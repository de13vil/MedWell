
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdherenceChart = ({ data }) => (
    <div className="panel-glass panel-hover p-6 rounded-2xl w-full">
        <h3 className="text-2xl font-bold text-white mb-6 text-center tracking-wide">Weekly Adherence (Line Graph)</h3>
        <ResponsiveContainer width="100%" height={340}>
            <LineChart data={data} margin={{ top: 20, right: 40, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="name" tick={{ fill: '#A0AEC0', fontSize: 16 }} />
                <YAxis tick={{ fill: '#A0AEC0', fontSize: 16 }} unit="%" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none', color: '#fff' }} />
                <Legend wrapperStyle={{ color: '#A0AEC0' }} />
                <Line type="monotone" dataKey="adherence" stroke="#8B5CF6" strokeWidth={4} dot={{ r: 7, fill: '#EC4899', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 10 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

export default AdherenceChart;
