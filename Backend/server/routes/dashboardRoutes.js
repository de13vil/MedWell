const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const DoseLog = require('../models/DoseLog');
const { protect } = require('../middleware/authMiddleware');

// GET /api/dashboard/summary - A single endpoint to get all dashboard data
router.get('/summary', protect, async (req, res) => {

    try {
        const userId = req.user._id;
    // Always use local time for today
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        // Get active schedules and all dose logs in parallel for efficiency
        const [schedules, doseLogs] = await Promise.all([
            Schedule.find({ user: userId, isActive: true }),
            DoseLog.find({ user: userId })
        ]);
        // Use local time for all calculations
        const eligibleSchedules = schedules.filter(s => {
            const schedDate = new Date(s.startDate);
            schedDate.setHours(0, 0, 0, 0);
            return schedDate <= startOfToday;
        });
        const currentHHmm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        // Debug: Log eligible schedules and dose logs for today
        console.log('--- DEBUG: Dashboard Summary ---');
        console.log('Eligible schedules:', eligibleSchedules.map(s => ({id: s._id, name: s.name, times: s.times, startDate: s.startDate})));
        console.log('Dose logs for user:', doseLogs.map(l => ({scheduleId: l.scheduleId, time: l.time, status: l.status, actionTime: l.actionTime})));

        // 1. Calculate Upcoming Doses (exclude ones already logged)
        const withinTolerance = (d1, d2, minutes = 2) => {
            const diff = Math.abs(new Date(d1).getTime() - new Date(d2).getTime());
            return diff <= minutes * 60 * 1000; // minutes -> ms
        };

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

        // Missed doses: scheduled today or earlier, time has passed, and not logged as Taken, Skipped, or Missed for today
        // Helper to zero-pad times for robust comparison
        const padTime = t => {
            if (!t) return '';
            const [h, m] = t.split(':');
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        };
        const missedDoses = eligibleSchedules.flatMap(s =>
            s.times.map(time => {
                const [hour, minute] = time.split(':').map(Number);
                const doseTime = new Date(startOfToday);
                doseTime.setHours(hour, minute, 0, 0);
                if (doseTime > now) return null; // only past/now doses

                // Check if this dose was logged as Taken, Skipped, or Missed (robust to time formatting)
                const wasLogged = doseLogs.some(log => {
                    const match = String(log.scheduleId) === String(s._id) &&
                        padTime(log.time) === padTime(time) &&
                        ['Taken', 'Skipped', 'Missed'].includes(log.status) &&
                        new Date(log.actionTime).toDateString() === now.toDateString();
                    if (match) {
                        console.log(`[DEBUG] Dose at ${padTime(time)} for schedule ${s.name} already logged as ${log.status} at ${log.actionTime}`);
                    }
                    return match;
                });
                if (wasLogged) return null;

                // Not taken, not skipped, not already marked missed
                console.log(`[DEBUG] Missed dose detected: schedule ${s.name}, time ${padTime(time)}`);
                return { scheduleId: s._id, medicationName: `${s.name} ${s.dosage}`, time: padTime(time) };
            }).filter(Boolean)
        ).sort((a, b) => a.time.localeCompare(b.time));

        // Skipped doses: doses logged as Skipped today
        const skippedDoses = doseLogs.filter(log => {
            const logDate = new Date(log.actionTime);
            return log.status === 'Skipped' &&
                logDate.getFullYear() === now.getFullYear() &&
                logDate.getMonth() === now.getMonth() &&
                logDate.getDate() === now.getDate();
        }).map(log => ({
            scheduleId: log.scheduleId,
            medicationName: log.medicationName,
            time: log.time
        }));

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

        // 4. Calculate Current Streak (increment for each day with at least one 'Taken', break otherwise)
        let currentStreak = 0;
        for (let i = 0; i < 30; i++) {
            const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i, 0, 0, 0, 0);
            const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i, 23, 59, 59, 999);
            const logsForDay = doseLogs.filter(log => {
                const logDate = new Date(log.actionTime);
                return logDate >= dayStart && logDate <= dayEnd;
            });
            // Print debug info for every day
            console.log(`[Streak Debug] LOOP DAY ${i}: dayStart: ${dayStart.toISOString()}, dayEnd: ${dayEnd.toISOString()}`);
            console.log(`[Streak Debug] LOOP DAY ${i}: logsForDay:`, logsForDay.map(l => ({status: l.status, actionTime: l.actionTime, time: l.time})));
            if (logsForDay.some(log => log.status === 'Taken')) {
                currentStreak++;
                console.log(`[Streak Debug] LOOP DAY ${i}: Found 'Taken' dose, streak incremented to ${currentStreak}`);
            } else {
                console.log(`[Streak Debug] LOOP DAY ${i}: No 'Taken' dose, streak broken.`);
                break;
            }
        }

        res.json({
            kpis: { adherenceWeekly, currentStreak, upcomingToday: upcomingDoses.length },
            upcomingDoses,
            missedDoses,
            skippedDoses,
            recentActivity,
        });

    } catch (error) {
        console.error("Dashboard Summary Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
