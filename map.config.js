import { GeoJsonLayer, ScatterplotLayer, IconLayer } from "@deck.gl/layers";
import { FillStyleExtension } from "@deck.gl/extensions";

export const LayerList = [
  { label: "Percentage of Enslaved People per County (1860)", id: "slavery" },
  { label: "Sundown Towns (1870-1970)", id: "sundownDot" },
  // { label: "Sundown Towns", id: "sundown" },
  // { label: "Sundown Towns Alt", id: "sundown2" },
  { label: "White Supremacist Attacks on Black Communities (1824-1974)", id: "violence" },
  { label: "Number of Lynchings in County (1870-1950)", id: "lynchings" },
  { label: "Residential Security Maps (1935-1940)", id: "redlining" },
];

export const DATA_URL = {
  slavery: "geojson/1860_counties.json",
  slavery2: "geojson/1860_counties.json",
  sundown_centroid: "geojson/sundown_features.json",
  sundown: "geojson/sundown_towns_areas_simplified.geojson",
  violence: "geojson/mass-violence-features.json",
  lynchings: "geojson/lynchings.geojson",
  redlining: "geojson/HOLC.geojson",
};

export const attributions = {
  slavery:
    "Enslaved Persons: US Decennial Census 1860, Accessed via Social Explorer. ",
  slavery2:
  "Enslaved Persons: US Decennial Census 1860, Accessed via Social Explorer. ",
  sundown:
    "Sundown Towns: James W. Loewen and heirs (Nick Loewen) - History and Social Justice, Tougaloo College, 2022. ",
  sundown2:
    "Sundown Towns: James W. Loewen and heirs (Nick Loewen) - History and Social Justice, Tougaloo College, 2022. ",
  sundownDot:
    "Sundown Towns: James W. Loewen and heirs (Nick Loewen) - History and Social Justice, Tougaloo College, 2022. ",
  violence: "Events of Mass Violence: Liam Hogan and contributors, 2015. ",
  lynchings: "Lynchings: Lynching in America - EJI. ",
  redlining:
    "Redlining: Nelson and contributors - Mapping Inequality, University of Richmond, 2022. CC NC-SA 4.0. ",
};

export const bins = {
  slavery: {
    bins: [20,40,60,80,100],
    colors: [
      [254,235,226],
      [251,180,185],
      [247,104,161],
      [197,27,138],
      [122,1,119]
      // [194,175,140],
      // [143,112,64, 225],
      // [98,78,60,225],
      // [69,49,49,225],
      // [171,64,64,225],
    ],
    separateZero: true,
    zeroColor: [0,0,0,0]
  },
  slavery2: {
    bins: [0, 10, 25, 50, 60, 75, 100],
    colors: [
      [237,248,251,220],
      [191,211,230,220],
      [158,188,218,220],
      [140,150,198,220],
      [140,107,177,220],
      [136,65,157,220],
      [110,1,107,220],
    ],
    separateZero: true,
    zeroColor: [0,0,0,0]
  },
  sundown: {
    bins: [1, 2, 3, 4, 8, 9],
    colors: [
      [171,64,64,50],
      [171,64,64,100],
      [171,64,64,150],
      [171,64,64,200],
      [0,80,85,255],
      [3,64,64,255],
    ],
    labels: [
      "Don't Know",
      "Possible",
      "Probable",
      "Surely",
      "Unlikely / Always Biracial",
      "Black Town or Township",
    ],
    categorical: true,
  },
  sundown2: {
    bins: [1, 2, 3, 4, 8, 9],
    colors: [
      [171,64,64],
      [171,64,64],
      [171,64,64],
      [171,64,64],
      [0,80,85,255],
      [3,64,64,255],
    ],
    labels: [
      "Don't Know",
      "Possible",
      "Probable",
      "Surely",
      "Unlikely / Always Biracial",
      "Black Town or Township",
    ],
    categorical: true,
  },
  sundownDot: {
    bins: [1, 2, 3, 4, 8, 9],
    colors: [
      [171,64,64,50],
      [171,64,64,100],
      [171,64,64,150],
      [171,64,64,200],
      [0,80,85,255],
      [3,64,64,255],
    ],
    labels: [
      "Don't Know",
      "Possible",
      "Probable",
      "Surely",
      "Unlikely / Always Biracial",
      "Black Town or Township",
    ],
    categorical: true,
  },
  violence: {
    bins: ["x"],
    colors: [[0, 0, 0]],
    labels: ["Incidence of Mass Violence"],
    categorical: true,
  },
  redlining: {
    bins: ["A", "B", "C", "D"],
    colors: [
      [115, 169, 77],
      [52, 172, 198],
      [219, 207, 0],
      [226, 77, 90],
    ],
    labels: ["A: Best", "B: Still Desirable", "C: Declining", "D: Hazardous"],
    categorical: true,
  },
  lynchings: {
    bins: [1, 5, 10, 25, 50, 245],
    colors: [
      [193,181,166],
      [194,175,140],
      [150,150,150],
      [99,99,99],
      [37,37,37],
      [56, 0, 0],
    ], separateZero: true,
  },
};

