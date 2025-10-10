const CLIENT_ID = '939487517070-9gr88tcbm6qh538ofndldcf0oav6c7kf.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAF12yC6SPatIYIAYBKTjHv6QXxJbEKsWE';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

let tokenClient;
let gapiInited = false;
let gisInited = false;
let loadingPromise = null;

const checkScriptsLoaded = (resolve) => {
    if (gapiInited && gisInited) resolve();
}

export const googleCalendarApi = {
    loadGapiScripts: () => {
        if (loadingPromise) return loadingPromise;
        loadingPromise = new Promise((resolve, reject) => {
            const scriptGapi = document.createElement('script');
            scriptGapi.src = 'https://apis.google.com/js/api.js';
            scriptGapi.async = true;
            scriptGapi.defer = true;
            scriptGapi.onload = () => {
                gapi.load('client', async () => {
                    try {
                        await gapi.client.init({ apiKey: API_KEY, discoveryDocs: DISCOVERY_DOCS });
                        gapiInited = true;
                        checkScriptsLoaded(resolve);
                    } catch (error) { reject(error); }
                });
            };
            scriptGapi.onerror = () => reject("Failed to load GAPI script.");
            document.body.appendChild(scriptGapi);

            const scriptGis = document.createElement('script');
            scriptGis.src = 'https://accounts.google.com/gsi/client';
            scriptGis.async = true;
            scriptGis.defer = true;
            scriptGis.onload = () => {
                try {
                    tokenClient = google.accounts.oauth2.initTokenClient({ client_id: CLIENT_ID, scope: SCOPES, callback: '' });
                    gisInited = true;
                    checkScriptsLoaded(resolve);
                } catch (error) { reject(error); }
            };
            scriptGis.onerror = () => reject("Failed to load GIS script.");
            document.body.appendChild(scriptGis);
        });
        return loadingPromise;
    },

    isCalendarEnabled: () => !!localStorage.getItem('gcal-token'),

    handleAuthClick: () => {
        return new Promise((resolve, reject) => {
            if (!gisInited || !gapiInited) return reject("Google API scripts not loaded.");
            tokenClient.callback = (resp) => {
                if (resp.error) return reject(resp.error);
                localStorage.setItem('gcal-token', JSON.stringify(gapi.client.getToken()));
                resolve();
            };
            if (gapi.client.getToken() === null) {
                tokenClient.requestAccessToken({ prompt: 'consent' });
            } else {
                tokenClient.requestAccessToken({ prompt: '' });
            }
        });
    },

    handleSignoutClick: () => {
        const token = gapi.client.getToken();
        if (token) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken('');
            localStorage.removeItem('gcal-token');
        }
    },
    
    addScheduleToCalendar: async (schedule) => {
        if (!googleCalendarApi.isCalendarEnabled()) return null;
        const token = JSON.parse(localStorage.getItem('gcal-token'));
        if (!token) return null;
        gapi.client.setToken(token);

        const createdEventIds = [];
        for (const time of schedule.times) {
            
            // --- THIS IS THE FIX ---
            // The startDate from the database is a full ISO string (e.g., "2025-10-06T00:00:00.000Z").
            // We only want the date part "2025-10-06" to create a valid new date with the scheduled time.
            const datePart = schedule.startDate.split('T')[0];
            const eventDateTime = new Date(`${datePart}T${time}`);

            if (isNaN(eventDateTime.getTime())) {
                console.error(`Could not create a valid date from start: ${schedule.startDate} and time: ${time}`);
                continue; 
            }

            const event = {
                'summary': `${schedule.name} - ${schedule.dosage}`,
                'description': `Medication schedule for ${schedule.name}, managed by MedWell.`,
                'start': {
                    'dateTime': eventDateTime.toISOString(),
                    'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                'end': {
                    'dateTime': new Date(eventDateTime.getTime() + 15 * 60000).toISOString(), // 15 min duration
                    'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                'recurrence': ['RRULE:FREQ=DAILY;COUNT=30'],
                'reminders': { 'useDefault': false, 'overrides': [{ 'method': 'popup', 'minutes': 10 }] },
            };

            try {
                const request = gapi.client.calendar.events.insert({ 'calendarId': 'primary', 'resource': event });
                const response = await new Promise((resolve, reject) => {
                    request.execute((resp) => resp.error ? reject(resp.error) : resolve(resp));
                });
                console.log('Event created:', response.htmlLink);
                createdEventIds.push(response.id);
            } catch (error) {
                console.error('Error creating calendar event:', error);
                if (error.code === 401) {
                    googleCalendarApi.handleSignoutClick();
                    alert("Your connection to Google expired. Please go to Settings and connect again.");
                }
            }
        }
        return createdEventIds;
    },

    deleteScheduleFromCalendar: async (eventIds) => {
        if (!googleCalendarApi.isCalendarEnabled() || !eventIds || eventIds.length === 0) return;
        const token = JSON.parse(localStorage.getItem('gcal-token'));
        if (!token) return;
        gapi.client.setToken(token);

        console.log("Attempting to delete Google Calendar events:", eventIds);
        for (const eventId of eventIds) {
            try {
                const request = gapi.client.calendar.events.delete({ 'calendarId': 'primary', 'eventId': eventId });
                await new Promise((resolve, reject) => {
                    request.execute((resp) => (resp && resp.error) ? reject(resp.error) : resolve());
                });
                console.log(`Event ${eventId} deleted.`);
            } catch (error) {
                console.error(`Error deleting event ${eventId}:`, error);
            }
        }
    }
};