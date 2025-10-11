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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900 py-8">
            <div className="w-full max-w-2xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-white mb-8 text-center">Settings</h1>
                <div className="flex flex-col gap-8">
                    <div className="rounded-2xl shadow-2xl border border-white/10 bg-white/10 p-8 flex flex-col items-center">
                        <h2 className="text-xl font-semibold text-white mb-6 text-center">Your Profile</h2>
                        <ProfileCard />
                    </div>
                    <div className="rounded-2xl shadow-2xl border border-white/10 bg-white/10 p-8 flex flex-col items-center">
                        <h2 className="text-xl font-semibold text-white mb-6 text-center">Integrations & Notifications</h2>
                        <div className="space-y-6 w-full">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                                <div>
                                    <h3 className="font-medium text-white">Google Calendar Sync</h3>
                                    <p className="text-sm text-gray-300">Automatically sync your medication schedules.</p>
                                </div>
                                {isCalendarEnabled ? (
                                    <button onClick={handleCalendarSignOut} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">
                                        Disconnect
                                    </button>
                                ) : (
                                    <button onClick={handleCalendarSignIn} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
                                        Connect
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                                <div>
                                    <h3 className="font-medium text-white">Browser Notifications</h3>
                                    <p className="text-sm text-gray-300">Status: <span className="font-semibold capitalize">{notificationPermission}</span></p>
                                </div>
                                {notificationPermission !== 'granted' && (
                                    <button onClick={handleNotificationRequest} className="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg">
                                        Request Permission
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
        <form className="w-full flex flex-col items-center gap-6" onSubmit={e => { e.preventDefault(); saveProfile(); }}>
            <div className="flex flex-col items-center gap-3">
                <div className="relative w-28 h-28 rounded-full overflow-hidden ring-2 ring-white/15 shadow-lg flex items-center justify-center">
                    {photoPreview ? (
                        <img
                            src={photoPreview}
                            alt=""
                            className="w-full h-full object-cover rounded-full"
                            style={{ display: 'block' }}
                        />
                    ) : (
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            alt="Placeholder"
                            className="w-full h-full object-cover rounded-full opacity-80"
                        />
                    )}
                </div>
                {/* Hidden file input */}
                <input
                    id="avatarInput"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={uploading}
                />
                <label htmlFor="avatarInput" className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${uploading ? 'bg-gray-600 text-gray-200' : 'bg-purple-600 hover:bg-purple-700 text-white'} shadow`}> 
                    {/* small camera icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M16.5 19.5h-9A2.5 2.5 0 0 1 5 17V9A2.5 2.5 0 0 1 7.5 6.5h1.379a1 1 0 0 0 .948-.684l.276-.828A2 2 0 0 1 12.01 4a2 2 0 0 1 1.907 1.32l.276.828a1 1 0 0 0 .948.684h1.379A2.5 2.5 0 0 1 19 9v8a2.5 2.5 0 0 1-2.5 2.5Z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                    {uploading ? 'Uploading…' : 'Change Photo'}
                </label>
            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-sm text-purple-200 mb-1">Place</label>
                    <input name="place" value={form.place} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10" />
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