// A simple service for handling browser notifications

const scheduledNotifications = new Set();

export const notificationService = {
    requestPermission: async () => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
            return;
        }
        if (Notification.permission !== "granted") {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                 console.log("Notification permission not granted.");
            }
        }
    },
    
    showNotification: (title, options) => {
        if (Notification.permission === "granted") {
            new Notification(title, options);
        }
    },

    // This is a simple in-memory scheduler. For a real app, use a service worker.
    scheduleNotification: (dose) => {
        const notificationId = `${dose.scheduleId}-${dose.time}`;
        if (scheduledNotifications.has(notificationId)) {
            return; // Already scheduled
        }

        const [hour, minute] = dose.time.split(':');
        const now = new Date();
        const notificationTime = new Date();
        notificationTime.setHours(hour, minute, 0, 0);

        const timeToNotification = notificationTime.getTime() - now.getTime();

        if (timeToNotification > 0) {
            setTimeout(() => {
                notificationService.showNotification(
                    'Medication Reminder', 
                    {
                        body: `It's time to take your ${dose.medicationName}.`,
                        icon: '/vite.svg' // Replace with your app's icon
                    }
                );
                scheduledNotifications.delete(notificationId);
            }, timeToNotification);

            scheduledNotifications.add(notificationId);
        }
    }
};
