const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const { protect } = require('../middleware/authMiddleware');

// --- GET ALL MEDICINES (This is your correct code) ---
router.get('/', protect, async (req, res) => {
  try {
    const medicines = await Medicine.find({ user: req.user._id });
    res.json(medicines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- CREATE A NEW MEDICINE (This is your correct code) ---
router.post('/', protect, async (req, res) => {
  try {
    const { name, dosage, times, frequency } = req.body;
    const newMedicine = new Medicine({
      name,
      dosage,
      times,
      frequency,
      user: req.user._id
    });
    const createdMedicine = await newMedicine.save();
    res.status(201).json(createdMedicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- UPDATE A MEDICINE (This is your correct code) ---
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, dosage, times, frequency } = req.body;
        const medicine = await Medicine.findById(req.params.id);

        if (medicine && medicine.user.toString() === req.user._id.toString()) {
            medicine.name = name || medicine.name;
            medicine.dosage = dosage || medicine.dosage;
            medicine.times = times || medicine.times;
            medicine.frequency = frequency || medicine.frequency;

            const updatedMedicine = await medicine.save();
            res.json(updatedMedicine);
        } else {
            res.status(404).json({ message: 'Medicine not found or user not authorized' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// --- DELETE A MEDICINE (This is your correct code) ---
router.delete('/:id', protect, async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (medicine && medicine.user.toString() === req.user._id.toString()) {
            await medicine.deleteOne();
            res.json({ message: 'Medicine removed successfully' });
        } else {
            res.status(404).json({ message: 'Medicine not found or user not authorized' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// --- CORRECTION: ADDED THE MISSING DOSE LOGGING ROUTE ---
// @route   POST /api/medicines/:id/log
// @desc    Add a dose log (e.g., "taken" or "missed") to a medicine's history
// @access  Private
router.post('/:id/log', protect, async (req, res) => {
    try {
        // The frontend will send a 'status' in the request body
        const { status } = req.body;
        const medicine = await Medicine.findById(req.params.id);

        // Security check: Make sure the medicine exists and belongs to the user
        if (medicine && medicine.user.toString() === req.user._id.toString()) {
            
            // Create the new history entry
            const logEntry = {
                status: status,
                date: new Date()
            };

            // Add the new log to the beginning of the history array
            medicine.history.unshift(logEntry);

            const updatedMedicine = await medicine.save();
            res.json(updatedMedicine);
        } else {
            res.status(404).json({ message: 'Medicine not found or user not authorized' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


module.exports = router;