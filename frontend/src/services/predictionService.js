// A simple service for predicting adherence issues based on historical data.

export const predictionService = {
    predictAdherence: (doseLogs) => {
        if (doseLogs.length < 10) {
            return null; // Not enough data for a meaningful prediction
        }

        const missedDoses = doseLogs.filter(log => log.status === 'Skipped');
        if (missedDoses.length === 0) {
            return null; // Perfect adherence!
        }
        
        let morningMisses = 0;
        let afternoonMisses = 0;
        let eveningMisses = 0;
        let nightMisses = 0;

        missedDoses.forEach(log => {
            const hour = new Date(log.scheduledTime).getHours();
            if (hour >= 6 && hour < 12) morningMisses++;
            else if (hour >= 12 && hour < 18) afternoonMisses++;
            else if (hour >= 18 && hour < 24) eveningMisses++;
            else nightMisses++;
        });

        const totalMisses = missedDoses.length;
        
        if ((eveningMisses / totalMisses) > 0.5) {
            return "AI Nudge: You seem to miss your evening doses frequently. Try setting an alarm on your phone as an extra reminder tonight!";
        }

        if ((morningMisses / totalMisses) > 0.5) {
            return "AI Nudge: It looks like mornings are a bit hectic. Consider taking your medication right after brushing your teeth to build a habit.";
        }
        
        // Add more complex rules here as needed...

        return null; // No clear pattern found
    }
};
