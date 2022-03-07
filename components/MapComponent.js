import { useState } from "react";
import DeckGL from "@deck.gl/react";
// import { GeoJsonLayer, ScatterplotLayer, IconLayer } from "@deck.gl/layers";
import {BitmapLayer} from '@deck.gl/layers';
import {TileLayer} from '@deck.gl/geo-layers';
import MapboxGLMap from "react-map-gl";
import styles from '../styles/Map.module.css'
import {
    layerSettings 
} from '../map.config'

export default function MapComponent({
    activeLayers = ["slavery"],
    view,
    setView,
    setPortal,
    bins
}) {
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
            onClick: ({ object }) => setPortal(`https://justice.tougaloo.edu/sundowntown/${object?.properties?.name?.replace(/\s/g, '-').toLowerCase()}-${object?.properties?.state.replace(/\s/g, '-').toLowerCase()}/`)
        },
        violence: {
            getSize: dotScale,
            onClick: ({ object }) => setPortal(object?.properties?.Source)      
        },
        lynchings:{},
        redlining: {}
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

        const baseLayer = new TileLayer({
            data: 'https://maps.georeferencer.com/georeferences/6e491171-9ff1-534c-a801-9dd0d979b14a/2020-04-05T21:35:29.176725Z/map/{z}/{x}/{y}.png?key=mpMyUkwG1ulAMwyEt4Wk',
            minZoom: 0,
            maxZoom: 19,
            tileSize: 256,        
            renderSubLayers: props => {
              const {
                bbox: {west, south, east, north}
              } = props.tile;
              return new BitmapLayer(props, {
                data: null,
                image: props.data,
                bounds: [west, south, east, north]
              });
            }
          });

        
    return <div className={styles.mapContainer}>
        <DeckGL
            viewState={view}
            onViewStateChange={({ viewState }) => setView(viewState)}
            controller={true}
            layers={[baseLayer, ...layers.filter(layer => activeLayers.includes(layer.id)).map(l => l.layer)]}
            pickingRadius={30}
        >
            {/* <MapboxGLMap
                reuseMaps
                mapStyle={'mapbox://styles/csds-hiplab/ckznihohm003a14p6a8bgjpls'}
                preventStyleDiffing={true}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            /> */}
        </DeckGL>
        {!!tooltipData.data && tooltipData.x !== -1 && <div className={styles.tooltip} style={{ left: tooltipData.x + 5, top: tooltipData.y + 5 }}>
            {tooltipData.data.map(entry => <p key={entry.title}>
                <b>{entry.title}</b> {entry.text}</p>)}
        </div>}
    </div>
}
