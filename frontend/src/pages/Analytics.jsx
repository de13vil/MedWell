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

    if (loading) return <div className="text-center p-10">Calculating Analytics...</div>;

    if (!analyticsData) {
        return (
            <div className="panel-glass panel-hover p-12 text-center">
                    <BarChart className="mx-auto text-gray-400" size={52} />
                    <h3 className="mt-4 text-xl font-bold text-white">Not Enough Data</h3>
                    <p className="text-gray-400 mt-2">Log your first dose from the dashboard to generate analytics.</p>
                </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Wellness Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard title="Overall Adherence" value={`${analyticsData.stats.overallAdherence}%`} icon={<BarChart size={24}/>} color="bg-blue-500/20 text-blue-300" />
                <StatCard title="Total Doses Taken" value={`${analyticsData.stats.totalTaken}`} icon={<CheckCircle size={24}/>} color="bg-green-500/20 text-green-300" />
                <StatCard title="Total Doses Missed" value={`${analyticsData.stats.totalMissed}`} icon={<XCircle size={24}/>} color="bg-red-500/20 text-red-300" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="panel-glass panel-hover panel-inner-pad">
                    <AdherenceChart data={analyticsData.weeklyAdherence} />
                </div>
                {analyticsData.missedByHour.length > 0 ? (
                    <div className="panel-glass panel-hover panel-inner-pad">
                        <MissedByHourChart data={analyticsData.missedByHour} />
                    </div>
                ) : (
                    <div className="panel-glass panel-hover panel-inner-pad flex flex-col items-center justify-center">
                        <h3 className="text-white text-lg font-bold mb-4">Missed Doses by Time of Day</h3>
                        <p className="text-gray-400">No missed doses recorded yet. Keep up the great work!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default AnalyticsPage;