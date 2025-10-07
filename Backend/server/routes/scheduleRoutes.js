const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const DoseLog = require('../models/DoseLog');
const { protect } = require('../middleware/authMiddleware');

// GET /api/schedules - Get all schedules for a user
router.get('/', protect, async (req, res) => {
    try {
        const schedules = await Schedule.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/schedules - Add a new schedule
router.post('/', protect, async (req, res) => {
    try {
        const { name, dosage, times, startDate } = req.body;
        const newSchedule = new Schedule({
            user: req.user._id,
            name,
            dosage,
            times,
            startDate,
        });
        const createdSchedule = await newSchedule.save();
        res.status(201).json(createdSchedule);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT /api/schedules/:id - Update a schedule
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, dosage, times, startDate, isActive, googleEventIds } = req.body;
        const schedule = await Schedule.findById(req.params.id);

        if (schedule && schedule.user.toString() === req.user._id.toString()) {
            schedule.name = name ?? schedule.name;
            schedule.dosage = dosage ?? schedule.dosage;
            schedule.times = times ?? schedule.times;
            schedule.startDate = startDate ?? schedule.startDate;
            schedule.isActive = isActive ?? schedule.isActive;
            schedule.googleEventIds = googleEventIds ?? schedule.googleEventIds;

            const updatedSchedule = await schedule.save();
            res.json(updatedSchedule);
        } else {
            res.status(404).json({ message: 'Schedule not found or user not authorized' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE /api/schedules/:id - Delete a schedule
router.delete('/:id', protect, async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (schedule && schedule.user.toString() === req.user._id.toString()) {
            await schedule.deleteOne();
            await DoseLog.deleteMany({ scheduleId: req.params.id }); // Also delete associated logs
            res.json({ message: 'Schedule removed successfully' });
        } else {
            res.status(404).json({ message: 'Schedule not found or user not authorized' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;