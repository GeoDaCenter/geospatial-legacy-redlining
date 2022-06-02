import React from "react";
import { LegendEntry } from "./LegendEntry";

export const MapLegend = ({
    layers,
    activeLayers
}) => {
    return <div>
        {activeLayers.map((layer, idx) => {
            const {
                mapBins,
                mapLabels,
                categorical,
                separateZero,
                label,
                mapColors
            } = layers[layer];

            return <LegendEntry
                key={idx}
                bins={mapBins}
                colors={mapColors}
                labels={mapLabels}
                separateZero={separateZero}
                categorical={categorical}
                title={label}
                />
        })}
    </div>
   
}