import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Clock, BookOpen, BarChart2, ChevronsRight, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeatureCard from '../Components/cards/FeatureCard';

// Contact Form Component
const ContactForm = () => {
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Sending...');
        const form = e.target;
        const data = new FormData(form);

        try {
            // Your unique Formspree URL has been added here
            const response = await fetch('https://formspree.io/f/xyznwbbr', {
                method: 'POST',
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                setStatus('Thanks for your message! We will get back to you soon.');
                form.reset();
            } else {
                setStatus('Oops! There was a problem submitting your form.');
            }
        } catch (error) {
            setStatus('Oops! There was a problem submitting your form.');
        } finally {
            setTimeout(() => setStatus(''), 5000); // Clear message after 5 seconds
        }
    };

    return (
        <div className="panel-glass p-8 rounded-3xl shadow-2xl max-w-2xl mx-auto">
            <h3 className="text-4xl font-bold mb-2 text-white">Get in Touch</h3>
            <p className="text-gray-400 mb-8">Have a question? Fill out the form below and we'll get back to you.</p>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                    <label className="text-sm font-bold text-gray-300 block mb-2">Full Name</label>
                    <input type="text" name="name" className="w-full bg-transparent border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus-accent" placeholder="e.g., Alex Doe" required />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-300 block mb-2">Email</label>
                    <input type="email" name="email" className="w-full bg-transparent border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus-accent" placeholder="you@example.com" required />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-300 block mb-2">Phone Number</label>
                    <input type="tel" name="phone" className="w-full bg-transparent border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus-accent" placeholder="+91 XXXXX XXXXX" required />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-300 block mb-2">Your Location</label>
                    <input type="text" name="place" className="w-full bg-transparent border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus-accent" placeholder="e.g., New Delhi, India" required />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-300 block mb-2">Your Query</label>
                    <textarea name="message" rows="4" className="w-full bg-transparent border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus-accent" placeholder="How can we help you today?" required></textarea>
                </div>
                <div className="flex justify-end pt-2">
                    <button type="submit" className="btn-gradient text-white font-semibold py-3 px-8 rounded-full">Send Message</button>
                </div>
                {status && <p className="text-center text-sm text-gray-300 mt-4">{status}</p>}
            </form>

        </div>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="bg-gray-900 text-white min-h-screen">
                <header className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <Pill size={28} className="text-purple-400" />
                        <h1 className="text-2xl font-bold ml-2">MedWell</h1>
                    </div>
                    <nav className="space-x-6 flex items-center">
                        <a href="#features" className="hover:text-purple-400">Features</a>
                        <a href="#contact" className="hover:text-purple-400">Contact Us</a>
                        <button onClick={() => navigate('/login')} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition-colors">
                            Login / Sign Up
                        </button>
                    </nav>
                </header>

                <main className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="py-32"
                    >
                        <h2 className="text-5xl md:text-7xl font-extrabold leading-tight">
                            Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Wellness</span> Companion
                        </h2>
                        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                            Never miss a dose again. Track your medications, monitor your health, and achieve your wellness goals with MedWell.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/register')}
                            className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-full shadow-lg text-lg"
                        >
                            Get Started for Free
                        </motion.button>
                    </motion.div>

                    <section id="features" className="py-20">
                        <h3 className="text-4xl font-bold mb-12">Why You'll Love MedWell</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 feature-grid">
                            <FeatureCard index={0} icon={<Clock size={32} />} title="Powerful Reminders">
                                Customizable alerts for every dose, ensuring you stay on track with your schedule.
                            </FeatureCard>
                            <FeatureCard index={1} icon={<BookOpen size={32} />} title="Simple Logging">
                                Log doses with a single tap. Keep a detailed history of taken and missed medications.
                            </FeatureCard>
                            <FeatureCard index={2} icon={<BarChart2 size={32} />} title="Wellness Dashboard">
                                Visualize your progress with insightful charts and track your health journey over time.
                            </FeatureCard>
                            <FeatureCard index={3} icon={<ChevronsRight size={32} />} title="AI Predictions">
                                Our smart system predicts potential adherence issues and helps you stay consistent.
                            </FeatureCard>
                            <FeatureCard index={4} icon={<Calendar size={32} />} title="Calendar Sync">
                                Integrate your medication schedule with your personal calendar for seamless planning.
                            </FeatureCard>
                            <FeatureCard index={5} icon={<User size={32} />} title="Natural Language Assistant">
                                Ask our AI chatbot anything about your schedule, just like talking to a real person.
                            </FeatureCard>
                        </div>
                    </section>

                    <section id="contact" className="py-20">
                        <ContactForm />
                    </section>
                </main>
            </div>
            {/* Animated Divider and Support Us Section */}
            <div className="w-full flex justify-center items-center mt-8">
                <div className="h-1 w-32 rounded-full bg-gradient-to-r from-purple-500/40 via-pink-400/30 to-purple-500/40 animate-pulse" />
            </div>
            <footer className="relative w-full bg-gradient-to-r from-purple-900/40 via-gray-900/70 to-pink-900/40 bg-opacity-70 backdrop-blur-md py-10 px-4 shadow-none overflow-hidden">
                {/* Blurred Accent Orb */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-40 bg-gradient-to-r from-purple-500/30 via-pink-400/20 to-purple-500/30 rounded-full blur-3xl opacity-60 pointer-events-none z-0" />
                <div className="relative z-10 container mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col items-center md:items-start">
                        <h4 className="text-2xl font-bold text-purple-200 mb-2">Support Us</h4>
                        <p className="text-gray-300 max-w-md text-center md:text-left">If you love MedWell and want to help us grow, consider sharing with friends, giving us feedback, or supporting us below!</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <motion.a
                            href="#"
                            whileHover={{ scale: 1.07, boxShadow: '0 0 24px 2px #a78bfa55' }}
                            whileTap={{ scale: 0.97 }}
                            className="bg-gradient-to-r from-purple-500/80 to-pink-400/80 text-white font-bold py-3 px-8 rounded-full shadow text-lg mb-2 transition-all flex items-center gap-2"
                        >
                            <span role="img" aria-label="coffee">☕</span> Buy us a Coffee
                        </motion.a>
                        <span className="text-gray-400 text-sm">Or star us on GitHub!</span>
                        <a href ="https://github.com/de13vil/" target="_blank" rel="noopener noreferrer" className="underline text-purple-300 hover:text-pink-200">Divyansh</a>
                    </div>
                </div>
                <div className="text-center text-gray-500 text-xs mt-8">&copy; {new Date().getFullYear()} MedWell. All rights reserved.</div>
            </footer>
        </>
    );
}
export default LandingPage;