import apiClient from './apiClient';

export const authApi = {
    login: async (email, password) => {
        try {
            // Make a REAL API call to the backend login route
            const response = await apiClient.post('/auth/login', { email, password });
            // The backend returns { success: true, token, user }
            return response.data; 
        } catch (error) {
            console.error("Login failed:", error.response?.data?.message || error.message);
            return { success: false, message: error.response?.data?.message || "Invalid credentials" };
        }
    },

    register: async (name, email, password) => {
        try {
            // Make a REAL API call to the backend register route
            const response = await apiClient.post('/auth/register', { name, email, password });
            // The backend returns { success: true, user }
            return response.data;
        } catch (error) {
            console.error("Registration failed:", error.response?.data?.message || error.message);
            return { success: false, message: error.response?.data?.message || "Registration failed" };
        }
    },
};