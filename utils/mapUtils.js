export function getColor({ val, mapBins, mapColors, separateZero, zeroColor = [255, 2, 255] }) {
    if (separateZero && val === 0) return zeroColor;
    for (let i = 0; i < mapBins.length; i++) {
        if (val <= mapBins[i]) return mapColors[i];
    }
    return mapColors[mapColors.length - 1];
}

export function getColorCategorical({ val, mapBins, mapColors }) {
    for (let i = 0; i < mapBins.length; i++) {
        if (val === mapBins[i]) return mapColors[i];
    }
    return [240, 240, 240, 120];
}