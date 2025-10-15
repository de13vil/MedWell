import { DateTime } from 'luxon';

// Pass user's timezone as second argument, fallback to browser tz
export const dateUtils = {
  formatTime: (timeStr, timezone) => {
    if (!timeStr) return 'Invalid Time';
    // If timeStr is ISO, parse as DateTime, else treat as HH:mm
    let dt;
    if (timeStr.includes('T')) {
      dt = DateTime.fromISO(timeStr, { zone: timezone || DateTime.local().zoneName });
    } else {
      // Use today with given time
      const [hour, minute] = timeStr.split(':');
      dt = DateTime.local().setZone(timezone || DateTime.local().zoneName).set({ hour: Number(hour), minute: Number(minute), second: 0, millisecond: 0 });
    }
    return dt.toFormat('h:mm a');
  },
  formatDate: (dateStr, timezone) => {
    if (!dateStr) return 'N/A';
    return DateTime.fromISO(dateStr, { zone: timezone || DateTime.local().zoneName }).toLocaleString(DateTime.DATE_FULL);
  },
  formatDateTime: (dateStr, timezone) => {
    if (!dateStr) return 'N/A';
    return DateTime.fromISO(dateStr, { zone: timezone || DateTime.local().zoneName }).toLocaleString(DateTime.DATETIME_MED);
  },
};
