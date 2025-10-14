const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String },
    place: { type: String },
    timezone: { type: String, default: Intl.DateTimeFormat().resolvedOptions().timeZone },
    notifications: {
        remindersEnabled: { type: Boolean, default: true },
        reminderLeadMinutes: { type: Number, default: 10 },
    },
    photo: { type: String }, // URL or relative path to avatar
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    bloodGroup: { type: String },
    allergies: { type: String },
    chronicConditions: { type: String },
    medications: { type: String },
    emergencyContact: {
        name: { type: String },
        relation: { type: String },
        phone: { type: String }
    },
    doctor: {
        name: { type: String },
        phone: { type: String },
        email: { type: String }
    },
    address: { type: String },
    insurance: {
        provider: { type: String },
        policyNumber: { type: String }
    },
    height: { type: String },
    weight: { type: String },
    lifestyleNotes: { type: String },
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);