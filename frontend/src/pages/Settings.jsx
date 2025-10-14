import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../api/authApi.js';
import { googleCalendarApi } from '../services/googleCalendarApi.js';
import { notificationService } from '../services/notificationService.js';
import { motion } from 'framer-motion';

const SettingsPage = () => {
    const { user } = useAuth();
    // We remove the apiReady state and just check if the calendar is enabled.
    const [isCalendarEnabled, setIsCalendarEnabled] = useState(googleCalendarApi.isCalendarEnabled());
    const [notificationPermission, setNotificationPermission] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );
    
    // This effect will re-check the calendar status if it changes.
    useEffect(() => {
        const interval = setInterval(() => {
            const isEnabled = googleCalendarApi.isCalendarEnabled();
            if (isEnabled !== isCalendarEnabled) {
                setIsCalendarEnabled(isEnabled);
            }
        }, 1000); // Check every second

        return () => clearInterval(interval);
    }, [isCalendarEnabled]);


    const handleCalendarSignIn = () => {
        googleCalendarApi.handleAuthClick().then(() => {
            setIsCalendarEnabled(true);
        }).catch(err => {
            console.error("Calendar sign-in error", err);
            alert("Could not sign in to Google Calendar. Make sure pop-ups are not blocked and try again.");
        });
    };

    const handleCalendarSignOut = () => {
        googleCalendarApi.handleSignoutClick();
        setIsCalendarEnabled(false);
    };

    const handleNotificationRequest = () => {
        notificationService.requestPermission().then(permission => {
            setNotificationPermission(permission);
        });
    };

    return (
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }}
            className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#211e3a] via-[#4f378b] to-[#312e81] py-12">
            <div className="w-full max-w-3xl mx-auto px-4">
                <h1 className="text-4xl font-extrabold text-white mb-10 text-center tracking-tight drop-shadow-lg">Settings</h1>
                <div className="flex flex-col gap-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.025, y: -6 }}
                        transition={{ delay: 0.2, duration: 0.7, type: 'spring', stiffness: 180 }}
                        className="relative rounded-3xl shadow-2xl glass-card border border-transparent p-10 flex flex-col items-center overflow-hidden transition-all"
                    >
                        <div className="absolute inset-0 rounded-3xl pointer-events-none neon-border" />
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-tr from-purple-600 to-pink-500 opacity-10 blur-3xl pointer-events-none z-0" />
                        <h2 className="text-2xl font-bold text-white mb-7 text-center flex items-center gap-2 z-10">
                            <span className="inline-block bg-gradient-to-tr from-indigo-600 to-purple-700 text-white rounded-full p-2 shadow-lg">
                                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z" fill="currentColor"/></svg>
                            </span>
                            Your Profile
                        </h2>
                        <ProfileCard />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.7 }}
                        className="rounded-3xl shadow-xl border border-indigo-900/40 bg-gradient-to-br from-[#232042]/80 via-[#312e81]/70 to-[#4f378b]/80 backdrop-blur-lg p-10 flex flex-col items-center relative overflow-hidden">
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-900/30 rounded-full blur-3xl z-0"></div>
                        <h2 className="text-2xl font-bold text-indigo-100 mb-7 text-center flex items-center gap-2 z-10">
                            <span className="inline-block bg-gradient-to-tr from-blue-900 to-indigo-700 text-white rounded-full p-2 shadow-lg">
                                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M17 10V7a5 5 0 0 0-10 0v3M5 10h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10Zm7 5v2m-4-6h8" stroke="currentColor" strokeWidth="2"/></svg>
                            </span>
                            Integrations & Notifications
                        </h2>
                        <div className="space-y-8 w-full z-10">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                                <div>
                                    <h3 className="font-semibold text-indigo-100 flex items-center gap-2"><span>📅</span> Google Calendar Sync</h3>
                                    <p className="text-sm text-indigo-200">Automatically sync your medication schedules.</p>
                                </div>
                                {isCalendarEnabled ? (
                                    <button onClick={handleCalendarSignOut} className="bg-gradient-to-tr from-red-800 to-pink-700 hover:from-red-900 hover:to-pink-800 text-white font-semibold py-2 px-6 rounded-xl shadow transition-all duration-200">
                                        Disconnect
                                    </button>
                                ) : (
                                    <button onClick={handleCalendarSignIn} className="bg-gradient-to-tr from-blue-900 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-semibold py-2 px-6 rounded-xl shadow transition-all duration-200">
                                        Connect
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                                <div>
                                    <h3 className="font-semibold text-indigo-100 flex items-center gap-2"><span>🔔</span> Browser Notifications</h3>
                                    <p className="text-sm text-indigo-200">Status: <span className="font-semibold capitalize">{notificationPermission}</span></p>
                                </div>
                                {notificationPermission !== 'granted' && (
                                    <button onClick={handleNotificationRequest} className="bg-gradient-to-tr from-gray-700 to-indigo-900 hover:from-gray-800 hover:to-indigo-950 text-white font-semibold py-2 px-6 rounded-xl shadow transition-all duration-200">
                                        Request Permission
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
};

export default SettingsPage;

// Inline ProfileCard component for simplicity
const ProfileCard = () => {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: '',
    place: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notifications: { remindersEnabled: true, reminderLeadMinutes: 10 },
    photo: user?.photo || '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    allergies: '',
    chronicConditions: '',
    medications: '',
    emergencyContact: { name: '', relation: '', phone: '' },
    doctor: { name: '', phone: '', email: '' },
    address: '',
    insurance: { provider: '', policyNumber: '' },
    height: '',
    weight: '',
    lifestyleNotes: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(user?.photo ? user.photo : '');

    useEffect(() => {
        let mounted = true;
        authApi.getProfile().then(profile => {
            if (!mounted) return;
            setForm(prev => ({
                ...prev,
                name: profile.name || prev.name,
                email: profile.email || prev.email,
                mobile: profile.mobile || '',
                place: profile.place || '',
                timezone: profile.timezone || prev.timezone,
                notifications: profile.notifications || prev.notifications,
                photo: profile.photo || '',
                dateOfBirth: profile.dateOfBirth || '',
                gender: profile.gender || '',
                bloodGroup: profile.bloodGroup || '',
                allergies: profile.allergies || '',
                chronicConditions: profile.chronicConditions || '',
                medications: profile.medications || '',
                emergencyContact: profile.emergencyContact || { name: '', relation: '', phone: '' },
                doctor: profile.doctor || { name: '', phone: '', email: '' },
                address: profile.address || '',
                insurance: profile.insurance || { provider: '', policyNumber: '' },
                height: profile.height || '',
                weight: profile.weight || '',
                lifestyleNotes: profile.lifestyleNotes || '',
            }));
            setPhotoPreview(profile.photo ? profile.photo : '');
            updateUser(profile); // Sync AuthContext and localStorage with latest profile
            setLoading(false);
        }).catch(err => {
            console.error('Failed to load profile', err);
            setLoading(false);
        });
        return () => { mounted = false; };
    }, []);
    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedPhotoFile(file);
        setMessage('');
        // Show local preview only; wait to upload until Save Changes
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('notifications.')) {
            const key = name.split('.')[1];
            setForm(prev => ({
                ...prev,
                notifications: {
                    ...prev.notifications,
                    [key]: type === 'checkbox' ? checked : Number(value),
                }
            }));
        } else if (name.startsWith('emergencyContact.')) {
            const key = name.split('.')[1];
            setForm(prev => ({
                ...prev,
                emergencyContact: {
                    ...prev.emergencyContact,
                    [key]: value,
                }
            }));
        } else if (name.startsWith('doctor.')) {
            const key = name.split('.')[1];
            setForm(prev => ({
                ...prev,
                doctor: {
                    ...prev.doctor,
                    [key]: value,
                }
            }));
        } else if (name.startsWith('insurance.')) {
            const key = name.split('.')[1];
            setForm(prev => ({
                ...prev,
                insurance: {
                    ...prev.insurance,
                    [key]: value,
                }
            }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const saveProfile = async () => {
        setSaving(true);
        setMessage('');
        try {
            const payload = {
                name: form.name,
                mobile: form.mobile,
                place: form.place,
                timezone: form.timezone,
                notifications: form.notifications,
            };
            const updated = await authApi.updateProfile(payload);
            // If a new photo was selected, upload it now
            if (selectedPhotoFile) {
                setUploading(true);
                try {
                    const { photo, user: updatedUser } = await authApi.uploadProfilePhoto(selectedPhotoFile);
                    setForm(prev => ({ ...prev, photo }));
                    setPhotoPreview(photo || '');
                    // Ensure the new photo is saved in AuthContext and localStorage
                    updateUser({ ...(user || {}), ...updated, photo });
                } catch (err) {
                    const msg = err?.response?.data?.message || 'Failed to upload photo';
                    setMessage(msg);
                    setUploading(false);
                    setSaving(false);
                    return;
                } finally {
                    setUploading(false);
                    setSelectedPhotoFile(null);
                }
            } else {
                // No photo change; update local AuthContext user for immediate reflection
                updateUser({ ...(user || {}), ...updated });
            }
            setMessage('Profile updated');
        } catch (err) {
            console.error('Failed to update profile', err);
            setMessage('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center text-white">Loading profile...</div>;

    const getInitials = (name) => {
        if (!name) return '';
        const parts = name.trim().split(/\s+/);
        const first = parts[0]?.[0] || '';
        const second = parts[1]?.[0] || '';
        return (first + second).toUpperCase();
    };
    const initials = getInitials(form.name || user?.name);

    return (
        <form className="w-full flex flex-col items-center gap-10" onSubmit={e => { e.preventDefault(); saveProfile(); }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}
                className="flex flex-col items-center gap-4 relative">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-700/70 shadow-xl bg-gradient-to-tr from-[#312e81]/80 to-[#4f378b]/60 flex items-center justify-center mb-2 group">
                    {photoPreview ? (
                        <img
                            src={photoPreview}
                            alt=""
                            className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                            style={{ display: 'block' }}
                        />
                    ) : (
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            alt="Placeholder"
                            className="w-full h-full object-cover rounded-full opacity-80"
                        />
                    )}
                    <label htmlFor="avatarInput" className="absolute bottom-2 right-2 bg-gradient-to-tr from-indigo-700 to-purple-700 text-white rounded-full p-2 shadow-lg cursor-pointer border-2 border-white/40 hover:scale-110 transition-transform">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M16.5 19.5h-9A2.5 2.5 0 0 1 5 17V9A2.5 2.5 0 0 1 7.5 6.5h1.379a1 1 0 0 0 .948-.684l.276-.828A2 2 0 0 1 12.01 4a2 2 0 0 1 1.907 1.32l.276.828a1 1 0 0 0 .948.684h1.379A2.5 2.5 0 0 1 19 9v8a2.5 2.5 0 0 1-2.5 2.5Z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                    </label>
                    <input
                        id="avatarInput"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        disabled={uploading}
                    />
                </div>
                <span className="text-2xl font-bold text-indigo-100 drop-shadow-lg">{form.name || 'Your Name'}</span>
                <span className="text-md text-indigo-200">{form.email}</span>
            </motion.div>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {/* Basic Info */}
                <div className="col-span-2 mb-2">
                    <h3 className="text-lg font-bold text-pink-200 flex items-center gap-2"><span className="text-2xl">👤</span> Basic Info</h3>
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Name</label>
                    <input name="name" value={form.name} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" />
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Email (read-only)</label>
                    <input name="email" value={form.email} disabled className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" />
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Mobile</label>
                    <input name="mobile" value={form.mobile} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" />
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" />
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Gender</label>
                    <select name="gender" value={form.gender} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Blood Group</label>
                    <input name="bloodGroup" value={form.bloodGroup} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" placeholder="e.g. O+" />
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Address</label>
                    <input name="address" value={form.address} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" />
                </div>
                {/* Medical Info */}
                <div className="col-span-2 pt-4">
                    <h3 className="text-lg font-bold text-purple-200 flex items-center gap-2"><span className="text-2xl">🩺</span> Medical Info</h3>
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Allergies</label>
                    <input name="allergies" value={form.allergies} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" placeholder="e.g. Penicillin" />
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Chronic Conditions</label>
                    <input name="chronicConditions" value={form.chronicConditions} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" placeholder="e.g. Diabetes" />
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Current Medications</label>
                    <input name="medications" value={form.medications} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" placeholder="e.g. Metformin" />
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Height</label>
                    <input name="height" value={form.height} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" placeholder="e.g. 170 cm" />
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Weight</label>
                    <input name="weight" value={form.weight} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" placeholder="e.g. 65 kg" />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm text-purple-200 mb-1">Lifestyle Notes</label>
                    <textarea name="lifestyleNotes" value={form.lifestyleNotes} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" placeholder="e.g. Non-smoker, regular exercise" />
                </div>
                {/* Emergency & Doctor Info */}
                <div className="col-span-2 pt-4">
                    <h3 className="text-lg font-bold text-red-200 flex items-center gap-2"><span className="text-2xl">🚨</span> Emergency & Doctor</h3>
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Emergency Contact Name</label>
                    <input name="emergencyContact.name" value={form.emergencyContact?.name || ''} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" />
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Relation</label>
                    <input name="emergencyContact.relation" value={form.emergencyContact?.relation || ''} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" />
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Phone</label>
                    <input name="emergencyContact.phone" value={form.emergencyContact?.phone || ''} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" />
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Primary Doctor Name</label>
                    <input name="doctor.name" value={form.doctor?.name || ''} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" />
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Doctor Phone</label>
                    <input name="doctor.phone" value={form.doctor?.phone || ''} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" />
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Doctor Email</label>
                    <input name="doctor.email" value={form.doctor?.email || ''} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" />
                </div>
                {/* Insurance */}
                <div className="col-span-2 pt-4">
                    <h3 className="text-lg font-bold text-blue-200 flex items-center gap-2"><span className="text-2xl">💳</span> Insurance</h3>
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Provider</label>
                    <input name="insurance.provider" value={form.insurance?.provider || ''} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" />
                </div>
                <div>
                    <label className="block text-sm text-purple-200 mb-1">Policy Number</label>
                    <input name="insurance.policyNumber" value={form.insurance?.policyNumber || ''} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm text-purple-200 mb-2">Timezone</label>
                    <input name="timezone" value={form.timezone} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm text-purple-200 mb-2">Reminders</label>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" name="notifications.remindersEnabled" checked={!!form.notifications?.remindersEnabled} onChange={onChange} />
                            <span className="text-white">Enable reminders</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-purple-200">Lead time (minutes)</span>
                            <input type="number" min="0" name="notifications.reminderLeadMinutes" value={form.notifications?.reminderLeadMinutes ?? 10} onChange={onChange} className="w-24 px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full flex justify-end gap-3 mt-4">
                <button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-5 rounded-lg">
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {message && <span className="text-sm text-gray-300">{message}</span>}
            </div>
        </form>
    );
}