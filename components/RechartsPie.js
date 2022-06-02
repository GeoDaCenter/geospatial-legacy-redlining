import React from "react";
import {
    Cell,
    PieChart,
    Pie
} from 'recharts'

const chartEntries = ['A', 'B', 'C', 'D']
const COLORS = [
    'rgb(115, 169, 77)',
    'rgb(52, 172, 198)',
    'rgb(219, 207, 0)',
    'rgb(226, 77, 90)'];

function RechartsPie({
    data,
    zoom,
    popScale,
    maxSize,
    scaleMultiplier
}) {
    const chartData = chartEntries.map(e => ({
        name: e,
        value: data[e] * 100
    }))

    const scale = Math.min(maxSize, popScale(data.population)) * scaleMultiplier
    const pctRedlined = Math.round(chartData.find(f => f.name === 'D')?.value)
    const hasInnerText = scale > 30
    const innerRadius = hasInnerText ? scale / 4 : 0
    return (
        <PieChart width={scale} height={scale} style={{ transform: `translate(-50%, -50%)` }}>
            {hasInnerText && <>
                <circle cx={scale / 2} cy={scale / 2} r={scale / 2} fill="rgb(255,255,255)" />
                <text x={scale / 2} y={scale / 2} textAnchor="middle" fill="rgb(226, 77, 90)" fontSize={scale / 5} dy={-scale / 50} fontWeight="bold">{pctRedlined}%</text>
                <text x={scale / 2} y={scale / 2} textAnchor="middle" fill="rgb(226, 77, 90)" fontSize={scale / 10} dy={scale / 10} fontWeight="bold">redlined</text>
            </>}
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" isAnimationActive={false} innerRadius={innerRadius} outerRadius={scale / 2}>
                {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>

        </PieChart>
    )
}

export default React.memo(RechartsPie)