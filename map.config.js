// library imports
import { getColor, getColorCategorical } from './utils/mapUtils.js'
import { GeoJsonLayer, ScatterplotLayer, IconLayer } from "@deck.gl/layers";
import {CSVLoader} from '@loaders.gl/csv';


// layer configuration
const layers = {
  slavery: {
    label: "Percentage of Enslaved People per County (1860)",
    data: "geojson/1860_counties.geojson",
    attribution: "Enslaved Persons: US Decennial Census 1860, Accessed via Social Explorer. ",
    mapBins: [20, 40, 60, 80, 100],
    mapColors: [
      [194, 175, 140],
      [143, 112, 64, 225],
      [98, 78, 60, 225],
      [69, 49, 49, 225],
      [171, 64, 64, 225],
    ],
    separateZero: true,
    zeroColor: [0, 0, 0, 0]
  },
  sundown: {
    label: "Sundown Towns (1870-1970)",
    data: "csv/sundown-towns.csv",
    attribution: "Sundown Towns: James W. Loewen and heirs (Nick Loewen) - History and Social Justice, Tougaloo College, 2022. ",
    mapBins: [1, 2, 3, 4, 8, 9],
    mapColors: [
      [255, 255, 178],
      [254, 204, 92],
      [253, 141, 60],
      [227, 26, 28],
      [117, 112, 179],
      [36, 81, 211],
    ],
    mapLabels: [
      "Don't Know",
      "Possible",
      "Probable",
      "Surely",
      "Unlikely / Always Biracial",
      "Black Town or Township",
    ],
    categorical: true,
  },
  eventsOfViolence: {
    label: "White Supremacist Attacks on Black Communities (1824-1974)",
    data: "csv/mass-violence.csv",
    attribution: "White Supremacist Attacks on Black Communities (1824-1974): Liam Hogan and contributors, 2015. ",
    mapBins: ["none"],
    mapColors: [[0, 0, 0]],
    mapLabels: ["Incidence of Mass Violence"],
    categorical: true,
  },
  lynchings: {
    label: "Number of Lynchings in County (1870-1950)",
    data: "geojson/lynchings.geojson",
    attribution: "Lynchings: Lynching in America - EJI. ",
    mapBins: [1, 5, 10, 25, 50, 245],
    mapColors: [
      [135, 135, 135],
      [159, 108, 134],
      [183, 81, 132],
      [207, 55, 131],
      [231, 28, 129],
      [255, 1, 128]
    ],
    separateZero: true,
  },
  redlining: {
    label: "Residential Security Maps (1935-1940)",
    data: "geojson/holc_boundaries.geojson",
    attribution: "Redlining: Nelson and contributors - Mapping Inequality, University of Richmond, 2022. CC NC-SA 4.0. ",
    mapBins: ["A", "B", "C", "D"],
    mapColors: [
      [115, 169, 77],
      [52, 172, 198],
      [219, 207, 0],
      [226, 77, 90],
    ],
    mapLabels: ["A: Best", "B: Still Desirable", "C: Declining", "D: Hazardous"],
    categorical: true,
  },
}

