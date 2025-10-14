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
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-900 bg-gradient-to-br from-purple-900/40 via-gray-900/70 to-pink-900/40">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center">
                        <motion.span
                            initial={{ scale: 0.85, boxShadow: '0 0 0px #a78bfa' }}
                            animate={{ scale: 1, boxShadow: '0 4px 16px 0 #a78bfa55' }}
                            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                            whileHover={{ scale: 1.05, boxShadow: '0 8px 24px 0 #a78bfa55' }}
                            className="inline-flex"
                        >
                            <Pill size={36} className="text-purple-400" />
                        </motion.span>
                        <h1 className="text-4xl font-bold ml-2 text-white">MedWell</h1>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-4">Set a New Password</h2>
                </div>
                <div className="p-10 rounded-3xl shadow-2xl glass-card border border-transparent relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none rounded-3xl neon-border" />
                    <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 opacity-10 blur-3xl pointer-events-none" />
                    <div className="relative z-10">
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-purple-300 block mb-2">New Password</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="8" className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-700 placeholder-white" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-purple-300 block mb-2">Confirm New Password</label>
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength="8" className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-700 placeholder-white" />
                            </div>
                            {message && <p className="text-center text-green-400">{message}</p>}
                            {error && <p className="text-center text-red-400">{error}</p>}
                            <button type="submit" className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-xl hover:scale-[1.04] hover:shadow-2xl transition-all duration-150 tracking-wide mt-2 border border-white/10">
                                Reset Password
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;