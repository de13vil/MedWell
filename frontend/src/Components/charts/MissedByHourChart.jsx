
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MissedByHourChart = ({ data }) => {
    const COLORS = ['#8B5CF6', '#34D399', '#F59E0B', '#EC4899'];
    return (
        <div className="panel-glass panel-hover p-6 rounded-2xl w-full">
            <h3 className="text-2xl font-bold text-white mb-6 text-center tracking-wide">Missed Doses by Time of Day (Doughnut)</h3>
            <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="missed"
                        nameKey="hour"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        label
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none', color: '#fff' }} />
                    <Legend wrapperStyle={{ color: '#A0AEC0' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MissedByHourChart;
