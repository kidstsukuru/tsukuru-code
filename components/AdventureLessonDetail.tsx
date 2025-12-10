import React, { useState, useEffect } from 'react';
import { Lesson as LessonType, Course as CourseType, Quiz } from '../types/index';
import { useAuthStore } from '../store/authStore';
import { getQuizzesByLesson, updateUserXP, completeLesson } from '../services/supabaseService';
import YouTubeEmbed from './common/YouTubeEmbed';
import Button from './common/Button';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type Checkpoint = {
    text: string;
};

type Lesson = LessonType & {
    checkpoints: Checkpoint[];
};

type CheckpointState = Checkpoint & { checked: boolean };

// --- Premium Visual Components ---

const MagicalBorder = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`relative p-[2px] rounded-xl bg-gradient-to-b from-[#FCD34D] via-[#B45309] to-[#78350F] ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#FCD34D] via-[#B45309] to-[#78350F] blur-sm opacity-50" />
        <div className="relative bg-[#1a1a1a] rounded-[10px] overflow-hidden">
            {children}
        </div>
    </div>
);

const RuneCheckbox = ({ checked, onChange, label }: { checked: boolean, onChange: () => void, label: string }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className={`
            flex items-center p-4 rounded-lg border border-[#B45309]/30 cursor-pointer transition-all
            ${checked ? 'bg-[#B45309]/20' : 'bg-black/40 hover:bg-[#B45309]/10'}
        `}
        onClick={onChange}
    >
        <div className={`
            w-6 h-6 rounded border-2 flex items-center justify-center mr-4 transition-all
            ${checked ? 'border-[#FCD34D] bg-[#FCD34D]/20' : 'border-[#78350F]'}
        `}>
            {checked && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#FCD34D]">✨</motion.span>}
        </div>
        <span className={`font-serif text-sm md:text-base ${checked ? 'text-[#FCD34D]' : 'text-[#D6D3D1]'}`}>
            {label}
        </span>
    </motion.div>
);

const AdventureLessonDetail: React.FC<{
    course: CourseType;
    lesson: Lesson;
    lessons: Lesson[];
    onBack: () => void;
}> = ({ course, lesson, lessons, onBack }) => {
    const { completeLesson: completeLessonInStore, user } = useAuthStore();
    const currentIndex = lessons.findIndex(l => l.id === lesson.id);
    const hasNext = currentIndex < lessons.length - 1;

    const [checkpoints, setCheckpoints] = useState<CheckpointState[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [totalQuizPoints, setTotalQuizPoints] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [loadingQuiz, setLoadingQuiz] = useState(false);

    useEffect(() => {
        setCheckpoints(lesson.checkpoints.map(cp => ({ ...cp, checked: false })));
        setShowQuiz(false);
        setCurrentQuizIndex(0);
        setQuizCompleted(false);
        setQuizScore(0);
        setTotalQuizPoints(0);
    }, [lesson]);

    useEffect(() => {
        const fetchQuizzes = async () => {
            if (!lesson.id) return;
            try {
                setLoadingQuiz(true);
                const data = await getQuizzesByLesson(lesson.id);
                setQuizzes(data);
                const total = data.reduce((sum, quiz) => sum + quiz.points, 0);
                setTotalQuizPoints(total);
            } catch (error) {
                console.error('Error fetching quizzes:', error);
            } finally {
                setLoadingQuiz(false);
            }
        };
        fetchQuizzes();
    }, [lesson.id]);

    const handleCheckboxChange = (index: number) => {
        const newCheckpoints = [...checkpoints];
        newCheckpoints[index].checked = !newCheckpoints[index].checked;
        setCheckpoints(newCheckpoints);

        if (newCheckpoints[index].checked) {
            confetti({
                particleCount: 30,
                spread: 50,
                origin: { y: 0.7 },
                colors: ['#FCD34D', '#B45309']
            });
        }
    };

    const allChecked = checkpoints.every(cp => cp.checked);

    const handleStartQuiz = () => {
        if (quizzes.length === 0) {
            handleCompleteLesson();
            return;
        }
        setShowQuiz(true);
        setCurrentQuizIndex(0);
        setSelectedAnswer('');
        setQuizSubmitted(false);
        setQuizScore(0);
    };

    const handleSubmitAnswer = () => {
        if (!selectedAnswer) {
            toast.error('Choose your spell!');
            return;
        }

        const currentQuiz = quizzes[currentQuizIndex];
        const correct = selectedAnswer === currentQuiz.correct_answer;
        setIsCorrect(correct);
        setQuizSubmitted(true);

        if (correct) {
            setQuizScore(prev => prev + currentQuiz.points);
            toast.success('Spell Cast Successfully! 🌟');
            confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#FCD34D', '#FFFFFF']
            });
        } else {
            toast.error('The spell fizzled...');
        }
    };

    const handleNextQuiz = () => {
        if (currentQuizIndex < quizzes.length - 1) {
            setCurrentQuizIndex(prev => prev + 1);
            setSelectedAnswer('');
            setQuizSubmitted(false);
            setIsCorrect(false);
        } else {
            setQuizCompleted(true);
            handleCompleteLesson();
        }
    };

    const handleCompleteLesson = async () => {
        if (!user) return;

        try {
            const scorePercentage = totalQuizPoints > 0
                ? Math.round((quizScore / totalQuizPoints) * 100)
                : 100;

            await completeLesson(user.uid, lesson.id, course.id, scorePercentage, 0);
            const xpToAward = lesson.xp_reward || 10;
            await updateUserXP(user.uid, xpToAward);
            completeLessonInStore(course.id, lesson.id);
            toast.success(`Quest Complete! +${xpToAward} XP Gained!`);

            const duration = 3000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#FCD34D', '#B45309']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#FCD34D', '#B45309']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());

        } catch (error) {
            console.error('Error completing lesson:', error);
            toast.error('Failed to record victory');
        }
    };

    const handleNext = () => {
        if (hasNext) {
            window.location.hash = `lesson-${lessons[currentIndex + 1].id}`;
        } else {
            onBack();
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-[#E7E5E4] font-serif overflow-hidden relative selection:bg-[#B45309] selection:text-white">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1E293B] via-[#0F172A] to-black" />
                {/* Floating Embers */}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-[#FCD34D] rounded-full animate-pulse opacity-20"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${Math.random() * 5 + 3}s`,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-12">
                    <button
                        onClick={onBack}
                        className="group flex items-center gap-2 px-6 py-2 rounded-full border border-[#B45309]/50 hover:bg-[#B45309]/20 transition-all text-[#FCD34D]"
                    >
                        <span className="text-xl group-hover:-translate-x-1 transition-transform">↩</span>
                        <span className="font-bold text-sm tracking-widest uppercase">Return to Map</span>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="px-4 py-1 rounded bg-black/50 border border-[#B45309] text-[#FCD34D] text-xs uppercase tracking-widest">
                            Chapter {currentIndex + 1}
                        </div>
                    </div>
                </header>

                {/* Title */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FCD34D] to-[#B45309] drop-shadow-lg mb-4">
                        {lesson.title}
                    </h1>
                    <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-[#B45309] to-transparent" />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Video Frame */}
                        <MagicalBorder>
                            <div className="aspect-video bg-black relative">
                                {lesson.youtube_url ? (
                                    <YouTubeEmbed url={lesson.youtube_url} title={lesson.title} />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-[#78350F]">
                                        <span className="text-2xl">🔮 Scrying Pool Offline</span>
                                    </div>
                                )}
                            </div>
                        </MagicalBorder>

                        {/* Description Scroll */}
                        <div className="bg-[#1a1a1a]/80 border border-[#B45309]/30 rounded-xl p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#B45309] to-transparent opacity-50" />
                            <h2 className="text-2xl font-bold text-[#FCD34D] mb-4 font-serif">
                                📜 The Lore
                            </h2>
                            <p className="text-[#D6D3D1] leading-relaxed text-lg">
                                {lesson.description}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Objectives */}
                        <div className="bg-[#1a1a1a]/80 border border-[#B45309]/30 rounded-xl overflow-hidden">
                            <div className="bg-[#2A1B0E] p-4 border-b border-[#B45309]/30">
                                <h2 className="font-bold text-[#FCD34D] uppercase tracking-widest text-sm">
                                    Quest Objectives
                                </h2>
                            </div>
                            <div className="p-4 space-y-3">
                                {checkpoints.map((cp, index) => (
                                    <RuneCheckbox
                                        key={index}
                                        checked={cp.checked}
                                        onChange={() => handleCheckboxChange(index)}
                                        label={cp.text}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="sticky top-6">
                            <AnimatePresence mode="wait">
                                {allChecked && !showQuiz && !quizCompleted && (
                                    <motion.button
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleStartQuiz}
                                        className="w-full py-4 bg-gradient-to-r from-[#B45309] to-[#78350F] text-white rounded-xl font-bold text-xl uppercase tracking-widest shadow-lg border border-[#FCD34D]/50 hover:shadow-[#FCD34D]/20 transition-all"
                                    >
                                        ⚔️ Begin Trial
                                    </motion.button>
                                )}

                                {showQuiz && !quizCompleted && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-[#2A1B0E] border-2 border-[#B45309] rounded-xl overflow-hidden"
                                    >
                                        <div className="bg-[#1a1a1a] p-4 text-center border-b border-[#B45309]">
                                            <h3 className="text-[#FCD34D] font-bold uppercase tracking-widest">
                                                Trial of Wisdom
                                            </h3>
                                            <div className="text-xs text-[#78350F] mt-1">
                                                Wave {currentQuizIndex + 1} / {quizzes.length}
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            {quizzes[currentQuizIndex] && (
                                                <>
                                                    <p className="font-bold text-white mb-6 text-lg text-center">
                                                        {quizzes[currentQuizIndex].question}
                                                    </p>

                                                    <div className="space-y-3">
                                                        {quizzes[currentQuizIndex].options?.map((option, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => !quizSubmitted && setSelectedAnswer(option)}
                                                                disabled={quizSubmitted}
                                                                className={`
                                                                    w-full p-4 border rounded-lg text-left font-serif transition-all
                                                                    ${selectedAnswer === option
                                                                        ? 'bg-[#B45309]/30 border-[#FCD34D] text-[#FCD34D]'
                                                                        : 'bg-black/20 border-[#78350F] text-[#D6D3D1] hover:bg-[#B45309]/10'
                                                                    }
                                                                    ${quizSubmitted && option === quizzes[currentQuizIndex].correct_answer ? '!bg-green-900/30 !border-green-500 !text-green-400' : ''}
                                                                    ${quizSubmitted && selectedAnswer === option && option !== quizzes[currentQuizIndex].correct_answer ? '!bg-red-900/30 !border-red-500 !text-red-400' : ''}
                                                                `}
                                                            >
                                                                {option}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {quizSubmitted && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className={`mt-4 p-3 rounded bg-black/30 border ${isCorrect ? 'border-green-500/50 text-green-400' : 'border-red-500/50 text-red-400'}`}
                                                        >
                                                            <p className="font-bold mb-1">{isCorrect ? '✨ Correct!' : '💀 Incorrect'}</p>
                                                            <p className="text-sm opacity-80">{quizzes[currentQuizIndex].explanation}</p>
                                                        </motion.div>
                                                    )}

                                                    <div className="mt-6">
                                                        {!quizSubmitted ? (
                                                            <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="w-full bg-[#B45309] hover:bg-[#92400E] border border-[#FCD34D]/30 text-white font-serif">
                                                                Cast Spell
                                                            </Button>
                                                        ) : (
                                                            <Button onClick={handleNextQuiz} className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF] border border-blue-400/30 text-white font-serif">
                                                                Next Challenge
                                                            </Button>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {quizCompleted && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-gradient-to-b from-[#FCD34D] to-[#B45309] p-1 rounded-xl shadow-2xl"
                                    >
                                        <div className="bg-[#1a1a1a] p-6 rounded-lg text-center">
                                            <div className="text-5xl mb-4">👑</div>
                                            <h3 className="text-2xl font-black text-[#FCD34D] mb-2 uppercase tracking-widest">Victory!</h3>
                                            <p className="text-[#D6D3D1] mb-6">
                                                Score: {quizScore} / {totalQuizPoints}
                                            </p>
                                            <Button onClick={handleNext} className="w-full bg-[#FCD34D] hover:bg-[#D97706] text-black font-bold uppercase tracking-widest">
                                                Continue Journey
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdventureLessonDetail;
