import apiClient from './apiClient';

export const otherApi = {
    // This function now makes a single, powerful API call.
    // All the complex calculation logic has been moved to the backend.
    getDashboardSummary: async () => {
        const response = await apiClient.get('/dashboard/summary');
        return response.data;
    },
};