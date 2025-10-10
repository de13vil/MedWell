import apiClient from './apiClient';

export const medicineApi = {
    // Corresponds to GET /api/schedules
    getSchedules: async () => {
        const response = await apiClient.get('/schedules');
        return response.data;
    },

    // Corresponds to POST /api/schedules
    addSchedule: async (formData) => {
        const response = await apiClient.post('/schedules', formData);
        return response.data;
    },

    // Corresponds to PUT /api/schedules/:id
    updateSchedule: async (scheduleId, formData) => {
        const response = await apiClient.put(`/schedules/${scheduleId}`, formData);
        return response.data;
    },
    
    // Corresponds to DELETE /api/schedules/:id
    deleteSchedule: async (scheduleId) => {
        const response = await apiClient.delete(`/schedules/${scheduleId}`);
        return response.data;
    },

    // Corresponds to POST /api/doselogs
    createDoseLog: async (logData) => {
        const response = await apiClient.post('/doselogs', logData);
        return response.data;
    },

    // Corresponds to GET /api/doselogs
    getDoseLogs: async () => {
        const response = await apiClient.get('/doselogs');
        return response.data;
    },
};