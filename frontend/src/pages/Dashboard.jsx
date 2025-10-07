import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../Components/cards/StatCard';
import { Clock, BarChart2, Zap, Plus, Check, X, AlertTriangle } from 'lucide-react';
import { dateUtils } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import { otherApi } from '../api/otherApi';
import { medicineApi } from '../api/medicineApi';
import { predictionService } from '../services/predictionService';
import { notificationService } from '../services/notificationService';

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [prediction, setPrediction] = useState(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        Promise.all([
            otherApi.getDashboardSummary(),
            medicineApi.getDoseLogs()
        ]).then(([summaryData, doseLogs]) => {
            setSummary(summaryData);
            const adherencePrediction = predictionService.predictAdherence(doseLogs);
            setPrediction(adherencePrediction);

            summaryData.upcomingDoses.forEach(dose => {
                notificationService.scheduleNotification(dose);
            });

            setLoading(false);
        }).catch(error => {
            console.error("Failed to fetch dashboard data:", error);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchData();
        notificationService.requestPermission();
    }, [fetchData]);

    const handleLogDose = async (dose, status) => {
        console.debug('handleLogDose start', { dose, status });
        // Optimistic UI update: remove the upcoming dose locally immediately
        setSummary(prev => {
            if (!prev) return prev;
            const newUpcoming = prev.upcomingDoses.filter(u => !(u.scheduleId === dose.scheduleId && u.time === dose.time));
            const newKpis = { ...(prev.kpis || {}) };
            if (typeof newKpis.upcomingToday === 'number') {
                newKpis.upcomingToday = Math.max(0, newKpis.upcomingToday - 1);
            }
            return { ...prev, upcomingDoses: newUpcoming, kpis: newKpis };
        });

        const log = {
            scheduleId: dose.scheduleId,
            medicationName: dose.medicationName,
            time: dose.time,
            scheduledTime: new Date(new Date().toDateString() + ' ' + dose.time).toISOString(),
            actionTime: new Date().toISOString(),
            status,
        };

        let createdLog = null;
        try {
            createdLog = await medicineApi.createDoseLog(log);
            console.debug('createDoseLog response', createdLog);
        } catch (error) {
            console.error('Failed to create dose log:', error);
            // Revert (or sync) by refetching authoritative data
            fetchData();
            return;
        }

        // Update UI authoritatively using the server response
        setSummary(prev => {
            if (!prev) return prev;
            // remove upcoming dose
            const newUpcoming = prev.upcomingDoses.filter(u => !(u.scheduleId === dose.scheduleId && u.time === dose.time));
            // prepend to recentActivity (use createdLog from server)
            const newRecent = [createdLog, ...(prev.recentActivity || [])].slice(0, 5);
            const newKpis = { ...(prev.kpis || {}) };
            if (typeof newKpis.upcomingToday === 'number') {
                newKpis.upcomingToday = Math.max(0, newKpis.upcomingToday - 1);
            }
            return { ...prev, upcomingDoses: newUpcoming, recentActivity: newRecent, kpis: newKpis };
        });

        console.debug('UI updated, re-syncing with server');
        // Re-sync with server to ensure any other derived values are correct
        fetchData();
    };

    if (loading || !summary) return <div className="text-center p-10">Loading Dashboard...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name.split(' ')[0]}!</h1>
            
            {prediction && (
                <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg relative flex items-center" role="alert">
                    <AlertTriangle className="mr-3"/>
                    <span className="block sm:inline">{prediction}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Upcoming Doses Today" value={summary.kpis.upcomingToday} icon={<Clock size={24}/>} color="bg-blue-500/20 text-blue-300" />
                <StatCard title="Adherence (7d)" value={`${summary.kpis.adherenceWeekly}%`} icon={<BarChart2 size={24}/>} color="bg-green-500/20 text-green-300" />
                <StatCard title="Current Streak" value={`${summary.kpis.currentStreak} Days`} icon={<Zap size={24}/>} color="bg-yellow-500/20 text-yellow-300" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="panel-glass panel-hover panel-inner-pad">
                    <h2 className="text-xl font-bold text-white mb-4">Upcoming Doses</h2>
                    {summary.upcomingDoses.length > 0 ? (
                        <div className="space-y-3">
                            {summary.upcomingDoses.map(dose => (
                                <div key={`${dose.scheduleId}-${dose.time}`} className="bg-black/20 p-3 rounded-lg flex justify-between items-center backdrop-blur-sm">
                                    <div>
                                        <p className="font-semibold text-white">{dose.medicationName.split(' ')[0]}</p>
                                        <p className="text-sm text-gray-400">{dose.medicationName.split(' ').slice(1).join(' ')}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-lg text-purple-400 mr-4">{dateUtils.formatTime(dose.time)}</p>
                                        <button type="button" onClick={(e) => { e.preventDefault(); handleLogDose(dose, 'Skipped'); }} title="Skip Dose" className="p-2 bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/40 transition-colors"><X size={16}/></button>
                                        <button type="button" onClick={(e) => { e.preventDefault(); handleLogDose(dose, 'Taken'); }} title="Take Dose" className="p-2 bg-green-500/20 text-green-300 rounded-full hover:bg-green-500/40 transition-colors"><Check size={16}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <p>No more upcoming doses for today. Great job!</p>
                             <button onClick={() => navigate('/schedules')} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center mx-auto">
                                <Plus size={18} className="mr-2" /> View Schedules
                            </button>
                        </div>
                    )}
                </div>

                <div className="panel-glass panel-hover panel-inner-pad">
                    <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                    {summary.recentActivity.length > 0 ? (
                         <ul className="space-y-3">
                            {summary.recentActivity.map(log => (
                                // --- THIS IS THE FIX ---
                                // We add a unique key prop using the ID from the database
                                <li key={log._id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                        {log.status === 'Taken' ? <Check size={16} className="mr-3 text-green-400"/> : <X size={16} className="mr-3 text-red-400"/>}
                                        <span className="font-medium text-white">{log.medicationName}</span>
                                    </div>
                                    <span className="text-gray-500">{new Date(log.actionTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                           <p>No recent activity to show.</p>
                           <p className="text-sm mt-2">Doses you take or miss will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default DashboardPage;