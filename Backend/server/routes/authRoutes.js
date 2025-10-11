const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const path = require('path');
const upload = require('../middleware/uploadMiddleware');
// Upload user photo (avatar) with robust error handling
router.post('/me/photo', async (req, res) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
        if (!token) return res.status(401).json({ message: 'Unauthorized' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Run multer upload and handle multer errors explicitly
        upload.single('photo')(req, res, async (err) => {
            if (err) {
                // Multer/file filter/size errors
                console.error('Avatar upload error:', err);
                return res.status(400).json({ message: err.message || 'Upload failed' });
            }
            try {
                if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
                const photoPath = `/uploads/avatars/${req.file.filename}`;
                const user = await User.findByIdAndUpdate(decoded.userId, { photo: photoPath }, { new: true }).select('-password');
                return res.json({ photo: photoPath, user });
            } catch (dbErr) {
                console.error('Avatar DB update error:', dbErr);
                return res.status(500).json({ message: 'Server error saving photo' });
            }
        });
    } catch (authErr) {
        console.error('Avatar auth error:', authErr);
        const status = authErr.name === 'JsonWebTokenError' || authErr.name === 'TokenExpiredError' ? 401 : 400;
        return res.status(status).json({ message: status === 401 ? 'Invalid or expired token' : 'Unable to upload photo' });
    }
});
const OTP = require('../models/OTP');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// POST /api/auth/request-email-otp
router.post('/request-email-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.create({ email, otp });

        await transporter.sendMail({
            // --- FIX: Changed quotes to backticks ---
            from: `MedWell <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your MedWell Verification Code',
            // --- FIX: Changed quotes to backticks ---
            text: `Your OTP for MedWell registration is: ${otp}. It will expire in 5 minutes.`,
            // --- FIX: Changed quotes to backticks ---
            html: `<div style="font-family: sans-serif; text-align: center; padding: 20px;"><h2>MedWell Verification</h2><p>Your one-time password is:</p><p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; background: #f0f0f0; padding: 10px; border-radius: 5px;">${otp}</p><p>This code will expire in 5 minutes.</p></div>`,
        });

        res.status(200).json({ message: 'Verification code sent to your email.' });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ message: 'Error sending verification code.' });
    }
});

// POST /api/auth/verify-email-otp
router.post('/verify-email-otp', async (req, res) => {
    try {
        const { name, email, password, mobile, place, otp } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }

        const otpRecord = await OTP.findOne({ email, otp }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired verification code.' });
        }

        const newUser = await User.create({ name, email, password, mobile, place });
        await OTP.deleteMany({ email });

        if (newUser) {
            res.status(201).json({
                success: true,
                message: 'Registration successful! Please log in.'
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Error verifying OTP and registering:", error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                token: jwt.sign({ userId: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '30d' }),
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    photo: user.photo || ''
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// POST /api/auth/request-password-reset-otp
router.post('/request-password-reset-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ message: 'If an account with this email exists, a verification code has been sent.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.create({ email, otp });

        await transporter.sendMail({
            // --- FIX: Changed quotes to backticks ---
            from: `MedWell <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your MedWell Password Reset Code',
            // --- FIX: Changed quotes to backticks ---
            html: `<div style="font-family: sans-serif; text-align: center; padding: 20px;"><h2>MedWell Password Reset</h2><p>Your one-time password is:</p><p style="font-size: 24px; font-weight: bold;">${otp}</p><p>This code will expire in 5 minutes.</p></div>`,
        });

        res.status(200).json({ message: 'A verification code has been sent to your email.' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending verification code.' });
    }
});

// POST /api/auth/verify-password-reset-otp
router.post('/verify-password-reset-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const otpRecord = await OTP.findOne({ email, otp }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired verification code.' });
        }

        const user = await User.findOne({ email });
        const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });

        await OTP.deleteMany({ email });

        res.status(200).json({ success: true, resetToken });
    } catch (error) {
        res.status(500).json({ message: 'Server error during OTP verification.' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ message: 'Missing information.' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.password = password;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token.' });
    }
});

module.exports = router;

// Profile routes (must be added before module.exports if using multiple routers, but here we extend existing)
router.get('/me', async (req, res) => {
    try {
        // Assuming protect middleware is applied at router level elsewhere; if not, we can add token parse here
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
        if (!token) return res.status(401).json({ message: 'Unauthorized' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Always return a 'photo' field as a string
    const userObj = user.toObject();
    userObj.photo = typeof userObj.photo === 'string' ? userObj.photo : '';
    res.json(userObj);
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

router.put('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
        if (!token) return res.status(401).json({ message: 'Unauthorized' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const updates = {};
        const allowed = ['name','mobile','place','timezone','notifications'];
        allowed.forEach(k => {
            if (req.body[k] !== undefined) updates[k] = req.body[k];
        });
        const user = await User.findByIdAndUpdate(decoded.userId, updates, { new: true }).select('-password');
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: 'Unable to update profile' });
    }
});