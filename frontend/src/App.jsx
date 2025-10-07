import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { googleCalendarApi } from './services/googleCalendarApi';

// Import Pages
import LandingPage from './pages/Landing';
import LoginPage from './pages/Auth/Login';
// --- THIS IS THE FIX ---
// The path was slightly incorrect. This matches the file you created.
import RegisterPage from './pages/Auth/Register'; 
import ForgotPasswordPage from './pages/Auth/ForgotPassword';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import DashboardPage from './pages/Dashboard';
import SchedulesPage from './pages/Schedules';
import HistoryPage from './pages/History';
import AnalyticsPage from './pages/Analytics';
import SettingsPage from './pages/Settings';

// Import Layout
import AppShell from './components/layout/AppShell';
import Chatbot from './components/chatbot/Chatbot';

const PrivateRoute = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const currentPage = location.pathname.substring(1);

    useEffect(() => {
        googleCalendarApi.loadGapiScripts();
    }, []);

    const handleLogout = () => {
        logout();
    };

    return (
        <AppShell user={user} onLogout={handleLogout} currentPage={currentPage}>
            <Chatbot />
            <Outlet />
        </AppShell>
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="font-sans">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                        {/* Private Routes Layout */}
                        <Route element={<PrivateRoute />}>
                            <Route element={<AppLayout />}>
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/schedules" element={<SchedulesPage />} />
                                <Route path="/history" element={<HistoryPage />} />
                                <Route path="/analytics" element={<AnalyticsPage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Route>
                        </Route>
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;