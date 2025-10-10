export const calculated__delay = (time, days = 0) => {
    if (typeof time !== 'string') return NaN;
    if (!Number.isInteger(days) || days < 0) return NaN;

    const parts = time.trim().split(':');
    if (parts.length !== 2) return NaN;

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (isNaN(hours) || isNaN(minutes)) return NaN;
    if (hours < 0 || hours > 23) return NaN;
    if (minutes < 0 || minutes > 59) return NaN;

    const now = new Date();
    const future = new Date(now);

    future.setDate(future.getDate() + days);
    future.setHours(hours, minutes, 0, 0);

    if (days === 0 && future.getTime() <= now.getTime()) {
        future.setDate(future.getDate() + 1);
    }

    return future.getTime() - now.getTime();
}
//