// technical layer configuration
const technicalLayerSettings = {
  slavery: {
    Layer: GeoJsonLayer,
    data: layers.slavery.data,
    id: "slavery-layer",
    getFillColor: (feature) => getColor({
      ...layers.slavery,
      val: ((feature?.properties["Slave Population"] || 0) / (feature?.properties["Total Population"] || 1)) * 100,
    }),
    tooltipValidateFunction: (feature) => !!feature?.properties?.NHGISNAM,
    tooltipDataFunction: (feature) => [
      {
        title: `${feature?.properties?.NHGISNAM}, ${feature?.properties?.STATENAM || "Undesignated"
          }`,
        text: "",
      },
      {
        title: `Total Population`,
        text:
          Math.round((feature?.properties["Total Population"] || 0) * 100) /
          100,
      },
      {
        title: `Slave Population`,
        text:
          Math.round((feature?.properties["Slave Population"] || 0) * 100) /
          100,
      },
      {
        title: `Percent Slave Population`,
        text: `${Math.round((feature?.properties["Percent Pop Slave "] || 0) * 100) /
          100
          }%`,
      },
      {
        title: `Free People of Color`,
        text:
          Math.round(
            (feature?.properties["Free Colored Population"] || 0) * 100
          ) / 100,
      },
      {
        title: `Percent Free People of Color`,
        text: `${Math.round(
          (feature?.properties["Percent Pop Free of Color"] || 0) * 100
        ) / 100
          }%`,
      },
    ],
    getLineColor: [115, 115, 115, 40],
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
    id: "sundown-layer-dot",
    data: layers.sundown.data,
    loaders: [CSVLoader],
    loadOptions: {
      csv: {
        delimiter: ',',
        dynamicTyping: true,
        skipEmptyLines: true
      }
    },
    getPosition: (d) => [d.x, d.y],
    getFillColor: (d) =>
      getColorCategorical({
        ...layers.sundown,
        val: d?.["confirmed"],
      }),
    getLineColor: [0, 0, 0, 0],
    pickable: true,
    stroked: true,
    filled: true,
    lineWidthScale: 20,
    lineWidthMinPixels: 1,
    lineWidthMaxPixels: 1,
    tooltipValidateFunction: (feature) => feature?.name,
    tooltipDataFunction: (feature) => [
      {
        title: `${feature?.name}, ${feature?.state}`,
        text: "",
      },
      {
        title: `Sundown Confirmation`,
        text: {
          1: "Don't Know",
          2: "Possible",
          3: "Probable",
          4: "Surely",
          5: "Unlikely / Always Biracial",
          6: "Black Town or Township",
          0: "Unknown / No Data"
        }[feature?.confirmed],
      },
      {
        title: "Click for more info",
      },
    ],
  },
  eventsOfViolence: {
    Layer: IconLayer,
    iconAtlas: "icons/icon-atlas.png",
    iconMapping: {
      flag: { x: 0, y: 0, width: 100, height: 100, mask: true },
      candle: { x: 100, y: 0, width: 100, height: 100, mask: true },
      group: { x: 0, y: 100, width: 100, height: 100, mask: true },
      grave: { x: 100, y: 100, width: 100, height: 100, mask: true },
    },
    getIcon: (d) => "flag",
    pickable: true,
    id: "icon-mass-violence-layer",
    data: layers.eventsOfViolence.data,
    loaders: [CSVLoader],
    loadOptions: {
      csv: {
        delimiter: ',',
        dynamicTyping: true,
        skipEmptyLines: true
      }
    },
    getPosition: (d) => [d.lon, d.lat],
    sizeScale: 3,
    sizeUnits: "meters",
    getColor: [0, 0, 0],
    tooltipValidateFunction: (feature) => !!feature?.name,
    tooltipDataFunction: (feature) => [
      {
        title: feature?.name,
        text: feature?.Date,
      },
      {
        title: "Fatalities",
        text: feature?.Fatalities,
      },
      {
        title: "Refugees",
        text: feature?.Regugees,
      },
      {
        title: "",
        text: feature?.["Narrative/Notes"],
      },
      {
        title: "Click for more info",
        text: "",
      },
    ],
  },
  lynchings: {
    id: "lynchings-layer",
    Layer: GeoJsonLayer,
    data: layers.lynchings.data,
    pickable: true,
    stroked: false,
    filled: true,
    extruded: false,
    getFillColor: (d) =>
      getColor({
        ...layers.lynchings,
        val: d?.properties["LYNCHINGS"] || 0,
      }),
    getLineColor: [115, 115, 115, 80],
    getLineWidth: 2,
    lineWidthMinPixels: 1,
    lineWidthMaxPixels: 1,
    opacity: 0.7,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: false,
    tooltipValidateFunction: (feature) => !!feature?.properties?.NAME,
    tooltipDataFunction: (feature) => [
      {
        title: `${feature?.properties?.NAME}, ${feature?.properties?.STATE_ABBREV}`,
        text: "",
      },
      {
        title: "Reported Lynchings",
        text: `${feature?.properties?.LYNCHINGS}`,
      },
    ],
  },
  redlining: {
    id: "redlining-layer",
    Layer: GeoJsonLayer,
    data: layers.redlining.data,
    pickable: true,
    stroked: false,
    filled: true,
    extruded: false,
    getFillColor: (d) =>
      getColorCategorical({
        ...layers.redlining,
        val: d.properties["holc_grade"] || 0,
      }),
    opacity: 0.8,
    tooltipValidateFunction: (feature) => !!feature?.properties?.city,
    tooltipDataFunction: (feature) => [
      {
        title: `${feature?.properties?.name ? `${feature?.properties?.name}, ` : ""
          }${feature?.properties?.city ? `${feature?.properties?.city}, ` : ""}${feature?.properties?.state ? `${feature?.properties?.state}, ` : ""
          }`.slice(0, -2),
        text: "",
      },
      {
        title: "HOLC Grade",
        text: `${feature?.properties?.holc_grade} (${{ A: "Best", B: "Still Desirable", C: "Declining", D: "Hazardous" }[
          feature?.properties?.holc_grade
        ]
          })`,
      },
    ],
  },
};

export {
  layers,
  technicalLayerSettings
}