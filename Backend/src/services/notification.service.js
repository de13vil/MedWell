
import { calculateDelay } from '../utils/date.utils.js';
export const setReminder = (schedule) => {
  const delay = calculateDelay(schedule.time, schedule.days);

  if (isNaN(delay)) {
    console.error('Invalid time format or days value');
    return;
  }
  
  setTimeout(() => {
    // Use the Notification API for a clean, professional notification
    new Notification('Alchemist\'s Reminder', {
        body: `Time to take your ${schedule.name}.`,
        icon: './potion-icon.png' // You can add an icon later
    });
  }, delay);

  console.log(`Reminder set for ${schedule.name}`);
};