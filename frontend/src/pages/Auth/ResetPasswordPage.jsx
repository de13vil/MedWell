import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';
import apiClient from '../../api/apiClient';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // --- NEW ---
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { token } = useParams();
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // --- NEW: Check if passwords match ---
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const res = await apiClient.post('/auth/reset-password', { token, password });
            setMessage(res.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center">
                        <Pill size={36} className="text-purple-400" />
                        <h1 className="text-4xl font-bold ml-2 text-white">MedWell</h1>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-4">Set a New Password</h2>
                </div>
                <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
                     <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-gray-300 block mb-2">New Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="8" className="w-full bg-gray-700 rounded-lg p-3 text-white" />
                        </div>
                        {/* --- NEW: Confirm Password Field --- */}
                        <div>
                            <label className="text-sm font-bold text-gray-300 block mb-2">Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength="8" className="w-full bg-gray-700 rounded-lg p-3 text-white" />
                        </div>
                        
                        {message && <p className="text-center text-green-400">{message}</p>}
                        {error && <p className="text-center text-red-400">{error}</p>}

                        <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg">
                            Reset Password
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;