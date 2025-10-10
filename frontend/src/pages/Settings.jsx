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
        <div className="relative min-h-screen w-full overflow-x-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-blue-900 via-indigo-800 to-fuchsia-800 opacity-90 blur-[2px]" />
            {/* Glassy floating shapes */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-400/20 rounded-full blur-2xl animate-pulse-slower" />
            <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-indigo-400/20 rounded-full blur-2xl animate-pulse-slow" />

            <div className="relative max-w-4xl mx-auto px-4 py-14">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-12 tracking-tight text-center">
                    Settings
                </h1>

                <div className="flex flex-col gap-12 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="panel-glass panel-hover p-10 shadow-2xl animate-fade-in-up w-full"
                    >
                        <h2 className="text-2xl font-bold text-white mb-8 tracking-wide text-center">Integrations & Notifications</h2>
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="font-bold text-white text-lg">Google Calendar Sync</h3>
                                    <p className="text-sm text-gray-400">Automatically sync your medication schedules.</p>
                                </div>
                                {isCalendarEnabled ? (
                                    <button onClick={handleCalendarSignOut} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg text-lg shadow-md">
                                        Disconnect
                                    </button>
                                ) : (
                                    <button onClick={handleCalendarSignIn} className="font-bold py-2 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-lg shadow-md">
                                        Connect
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="font-bold text-white text-lg">Browser Notifications</h3>
                                    <p className="text-sm text-gray-400">Status: <span className="font-semibold capitalize">{notificationPermission}</span></p>
                                </div>
                                {notificationPermission !== 'granted' && (
                                    <button onClick={handleNotificationRequest} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg text-lg shadow-md">
                                        Request Permission
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
};

export default SettingsPage;