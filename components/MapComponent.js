import { useState, useEffect, useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { StaticMap, MapContext, NavigationControl } from 'react-map-gl';
import styles from '../styles/Map.module.css'
import { scaleLinear } from "d3-scale";
import { RedliningMarkers } from "./RedliningMarkers";
import {CSVLoader} from '@loaders.gl/csv';
import {load} from '@loaders.gl/core';

const MAP_STYLE = 'mapbox://styles/csds-hiplab/cl1guqfvq001514s96n92ltey';

export default function MapComponent({
    activeLayers = ["slavery"],
    view,
    setView,
    setPortal,
    layers,
    technicalLayerSettings
}) {
    // pixel scaling
    const roundedZoom = Math.round(view.zoom)
    const dotScale = view.zoom > 10 ? 250 : ((14 - view.zoom) ** 4) * 1.5

    // data loading for marker data
    const [holcCentroids, setHolcCentroids] = useState([])
    useEffect(() => {
        const fetchData = async () => {
            await load('csv/holc_city_centroids.csv', CSVLoader, {header: true, dynamicTyping: true}).then(setHolcCentroids)
        }
        fetchData()
    }, [])

    // tooltip data
    const [tooltipData, setTooltipData] = useState({
        data: null,
        x: null,
        y: null
    })

    // interactive map settings
    const interactiveLayerSettings = {
        slavery: {},
        sundown: {
            getRadius: dotScale,
            onClick: ({ object }) => setPortal(`https://justice.tougaloo.edu/sundowntown/${object?.properties?.full_name?.replace(/\s/g, '-').replace(',', '').toLowerCase()}/`)
        },
        eventsOfViolence: {
            getSize: dotScale,
            onClick: ({ object }) => setPortal(object?.properties?.Source)
        },
        lynchings: {},
        redlining: {
            opacity: roundedZoom > 8
                ? 1
                : roundedZoom > 6
                    ? 0.5
                    : 0.1
        }
    };

    // combine map layer properties
    const mapLayers = useMemo(() => Object.keys(layers)
        .map(layerName => {
            const { Layer, tooltipValidateFunction, tooltipDataFunction } = technicalLayerSettings[layerName]
            return new Layer({
                onHover: ({ object, x, y }) => tooltipValidateFunction(object)
                    ? setTooltipData({ x, y, data: tooltipDataFunction(object) })
                    : setTooltipData({ x: null, y: null, data: null }),
                ...layers[layerName],
                ...technicalLayerSettings[layerName],
                ...interactiveLayerSettings[layerName],
                visible: activeLayers.includes(layerName),
                updateTriggers: {
                    visible: [JSON.stringify(activeLayers)]
                }
            })
        }),[JSON.stringify(activeLayers), roundedZoom])

    return <div className={styles.mapContainer}>
        <DeckGL
            viewState={view}
            onViewStateChange={({ viewState }) => setView(viewState)}
            controller={true}
            layers={mapLayers}
            pickingRadius={30}
            ContextProvider={MapContext.Provider}
        >
            <StaticMap
                reuseMaps
                mapStyle={MAP_STYLE}
                preventStyleDiffing={true}
                mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            />
            <RedliningMarkers 
                data={holcCentroids} 
                isActive={activeLayers.includes('redlining') && roundedZoom < 11} 
                zoom={roundedZoom}
                />
        </DeckGL>
        {!!tooltipData.data && tooltipData.x !== -1 && <div className={styles.tooltip} style={{ left: tooltipData.x + 5, top: tooltipData.y + 5 }}>
            {tooltipData.data.map(entry => <p key={entry.title}>
                <b>{entry.title}</b> {entry.text}</p>)}
        </div>}
    </div>
}