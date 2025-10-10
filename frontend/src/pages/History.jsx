import React, { useState, useEffect } from 'react';
import { medicineApi } from '../api/medicineApi';
import { History as HistoryIcon, CheckCircle, XCircle } from 'lucide-react';
import { dateUtils } from '../utils/dateUtils';

const HistoryPage = () => {
    const [logs, setLogs] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        medicineApi.getDoseLogs().then(data => {
            const grouped = data.reduce((acc, log) => {
                const date = new Date(log.actionTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(log);
                return acc;
            }, {});
            setLogs(grouped);
            setLoading(false);
        }).catch(error => {
            console.error("Failed to fetch history:", error);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-center p-10">Loading History...</div>;

    const logGroups = Object.keys(logs);

        return (
            <div className="relative min-h-screen flex flex-col bg-gray-900 text-white overflow-x-hidden">
                {/* Animated background orb */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-72 bg-gradient-to-r from-purple-500/20 via-pink-400/10 to-purple-500/20 rounded-full blur-3xl opacity-60 pointer-events-none z-0" />
                {/* Animated divider */}
                <div className="w-full flex justify-center items-center mb-8 z-10 relative mt-8">
                    <div className="h-1 w-32 rounded-full bg-gradient-to-r from-purple-500/40 via-pink-400/30 to-purple-500/40 animate-pulse" />
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-10 z-10 relative w-full max-w-4xl mx-auto px-4 md:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">Dose History</h1>
                    </div>
                    {logGroups.length > 0 ? (
                        <div className="space-y-12">
                            {logGroups.map(date => (
                                <div key={date}>
                                    <h2 className="text-2xl font-extrabold text-purple-200 mb-6 sticky top-0 bg-gray-900/80 backdrop-blur-sm py-3 z-10 rounded-xl shadow-inner px-4">{date}</h2>
                                    <div className="panel-glass bg-gradient-to-br from-purple-900/40 to-pink-900/30 border border-purple-900/30 shadow-2xl rounded-2xl">
                                        <div className="divide-y divide-purple-900/30">
                                            {logs[date].map(log => (
                                                <div key={log.logId} className="flex items-center justify-between px-6 py-5 hover:bg-black/20 backdrop-blur-sm rounded-xl transition-all">
                                                    <div className="flex items-center gap-5">
                                                        {log.status === 'Taken' ? <CheckCircle size={28} className="text-green-400"/> : <XCircle size={28} className="text-red-400"/>}
                                                        <div>
                                                            <p className="font-bold text-lg text-white">{log.medicationName}</p>
                                                            <p className="text-base text-purple-200">Scheduled for {dateUtils.formatTime(new Date(log.scheduledTime).toTimeString().slice(0,5))}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`font-bold text-base ${log.status === 'Taken' ? 'text-green-300' : 'text-red-300'}`}>{log.status}</p>
                                                        <p className="text-xs text-purple-200 font-mono mt-1">{new Date(log.actionTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center panel-glass p-16 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/30 border border-purple-900/30 shadow-2xl">
                            <HistoryIcon size={56} className="mx-auto text-purple-400"/>
                            <h3 className="mt-6 text-2xl font-extrabold text-white">No History Yet</h3>
                            <p className="text-purple-200 mt-3 text-lg">Log your first dose from the dashboard to see your history here.</p>
                        </div>
                    )}
                </div>
            </div>
    );
};
export default HistoryPage;

