import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MissedByHourChart = ({ data }) => {
    const COLORS = ['#8B5CF6', '#34D399', '#F59E0B', '#EC4899'];
    return (
            <div className="panel-glass panel-hover p-6 rounded-2xl">
            <h3 className="text-white text-lg font-bold mb-4">Missed Doses by Time of Day</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={data} dataKey="missed" nameKey="hour" cx="50%" cy="50%" outerRadius={100} label>
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
