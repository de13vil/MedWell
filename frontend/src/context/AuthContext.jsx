import React, { createContext, useState, useContext } from 'react';
import { authApi } from '../api/authApi';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const getInitialState = () => {
        try {
            const storedAuthData = localStorage.getItem('medwell_auth');
            if (storedAuthData) {
                return JSON.parse(storedAuthData);
            }
        } catch (error) {
            console.error("Could not parse stored auth data", error);
        }
        return { user: null, isAuthenticated: false, token: null };
    };

    const [authData, setAuthData] = useState(getInitialState);

    const login = async (email, password) => {
        const res = await authApi.login(email, password);
        if (res.success) {
            const newAuthData = { user: res.user, isAuthenticated: true, token: res.token };
            localStorage.setItem('medwell_auth', JSON.stringify(newAuthData));
            setAuthData(newAuthData);
            return true;
        }
        return false;
    };

    const register = async (name, email, password) => {
        const res = await authApi.register(name, email, password);
        if (res.success) {
            // --- THIS IS THE FIX ---
            // Use the real token from the response, not 'fake-token'
            const newAuthData = { user: res.user, isAuthenticated: true, token: res.token };
            localStorage.setItem('medwell_auth', JSON.stringify(newAuthData));
            setAuthData(newAuthData);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('medwell_auth');
        setAuthData({ user: null, isAuthenticated: false, token: null });
    };

    const value = { ...authData, login, register, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};