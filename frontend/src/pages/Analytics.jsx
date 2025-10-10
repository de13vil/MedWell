
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
                    const totalMissed = doseLogs.filter(l => l.status === 'Skipped').length;
                    const totalLogs = totalTaken + totalMissed;
                    const overallAdherence = totalLogs > 0 ? Math.round((totalTaken / totalLogs) * 100) : 0;

                    const weeklyAdherence = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIndex) => {
                        const dayLogs = doseLogs.filter(d => new Date(d.actionTime).getDay() === dayIndex);
                        const takenCount = dayLogs.filter(d => d.status === 'Taken').length;
                        const totalCount = dayLogs.filter(d => d.status === 'Taken' || d.status === 'Skipped').length;
                        if (totalCount === 0) return { name: day, adherence: 0 };
                        return { name: day, adherence: Math.round((takenCount / totalCount) * 100) };
                    });

                    const missedByHour = [
                        { hour: 'Morning (6-11am)', missed: 0 },
                        { hour: 'Afternoon (12-5pm)', missed: 0 },
                        { hour: 'Evening (6-11pm)', missed: 0 },
                        { hour: 'Night (12-5am)', missed: 0 },
                    ];
                    doseLogs.filter(d => d.status === 'Skipped').forEach(d => {
                        const hour = new Date(d.scheduledTime).getHours();
                        if (hour >= 6 && hour < 12) missedByHour[0].missed++;
                        else if (hour >= 12 && hour < 18) missedByHour[1].missed++;
                        else if (hour >= 18 && hour < 24) missedByHour[2].missed++;
                        else missedByHour[3].missed++;
                    });

                    setAnalyticsData({
                        stats: { overallAdherence, totalTaken, totalMissed },
                        weeklyAdherence,
                        missedByHour: missedByHour.filter(m => m.missed > 0),
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
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
                                        title="Total Doses Missed"
                                        value={`${analyticsData.stats.totalMissed}`}
                                        icon={<XCircle size={28} />}
                                        color="bg-gradient-to-br from-red-500/30 to-fuchsia-500/10 text-red-200 shadow-lg"
                                    />
                                </div>

                                {/* Charts Section - Full Width, Stacked */}
                                <div className="flex flex-col gap-10 w-full">
                                    <AdherenceChart data={analyticsData.weeklyAdherence} />
                                    {analyticsData.missedByHour.length > 0 ? (
                                        <MissedByHourChart data={analyticsData.missedByHour} />
                                    ) : (
                                        <div className="panel-glass panel-hover panel-inner-pad shadow-2xl animate-fade-in-up flex flex-col items-center justify-center min-h-[260px] w-full">
                                            <h3 className="text-white text-lg font-bold mb-4">Missed Doses by Time of Day</h3>
                                            <p className="text-gray-300">No missed doses recorded yet. Keep up the great work!</p>
                                        </div>
                                    )}
                                </div>
                </div>
            </div>
        );
};
export default AnalyticsPage;