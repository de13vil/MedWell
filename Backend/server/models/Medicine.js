const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
  },
  times: [{
    type: String,
    required: true
  }],
  frequency: {
    type: String,
    required: true,
    default: 'daily'
  },
  // --- THIS IS THE FIX ---
  // We add the 'history' array to the blueprint, so the database
  // knows how to store the log of taken/missed doses.
  history: [{
    date: {
        type: Date,
        default: Date.now
    },
    status: {
      type: String,
      enum: ['taken', 'missed', 'snoozed'], // Only allows these values
      required: true
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema);