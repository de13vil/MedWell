import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';

// --- THIS LAYOUT COMPONENT WAS MISSING ---
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
                            <Pill size={40} className="text-purple-400 drop-shadow-lg" />
                        </motion.span>
                        <h1 className="text-4xl font-extrabold ml-2 text-white tracking-wide drop-shadow">MedWell</h1>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-4 drop-shadow">{title}</h2>
                    <p className="text-purple-200 text-base mt-1">{subtitle}</p>
                </div>
                <div className="p-10 rounded-3xl shadow-2xl glass-card border border-transparent relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none rounded-3xl neon-border" />
                    <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 opacity-10 blur-3xl pointer-events-none" />
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
                <p className="text-center mt-6 text-purple-300">
                    {page === '/login' ? "Already have an account?" : "Don't have an account?"}{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(page); }} className="text-purple-400 hover:text-white hover:underline font-semibold transition-colors duration-150">
                        {linkText}
                    </a>
                </p>
            </motion.div>
        </div>
    );
};
// --- END OF LAYOUT COMPONENT ---


const RegisterPage = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '', middleName: '', lastName: '',
        email: '', mobile: '', place: '', password: '',
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await apiClient.post('/auth/request-email-otp', { email: formData.email });
            setMessage(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        // --- THIS IS THE FIX ---
        // Added backticks to correctly create the fullName string
        const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.replace(/\s+/g, ' ').trim();
        
        try {
            const res = await apiClient.post('/auth/verify-email-otp', {
                name: fullName,
                email: formData.email,
                password: formData.password,
                mobile: formData.mobile,
                place: formData.place,
                otp: otp,
            });

            setMessage(res.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            setIsLoading(false);
        }
    };
    
    return (
        <AuthPageLayout title="Create Your Account" subtitle="Start your path to better health today." page="/login" linkText="Login">
            {step === 1 && (
                <form onSubmit={handleRequestOtp} className="space-y-6">
                    <div className="flex space-x-4">
                        <div className="w-1/2">
                            <label className="text-sm font-semibold text-purple-300 block mb-2">First Name</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Alex" className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-700 placeholder-white" required />
                        </div>
                        <div className="w-1/2">
                            <label className="text-sm font-semibold text-purple-300 block mb-2">Last Name</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-700 placeholder-white" required />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-purple-300 block mb-2">Middle Name (Optional)</label>
                        <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} placeholder="J." className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-700 placeholder-white" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-purple-300 block mb-2">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-700 placeholder-white" required />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-purple-300 block mb-2">Mobile Number</label>
                        <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="+91 00000 00000" className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-700 placeholder-white" required />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-purple-300 block mb-2">Your Location</label>
                        <input type="text" name="place" value={formData.place} onChange={handleInputChange} placeholder="e.g., New York, USA" className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-700 placeholder-white" required />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-purple-300 block mb-2">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleInputChange} 
                            placeholder="At least 8 characters" 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-700 placeholder-white" 
                            required 
                            minLength="8"
                            title="Password must be at least 8 characters long"
                        />
                    </div>
                    {error && <p className="text-center text-red-400 font-semibold py-2">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-xl hover:scale-[1.04] hover:shadow-2xl transition-all duration-150 tracking-wide mt-2 border border-white/10 disabled:opacity-50">
                        {isLoading ? 'Sending...' : 'Send Verification Code'}
                    </button>
                </form>
            )}
            {step === 2 && (
                <form onSubmit={handleVerifyAndRegister} className="space-y-6">
                    <p className="text-center text-gray-300">A 6-digit code was sent to <span className="font-bold text-white">{formData.email}</span>. Please enter it below.</p>
                    <div>
                        <label className="text-sm font-semibold text-purple-200 block mb-2">Verification Code</label>
                        <input 
                            type="text" 
                            value={otp} 
                            onChange={e => setOtp(e.target.value)} 
                            placeholder="_ _ _ _ _ _" 
                            maxLength="6"
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white text-center text-2xl tracking-[.5em] focus:outline-none focus:ring-2 focus:ring-purple-700 placeholder-white" 
                            required 
                        />
                    </div>
                    {message && <p className="text-center text-green-400 font-semibold py-2">{message}</p>}
                    {error && <p className="text-center text-red-400 font-semibold py-2">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-xl hover:scale-[1.04] hover:shadow-2xl transition-all duration-150 tracking-wide mt-2 border border-white/10 disabled:opacity-50">
                        {isLoading ? 'Verifying...' : 'Verify & Create Account'}
                    </button>
                    <button type="button" onClick={() => setStep(1)} className="w-full text-center text-purple-200 mt-2 hover:text-white disabled:opacity-50" disabled={isLoading}>Back</button>
                </form>
            )}
        </AuthPageLayout>
    );
};

export default RegisterPage;