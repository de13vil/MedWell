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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Dose History</h1>
            </div>
            
            {logGroups.length > 0 ? (
                <div className="space-y-8">
                    {logGroups.map(date => (
                        <div key={date}>
                             <h2 className="text-xl font-semibold text-purple-300 mb-4 sticky top-0 bg-gray-900/80 backdrop-blur-sm py-2 z-10">{date}</h2>
                             <div className="panel-glass">
                                <div className="divide-y divide-gray-700">
                                    {logs[date].map(log => (
                                        <div key={log.logId} className="flex items-center justify-between p-4 hover:bg-black/20 backdrop-blur-sm">
                                            <div className="flex items-center gap-4">
                                                {log.status === 'Taken' ? <CheckCircle size={24} className="text-green-400"/> : <XCircle size={24} className="text-red-400"/>}
                                                <div>
                                                    <p className="font-semibold text-white">{log.medicationName}</p>
                                                    <p className="text-sm text-gray-400">Scheduled for {dateUtils.formatTime(new Date(log.scheduledTime).toTimeString().slice(0,5))}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-semibold text-sm ${log.status === 'Taken' ? 'text-green-300' : 'text-red-300'}`}>{log.status}</p>
                                                <p className="text-xs text-gray-500">{new Date(log.actionTime).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center panel-glass p-12 rounded-2xl">
                    <HistoryIcon size={48} className="mx-auto text-gray-400"/>
                    <h3 className="mt-4 text-xl font-bold text-white">No History Yet</h3>
                    <p className="text-gray-400">Log your first dose from the dashboard to see your history here.</p>
                </div>
            )}
        </div>
    );
};
export default HistoryPage;

