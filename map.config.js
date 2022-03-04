import { ScatterplotLayer } from "@deck.gl/layers";

export const LayerList = [
    { label: 'Enslaved Persons in the US - 1860', id: 'slavery' },
    { label: 'Sundown Towns', id: 'sundown' },
    { label: 'Events of Mass Violence', id: 'violence' },
    { label: 'Reported Lynchings by County', id: 'lynchings' },
    { label: 'Redlining', id: 'redlining' },
]

export const DATA_URL = {
    slavery: "geojson/1860_counties.json",
    sundown: "geojson/sundown_features.json",
    violence: "geojson/mass-violence-features.json",
    lynchings: "geojson/lynchings.geojson",
    redlining: "geojson/HOLC.geojson",
};


export const bins = {
    slavery: {
        bins: [300, 1600, 4500, 37290],
        colors: [
        [217, 217, 217],
        [173, 194, 191],
        [119, 156, 175],
        [27,65,87]],

        separateZero: true
    },
    sundown: {
        bins: [1, 2, 3, 4, 8, 9],
        colors: [
            [255, 255, 178],
            [254, 204, 92],
            [253, 141, 60],
            [227, 26, 28],
            [117, 112, 179],
            [36,81,211]
        ],
        labels: [
            "Don't Know",
            "Possible",
            "Probable",
            "Surely",
            "Unlikely / Always Biracial",
            "Black Town or Township"
        ],
        categorical: true
    },
    violence: {
        bins: ['x'],
        colors: [[0, 0, 0]],
        labels: ["Incidence of Mass Violence"],
        categorical: true
    },
    redlining: {
        bins: ['A', 'B', 'C', 'D'],
        colors: [
            [115, 169, 77],
            [52, 172, 198],
            [219, 207, 0],
            [226, 77, 90]
        ],
        labels: [
            'A: Best',
            'B: Still Desirable',
            'C: Declining',
            'D: Hazardous'
        ],
        categorical: true
    },
    lynchings: {
        bins: [1, 5, 10, 25, 50, 245],
        colors: [
            [135, 135, 135],
            [159, 108, 134],
            [183, 81, 132],
            [207, 55, 131],
            [231, 28, 129],
            [255, 1, 128]
        ],

    }
}

export const layerSettings = {
    slavery: {        
        Layer: GeoJsonLayer,
        data: DATA_URL.slavery,
        id: "slavery-layer",
        getFillColor: feature => getColor({
            ...bins.slavery,
            val: feature?.properties['Slave Population'] || 0
        }),
        tooltipValidateFunction: (feature) => !!feature?.properties?.NHGISNAM, 
        tooltipDataFunction: (feature) => [
            {
                title: `${feature?.properties?.NHGISNAM}, ${feature?.properties?.STATENAM || 'Undesignated'}`,
                text: ''
            }, {
                title: `Total Population`,
                text: Math.round((feature?.properties['Total Population'] || 0) * 100) / 100
            }, {
                title: `Slave Population`,
                text: Math.round((feature?.properties['Slave Population'] || 0) * 100) / 100
            }, {
                title: `Percent Slave Population`,
                text: `${Math.round((feature?.properties['Percent Pop Slave '] || 0) * 100) / 100}%`
            }, {
                title: `Free People of Color`,
                text: Math.round((feature?.properties['Free Colored Population'] || 0) * 100) / 100
            }, {
                title: `Percent Free People of Color`,
                text: `${Math.round((feature?.properties['Percent Pop Free of Color'] || 0) * 100) / 100}%`
            }
        ],
        getLineColor: [255, 255, 255, 40],
        getLineWidth: 1,
        lineWidthMinPixels: 1,
        lineWidthMaxPixels: 1,
        opacity: 0.7,
        pickable: true,
        stroked: true,
        filled: true,
        extruded: false,
    },
    sundown: {
        Layer: ScatterplotLayer,
        id: 'sundown-layer',
        data: DATA_URL.sundown,
        getPosition: d => d.geometry.coordinates,
        getFillColor: d => getColorCategorical({
            ...bins.sundown,
            val: d?.properties['confirmed']
        }),
        getLineColor: [0, 0, 0],
        pickable: true,
        stroked: true,
        filled: true,
        lineWidthScale: 20,
        lineWidthMinPixels: 1,
        lineWidthMaxPixels: 1,

    }
}

export const attributions = {
    slavery: "Enslaved Persons: US Decennial Census 1860, Accessed via Social Explorer. ",
    sundown: "Sundown Towns: James W. Loewen and heirs (Nick Loewen) - History and Social Justice, Tougaloo College, 2022. ",
    violence: "Events of Mass Violence: Liam Hogan and contributors, 2015. ",
    lynchings: "Lynchings: Lynching in America - EJI. ",
    redlining: "Redlining: Nelson and contributors - Mapping Inequality, University of Richmond, 2022. CC NC-SA 4.0. ",
}


function getColor({
    val, bins, colors, separateZero }){
    if (separateZero && val === 0) return [50, 50, 50, 120]
    for (let i = 0; i < bins.length; i++) {
        if (val <= bins[i]) return colors[i]
    }
    return colors[colors.length - 1]
}

function getColorCategorical({
    val, bins, colors }){
    for (let i = 0; i < bins.length; i++) {
        if (val === bins[i]) return colors[i]
    }
    return [240, 240, 240, 120]
}