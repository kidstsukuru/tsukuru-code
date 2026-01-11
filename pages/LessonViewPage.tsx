import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import YouTubeEmbed from '../components/common/YouTubeEmbed';
import { useAuthStore } from '../store/authStore';
import { getCourseById, getLevelById, getLessonsByLevel, updateUserXP, completeLesson, checkAndCompleteLevelIfNeeded, getUserData } from '../services/supabaseService';
import { Lesson as LessonType, Course as CourseType, Level } from '../types/index';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import LevelClearModal from '../components/modals/LevelClearModal';
import { createSafeHTML } from '../utils/sanitizeHelpers';

type Checkpoint = {
    text: string;
};

type Lesson = LessonType & {
    checkpoints: Checkpoint[];
};

// デフォルトのチェックポイント
const DEFAULT_CHECKPOINTS: Checkpoint[] = [
    { text: '動画を最後まで見た' },
    { text: 'レッスンの内容を理解した' },
];

type CheckpointState = Checkpoint & { checked: boolean };

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const LessonViewPage: React.FC = () => {
    const { courseId, levelId, lessonId } = useParams<{ courseId: string; levelId: string; lessonId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { completeLesson: completeLessonInStore, user } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState<CourseType | null>(null);
    const [level, setLevel] = useState<Level | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

    const [checkpoints, setCheckpoints] = useState<CheckpointState[]>([]);
    const [lessonCompleted, setLessonCompleted] = useState(false);

    const [showLevelCompleteModal, setShowLevelCompleteModal] = useState(false);
    const [levelBonusXP, setLevelBonusXP] = useState(0);
    const [lessonXP, setLessonXP] = useState(0);
    const [totalUserXP, setTotalUserXP] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (!courseId || !levelId || !lessonId) return;

            try {
                setLoading(true);

                const [courseData, levelData, lessonsData] = await Promise.all([
                    getCourseById(courseId),
                    getLevelById(levelId),
                    getLessonsByLevel(levelId),
                ]);

                setCourse(courseData);
                setLevel(levelData);

                const formattedLessons: Lesson[] = lessonsData.map(lesson => ({
                    ...lesson,
                    checkpoints: DEFAULT_CHECKPOINTS,
                }));

                setLessons(formattedLessons);

                const lesson = formattedLessons.find(l => l.id === lessonId);
                if (lesson) {
                    setCurrentLesson(lesson);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('データの取得に失敗しました');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId, levelId, lessonId]);

    useEffect(() => {
        if (currentLesson) {
            setCheckpoints(currentLesson.checkpoints.map(cp => ({ ...cp, checked: false })));
            setLessonCompleted(false);
        }
    }, [currentLesson]);


    const handleCheckboxChange = (index: number) => {
        const newCheckpoints = [...checkpoints];
        newCheckpoints[index].checked = !newCheckpoints[index].checked;
        setCheckpoints(newCheckpoints);
    };

    const allChecked = checkpoints.every(cp => cp.checked);

    const handleCompleteLesson = async () => {
        if (!user || !currentLesson || !courseId || !levelId) return;

        try {
            const score = 100;
            const timeSpent = 0;

            await completeLesson(user.uid, currentLesson.id, courseId, score, timeSpent);

            if (currentLesson.xp_reward) {
                await updateUserXP(user.uid, currentLesson.xp_reward);
                setLessonXP(currentLesson.xp_reward);
            }

            completeLessonInStore(courseId, currentLesson.id);
            setLessonCompleted(true);

            toast.success('レッスンを完了しました！');

            // レベル完了チェック
            await checkLevelCompletion();
        } catch (error) {
            console.error('Error completing lesson:', error);
            toast.error('レッスン完了の記録に失敗しました');
        }
    };

    const checkLevelCompletion = async () => {
        if (!user || !levelId) return;

        try {
            const result = await checkAndCompleteLevelIfNeeded(user.uid, levelId);

            if (result?.levelCompleted) {
                setLevelBonusXP(result.bonusXP);

                // Fetch updated user data to get total XP
                const userData = await getUserData(user.uid);
                if (userData) {
                    setTotalUserXP(userData.xp || 0);
                }

                setShowLevelCompleteModal(true);
            }
        } catch (error) {
            console.error('Error checking level completion:', error);
        }
    };

    const handlePrev = () => {
        if (!currentLesson) return;
        const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex > 0) {
            const prevLesson = lessons[currentIndex - 1];
            navigate(`/course/${courseId}/level/${levelId}/lesson/${prevLesson.id}`);
        }
    };

    const handleNext = () => {
        if (!currentLesson) return;
        const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex < lessons.length - 1) {
            const nextLesson = lessons[currentIndex + 1];
            navigate(`/course/${courseId}/level/${levelId}/lesson/${nextLesson.id}`);
        } else {
            // レベルの最後のレッスン - レベル一覧に戻る
            navigate(`/course/${courseId}`);
        }
    };

    const closeLevelCompleteModal = () => {
        setShowLevelCompleteModal(false);
        navigate(`/course/${courseId}`);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-12 text-center">
                <h1 className="text-2xl font-bold">読み込み中...</h1>
            </div>
        );
    }

    if (!course || !level || !currentLesson || !user) {
        return (
            <div className="container mx-auto px-6 py-12 text-center">
                <h1 className="text-2xl font-bold">レッスンが見つかりません。</h1>
                <Button onClick={() => navigate('/dashboard')} className="mt-4">ダッシュボードにもどる</Button>
            </div>
        );
    }

    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < lessons.length - 1;

    return (
        <div className="min-h-screen bg-[#f4e4bc] font-serif relative">
            {/* 背景装飾 */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235D4037' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />

            <div className="container mx-auto px-6 py-12 landscape:py-3 landscape:px-3 relative z-10">
                <div className="flex items-center mb-8 landscape:mb-3">
                    <button
                        onClick={() => navigate(`/course/${courseId}/level/${levelId}`)}
                        className="flex items-center gap-2 text-amber-900 hover:text-amber-700 font-bold bg-white/50 px-4 py-2 landscape:px-3 landscape:py-1 rounded-full transition-all hover:bg-white/80 landscape:text-sm"
                    >
                        <svg className="w-5 h-5 landscape:w-4 landscape:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>冒険の地図に戻る</span>
                    </button>
                </div>

                <div className="mb-6 landscape:mb-2 text-center landscape:text-left">
                    <span className="inline-block px-4 py-1 landscape:px-2 bg-amber-800 text-amber-100 rounded-full text-sm landscape:text-xs font-bold mb-2 landscape:mb-1 tracking-wider">QUEST</span>
                    <h1 className="text-3xl sm:text-5xl landscape:text-xl font-bold mb-2 landscape:mb-1 text-amber-900 drop-shadow-sm">{currentLesson.title}</h1>
                    <p className="text-amber-800 font-medium landscape:text-sm">{course.title} - {level.title}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 landscape:grid-cols-2 gap-8 landscape:gap-3">
                    <div className="lg:col-span-2 landscape:col-span-1 space-y-8 landscape:space-y-3">
                        {/* 動画カード */}
                        <div className="bg-[#fff9e6] rounded-xl shadow-xl border-4 border-[#d4c5a2] overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-2 bg-[#d4c5a2]"></div>
                            <div className="p-1">
                                {currentLesson.youtube_url ? (
                                    <YouTubeEmbed url={currentLesson.youtube_url} title={currentLesson.title} />
                                ) : (
                                    <div className="bg-amber-50 rounded-lg p-12 text-center border-2 border-dashed border-amber-300">
                                        <p className="text-amber-800 font-bold">このクエストには動画の記録がないようだ...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 説明カード */}
                        <div className="bg-[#fff9e6] p-8 landscape:p-4 rounded-xl shadow-lg border-2 border-[#d4c5a2] relative landscape:hidden">
                            <div className="absolute -top-4 -left-4 w-12 h-12 landscape:w-8 landscape:h-8 bg-amber-600 rounded-full flex items-center justify-center text-white text-2xl landscape:text-lg shadow-md">
                                📜
                            </div>
                            <h2 className="text-2xl landscape:text-lg font-bold mb-4 landscape:mb-2 text-amber-900 border-b-2 border-amber-200 pb-2">
                                クエスト情報
                            </h2>
                            <div
                                className="prose prose-amber max-w-none text-amber-900"
                                dangerouslySetInnerHTML={createSafeHTML(currentLesson.description)}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6 landscape:space-y-2">
                        {/* クエスト目標（チェックポイント） */}
                        <div className="bg-[#fff9e6] p-6 landscape:p-3 rounded-xl shadow-lg border-4 border-amber-700/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg className="w-32 h-32 text-amber-900" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            <h2 className="text-xl landscape:text-base font-bold mb-6 landscape:mb-2 flex items-center gap-x-3 landscape:gap-x-2 text-amber-900">
                                <span className="text-2xl landscape:text-lg">⚔️</span>
                                <span>クエスト目標</span>
                            </h2>

                            <div className="space-y-4 landscape:space-y-2 relative z-10">
                                {checkpoints.map((cp, index) => (
                                    <label
                                        key={index}
                                        htmlFor={`cp-${index}`}
                                        className={`
                                            flex items-center p-4 landscape:p-2 rounded-lg border-2 cursor-pointer transition-all duration-300 group
                                            ${cp.checked
                                                ? 'bg-green-100/50 border-green-600/30'
                                                : 'bg-white border-amber-200 hover:border-amber-400 hover:bg-amber-50'
                                            }
                                        `}
                                    >
                                        <div className="relative">
                                            <input
                                                id={`cp-${index}`}
                                                type="checkbox"
                                                checked={cp.checked}
                                                onChange={() => handleCheckboxChange(index)}
                                                className="sr-only"
                                            />
                                            <div className={`
                                                w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all duration-300
                                                ${cp.checked
                                                    ? 'bg-green-500 border-green-600 scale-110'
                                                    : 'bg-amber-100 border-amber-300 group-hover:border-amber-500'
                                                }
                                            `}>
                                                {cp.checked && <CheckIcon className="w-5 h-5 text-white" />}
                                            </div>
                                        </div>
                                        <span className={`
                                            ml-4 landscape:ml-2 font-bold text-lg landscape:text-sm transition-colors
                                            ${cp.checked ? 'text-green-800 line-through opacity-70' : 'text-amber-900'}
                                        `}>
                                            {cp.text}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 完了アクション */}
                        {allChecked && !lessonCompleted && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-gradient-to-br from-green-100 to-emerald-200 p-6 landscape:p-3 rounded-xl shadow-xl border-4 border-green-400 text-center"
                            >
                                <h2 className="text-xl landscape:text-base font-bold mb-2 landscape:mb-1 text-green-900">目標達成！</h2>
                                <p className="text-green-800 mb-4 landscape:mb-2 text-sm landscape:text-xs">クエストを完了して報酬を受け取ろう</p>
                                <button
                                    onClick={handleCompleteLesson}
                                    className="w-full py-4 landscape:py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all flex items-center justify-center gap-2 landscape:text-sm"
                                >
                                    <span className="text-xl">🎁</span>
                                    クエスト完了！
                                </button>
                            </motion.div>
                        )}

                        {lessonCompleted && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="bg-gradient-to-br from-amber-100 to-yellow-200 p-6 rounded-xl shadow-xl border-4 border-yellow-400 text-center"
                            >
                                <h2 className="text-2xl font-bold mb-2 text-amber-900">クエストクリア！</h2>
                                <div className="text-4xl mb-2">🎉</div>
                                <p className="text-amber-800 font-bold">
                                    {currentLesson.xp_reward && `+${currentLesson.xp_reward} XP 獲得！`}
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <div className="h-5 mb-1" />
                        <Button onClick={handlePrev} variant="secondary" disabled={!hasPrev}>
                            前のレッスンへ
                        </Button>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="h-5 mb-1">
                            {!allChecked && (
                                <p className="text-sm text-amber-600 font-bold">
                                    すべての項目をチェックしよう！
                                </p>
                            )}
                        </div>
                        <Button
                            onClick={handleNext}
                            disabled={!lessonCompleted}
                        >
                            {hasNext ? '次のレッスンへ' : 'レベル一覧に戻る'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* レベルクリアモーダル */}
            {level && (
                <LevelClearModal
                    isOpen={showLevelCompleteModal}
                    onClose={closeLevelCompleteModal}
                    levelTitle={level.title}
                    levelNumber={level.level_number}
                    xpEarned={lessonXP}
                    bonusXP={levelBonusXP}
                    totalXP={totalUserXP}
                />
            )}
        </div>
    );
};

export default LessonViewPage;
