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
        res.status(201).json(createdLog);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;