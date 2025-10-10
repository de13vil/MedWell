import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Eye, EyeOff } from 'lucide-react'; // Import Eye icons
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthPageLayout = ({ children, title, subtitle, page, linkText }) => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center">
                        <Pill size={36} className="text-purple-400" />
                        <h1 className="text-4xl font-bold ml-2 text-white">MedWell</h1>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-4">{title}</h2>
                    <p className="text-gray-400">{subtitle}</p>
                </div>
                <div className="p-8 rounded-3xl shadow-2xl glass-card border border-transparent">
                    {children}
                </div>
                <p className="text-center mt-6 text-gray-400">
                    {page === '/login' ? "Already have an account?" : "Don't have an account?"}{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(page); }} className="text-purple-400 hover:underline font-semibold">
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
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div>
                    <label className="text-sm font-semibold text-gray-300 block mb-2">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" className="w-full bg-transparent border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus-accent" />
                </div>
                <div>
                    <label className="text-sm font-semibold text-gray-300 block mb-2">Password</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? 'text' : 'password'} // Toggle input type
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            placeholder="Enter your password" 
                            className="w-full bg-transparent border border-gray-700 rounded-xl p-3 pr-10 text-white focus:outline-none focus-accent" 
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-300 hover:text-white"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <div className="text-right">
                    <a href="#" onClick={e => {e.preventDefault(); navigate('/forgot-password')}} className="text-sm text-purple-300 hover:underline">Forgot Password?</a>
                </div>
                <button type="submit" className="w-full btn-gradient text-white font-semibold py-3 px-4 rounded-xl focus:outline-none">
                    Login
                </button>
            </form>
        </AuthPageLayout>
    );
};

export default LoginPage;