const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const DoseLog = require('../models/DoseLog');
const { protect } = require('../middleware/authMiddleware');

// GET /api/dashboard/summary - A single endpoint to get all dashboard data
router.get('/summary', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const today = new Date();
        const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));

        // Get active schedules and all dose logs in parallel for efficiency
        const [schedules, doseLogs] = await Promise.all([
            Schedule.find({ user: userId, isActive: true }),
            DoseLog.find({ user: userId })
        ]);

        // 1. Calculate Upcoming Doses (exclude ones already logged)
        const now = new Date();

        // Helper: are two times within tolerance (ms)
        const withinTolerance = (d1, d2, minutes = 2) => {
            const diff = Math.abs(new Date(d1).getTime() - new Date(d2).getTime());
            return diff <= minutes * 60 * 1000; // minutes -> ms
        };

        // Define currentHHmm for logging and time comparison
        const currentHHmm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

        // Consider only schedules that start now or earlier (today or before)
        const eligibleSchedules = schedules.filter(s => s.startDate <= now);
    console.log('[Dashboard] Eligible schedules:', eligibleSchedules.map(s => ({id: s._id, name: s.name, startDate: s.startDate, times: s.times})));


    const upcomingDoses = eligibleSchedules.flatMap(s => 
        s.times.map(time => {
            const [hour, minute] = time.split(':').map(Number);
            const doseTime = new Date(startOfToday);
            doseTime.setHours(hour, minute, 0, 0);
            console.log(`[Dashboard] Checking upcoming: schedule ${s.name} time ${time} vs currentHHmm ${currentHHmm}`);

            if (doseTime <= now) return null; // only future doses

            return { scheduleId: s._id, medicationName: `${s.name} ${s.dosage}`, time };
        }).filter(Boolean)
    ).sort((a, b) => a.time.localeCompare(b.time));
    console.log('[Dashboard] Upcoming doses:', upcomingDoses);

        // Missed doses: scheduled today or earlier, time has passed, and not logged yet

    const missedDoses = eligibleSchedules.flatMap(s =>
        s.times.map(time => {
            const [hour, minute] = time.split(':').map(Number);
            const doseTime = new Date(startOfToday);
            doseTime.setHours(hour, minute, 0, 0);
            console.log(`[Dashboard] Checking missed: schedule ${s.name} time ${time} vs currentHHmm ${currentHHmm}`);  
            if (doseTime > now) return null; // only past/now doses

            return { scheduleId: s._id, medicationName: `${s.name} ${s.dosage}`, time };
        }).filter(Boolean)
    ).sort((a, b) => a.time.localeCompare(b.time));
    console.log('[Dashboard] Missed doses:', missedDoses);


        // 2. Get Recent Activity (include Missed)
        const recentActivity = doseLogs
            .filter(log => ['Taken', 'Skipped', 'Missed'].includes(log.status))
            .sort((a, b) => b.actionTime - a.actionTime)
            .slice(0, 5);


    // 3. Calculate 7-day Adherence (include Missed)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekLogs = doseLogs.filter(log => log.actionTime > sevenDaysAgo && (log.status === 'Taken' || log.status === 'Skipped' || log.status === 'Missed'));
    const takenInWeek = weekLogs.filter(l => l.status === 'Taken').length;
    const adherenceWeekly = weekLogs.length > 0 ? Math.round((takenInWeek / weekLogs.length) * 100) : 0;


        // 4. Calculate Current Streak (break on Missed or Skipped)
        let currentStreak = 0;
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (i + 1));
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));
            
            const schedulesForDay = schedules.filter(s => s.startDate <= dayStart);
            if (schedulesForDay.length === 0) continue;

            const totalDosesScheduled = schedulesForDay.reduce((acc, s) => acc + s.times.length, 0);
            
            const logsForDay = doseLogs.filter(log => log.actionTime >= dayStart && log.actionTime <= dayEnd);
            const takenLogsForDay = logsForDay.filter(l => l.status === 'Taken');
            const missedOrSkipped = logsForDay.some(l => l.status === 'Missed' || l.status === 'Skipped');
            
            if (totalDosesScheduled > 0 && takenLogsForDay.length >= totalDosesScheduled && !missedOrSkipped) {
                currentStreak++;
            } else if (totalDosesScheduled > 0) {
                break;
            }
        }

        res.json({
            kpis: { adherenceWeekly, currentStreak, upcomingToday: upcomingDoses.length },
            upcomingDoses,
            missedDoses,
            recentActivity,
        });

    } catch (error) {
        console.error("Dashboard Summary Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;