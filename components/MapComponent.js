import { useState } from "react";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, ScatterplotLayer, IconLayer } from "@deck.gl/layers";
import MapboxGLMap from "react-map-gl";
import styles from '../styles/Map.module.css'

const getColor = ({
    val, bins, colors, separateZero }) => {
    if (separateZero && val === 0) return [50, 50, 50, 120]
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


const ICON_MAPPING = {
    flag: {x: 0, y: 0, width: 100, height: 100, mask: true},
    candle: {x: 100, y: 0, width: 100, height: 100, mask: true},
    group: {x: 0, y: 100, width: 100, height: 100, mask: true},
    grave: {x: 100, y: 100, width: 100, height: 100, mask: true},
  };

export default function MapComponent({
    activeLayers = ["slavery"],
    view,
    setView,
    setPortal,
    bins,
    DATA_URL
}) {
    const [tooltipData, setTooltipData] = useState({
        data: null,
        x: null,
        y: null
    })
    const stringifiedBins = JSON.stringify(bins)

    const dotScale = view.zoom > 10 ? 250 : ((14 - view.zoom) ** 4) * 1.5
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
                    val: d?.properties['Slave Population'] || 0
                }),
                getLineColor: [255, 255, 255, 40],
                getLineWidth: 1,
                lineWidthMinPixels: 1,
                lineWidthMaxPixels: 1,
                opacity: 0.7,
                onHover: ({ object, x, y }) => !!object?.properties?.NHGISNAM ? setTooltipData({
                    x,
                    y,
                    data: [{
                        title: `${object?.properties?.NHGISNAM}, ${object?.properties?.STATENAM || 'Undesignated'}`,
                        text: ''
                    }, {
                        title: `Total Population`,
                        text: Math.round((object?.properties['Total Population'] || 0) * 100) / 100
                    }, {
                        title: `Slave Population`,
                        text: Math.round((object?.properties['Slave Population'] || 0) * 100) / 100
                    }, {
                        title: `Percent Slave Population`,
                        text: `${Math.round((object?.properties['Percent Pop Slave '] || 0) * 100) / 100}%`
                    }, {
                        title: `Free People of Color`,
                        text: Math.round((object?.properties['Free Colored Population'] || 0) * 100) / 100
                    }, {
                        title: `Percent Free People of Color`,
                        text: `${Math.round((object?.properties['Percent Pop Free of Color'] || 0) * 100) / 100}%`
                    }]
                }) : setTooltipData({ x: null, y: null, data: null }),
                updateTriggers: {
                    getFillColor: [stringifiedBins]
                }
            })
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
                pickable: true,
                stroked: true,
                filled: true,
                lineWidthScale: 20,
                lineWidthMinPixels: 1,
                lineWidthMaxPixels: 1,
                onHover: ({ object, x, y }) => !!object?.properties?.name ? setTooltipData({
                    x,
                    y,
                    data: [{
                        title: `${object?.properties?.name}, ${object?.properties?.state}`,
                        text: ''
                    }, {
                        title: `Sundown Confirmation`,
                        text: {
                            1: "Don't Know",
                            2: "Possible",
                            3: "Probable",
                            4: "Surely",
                            5: "Unlikely / Always Biracial",
                            6: "Black Town or Township"
                        }[object?.properties['confirmed']]
                    }, {
                        title: 'Click for more info'
                    }]
                }) : setTooltipData({ x: null, y: null, data: null }),
                onClick: ({ object }) => setPortal(`https://justice.tougaloo.edu/sundowntown/${object?.properties?.name?.replace(/\s/g, '-').toLowerCase()}-${object?.properties?.state.replace(/\s/g, '-').toLowerCase()}/`),
                updateTriggers: {
                    getFillColor: [stringifiedBins]
                }
            })
        ],
        violence: [
            new IconLayer({
                iconAtlas: 'icons/icon-atlas.png',
                iconMapping: ICON_MAPPING,
                getIcon: d => 'flag',       
                pickable:true,
                id: 'icon-mass-violence-layer',
                data: DATA_URL.violence,
                getPosition: d => d?.geometry?.coordinates,
                getSize: dotScale,
                sizeScale: 3,
                sizeUnits: 'meters',
                getColor: [0, 0, 0],
                onHover: ({ object, x, y }) => !!object?.properties?.name ? setTooltipData({
                    x,
                    y,
                    data: [{
                        title: object?.properties?.name,
                        text: object?.properties?.Date
                    }, {
                        title: 'Fatalities',
                        text: object?.properties?.Fatalities                        
                    }, {
                        title: 'Refugees',
                        text: object?.properties?.Regugees                        
                    }, {
                        title: '',
                        text: object?.properties?.['Narrative/Notes']
                    },{
                        title: 'Click for more info',
                        text: ''
                    }]
                }) : setTooltipData({ x: null, y: null, data: null }),
                onClick: ({ object }) => setPortal(object?.properties?.Source),
                updateTriggers: {
                    getColor: [stringifiedBins]
                }

            }),
            // new ScatterplotLayer({
            //     id: 'mass-violence-layer',
            //     data: DATA_URL.violence,
            //     getPosition: d => d?.geometry?.coordinates,
            //     getRadius: dotScale,
            //     getFillColor: [0, 0, 0],
            //     getLineColor: d => [0, 0, 0],
            //     pickable: true,
            //     stroked: true,
            //     filled: true,
            //     lineWidthScale: 20,
            //     lineWidthMinPixels: 1,
            //     lineWidthMaxPixels: 1,
            //     onHover: ({ object, x, y }) => !!object?.properties?.name ? setTooltipData({
            //         x,
            //         y,
            //         data: [{
            //             title: object?.properties?.name,
            //             text: object?.properties?.Date
            //         }, {
            //             title: 'Fatalities',
            //             text: object?.properties?.Fatalities                        
            //         }, {
            //             title: 'Refugees',
            //             text: object?.properties?.Regugees                        
            //         }, {
            //             title: '',
            //             text: object?.properties?.['Narrative/Notes']
            //         },{
            //             title: 'Click for more info',
            //             text: ''
            //         }]
            //     }) : setTooltipData({ x: null, y: null, data: null }),
            //     onClick: ({ object }) => setPortal(object?.properties?.Source)

            // })
        ],
        lynchings: [
            new GeoJsonLayer({
                id: "lynchings-layer",
                data: DATA_URL.lynchings,
                pickable: true,
                stroked: false,
                filled: true,
                extruded: false,
                getFillColor: d => getColor({
                    ...bins.lynchings,
                    val: d?.properties['LYNCHINGS'] || 0
                }),
                getLineColor: [0, 0, 0],
                getLineWidth: 1,
                lineWidthMinPixels: 1,
                lineWidthMaxPixels: 1,
                opacity: 0.7,
                onHover: ({ object, x, y }) => !!object?.properties?.NAME ? setTooltipData({
                    x,
                    y,
                    data: [{
                        title: `${object?.properties?.NAME}, ${object?.properties?.STATE_ABBREV}`,
                        text: ''
                    },{
                        title: "Reported Lynchings",
                        text: `${object?.properties?.LYNCHINGS}`
                    },]
                }) : setTooltipData({ x: null, y: null, data: null }),
                updateTriggers: {
                    getFillColor: [stringifiedBins]
                }
            }),],
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
                    val: d.properties['holc_grade'] || 0
                }),
                opacity: 0.8,
                onHover: ({ object, x, y }) => !!object?.properties?.city ? setTooltipData({
                    x,
                    y,
                    data: [{
                        title: `${object?.properties?.name ? `${object?.properties?.name}, ` : ''}${object?.properties?.city ? `${object?.properties?.city}, ` : ''}${object?.properties?.state ? `${object?.properties?.state}, ` : ''}`.slice(0,-2),
                        text: ''
                    },{
                        title: "HOLC Grade",
                        text: `${object?.properties?.holc_grade} (${{A:'Best',B:'Still Desirable',C:'Declining',D:'Hazardous'}[object?.properties?.holc_grade]})`
                    },]
                }) : setTooltipData({ x: null, y: null, data: null }),
                updateTriggers: {
                    getFillColor: [stringifiedBins]
                }
            }),
        ],
    };

    return <div className={styles.mapContainer}>
        <DeckGL
            viewState={view}
            onViewStateChange={({ viewState }) => setView(viewState)}
            controller={true}
            layers={activeLayers.map((name) => layers[name]).flat()}
            pickingRadius={30}
        >
            <MapboxGLMap
                reuseMaps
                mapStyle={'mapbox://styles/csds-hiplab/ckznihohm003a14p6a8bgjpls'}
                preventStyleDiffing={true}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            />
        </DeckGL>
        {!!tooltipData.data && tooltipData.x !== -1 && <div className={styles.tooltip} style={{ left: tooltipData.x + 5, top: tooltipData.y + 5 }}>
            {tooltipData.data.map(entry => <p key={entry.title}>
                <b>{entry.title}</b> {entry.text}</p>)}
        </div>}
    </div>
}
