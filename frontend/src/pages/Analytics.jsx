
import React, { useState, useEffect } from 'react';
import { medicineApi } from '../api/medicineApi';
import AdherenceChart from '../Components/charts/AdherenceChart';
import MissedByHourChart from '../Components/charts/MissedByHourChart';
import StatCard from '../Components/cards/StatCard';
import { BarChart, CheckCircle, XCircle } from 'lucide-react';

const AnalyticsPage = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const doseLogs = await medicineApi.getDoseLogs();
                if (doseLogs && doseLogs.length > 0) {
                    const totalTaken = doseLogs.filter(l => l.status === 'Taken').length;
                    const totalMissed = doseLogs.filter(l => l.status === 'Missed').length;
                    const totalSkipped = doseLogs.filter(l => l.status === 'Skipped').length;
                    const totalLogs = totalTaken + totalMissed + totalSkipped;
                    const overallAdherence = totalLogs > 0 ? Math.round((totalTaken / totalLogs) * 100) : 0;

                    const weeklyAdherence = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIndex) => {
                        const dayLogs = doseLogs.filter(d => new Date(d.actionTime).getDay() === dayIndex);
                        const takenCount = dayLogs.filter(d => d.status === 'Taken').length;
                        const totalCount = dayLogs.filter(d => ['Taken','Skipped','Missed'].includes(d.status)).length;
                        if (totalCount === 0) return { name: day, adherence: 0 };
                        return { name: day, adherence: Math.round((takenCount / totalCount) * 100) };
                    });

                    // Missed Doses (today only)
                    const todayStr = new Date().toISOString().slice(0, 10);
                    const missedDosesToday = doseLogs.filter(d => d.status === 'Missed' && d.actionTime && new Date(d.actionTime).toISOString().slice(0, 10) === todayStr);

                    setAnalyticsData({
                        stats: { overallAdherence, totalTaken, totalMissed, totalSkipped },
                        weeklyAdherence,
                        missedDosesToday,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch analytics data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


        if (loading) return (
            <div className="relative min-h-[60vh] flex items-center justify-center">
                <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-blue-900 via-indigo-800 to-fuchsia-800 opacity-80 blur-[2px]" />
                <div className="panel-glass panel-hover p-12 text-center max-w-lg w-full shadow-2xl animate-fade-in">
                    <BarChart className="mx-auto text-fuchsia-400 animate-bounce" size={60} />
                    <h3 className="mt-6 text-2xl font-bold text-white">Calculating Analytics...</h3>
                    <p className="text-gray-300 mt-3 text-lg">Please wait while we crunch your wellness data.</p>
                </div>
            </div>
        );


        if (!analyticsData) {
            return (
                <div className="relative min-h-[60vh] flex items-center justify-center">
                    <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-blue-900 via-indigo-800 to-fuchsia-800 opacity-80 blur-[2px]" />
                    <div className="panel-glass panel-hover p-12 text-center max-w-lg w-full shadow-2xl animate-fade-in">
                        <BarChart className="mx-auto text-fuchsia-400 animate-bounce" size={60} />
                        <h3 className="mt-6 text-2xl font-bold text-white">Not Enough Data</h3>
                        <p className="text-gray-300 mt-3 text-lg">Log your first dose from the dashboard to generate analytics.</p>
                    </div>
                </div>
            );
        }


        // Animated glassy gradient background
        return (
            <div className="relative min-h-screen w-full overflow-x-hidden">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-blue-900 via-indigo-800 to-fuchsia-800 opacity-90 blur-[2px]" />
                {/* Glassy floating shapes */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-400/20 rounded-full blur-2xl animate-pulse-slower" />
                <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-indigo-400/20 rounded-full blur-2xl animate-pulse-slow" />

                <div className="relative max-w-6xl mx-auto px-4 py-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-10 tracking-tight text-center">
                        Wellness Analytics
                    </h1>

                                {/* Stat Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                                    <StatCard
                                        title="Overall Adherence"
                                        value={`${analyticsData.stats.overallAdherence}%`}
                                        icon={<BarChart size={28} />}
                                        color="bg-gradient-to-br from-blue-500/30 to-fuchsia-500/20 text-blue-200 shadow-lg"
                                    />
                                    <StatCard
                                        title="Total Doses Taken"
                                        value={`${analyticsData.stats.totalTaken}`}
                                        icon={<CheckCircle size={28} />}
                                        color="bg-gradient-to-br from-green-500/30 to-blue-500/10 text-green-200 shadow-lg"
                                    />
                                    <StatCard
                                        title="Total Missed Doses"
                                        value={`${analyticsData.stats.totalMissed}`}
                                        icon={<XCircle size={28} />}
                                        color="bg-gradient-to-br from-red-500/30 to-fuchsia-500/10 text-red-200 shadow-lg"
                                    />
                                    <StatCard
                                        title="Total Skipped Doses"
                                        value={`${analyticsData.stats.totalSkipped}`}
                                        icon={<XCircle size={28} />}
                                        color="bg-gradient-to-br from-pink-500/30 to-fuchsia-500/10 text-pink-200 shadow-lg"
                                    />
                                </div>

                                {/* ...existing code... */}
                                {/* Charts Section - Full Width, Stacked */}
                                <div className="flex flex-col gap-10 w-full">
                                    <AdherenceChart data={analyticsData.weeklyAdherence} />
                                </div>
                </div>
            </div>
        );
};
export default AnalyticsPage;