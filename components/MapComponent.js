import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import MapboxGLMap from "react-map-gl";
import styles from '../styles/Map.module.css'

const getColor = ({
    val, bins, colors, separateZero }) => {
    if (separateZero && val === 0) return [240, 240, 240, 0]
    for (let i = 0; i < bins.length; i++) {
        if (val <= bins[i]) return colors[i]
    }
    return colors[colors.length - 1]
}

const getColorCategorical = ({
    val, bins, colors }) => {
    for (let i = 0; i < bins.length; i++) {
        if (val === bins[i]) return colors[i]
    }
    return [240, 240, 240, 120]
}

export default function MapComponent({
    activeLayers = ["slavery"],
    view,
    setView,
    bins,
    DATA_URL
}) {

    const dotScale = view.zoom > 10 ? 150 : (14-view.zoom)**4
    const layers = {
        slavery: [
            new GeoJsonLayer({
                id: "slavery-layer",
                data: DATA_URL.slavery,
                pickable: true,
                stroked: true,
                filled: true,
                extruded: false,
                getFillColor: d => getColor({
                    ...bins.slavery,
                    val: d?.properties['Slave Population']||0
                }),
                getLineColor: [255, 255, 255],
                getLineWidth:1,
                lineWidthMinPixels:1,
                lineWidthMaxPixels:1,
                opacity:0.7
            }),
        ],
        sundown: [
            new ScatterplotLayer({
                id: 'sundown-layer',
                data: DATA_URL.sundown,
                getPosition: d => d.geometry.coordinates,
                getRadius: dotScale,
                getFillColor: d => getColorCategorical({
                    ...bins.sundown,
                    val: d?.properties['confirmed']
                }),
                getLineColor: d => [0, 0, 0],
                pickable:false,
                stroked: true,
                filled:true,
                lineWidthScale: 20,
                lineWidthMinPixels: 1,
                lineWidthMaxPixels: 1
              })
        ],
        violence:  [
            new ScatterplotLayer({
                id: 'mass-violence-layer',
                data: DATA_URL.violence,
                getPosition: d => d?.geometry?.coordinates,
                getRadius: dotScale,
                getFillColor: [255,0,0],
                getLineColor: d => [0, 0, 0],
                pickable:false,
                stroked: true,
                filled:true,
                lineWidthScale: 20,
                lineWidthMinPixels: 1,
                lineWidthMaxPixels: 1
              })
        ],
        lynchings: [],
        redlining: [
            new GeoJsonLayer({
                id: "redlining-layer",
                data: DATA_URL.redlining,
                pickable: true,
                stroked: false,
                filled: true,
                extruded: false,
                getFillColor: d => getColorCategorical({
                    ...bins.redlining,
                    val: d.properties['holc_grade']||0
                }),
                opacity:0.8
            }),
        ],
    };
    
    return <div className={styles.mapContainer}>
        <DeckGL
            viewState={view}
            onViewStateChange={({ viewState }) => setView(viewState)}
            controller={true}
            layers={activeLayers.map((name) => layers[name]).flat()}
        >
            <MapboxGLMap
                reuseMaps
                mapStyle={'mapbox://styles/csds-hiplab/ckznihohm003a14p6a8bgjpls'}
                preventStyleDiffing={true}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            />
        </DeckGL>
    </div>
}
