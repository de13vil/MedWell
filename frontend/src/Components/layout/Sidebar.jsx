import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, Settings, BarChart2, ChevronLeft, ChevronRight, Pill, History as HistoryIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Sidebar = ({ currentPage, isSidebarOpen, setSidebarOpen }) => { // Removed navigate from props
    const navigate = useNavigate(); // Initialize hook

    const navItems = [
        { name: 'Dashboard', icon: <Home size={20} />, page: 'dashboard' },
        { name: 'Schedules', icon: <Calendar size={20} />, page: 'schedules' },
        { name: 'History', icon: <HistoryIcon size={20} />, page: 'history' },
        { name: 'Analytics', icon: <BarChart2 size={20} />, page: 'analytics' },
        { name: 'Settings', icon: <Settings size={20} />, page: 'settings' },
    ];

    const sidebarVariants = {
        open: { width: '256px', transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { width: '80px', transition: { type: 'spring', stiffness: 300, damping: 30 } }
    };

    return (
        <motion.div
            variants={sidebarVariants}
            animate={isSidebarOpen ? "open" : "closed"}
            className="flex flex-col h-full relative glass-card"
        >
            <div className="flex items-center justify-between p-4 h-16 border-b border-gray-700">
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center"
                        >
                            <Pill size={24} className="text-purple-400" />
                            <span className="text-xl font-bold ml-2 text-white">MedWell</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-3">
                {navItems.map(item => (
                    <a
                        key={item.name}
                        href="#"
                        // Updated onClick to use navigate with a URL path
                        onClick={(e) => { e.preventDefault(); navigate(`/${item.page}`); }}
                        className={`flex items-center p-3 rounded-lg transition-all duration-200 transform ${
                            currentPage === item.page ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg' : 'hover:bg-gray-800 hover:text-white'
                        }`}
                        title={item.name}
                    >
                        {item.icon}
                        <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.span 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }} 
                                exit={{ opacity: 0, x: -10 }} 
                                className="ml-4 font-medium whitespace-nowrap"
                            >
                                {item.name}
                            </motion.span>
                        )}
                        </AnimatePresence>
                    </a>
                ))}
            </nav>
            <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="absolute -right-4 top-16 bg-gradient-to-r from-purple-600 to-pink-500 text-white p-2 rounded-full shadow-2xl focus:outline-none"
            >
                {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
        </motion.div>
    );
};

export default Sidebar;
