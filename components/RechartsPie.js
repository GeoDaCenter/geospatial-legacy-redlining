import React from "react";
import {
    Cell,
    PieChart,
    Pie
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
    
    return (
        <PieChart width={100} height={100}>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" isAnimationActive={false}>
                {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
        </PieChart>
    )
}

export default React.memo(RechartsPie)