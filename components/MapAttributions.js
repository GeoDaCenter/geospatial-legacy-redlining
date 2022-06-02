import React from 'react';

export const MapAttributions = ({
    layers,
    activeLayers
}) => {
    return <div>
        {activeLayers.map(
            layer =>
                <span key={`attribution-${layer}`}>
                    {layers[layer]?.attribution || ''}
                </span>
        )}
        Map Data: © <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noreferrer">Mapbox</a> ©{" "}
        <a href="https://www.openstreetmap.org/about/" target="_blank" rel="noreferrer">OpenStreetMap</a>{" "}
        <a href="https://www.mapbox.com/contribute/#/?q=&l=2.1234%2F32.9547%2F11" target="_blank" rel="noreferrer">Improve this map</a>
    </div>
}