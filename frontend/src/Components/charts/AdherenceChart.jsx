import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdherenceChart = ({ data }) => (
    <div className="panel-glass panel-hover p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-4">Weekly Adherence</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="name" tick={{ fill: '#A0AEC0' }} />
                <YAxis tick={{ fill: '#A0AEC0' }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none', color: '#fff' }} />
                <Legend wrapperStyle={{ color: '#A0AEC0' }} />
                <Bar dataKey="adherence" fill="url(#colorUv)" />
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0.8}/>
                    </linearGradient>
                </defs>
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export default AdherenceChart;
