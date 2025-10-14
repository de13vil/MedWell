import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
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
    const [doseLogsData, setDoseLogsData] = useState([]);
    // Track which upcoming doses have been acted on (Taken/Skipped) in this session
    const [hiddenUpcoming, setHiddenUpcoming] = useState([]);

    // Helper to consistently key doses (normalize scheduleId to string)
    const doseKey = (d) => `${String(d.scheduleId)}-${d.time}`;

    const fetchData = useCallback(() => {
        setLoading(true);
        Promise.all([
            otherApi.getDashboardSummary(),
            medicineApi.getDoseLogs()
        ]).then(([summaryData, doseLogs]) => {
            setSummary(summaryData);
            setDoseLogsData(doseLogs || []);
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

    // Avoid duplicate initial fetches in StrictMode/dev by guarding with a ref
    const hasFetchedRef = useRef(false);
    useEffect(() => {
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchData();
            notificationService.requestPermission();
        }
    }, [fetchData]);

    // Periodically refresh dashboard summary so time-based sections update automatically
    useEffect(() => {
        const interval = setInterval(() => {
            fetchData();
        }, 60000); // every 60 seconds
        return () => clearInterval(interval);
    }, [fetchData]);


    const handleLogDose = async (dose, status) => {
        console.debug('handleLogDose start', { dose, status });
        // Track this dose as hidden in upcoming
        setHiddenUpcoming(prev => [...prev, doseKey(dose)]);

        // Prevent duplicate logs for the same dose/time/status on the same day
        const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
        const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));
        const alreadyLoggedToday = (doseLogsData || []).some(log => {
            if (!log.scheduleId || !log.actionTime) return false;
            const sameSchedule = String(log.scheduleId) === String(dose.scheduleId);
            const sameTime = (log.time || '') === dose.time;
            const sameStatus = log.status === status;
            const actionDate = new Date(log.actionTime);
            return sameSchedule && sameTime && sameStatus && actionDate >= startOfToday && actionDate <= endOfToday;
        });
        if (alreadyLoggedToday) {
            console.debug('Dose already logged today, skipping duplicate log.');
            return;
        }

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
            // remove from upcoming in authoritative state as well
            const newUpcoming = (prev.upcomingDoses || []).filter(u => doseKey(u) !== doseKey(dose));
            // prepend to recentActivity (use createdLog from server), but only if not already present for today
            const newRecent = [createdLog, ...(prev.recentActivity || [])]
                .filter((log, idx, arr) =>
                    arr.findIndex(l => l.scheduleId === log.scheduleId && l.time === log.time && new Date(l.actionTime).toDateString() === new Date(log.actionTime).toDateString()) === idx
                )
                .slice(0, 5);
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

    // --- Custom logic for upcoming and missed doses ---
    // Helper: get today's date string (YYYY-MM-DD)
    const todayStr = new Date().toISOString().slice(0, 10);
    // Helper: get current time in minutes since midnight
    const getMinutes = (t) => {
        const [h, m] = t.split(':');
        return parseInt(h) * 60 + parseInt(m);
    };
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // Upcoming doses are provided by backend already filtered for future times and eligible schedules
    // Build acted-on keys for today from dose logs
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));
    const toHHmm = (dateLike, fallbackTimeStr) => {
        if (fallbackTimeStr) return fallbackTimeStr;
        const d = new Date(dateLike);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    };
    const actedTodayKeys = new Set(
        (doseLogsData || [])
            .filter(l => ['Taken','Skipped','Missed'].includes(l.status) && l.actionTime && new Date(l.actionTime) >= startOfToday && new Date(l.actionTime) <= endOfToday)
            .map(l => {
                const hhmm = toHHmm(l.scheduledTime, l.time);
                return `${String(l.scheduleId)}-${hhmm}`;
            })
    );

    // Upcoming doses: hide locally hidden and already acted-on today
    const upcomingDoses = (summary?.upcomingDoses || []).filter(
        dose => !hiddenUpcoming.includes(doseKey(dose)) && !actedTodayKeys.has(doseKey(dose))
    );

    // Missed and Skipped doses: show all logs with status 'Missed' for today
    const missedDoses = (doseLogsData || []).filter(
        l => l.status === 'Missed' && l.actionTime && new Date(l.actionTime).toDateString() === new Date().toDateString()
    );
    const skippedDoses = (doseLogsData || []).filter(
        l => l.status === 'Skipped' && l.actionTime && new Date(l.actionTime).toDateString() === new Date().toDateString()
    );

    // Auto-log missed doses as "Missed" (once, with debug)
    const missedLoggedRef = useRef({});
    useEffect(() => {
        if (!missedDoses.length) return;
        missedDoses.forEach(async (dose) => {
            const key = `${dose.scheduleId}-${dose.time}`;
            // Only auto-log if not already in recentActivity
            const alreadyLogged = (summary?.recentActivity || []).some(
                log => log.scheduleId === dose.scheduleId && log.time === dose.time && ['Taken','Skipped','Missed'].includes(log.status)
            );
            if (!alreadyLogged && !missedLoggedRef.current[key]) {
                missedLoggedRef.current[key] = true;
                console.debug('Auto-logging missed dose:', dose);
                await handleLogDose(dose, 'Missed');
            }
        });
        // eslint-disable-next-line
    }, [missedDoses.length, summary]);

    if (loading || !summary) return <div className="text-center p-10">Loading Dashboard...</div>;

    return (
        <div className="relative min-h-screen flex flex-col bg-gray-900 text-white">
            {/* Animated background orb */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-gradient-to-r from-purple-500/20 via-pink-400/10 to-purple-500/20 rounded-full blur-3xl opacity-60 pointer-events-none z-0" />
            {/* Animated divider */}
            <div className="w-full flex justify-center items-center mb-8 z-10 relative">
                <div className="h-1 w-32 rounded-full bg-gradient-to-r from-purple-500/40 via-pink-400/30 to-purple-500/40 animate-pulse" />
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-8 z-10 relative w-full max-w-7xl mx-auto px-4 md:px-8">
                <motion.h1
                    className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-xl text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    Welcome back, {user?.name.split(' ')[0]}!
                </motion.h1>

                {prediction && (
                    <motion.div
                        className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg relative flex items-center justify-center shadow-lg"
                        role="alert"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <AlertTriangle className="mr-3 animate-bounce"/>
                        <span className="block sm:inline">{prediction}</span>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <StatCard title="Upcoming Doses Today" value={upcomingDoses.length} icon={<Clock size={24}/>} color="bg-blue-500/20 text-blue-300" />
                    <StatCard title="Adherence (7d)" value={`${summary.kpis.adherenceWeekly}%`} icon={<BarChart2 size={24}/>} color="bg-green-500/20 text-green-300" />
                    <StatCard title="Current Streak" value={`${summary.kpis.currentStreak} Days`} icon={<Zap size={24}/>} color="bg-yellow-500/20 text-yellow-300" />
                </div>

                <div className="flex flex-col gap-10 w-full max-w-3xl mx-auto">
                    {/* Upcoming Doses Section (filtered) */}
                    <motion.div
                        className="panel-glass panel-hover panel-inner-pad shadow-2xl border border-purple-900/30 w-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                    >
                        <h2 className="text-2xl font-extrabold text-white mb-6 tracking-tight">Upcoming Doses</h2>
                        {upcomingDoses.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingDoses.map(dose => (
                                    <motion.div
                                        key={`${dose.scheduleId}-${dose.time}`}
                                        className="bg-gradient-to-r from-purple-900/40 to-pink-900/30 p-5 rounded-2xl flex justify-between items-center backdrop-blur-md hover:scale-[1.03] hover:shadow-2xl transition-all border border-purple-800/30"
                                        whileHover={{ scale: 1.03 }}
                                    >
                                        <div>
                                            <p className="font-bold text-lg text-white">{dose.medicationName.split(' ')[0]}</p>
                                            <p className="text-sm text-purple-200">{dose.medicationName.split(' ').slice(1).join(' ')}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className="font-bold text-xl text-purple-400 mr-4">{dateUtils.formatTime(dose.time)}</p>
                                            <button type="button" onClick={(e) => { e.preventDefault(); handleLogDose(dose, 'Skipped'); }} title="Skip Dose" className="p-3 bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/40 hover:scale-110 transition-all"><X size={18}/></button>
                                            <button type="button" onClick={(e) => { e.preventDefault(); handleLogDose(dose, 'Taken'); }} title="Take Dose" className="p-3 bg-green-500/20 text-green-300 rounded-full hover:bg-green-500/40 hover:scale-110 transition-all"><Check size={18}/></button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <p>No more upcoming doses for today. Great job!</p>
                                <motion.button
                                    onClick={() => navigate('/schedules')}
                                    className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl flex items-center mx-auto shadow-lg transition-all text-lg"
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <Plus size={20} className="mr-2" /> View Schedules
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                    {/* Missed Doses Section */}
                    <motion.div
                        className="panel-glass panel-hover panel-inner-pad shadow-2xl border border-red-900/30 w-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                    >
                        <h2 className="text-2xl font-extrabold text-red-300 mb-6 tracking-tight">Missed Doses</h2>
                        {missedDoses.length > 0 ? (
                            <ul className="space-y-4">
                                {missedDoses.map(dose => (
                                    <li key={`${dose.scheduleId}-${dose.time}`} className="flex items-center justify-between text-base bg-red-900/20 rounded-xl px-4 py-3">
                                        <div>
                                            <span className="font-semibold text-white">{dose.medicationName}</span>
                                            <span className="ml-3 text-red-400 font-mono">{dateUtils.formatTime(dose.time)}</span>
                                        </div>
                                        <span className="text-red-400 font-bold">Missed</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-6 text-gray-400">
                                <p>No missed doses today. Keep it up!</p>
                            </div>
                        )}
                    </motion.div>
                    <motion.div
                        className="panel-glass panel-hover panel-inner-pad shadow-2xl border border-pink-900/30 w-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.18 }}
                    >
                        <h2 className="text-2xl font-extrabold text-pink-300 mb-6 tracking-tight">Skipped Doses</h2>
                        {skippedDoses.length > 0 ? (
                            <ul className="space-y-4">
                                {skippedDoses.map(dose => (
                                    <li key={`${dose.scheduleId}-${dose.time}`} className="flex items-center justify-between text-base bg-pink-900/20 rounded-xl px-4 py-3">
                                        <div>
                                            <span className="font-semibold text-white">{dose.medicationName}</span>
                                            <span className="ml-3 text-pink-400 font-mono">{dateUtils.formatTime(dose.time)}</span>
                                        </div>
                                        <span className="text-pink-400 font-bold">Skipped</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-6 text-gray-400">
                                <p>No skipped doses today. Good job!</p>
                            </div>
                        )}
                    </motion.div>
                    <motion.div
                        className="panel-glass panel-hover panel-inner-pad shadow-2xl border border-purple-900/30 w-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-extrabold text-white mb-6 tracking-tight">Recent Activity</h2>
                        {summary.recentActivity.length > 0 ? (
                            <ul className="space-y-4">
                                {summary.recentActivity.map(log => (
                                    <motion.li
                                        key={log._id}
                                        className="flex items-center justify-between text-base hover:bg-black/10 rounded-xl px-4 py-3 transition-all"
                                        whileHover={{ scale: 1.025 }}
                                    >
                                        <div className="flex items-center">
                                            {log.status === 'Taken' ? (
                                                <Check size={18} className="mr-3 text-green-400"/>
                                            ) : log.status === 'Missed' ? (
                                                <AlertTriangle size={18} className="mr-3 text-yellow-400"/>
                                            ) : log.status === 'Skipped' ? (
                                                <X size={18} className="mr-3 text-red-400"/>
                                            ) : null}
                                            <span className="font-semibold text-white">{log.medicationName}</span>
                                        </div>
                                        <span className="text-purple-200 font-mono">{new Date(log.actionTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <p>No recent activity to show.</p>
                                <p className="text-base mt-2">Doses you take or miss will appear here.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
export default DashboardPage;