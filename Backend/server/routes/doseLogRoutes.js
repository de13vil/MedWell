const express = require('express');
const router = express.Router();
const DoseLog = require('../models/DoseLog');
const { protect } = require('../middleware/authMiddleware');

// GET /api/doselogs - Get all dose logs for a user
router.get('/', protect, async (req, res) => {
    try {
        const logs = await DoseLog.find({ user: req.user._id }).sort({ actionTime: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// POST /api/doselogs - Create a new dose log
router.post('/', protect, async (req, res) => {
    try {
        const { scheduleId, medicationName, scheduledTime, actionTime, status } = req.body;
        console.log('[DoseLog] Creating log:', { scheduleId, medicationName, scheduledTime, actionTime, status });
        const newLog = new DoseLog({
            user: req.user._id,
            scheduleId,
            medicationName,
            scheduledTime,
            time: req.body.time,
            actionTime,
            status,
        });
        const createdLog = await newLog.save();
        console.log('[DoseLog] Created:', createdLog);
        res.status(201).json(createdLog);
    } catch (error) {
        console.error('[DoseLog] Error creating log:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;