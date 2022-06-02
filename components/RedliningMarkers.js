import React, { useMemo } from 'react';
import RechartsPie from './RechartsPie';
import { Marker } from 'react-map-gl';
import { scaleLinear } from 'd3-scale';

const MAX_SIZE = 25
const MIN_SIZE = 3

export const RedliningMarkers = ({
    data=[],
    isActive=false,
    zoom
}) => {
    // Scale based on popualation
    const popScale = scaleLinear()
        .domain([0, 250000]) // population range
        .range([MIN_SIZE, MAX_SIZE]) // pixel range
    const windowMultiplier = typeof window === 'undefined' ? 1 : Math.max(1, window.innerWidth / 1024)
    const scaleMultiplier = Math.max(1, zoom - 5) * windowMultiplier
    // draw markers for pie charts
    const markers = useMemo(() => 
        data.map(feature => <Marker key={feature.NAME} longitude={+feature.x} latitude={+feature.y}>
            <div>
                <RechartsPie data={feature} zoom={zoom} popScale={popScale} maxSize={MAX_SIZE} scaleMultiplier={scaleMultiplier} />
            </div>
        </Marker>)
    ,[zoom, data?.length])

    if (isActive) {
        return markers
    } else {
        return null
    }
}