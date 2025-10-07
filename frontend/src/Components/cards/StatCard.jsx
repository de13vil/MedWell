import React from 'react';

const StatCard = ({ title, value, icon, color }) => (
    <div className="p-5 rounded-2xl shadow-xl flex items-center space-x-4 border border-transparent glass-card">
        <div className={`p-3 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white`}>{icon}</div>
        <div>
            <p className="text-gray-300 text-xs uppercase tracking-wide">{title}</p>
            <p className="text-white text-2xl font-extrabold">{value}</p>
        </div>
    </div>
);

export default StatCard;
