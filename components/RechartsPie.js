import React from "react";
import {
    Cell,
    PieChart,
    Pie,
    Label,
    Text
} from 'recharts'

const chartEntries = ['A','B','C','D']
const COLORS = [
    'rgb(115, 169, 77)',
    'rgb(52, 172, 198)',
    'rgb(219, 207, 0)',
    'rgb(226, 77, 90)'];

function RechartsPie({
    data
}){
    const chartData = chartEntries.map(e => ({
        name: e,
        value: data[e]*100
    }))
    const pctRedlined = Math.round(chartData.find(f => f.name === 'D')?.value)
    
    return (
        <PieChart width={100} height={100}>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" isAnimationActive={false}>
                {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="rgba(255,255,255,0.8)" />
                ))}
            </Pie>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" isAnimationActive={false} innerRadius={30} outerRadius={50}>
                {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <text x="50" y="50" textAnchor="middle" fill="rgb(226, 77, 90)" fontSize="24" dy="6" fontWeight="bold">{pctRedlined}%</text>
        </PieChart>
    )
}

export default React.memo(RechartsPie)