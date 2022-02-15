export const LayerList = [
    { label: 'Enslaved Persons in the US - 1860', id: 'slavery' },
    { label: 'Sundown Towns', id: 'sundown' },
    { label: 'Events of Mass Violence', id: 'violence' },
    // { label: 'Lynchings (not yet available)', id: 'lynchings' },
    { label: 'Redlining', id: 'redlining' },
  ]

export const DATA_URL = {
    slavery: "geojson/1860_counties.json",
    sundown: "geojson/sundown_features.json",
    violence: "geojson/mass-violence-features.json",
    lynchings: "geojson/lynchings.geojson", // todo
    redlining: "geojson/HOLC.geojson",
  };
  

export const bins = {
    slavery: {
        bins: [300,1600,4500,37290],
        colors: [[241, 238, 246],
        [215, 181, 216],
        [223, 101, 176],
        [206, 18, 86]],
        separateZero: true
    },
    sundown:{
        bins: [1,2,3,4,8,9],
        colors: [
            [255,255,178],
            [254,204,92],
            [253,141,60],
            [227,26,28],
            [117,112,179],
            [231,41,138]
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
        colors: [[255,0,0]],
        labels: ["Incidence of Mass Violence"],
        categorical: true
    },
    redlining: {
        bins: ['A','B','C','D'],
        colors: [
            [115,169,77],
            [52,172,198],
            [219,207,0],
            [226,77,90]
        ],
        labels: [
            'A: Best',
            'B: Still Desirable',
            'C: Declining',
            'D: Hazardous'
        ],
        categorical: true
    }
  }
  
export const attributions = {    
    slavery: "Enslaved Persons: US Decennial Census 1860, Accessed via Social Explorer. ",
    sundown: "Sundown Towns: James W. Loewen and heirs (Nick Loewen) - History and Social Justice, Tougaloo College, 2022. ",
    violence: "Events of Mass Violence: Liam Hogan and contributors, 2015. ",
    lynchings: "Lynchings: Forthcoming.", // todo
    redlining: "Redlining: Nelson and contributors - Mapping Inequality, University of Richmond, 2022. CC NC-SA 4.0. ",
  }