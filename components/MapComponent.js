import { useState, useEffect, useMemo  } from "react";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, ScatterplotLayer, IconLayer } from "@deck.gl/layers";
import {StaticMap, MapContext, NavigationControl, Marker} from 'react-map-gl';
import styles from '../styles/Map.module.css'
import {
    layerSettings 
} from '../map.config';
import RechartsPie from './RechartsPie.js'
import { scaleLinear } from "d3-scale";

const MAP_STYLE = 'mapbox://styles/csds-hiplab/cl1guqfvq001514s96n92ltey';
const BARWIDTH = 20;
const BARHEIGHT = 100;

export default function MapComponent({
    activeLayers = ["slavery"],
    view,
    setView,
    setPortal,
    bins
}) {
    const roundedZoom = Math.round(view.zoom)

    const popScale = scaleLinear()
        .domain([0, 250000])
        .range([20,300])
        
    const [holcCentroids, setHolcCentroids] = useState([])
    useEffect(() => {
        fetch('/geojson/HOLC_centroids_cities.json').then(r => r.json()).then(setHolcCentroids)
    },[])

    const [tooltipData, setTooltipData] = useState({
        data: null,
        x: null,
        y: null
    })
    const stringifiedBins = JSON.stringify(bins)

    const dotScale = view.zoom > 10 ? 250 : ((14 - view.zoom) ** 4) * 1.5

    const interactiveLayerSettings = {
        slavery: {},
        sundown:{
            getRadius: dotScale,
            onClick: ({ object }) => setPortal(`https://justice.tougaloo.edu/sundowntown/${object?.properties?.full_name?.replace(/\s/g, '-').replace(',','').toLowerCase()}/`)
        },
        sundown2:{
            getRadius: dotScale,
            onClick: ({ object }) => setPortal(`https://justice.tougaloo.edu/sundowntown/${object?.properties?.full_name?.replace(/\s/g, '-').replace(',','').toLowerCase()}/`)
        },
        sundownDot:{
            getRadius: dotScale,
            onClick: ({ object }) => setPortal(`https://justice.tougaloo.edu/sundowntown/${object?.properties?.full_name?.replace(/\s/g, '-').replace(',','').toLowerCase()}/`)
        },
        violence: {
            getSize: dotScale,
            onClick: ({ object }) => setPortal(object?.properties?.Source)      
        },
        lynchings:{},
        redlining: {
            opacity: roundedZoom > 8 ? 1 : roundedZoom > 6 ? 0.5 : 0.1,
        }
    };
    
    const layers = Object.keys(layerSettings)
        .map(layerName => {
            const {Layer, tooltipValidateFunction, tooltipDataFunction, ...rest} = layerSettings[layerName]
            
            return {
                id:layerName,
                layer: new Layer({
                    onHover: ({ object, x, y }) => tooltipValidateFunction(object) 
                        ? setTooltipData({x,y, data: tooltipDataFunction(object)})
                        : setTooltipData({ x: null, y: null, data: null }),
                    updateTriggers: {
                        getFillColor: [stringifiedBins]
                    },
                    ...rest,
                    ...interactiveLayerSettings[layerName] ,
                })
            }
        })

    const markers = useMemo(() => activeLayers.includes('redlining') && roundedZoom < 9 ? <>
        {holcCentroids.map(feature => <Marker key={feature.NAME} longitude={+feature.x} latitude={+feature.y}>
            <div
            style={{
                width:BARWIDTH,
                height:BARWIDTH,
                transform:`translate(${-BARWIDTH*2}px,${-BARHEIGHT/2}px)`
            }}
            >
                <RechartsPie data={feature} zoom={roundedZoom} popScale={popScale} />
            </div>
        </Marker>)}
      </> : null,[JSON.stringify(activeLayers), roundedZoom])
    return <div className={styles.mapContainer}>
        <DeckGL
            viewState={view}
            onViewStateChange={({ viewState }) => setView(viewState)}
            controller={true}
            layers={layers.filter(layer => activeLayers.includes(layer.id)).map(l => l.layer)}
            pickingRadius={30} 
            ContextProvider={MapContext.Provider}
        >
            <StaticMap
                reuseMaps
                mapStyle={MAP_STYLE}
                preventStyleDiffing={true}
                mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            />
            {markers}
        </DeckGL>
        {!!tooltipData.data && tooltipData.x !== -1 && <div className={styles.tooltip} style={{ left: tooltipData.x + 5, top: tooltipData.y + 5 }}>
            {tooltipData.data.map(entry => <p key={entry.title}>
                <b>{entry.title}</b> {entry.text}</p>)}
        </div>}
    </div>
}

function StackedBarChart({data}){
    const inner = writeElems(data, 0)
    return <svg width={BARWIDTH} height={BARHEIGHT} viewBox={`0 0 ${BARWIDTH} ${BARHEIGHT}`}>{inner}</svg>
}

const grades = [{
    grade: "A",
    color: "rgba(115, 169, 77, 0.25)",
  },{
    grade: "B",
    color: "rgba(52, 172, 198, 0.25)",
  },{
    grade: "C",
    color: "rgba(219, 207, 0, 0.25)",
  },{
    grade: "D",
    color: "rgb(226, 77, 90)",
  }]

function writeElems(row, baseX){    
    let cumulativeTotal = 0;
    const elems = grades.map(({grade, color}) => {
      const el = <rect x={baseX} y={`${Math.round(cumulativeTotal*100)}%`} width="100%" height={`${row[grade]*100}%`} fill={color} />
      cumulativeTotal+=row[grade]
      return el
    })
    return elems
  }