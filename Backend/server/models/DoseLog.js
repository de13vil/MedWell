const mongoose = require('mongoose');

const doseLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    scheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Schedule',
    },
    medicationName: {
        type: String,
        required: true,
    },
    scheduledTime: {
        type: Date,
        required: true,
        // Always set using luxon and user's timezone
    },
    // original schedule time string e.g. '08:30' to help match scheduled dose entries
    time: {
        type: String,
    },
    actionTime: {
        type: Date,
        required: true,
        // Always set using luxon and user's timezone
    },
    status: {
        type: String,
        required: true,
    enum: ['Taken', 'Skipped', 'Missed'],
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('DoseLog', doseLogSchema);