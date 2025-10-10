import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, children, index = 0 }) => {
    const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
    const ref = useRef(null);

    const handleMove = (e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within element
        const y = e.clientY - rect.top;  // y position within element
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateY = ((x - cx) / cx) * 8; // max 8deg
        const rotateX = -((y - cy) / cy) * 8;
        setTilt({ rotateX, rotateY });
    };
    const handleLeave = () => setTilt({ rotateX: 0, rotateY: 0 });

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
            transition={{ duration: 0.6, delay: index * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
            whileHover={{ scale: 1.04 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative p-6 rounded-3xl shadow-2xl glass-card border border-transparent overflow-hidden"
        >
            {/* Animated neon border */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none neon-border" />

            {/* Soft accent orb */}
            <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 opacity-10 blur-3xl pointer-events-none" />

            <div className="relative z-10">
                <div className="mb-4">
                    <div className="inline-flex items-center justify-center p-4 rounded-xl bg-black/20 text-white shadow-lg ring-1 ring-white/6" style={{ width: 56, height: 56 }}>
                        <div className="text-2xl">{icon}</div>
                    </div>
                </div>
                <h3 className="text-lg md:text-xl font-extrabold text-white mb-2 tracking-tight">{title}</h3>
                <p className="text-gray-300 text-sm">{children}</p>
            </div>
        </motion.div>
    );
};

export default FeatureCard;
