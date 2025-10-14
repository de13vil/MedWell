import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Eye, EyeOff } from 'lucide-react'; // Import Eye icons
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
}

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const success = await login(email, password);
        if (!success) {
            setError('Invalid email or password. Please try again.');
        } else {
            navigate('/dashboard');
        }
    };
    
    return (
        <AuthPageLayout title="Welcome Back!" subtitle="Log in to manage your wellness journey." page="/register" linkText="Sign Up">
            <form onSubmit={handleSubmit} className="space-y-7">
                {error && <p className="text-red-400 text-center font-semibold">{error}</p>}
                <div>
                    <label className="text-sm font-bold text-purple-300 block mb-2">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-700 placeholder-white" />
                </div>
                <div>
                    <label className="text-sm font-bold text-purple-300 block mb-2">Password</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? 'text' : 'password'}
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            placeholder="Enter your password" 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-700 placeholder-white" 
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center text-purple-400 hover:text-white"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <div className="text-right">
                    <a href="#" onClick={e => {e.preventDefault(); navigate('/forgot-password')}} className="text-sm text-purple-300 hover:underline">Forgot Password?</a>
                </div>
                <button type="submit" className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-xl hover:scale-[1.04] hover:shadow-2xl transition-all duration-150 tracking-wide mt-2 border border-white/10">
                    Login
                </button>
            </form>
        </AuthPageLayout>
    );
};

export default LoginPage;