import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { googleCalendarApi } from '../services/googleCalendarApi.js';
import { notificationService } from '../services/notificationService.js';
import { motion } from 'framer-motion';

const SettingsPage = () => {
    const { user } = useAuth();
    // We remove the apiReady state and just check if the calendar is enabled.
    const [isCalendarEnabled, setIsCalendarEnabled] = useState(googleCalendarApi.isCalendarEnabled());
    const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
    
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
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
            <div className="space-y-8 max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="panel-glass panel-hover p-8"
                >
                    <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-300 block mb-2">Full Name</label>
                            <input type="text" defaultValue={user?.name} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-300 block mb-2">Email</label>
                            <input type="email" defaultValue={user?.email} disabled className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-400 cursor-not-allowed" />
                        </div>
                        <div className="pt-6 flex justify-end">
                            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="panel-glass panel-hover p-8">
                    <h2 className="text-xl font-bold text-white mb-6">Integrations & Notifications</h2>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-white">Google Calendar Sync</h3>
                                <p className="text-sm text-gray-400">Automatically sync your medication schedules.</p>
                            </div>
                            {isCalendarEnabled ? (
                                <button onClick={handleCalendarSignOut} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                                    Disconnect
                                </button>
                            ) : (
                                <button onClick={handleCalendarSignIn} className="font-bold py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700">
                                    Connect
                                </button>
                            )}
                        </div>
                         <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-white">Browser Notifications</h3>
                                <p className="text-sm text-gray-400">Status: <span className="font-semibold capitalize">{notificationPermission}</span></p>
                            </div>
                            {notificationPermission !== 'granted' && (
                                <button onClick={handleNotificationRequest} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">
                                    Request Permission
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
};

export default SettingsPage;