import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  // The '/api' prefix is crucial. It matches the proxy setting in your vite.config.js.
  // All requests made with this instance will automatically go to http://localhost:5000/api/...
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// === Interceptor for adding the Auth Token to requests ===
// This function will run before every request is sent.
apiClient.interceptors.request.use(
  (config) => {
    // 1. Get the auth data from localStorage
    const authDataString = localStorage.getItem('medwell_auth');
    if (authDataString) {
      // 2. Parse the JSON to get the token
      const authData = JSON.parse(authDataString);
      const token = authData?.token;

      // 3. If a token exists, add it to the Authorization header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;