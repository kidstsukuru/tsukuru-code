import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const GalaxyBackground: React.FC = () => {
    const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);

    useEffect(() => {
        // Generate random stars
        const generateStars = () => {
            const newStars = [];
            for (let i = 0; i < 50; i++) {
                newStars.push({
                    id: i,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 2 + 1,
                    duration: Math.random() * 3 + 2,
                    delay: Math.random() * 2,
                });
            }
            setStars(newStars);
        };

        generateStars();
    }, []);

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0f172a]">
            {/* Deep Space Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e1b4b]" />

            {/* Nebula Effects */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-fuchsia-600 rounded-full blur-[100px] opacity-30 mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
            </div>

            {/* Stars */}
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: star.size,
                        height: star.size,
                    }}
                    animate={{
                        opacity: [0.2, 1, 0.2],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Grid Overlay (Retro-futuristic feel) */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)',
                    transformOrigin: 'top center',
                }}
            />
        </div>
    );
};

export default GalaxyBackground;
