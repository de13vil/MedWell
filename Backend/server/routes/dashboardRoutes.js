const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const DoseLog = require('../models/DoseLog');
const { protect } = require('../middleware/authMiddleware');

// GET /api/dashboard/summary - A single endpoint to get all dashboard data
router.get('/summary', protect, async (req, res) => {

    try {
        const { _id: userId, timezone = 'UTC' } = req.user;
        const { DateTime } = require('luxon');
        // Use user's timezone for all calculations
        const now = DateTime.now().setZone(timezone);
        const today = now.startOf('day');
        const startOfToday = today;
        // Get active schedules and all dose logs in parallel for efficiency
        const [schedules, doseLogs] = await Promise.all([
            Schedule.find({ user: userId, isActive: true }),
            DoseLog.find({ user: userId })
        ]);
        // Use user's timezone for all calculations
        const eligibleSchedules = schedules.filter(s => {
            const schedDate = DateTime.fromJSDate(s.startDate).setZone(timezone).startOf('day');
            return schedDate <= startOfToday;
        });
        const currentHHmm = now.toFormat('HH:mm');
        // Debug: Log eligible schedules and dose logs for today
        console.log('--- DEBUG: Dashboard Summary ---');
        console.log('Eligible schedules:', eligibleSchedules.map(s => ({id: s._id, name: s.name, times: s.times, startDate: s.startDate})));
        console.log('Dose logs for user:', doseLogs.map(l => ({scheduleId: l.scheduleId, time: l.time, status: l.status, actionTime: l.actionTime})));

        // Helper to zero-pad times for robust comparison
        const padTime = t => {
            if (!t) return '';
            const [h, m] = t.split(':');
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        };

        // 1. Calculate Upcoming Doses (future doses for today, not yet logged)
        const upcomingDoses = eligibleSchedules.flatMap(s => {
            const schedStart = DateTime.fromJSDate(s.startDate).setZone(timezone).startOf('day');
            const days = Math.max(0, today.diff(schedStart, 'days').days);
            let upcoming = [];
            // Only today, only times after now
            for (const time of s.times) {
                const [hour, minute] = time.split(':').map(Number);
                const doseTime = today.set({ hour, minute, second: 0, millisecond: 0 });
                if (doseTime <= now) continue;
                // Exclude if already logged as Taken, Skipped, or Missed for today
                const wasLogged = doseLogs.some(log => {
                    const logTime = DateTime.fromISO(log.actionTime, { zone: timezone });
                    return String(log.scheduleId) === String(s._id) &&
                        padTime(log.time) === padTime(time) &&
                        ['Taken', 'Skipped', 'Missed'].includes(log.status) &&
                        logTime.toFormat('yyyy-MM-dd') === today.toFormat('yyyy-MM-dd');
                });
                if (wasLogged) continue;
                upcoming.push({ scheduleId: s._id, medicationName: `${s.name} ${s.dosage}`, time: padTime(time), date: today.toFormat('yyyy-MM-dd') });
            }
            return upcoming;
        }).sort((a, b) => a.time.localeCompare(b.time));
        // 2. Missed doses: only today's missed doses, each dose appears only once
        const missedDoses = eligibleSchedules.flatMap(s => {
            let missed = [];
            for (const time of s.times) {
                const [hour, minute] = time.split(':').map(Number);
                const doseTime = today.set({ hour, minute, second: 0, millisecond: 0 });
                if (doseTime >= now) continue;
                // Only mark as missed if there is NO log for this schedule, date, and time with status Taken, Skipped, or Missed
                const wasLogged = doseLogs.some(log => {
                    const logTime = DateTime.fromISO(log.actionTime, { zone: timezone });
                    // Must match scheduleId, time, and date exactly
                    return String(log.scheduleId) === String(s._id) &&
                        padTime(log.time) === padTime(time) &&
                        logTime.toFormat('yyyy-MM-dd') === today.toFormat('yyyy-MM-dd') &&
                        ['Taken', 'Skipped', 'Missed'].includes(log.status);
                });
                if (wasLogged) continue;
                missed.push({
                    scheduleId: s._id,
                    medicationName: `${s.name} ${s.dosage}`,
                    time: padTime(time),
                    date: today.toFormat('yyyy-MM-dd')
                });
            }
            return missed;
        })
        .filter((dose, idx, arr) =>
            arr.findIndex(d => d.scheduleId === dose.scheduleId && d.time === dose.time && d.date === dose.date) === idx
        )
        .sort((a, b) => a.time.localeCompare(b.time));
        // 3. Skipped doses: only today's current schedule times, matching missed logic
        const skippedDoses = eligibleSchedules.flatMap(s => {
            let skipped = [];
            for (const time of s.times) {
                const [hour, minute] = time.split(':').map(Number);
                const doseTime = today.set({ hour, minute, second: 0, millisecond: 0 });
                if (doseTime >= now) continue; // Only if time has passed today
                // Is there a log for this schedule, time, and today with status Skipped?
                const log = doseLogs.find(log => {
                    const logTime = DateTime.fromISO(log.actionTime, { zone: timezone });
                    return String(log.scheduleId) === String(s._id) &&
                        padTime(log.time) === padTime(time) &&
                        log.status === 'Skipped' &&
                        logTime.toFormat('yyyy-MM-dd') === today.toFormat('yyyy-MM-dd');
                });
                if (log) {
                    skipped.push({
                        scheduleId: s._id,
                        medicationName: `${s.name} ${s.dosage}`,
                        time: padTime(time),
                        date: today.toFormat('yyyy-MM-dd')
                    });
                }
            }
            return skipped;
        })
        // Remove duplicates (shouldn't be any, but just in case)
        .filter((dose, idx, arr) =>
            arr.findIndex(d => d.scheduleId === dose.scheduleId && d.time === dose.time && d.date === dose.date) === idx
        )
        .sort((a, b) => a.time.localeCompare(b.time));

        // 2. Get Recent Activity (include Missed)
        const recentActivity = doseLogs
            .filter(log => ['Taken', 'Skipped', 'Missed'].includes(log.status))
            .sort((a, b) => b.actionTime - a.actionTime)
            .slice(0, 5);

        // 3. Calculate 7-day Adherence (include Missed)
        const sevenDaysAgo = now.minus({ days: 7 });
        const weekLogs = doseLogs.filter(log => {
            const logTime = DateTime.fromISO(log.actionTime, { zone: timezone });
            return logTime > sevenDaysAgo && ['Taken', 'Skipped', 'Missed'].includes(log.status);
        });
        const takenInWeek = weekLogs.filter(l => l.status === 'Taken').length;
        const adherenceWeekly = weekLogs.length > 0 ? Math.round((takenInWeek / weekLogs.length) * 100) : 0;

        // 4. Calculate Current Streak (increment for each day with at least one 'Taken', break otherwise)
        let currentStreak = 0;
        for (let i = 0; i < 30; i++) {
            const dayStart = today.minus({ days: i }).startOf('day');
            const dayEnd = today.minus({ days: i }).endOf('day');
            const logsForDay = doseLogs.filter(log => {
                const logTime = DateTime.fromISO(log.actionTime, { zone: timezone });
                return logTime >= dayStart && logTime <= dayEnd;
            });
            // Print debug info for every day
            console.log(`[Streak Debug] LOOP DAY ${i}: dayStart: ${dayStart.toISO()}, dayEnd: ${dayEnd.toISO()}`);
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
