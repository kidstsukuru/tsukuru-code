import React, { useEffect, useRef, useState } from 'react';
import { Lesson } from '../types/index';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

interface AdventureMapProps<T extends Lesson> {
    lessons: T[];
    onSelectLesson: (lesson: T) => void;
    currentLessonId?: string;
}

// --- Premium Visual Assets (SVG Components) ---

const MagicalMist = () => (
    <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen overflow-hidden">
        <motion.div
            animate={{ x: [-100, 100], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-[200%] h-full bg-gradient-to-r from-transparent via-purple-900/20 to-transparent blur-3xl"
        />
    </div>
);

const GlowingRune = ({ active }: { active: boolean }) => (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${active ? 'animate-spin-slow' : ''}`}>
        <defs>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <circle cx="50" cy="50" r="45" fill="none" stroke={active ? "#FCD34D" : "#4B5563"} strokeWidth="2" filter="url(#glow)" />
        <path d="M50 10 L90 90 L10 90 Z" fill="none" stroke={active ? "#FCD34D" : "#4B5563"} strokeWidth="2" filter="url(#glow)" />
        <circle cx="50" cy="50" r="10" fill={active ? "#FCD34D" : "none"} filter="url(#glow)" />
    </svg>
);

const LocationMarker = ({ type, isLocked, isCompleted, isCurrent }: { type: string, isLocked: boolean, isCompleted: boolean, isCurrent: boolean }) => {
    const getGradient = () => {
        if (isLocked) return "from-gray-700 to-gray-900";
        if (isCompleted) return "from-emerald-600 to-teal-800";
        if (isCurrent) return "from-amber-500 to-orange-700";
        return "from-blue-600 to-indigo-900";
    };

    const getIcon = () => {
        switch (type) {
            case 'village': return "🏰";
            case 'forest': return "🌲";
            case 'cave': return "🏔️";
            case 'castle': return "👑";
            default: return "⚔️";
        }
    };

    return (
        <div className="relative w-32 h-32 md:w-40 md:h-40 group">
            {/* Magical Aura for Current */}
            {isCurrent && (
                <div className="absolute inset-[-20px] rounded-full bg-amber-500/30 blur-xl animate-pulse" />
            )}

            {/* Main Orb */}
            <div className={`
                relative w-full h-full rounded-full 
                bg-gradient-to-br ${getGradient()}
                shadow-[inset_0_2px_15px_rgba(255,255,255,0.3),0_10px_30px_rgba(0,0,0,0.5)]
                border-4 ${isCurrent ? 'border-amber-300' : isCompleted ? 'border-emerald-400' : 'border-gray-600'}
                flex items-center justify-center
                transition-all duration-500
                ${!isLocked && 'group-hover:scale-110 group-hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]'}
            `}>
                {/* Inner Texture */}
                <div className="absolute inset-2 rounded-full border border-white/10" />

                {/* Icon */}
                <span className={`text-5xl filter drop-shadow-lg ${isLocked ? 'grayscale opacity-50' : ''}`}>
                    {getIcon()}
                </span>

                {/* Status Indicator */}
                {isLocked && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-3xl">🔒</span>
                    </div>
                )}
                {isCompleted && (
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-2 shadow-lg border-2 border-emerald-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                    </div>
                )}
            </div>
        </div>
    );
};

const AdventureMap = <T extends Lesson>({ lessons, onSelectLesson, currentLessonId }: AdventureMapProps<T>) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const currentIndex = currentLessonId ? lessons.findIndex(l => l.id === currentLessonId) : 0;

    // Auto-scroll to current
    useEffect(() => {
        if (containerRef.current) {
            const currentElement = containerRef.current.querySelector(`[data-index="${currentIndex}"]`);
            if (currentElement) {
                setTimeout(() => {
                    currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }
        }
    }, [currentIndex]);

    const getLocationType = (index: number, total: number) => {
        if (index === 0) return 'village';
        if (index === total - 1) return 'castle';
        const types = ['forest', 'cave', 'mountain', 'ruins'];
        return types[(index - 1) % types.length];
    };

    return (
        <div className="w-full h-[85vh] overflow-hidden relative rounded-3xl shadow-2xl border-[12px] border-[#2A1B0E] bg-[#1a1a1a] font-serif">
            {/* --- Global Atmosphere Layers --- */}

            {/* 1. Base Terrain Gradient (Dark Fantasy) */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#312E81]" />

            {/* 2. Animated Fog/Mist */}
            <MagicalMist />

            {/* 3. Floating Particles (CSS) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-amber-200 rounded-full animate-pulse"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${Math.random() * 5 + 3}s`,
                            opacity: Math.random() * 0.5
                        }}
                    />
                ))}
            </div>

            {/* --- Scrollable Content --- */}
            <div
                ref={containerRef}
                className="h-full overflow-y-auto overflow-x-hidden relative z-10 scrollbar-thin scrollbar-thumb-amber-700 scrollbar-track-transparent"
            >
                <div className="relative min-h-[200%] py-40 px-4 flex flex-col items-center gap-40">

                    {/* Epic Title Banner */}
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="text-center mb-20 relative z-20"
                    >
                        <div className="relative inline-block">
                            {/* Glow behind title */}
                            <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
                            <h1 className="relative text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FCD34D] to-[#B45309] drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] tracking-widest uppercase font-serif">
                                The Saga
                            </h1>
                            <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#FCD34D] to-transparent mt-2" />
                            <p className="text-[#FCD34D] font-serif tracking-[0.5em] text-sm mt-4 uppercase opacity-80">
                                Chapter I: The Awakening
                            </p>
                        </div>
                    </motion.div>

                    {lessons.map((lesson, index) => {
                        const isCompleted = index < currentIndex;
                        const isCurrent = index === currentIndex;
                        const isLocked = index > currentIndex;
                        const locationType = getLocationType(index, lessons.length);
                        const isLeft = index % 2 === 0;

                        return (
                            <div
                                key={lesson.id}
                                data-index={index}
                                className={`
                                    relative flex items-center w-full max-w-4xl mx-auto
                                    ${isLeft ? 'justify-start md:pl-32' : 'justify-end md:pr-32'}
                                `}
                            >
                                {/* Magical Ley Line (Path) */}
                                {index < lessons.length - 1 && (
                                    <div className="absolute top-1/2 left-0 w-full h-64 -z-10 pointer-events-none">
                                        <svg className="w-full h-full overflow-visible">
                                            <defs>
                                                <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor={isCompleted ? "#FCD34D" : "#4B5563"} stopOpacity="0.5" />
                                                    <stop offset="100%" stopColor={isCompleted ? "#FCD34D" : "#4B5563"} stopOpacity="0.1" />
                                                </linearGradient>
                                                <filter id="glow-path">
                                                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                                    <feMerge>
                                                        <feMergeNode in="coloredBlur" />
                                                        <feMergeNode in="SourceGraphic" />
                                                    </feMerge>
                                                </filter>
                                            </defs>
                                            <path
                                                d={isLeft
                                                    ? `M 150 50 C 400 50, 400 250, 750 250`
                                                    : `M 750 50 C 400 50, 400 250, 150 250`
                                                }
                                                fill="none"
                                                stroke={`url(#grad-${index})`}
                                                strokeWidth="6"
                                                strokeLinecap="round"
                                                filter="url(#glow-path)"
                                                className="transition-all duration-1000"
                                            />
                                            {/* Energy Flow Animation */}
                                            {!isLocked && (
                                                <circle r="4" fill="#FCD34D">
                                                    <animateMotion
                                                        dur="3s"
                                                        repeatCount="indefinite"
                                                        path={isLeft
                                                            ? `M 150 50 C 400 50, 400 250, 750 250`
                                                            : `M 750 50 C 400 50, 400 250, 150 250`
                                                        }
                                                    />
                                                </circle>
                                            )}
                                        </svg>
                                    </div>
                                )}

                                {/* Stage Node */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    className="relative group cursor-pointer"
                                    onClick={() => !isLocked && onSelectLesson(lesson)}
                                >
                                    <LocationMarker
                                        type={locationType}
                                        isLocked={isLocked}
                                        isCompleted={isCompleted}
                                        isCurrent={isCurrent}
                                    />

                                    {/* Label Card */}
                                    <div className={`
                                        absolute top-1/2 transform -translate-y-1/2 
                                        ${isLeft ? 'left-full ml-8' : 'right-full mr-8'}
                                        w-64 z-30
                                    `}>
                                        <motion.div
                                            whileHover={{ x: isLeft ? 10 : -10 }}
                                            className={`
                                                bg-[#1a1a1a]/90 backdrop-blur-md border border-[#FCD34D]/30 
                                                p-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]
                                                ${isLocked ? 'opacity-50' : 'opacity-100'}
                                            `}
                                        >
                                            <div className="text-[#FCD34D] text-xs font-serif uppercase tracking-widest mb-1">
                                                Quest {index + 1}
                                            </div>
                                            <h3 className="text-white font-serif text-lg font-bold leading-tight">
                                                {lesson.title}
                                            </h3>
                                            {!isLocked && (
                                                <div className="mt-2 text-gray-400 text-xs">
                                                    Click to travel
                                                </div>
                                            )}
                                        </motion.div>
                                    </div>

                                    {/* Hero Avatar (Floating) */}
                                    {isCurrent && (
                                        <motion.div
                                            layoutId="hero-avatar"
                                            className="absolute -top-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
                                            initial={{ y: -20 }}
                                            animate={{ y: 0 }}
                                            transition={{
                                                y: { duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                                            }}
                                        >
                                            <div className="relative">
                                                {/* Hero Glow */}
                                                <div className="absolute inset-0 bg-amber-500/50 blur-2xl rounded-full" />

                                                {/* Hero Figure (SVG) */}
                                                <div className="relative w-24 h-24 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
                                                    <svg viewBox="0 0 100 100" className="w-full h-full">
                                                        <defs>
                                                            <linearGradient id="heroArmor" x1="0" y1="0" x2="1" y2="1">
                                                                <stop offset="0%" stopColor="#FCD34D" />
                                                                <stop offset="100%" stopColor="#B45309" />
                                                            </linearGradient>
                                                        </defs>
                                                        {/* Cape */}
                                                        <path d="M20 80 Q 50 100 80 80 L 70 40 L 30 40 Z" fill="#DC2626" />
                                                        {/* Body */}
                                                        <circle cx="50" cy="30" r="15" fill="url(#heroArmor)" /> {/* Head */}
                                                        <path d="M30 50 L 70 50 L 60 90 L 40 90 Z" fill="url(#heroArmor)" /> {/* Torso */}
                                                        {/* Sword */}
                                                        <path d="M75 40 L 90 20 L 95 25 L 80 45 Z" fill="#9CA3AF" />
                                                    </svg>
                                                </div>

                                                {/* "You Are Here" Badge */}
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                                                    bg-gradient-to-r from-amber-600 to-red-600 text-white 
                                                    text-[10px] font-bold px-3 py-1 rounded-full 
                                                    border border-amber-300 shadow-lg whitespace-nowrap uppercase tracking-wider">
                                                    Current Quest
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AdventureMap;