export const layerSettings = {
  slavery: {
    Layer: GeoJsonLayer,
    data: DATA_URL.slavery,
    id: "slavery-layer",
    getFillColor: (feature) =>
      getColor({
        ...bins.slavery,
        val: ((feature?.properties["Slave Population"] || 0)/(feature?.properties["Total Population"] || 1))* 100,
      }),
    tooltipValidateFunction: (feature) => !!feature?.properties?.NHGISNAM,
    tooltipDataFunction: (feature) => [
      {
        title: `${feature?.properties?.NHGISNAM}, ${
          feature?.properties?.STATENAM || "Undesignated"
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
        text: `${
          Math.round((feature?.properties["Percent Pop Slave "] || 0) * 100) /
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
        text: `${
          Math.round(
            (feature?.properties["Percent Pop Free of Color"] || 0) * 100
          ) / 100
        }%`,
      },
    ],
    getLineColor: [115,115,115, 40],
    getLineWidth: 1,
    lineWidthMinPixels: 1,
    lineWidthMaxPixels: 1,
    opacity: 0.7,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: false,
  },

slavery2: {
    Layer: GeoJsonLayer,
    data: DATA_URL.slavery,
    id: "slavery-layer",
    getFillColor: (feature) =>
      getColor({
        ...bins.slavery,
        val: feature?.properties["Percent"] || 0,
      }),
    tooltipValidateFunction: (feature) => !!feature?.properties?.NHGISNAM,
    tooltipDataFunction: (feature) => [
      {
        title: `${feature?.properties?.NHGISNAM}, ${
          feature?.properties?.STATENAM || "Undesignated"
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
        text: `${
          Math.round((feature?.properties["Percent Pop Slave "] || 0) * 100) /
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
        text: `${
          Math.round(
            (feature?.properties["Percent Pop Free of Color"] || 0) * 100
          ) / 100
        }%`,
      },
    ],
    getLineColor: [115,115,115, 40],
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
    Layer: GeoJsonLayer,
    id: "sundown-layer",
    data: DATA_URL.sundown,
    getFillColor: (d) =>
      getColorCategorical({
        ...bins.sundown,
        val: d?.properties["confirmed"],
      }),
    getLineColor: [0, 0, 0,0],
    pickable: true,
    stroked: true,
    filled: true,
    autoHighlight: true,
    tooltipValidateFunction: (feature) => feature?.properties?.full_name,
    tooltipDataFunction: (feature) => [
      {
        title: `${feature?.properties?.full_name}`,
        text: "",
      },
      {
        title: `Sundown Confirmation`,
        text: {
          1: "Don't Know",
          2: "Possible",
          3: "Probable",
          4: "Surely",
          8: "Unlikely / Always Biracial",
          9: "Black Town or Township",
          0: "Unknown / No Data"
        }[feature?.properties["confirmed"]],
      },
      {
        title: "Click for more info",
      },
    ],
  },
  sundown2: {
    Layer: GeoJsonLayer,
    id: "sundown-layer-2",
    data: DATA_URL.sundown,
    getFillColor: (d) =>
      getColorCategorical({
        ...bins.sundown,
        val: d?.properties["confirmed"],
      }),
    getLineColor: [0, 0, 0, 80],
    getLineWidth: 1,
    lineWidthScale: 20,
    lineWidthMinPixels: 1,
    lineWidthMaxPixels: 1,
    pickable: true,
    stroked: true,
    filled: true,
    autoHighlight: true,
    fillPatternAtlas: `/patterns/sundown-pattern.png`,
    fillPatternEnabled: true,
    fillPatternMapping: `/patterns/sundown-atlas.json`,
    getFillPattern: f => f.properties["confirmed"],
    getFillPatternScale: 20,
    getFillPatternOffset: [0, 0],
    extensions: [new FillStyleExtension({ pattern: true })],
    tooltipValidateFunction: (feature) => feature?.properties?.full_name,
    tooltipDataFunction: (feature) => [
      {
        title: `${feature?.properties?.full_name}`,
        text: "",
      },
      {
        title: `Sundown Confirmation`,
        text: {
          1: "Don't Know",
          2: "Possible",
          3: "Probable",
          4: "Surely",
          8: "Unlikely / Always Biracial",
          9: "Black Town or Township",
          0: "Unknown / No Data"
        }[feature?.properties["confirmed"]],
      },
      {
        title: "Click for more info",
      },
    ],
  },
  sundownDot: {
    Layer: ScatterplotLayer,
    id: "sundown-layer-dot",
    data: DATA_URL.sundown_centroid,
    getPosition: (d) => d.geometry.coordinates,
    getFillColor: (d) =>
      getColorCategorical({
        ...bins.sundownDot,
        val: d?.properties["confirmed"],
      }),
    getLineColor: [0, 0, 0,0],
    pickable: true,
    stroked: true,
    filled: true,
    lineWidthScale: 20,
    lineWidthMinPixels: 1,
    lineWidthMaxPixels: 1,
    tooltipValidateFunction: (feature) => feature?.properties?.name,
    tooltipDataFunction: (feature) => [
      {
        title: `${feature?.properties?.name}, ${feature?.properties?.state}`,
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
        }[feature?.properties["confirmed"]],
      },
      {
        title: "Click for more info",
      },
    ],
  },
  violence: {
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
    data: DATA_URL.violence,
    getPosition: (d) => d?.geometry?.coordinates,
    sizeScale: 3,
    sizeUnits: "meters",
    getColor: [0, 0, 0],
    tooltipValidateFunction: (feature) => !!feature?.properties?.name,
    tooltipDataFunction: (feature) => [
      {
        title: feature?.properties?.name,
        text: feature?.properties?.Date,
      },
      {
        title: "Fatalities",
        text: feature?.properties?.Fatalities,
      },
      {
        title: "Refugees",
        text: feature?.properties?.Regugees,
      },
      {
        title: "",
        text: feature?.properties?.["Narrative/Notes"],
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
    data: DATA_URL.lynchings,
    pickable: true,
    stroked: false,
    filled: true,
    extruded: false,
    getFillColor: (d) =>
      getColor({
        ...bins.lynchings,
        val: d?.properties["LYNCHINGS"] || 0,
      }),
    getLineColor: [115,115,115, 80],
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
    data: DATA_URL.redlining,
    pickable: true,
    stroked: false,
    filled: true,
    extruded: false,
    getFillColor: (d) =>
      getColorCategorical({
        ...bins.redlining,
        val: d.properties["holc_grade"] || 0,
      }),
    opacity: 0.8,
    tooltipValidateFunction: (feature) => !!feature?.properties?.city,
    tooltipDataFunction: (feature) => [
      {
        title: `${
          feature?.properties?.name ? `${feature?.properties?.name}, ` : ""
        }${feature?.properties?.city ? `${feature?.properties?.city}, ` : ""}${
          feature?.properties?.state ? `${feature?.properties?.state}, ` : ""
        }`.slice(0, -2),
        text: "",
      },
      {
        title: "HOLC Grade",
        text: `${feature?.properties?.holc_grade} (${
          { A: "Best", B: "Still Desirable", C: "Declining", D: "Hazardous" }[
            feature?.properties?.holc_grade
          ]
        })`,
      },
    ],
  },
};

function getColor({ val, bins, colors, separateZero, zeroColor=[255,2,255] }) {
  if (separateZero && val === 0) return zeroColor;
  for (let i = 0; i < bins.length; i++) {
    if (val <= bins[i]) return colors[i];
  }
  return colors[colors.length - 1];
}

function getColorCategorical({ val, bins, colors }) {
  for (let i = 0; i < bins.length; i++) {
    if (val === bins[i]) return colors[i];
  }
  return [240, 240, 240, 120];
}
