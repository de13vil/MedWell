import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';

const AuthPageLayout = ({ children, title, subtitle, page, linkText }) => {
    const navigate = useNavigate();
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
                    <h2 className="text-2xl font-bold text-white mt-4">{title}</h2>
                    <p className="text-purple-200">{subtitle}</p>
                </div>
                <div className="p-10 rounded-3xl shadow-2xl glass-card border border-transparent relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none rounded-3xl neon-border" />
                    <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 opacity-10 blur-3xl pointer-events-none" />
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
                <p className="text-center mt-6 text-purple-300">
                    Remember your password?{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(page); }} className="text-purple-400 hover:text-white hover:underline font-semibold transition-colors duration-150">
                        {linkText}
                    </a>
                </p>
            </motion.div>
        </div>
    );
};


const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1); // 1 for email, 2 for OTP
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Step 1: Request OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await apiClient.post('/auth/request-password-reset-otp', { email });
            setMessage(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP and Redirect
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await apiClient.post('/auth/verify-password-reset-otp', { email, otp });
            if (res.data.success) {
                // --- THIS IS THE FIX ---
                // Changed the forward slash to a backtick to correctly form the URL string
                navigate(`/reset-password/${res.data.resetToken}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthPageLayout title="Reset Password" subtitle="Enter your email to receive a verification code." page="/login" linkText="Back to Login">
            {step === 1 && (
                <form onSubmit={handleRequestOtp} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-purple-300 block mb-2">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-700 placeholder-white" />
                    </div>
                    {error && <p className="text-center text-red-400 py-2">{error}</p>}
                    {message && <p className="text-center text-green-400 py-2">{message}</p>}
                    <button type="submit" disabled={isLoading} className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-xl hover:scale-[1.04] hover:shadow-2xl transition-all duration-150 tracking-wide mt-2 border border-white/10 disabled:opacity-50">
                        {isLoading ? 'Sending...' : 'Send Verification Code'}
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <p className="text-center text-gray-300">A 6-digit code was sent to <span className="font-bold text-white">{email}</span>.</p>
                    <div>
                        <label className="text-sm font-bold text-purple-300 block mb-2">Verification Code</label>
                        <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required maxLength="6" className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white text-center text-2xl tracking-[.5em] focus:outline-none focus:ring-2 focus:ring-purple-700 placeholder-white" />
                    </div>
                    {error && <p className="text-center text-red-400 py-2">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-xl hover:scale-[1.04] hover:shadow-2xl transition-all duration-150 tracking-wide mt-2 border border-white/10 disabled:opacity-50">
                        {isLoading ? 'Verifying...' : 'Verify Code'}
                    </button>
                    <button type="button" onClick={() => setStep(1)} className="w-full text-center text-purple-200 mt-2 hover:text-white disabled:opacity-50" disabled={isLoading}>Back</button>
                </form>
            )}
        </AuthPageLayout>
    );
};

export default ForgotPasswordPage;