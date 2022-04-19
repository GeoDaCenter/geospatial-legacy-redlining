import React from "react";
import {
    ResponsiveContainer,
    Bar,
    BarChart,
    XAxis,
    YAxis,
    Cell
} from 'recharts'

const chartEntries = ['A', 'B', 'C', 'D']
const COLORS = [
    'rgb(115, 169, 77)',
    'rgb(52, 172, 198)',
    'rgb(219, 207, 0)',
    'rgb(226, 77, 90)',];

function RechartsPie({
    data
}) {
    const chartData = chartEntries.map(e => ({
        name: e,
        value: data[e] * 100
    }))

    return (
            <div style={{transform:'rotate(90deg)'}}>
            <BarChart
                width={200}
                height={200}
                data={chartData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                layout="horizontal"
            >
                <XAxis dataKey="name" />
                <YAxis dataKey="value" domain={[0,50]}/>
                <Bar dataKey="value">{chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}</Bar>
            </BarChart>
            </div>
    )
}

export default React.memo(RechartsPie)

