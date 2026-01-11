import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const EntryPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 landscape:p-2 overflow-hidden relative">
            {/* 背景のパーティクル効果 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: Math.random() * 4 + 2,
                            height: Math.random() * 4 + 2,
                            background: `rgba(${Math.random() > 0.5 ? '6, 182, 212' : '236, 72, 153'}, ${Math.random() * 0.5 + 0.2})`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [-20, -100],
                            opacity: [0.8, 0],
                            scale: [1, 0.5],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                            ease: "easeOut",
                        }}
                    />
                ))}
            </div>

            {/* ロゴ */}
            <motion.h1
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                className="text-4xl sm:text-6xl landscape:text-3xl font-black mb-12 landscape:mb-6 text-center"
                style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 60px rgba(245, 158, 11, 0.4)',
                }}
            >
                Tsukuru Code
            </motion.h1>

            {/* 選択カード */}
            <div className="flex flex-col sm:flex-row landscape:flex-row gap-6 landscape:gap-4 relative z-10">
                {/* クリエイターズワールド */}
                <motion.button
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                    whileHover={{ scale: 1.08, rotate: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/creations')}
                    className="group relative w-44 h-44 sm:w-56 sm:h-56 landscape:w-40 landscape:h-40 rounded-3xl overflow-hidden"
                >
                    {/* 背景グラデーション */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 opacity-90 group-hover:opacity-100 transition-opacity" />

                    {/* 輝きエフェクト */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20" />
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                    {/* コンテンツ */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
                        <motion.span
                            className="text-7xl sm:text-8xl landscape:text-6xl mb-2"
                            animate={{
                                y: [0, -8, 0],
                                rotate: [0, 5, -5, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            🎮
                        </motion.span>
                        <span className="text-white font-bold text-lg sm:text-xl landscape:text-base tracking-wide drop-shadow-lg">
                            あそぶ
                        </span>
                    </div>

                    {/* ボーダーグロー */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-white/30 group-hover:border-white/60 transition-colors" />
                </motion.button>

                {/* 学習ページ */}
                <motion.button
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                    whileHover={{ scale: 1.08, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="group relative w-44 h-44 sm:w-56 sm:h-56 landscape:w-40 landscape:h-40 rounded-3xl overflow-hidden"
                >
                    {/* 背景グラデーション */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 opacity-90 group-hover:opacity-100 transition-opacity" />

                    {/* 輝きエフェクト */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20" />
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                    {/* コンテンツ */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
                        <motion.span
                            className="text-7xl sm:text-8xl landscape:text-6xl mb-2"
                            animate={{
                                y: [0, -8, 0],
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5,
                            }}
                        >
                            📚
                        </motion.span>
                        <span className="text-white font-bold text-lg sm:text-xl landscape:text-base tracking-wide drop-shadow-lg">
                            まなぶ
                        </span>
                    </div>

                    {/* ボーダーグロー */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-white/30 group-hover:border-white/60 transition-colors" />
                </motion.button>
            </div>

            {/* 下部リンク（控えめに） */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-10 landscape:mt-4 text-gray-500 text-sm landscape:text-xs"
            >
                <button
                    onClick={() => navigate('/register')}
                    className="text-cyan-400/70 hover:text-cyan-300 transition-colors"
                >
                    新規登録
                </button>
            </motion.p>
        </div>
    );
};

export default EntryPage;
