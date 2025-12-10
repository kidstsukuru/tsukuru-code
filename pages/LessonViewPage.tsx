import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import YouTubeEmbed from '../components/common/YouTubeEmbed';
import { useAuthStore } from '../store/authStore';
import { getCourseById, getLevelById, getLessonsByLevel, getQuizzesByLesson, updateUserXP, completeLesson, checkAndCompleteLevelIfNeeded } from '../services/supabaseService';
import { Lesson as LessonType, Course as CourseType, Level, Quiz } from '../types/index';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

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

    const [showLevelCompleteModal, setShowLevelCompleteModal] = useState(false);
    const [levelBonusXP, setLevelBonusXP] = useState(0);

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
            setShowQuiz(false);
            setCurrentQuizIndex(0);
            setQuizCompleted(false);
            setQuizScore(0);
            setTotalQuizPoints(0);
        }
    }, [currentLesson]);

    useEffect(() => {
        const fetchQuizzes = async () => {
            if (!currentLesson?.id) return;

            try {
                setLoadingQuiz(true);
                const data = await getQuizzesByLesson(currentLesson.id);
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
    }, [currentLesson?.id]);

    const handleCheckboxChange = (index: number) => {
        const newCheckpoints = [...checkpoints];
        newCheckpoints[index].checked = !newCheckpoints[index].checked;
        setCheckpoints(newCheckpoints);
    };

    const allChecked = checkpoints.every(cp => cp.checked);

    const handleStartQuiz = () => {
        if (quizzes.length === 0) {
            handleCompleteLessonWithoutQuiz();
            return;
        }
        setShowQuiz(true);
        setCurrentQuizIndex(0);
        setSelectedAnswer('');
        setQuizSubmitted(false);
    };

    const handleCompleteLessonWithoutQuiz = async () => {
        if (!user || !currentLesson || !courseId || !levelId) return;

        try {
            const score = 100;
            const timeSpent = 0;

            await completeLesson(user.uid, currentLesson.id, courseId, score, timeSpent);

            if (currentLesson.xp_reward) {
                await updateUserXP(user.uid, currentLesson.xp_reward);
            }

            completeLessonInStore(currentLesson.id);

            toast.success('レッスンを完了しました！');

            // レベル完了チェック
            await checkLevelCompletion();

            setQuizCompleted(true);
        } catch (error) {
            console.error('Error completing lesson:', error);
            toast.error('レッスン完了の記録に失敗しました');
        }
    };

    const handleSubmitAnswer = () => {
        if (!selectedAnswer) return;

        const currentQuiz = quizzes[currentQuizIndex];
        const correct = selectedAnswer === currentQuiz.correct_answer;

        setIsCorrect(correct);
        setQuizSubmitted(true);

        if (correct) {
            setQuizScore(prev => prev + currentQuiz.points);
        }
    };

    const handleNextQuiz = () => {
        if (currentQuizIndex < quizzes.length - 1) {
            setCurrentQuizIndex(prev => prev + 1);
            setSelectedAnswer('');
            setQuizSubmitted(false);
            setIsCorrect(false);
        } else {
            handleQuizComplete();
        }
    };

    const handleQuizComplete = async () => {
        if (!user || !currentLesson || !courseId || !levelId) return;

        try {
            const scorePercentage = totalQuizPoints > 0 ? (quizScore / totalQuizPoints) * 100 : 100;
            const timeSpent = 0;

            await completeLesson(user.uid, currentLesson.id, courseId, Math.round(scorePercentage), timeSpent);

            if (currentLesson.xp_reward) {
                await updateUserXP(user.uid, currentLesson.xp_reward);
            }

            completeLessonInStore(currentLesson.id);

            setQuizCompleted(true);
            setShowQuiz(false);

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
                setShowLevelCompleteModal(true);

                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
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
        <div className="bg-amber-50 min-h-screen">
            <div className="container mx-auto px-6 py-12">
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate(`/course/${courseId}`)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>{level.title}に戻る</span>
                    </button>
                </div>

                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">{currentLesson.title}</h1>
                    <p className="text-sm text-gray-600">{course.title} / {level.title}</p>
                </div>

                <Card className="mb-8">
                    {currentLesson.youtube_url ? (
                        <YouTubeEmbed url={currentLesson.youtube_url} title={currentLesson.title} />
                    ) : (
                        <div className="bg-gray-100 rounded-lg p-8 text-center">
                            <p className="text-gray-600">このレッスンには動画が設定されていません</p>
                        </div>
                    )}
                </Card>

                <Card className="p-6 mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4">このレッスンのポイント</h2>
                    <p className="text-gray-700 leading-relaxed text-base">
                        {currentLesson.description}
                    </p>
                </Card>

                <Card className="p-6 sm:p-8 mb-8 bg-amber-50 border-2 border-amber-200">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-x-3">
                        <span className="text-3xl">🎯</span>
                        <span>理解度チェック</span>
                    </h2>
                    <p className="text-gray-600 mb-6">
                        動画で学んだことを確認しよう！できたらタップしてチェック！
                    </p>
                    <div className="space-y-3">
                        {checkpoints.map((cp, index) => (
                            <label
                                key={index}
                                htmlFor={`cp-${index}`}
                                className={`
                                    flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                    ${cp.checked
                                        ? 'bg-green-100 border-green-300 shadow-inner'
                                        : 'bg-white border-gray-200 hover:bg-yellow-50 hover:border-yellow-300'
                                    }
                                `}
                            >
                                <input
                                    id={`cp-${index}`}
                                    type="checkbox"
                                    checked={cp.checked}
                                    onChange={() => handleCheckboxChange(index)}
                                    className="sr-only"
                                />
                                <div className={`
                                    w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-all
                                    ${cp.checked ? 'bg-green-500 border-green-600' : 'bg-gray-100 border-gray-300'}
                                `}>
                                    {cp.checked && <CheckIcon className="w-4 h-4 text-white" />}
                                </div>
                                <span className={`
                                    ml-4 font-medium
                                    ${cp.checked ? 'text-gray-500 line-through' : 'text-gray-800'}
                                `}>
                                    {cp.text}
                                </span>
                            </label>
                        ))}
                    </div>
                </Card>

                {allChecked && !showQuiz && !quizCompleted && (
                    <Card className="p-6 sm:p-8 mb-8 bg-purple-50 border-2 border-purple-200">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-x-3">
                            <span className="text-3xl">📝</span>
                            <span>クイズに挑戦！</span>
                        </h2>
                        {loadingQuiz ? (
                            <p className="text-gray-600">クイズを読み込んでいます...</p>
                        ) : quizzes.length === 0 ? (
                            <div>
                                <p className="text-gray-600 mb-4">このレッスンにはクイズがありません。次のレッスンに進みましょう！</p>
                                <Button onClick={handleStartQuiz}>レッスンを完了</Button>
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-600 mb-4">
                                    このレッスンには {quizzes.length} 問のクイズがあります（合計 {totalQuizPoints} ポイント）
                                </p>
                                <Button onClick={handleStartQuiz}>クイズを始める</Button>
                            </div>
                        )}
                    </Card>
                )}

                {showQuiz && !quizCompleted && quizzes.length > 0 && (
                    <Card className="p-6 sm:p-8 mb-8 bg-white border-2 border-purple-300">
                        <div className="mb-4 flex justify-between items-center">
                            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-x-3">
                                <span className="text-3xl">📝</span>
                                <span>クイズ {currentQuizIndex + 1} / {quizzes.length}</span>
                            </h2>
                            <div className="text-sm text-gray-600">
                                現在のスコア: {quizScore} / {totalQuizPoints}
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4">{quizzes[currentQuizIndex].question}</h3>

                            {quizzes[currentQuizIndex].question_type === 'multiple_choice' && quizzes[currentQuizIndex].options && (
                                <div className="space-y-3">
                                    {quizzes[currentQuizIndex].options!.map((option, index) => (
                                        <label
                                            key={index}
                                            className={`
                                                flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                                                ${selectedAnswer === option
                                                    ? quizSubmitted
                                                        ? option === quizzes[currentQuizIndex].correct_answer
                                                            ? 'bg-green-100 border-green-300'
                                                            : 'bg-red-100 border-red-300'
                                                        : 'bg-amber-100 border-amber-300'
                                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                                }
                                                ${quizSubmitted ? 'pointer-events-none' : ''}
                                            `}
                                        >
                                            <input
                                                type="radio"
                                                name="quiz-answer"
                                                value={option}
                                                checked={selectedAnswer === option}
                                                onChange={(e) => setSelectedAnswer(e.target.value)}
                                                disabled={quizSubmitted}
                                                className="sr-only"
                                            />
                                            <div className={`
                                                w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2
                                                ${selectedAnswer === option ? 'bg-amber-500 border-amber-600' : 'bg-white border-gray-300'}
                                            `}>
                                                {selectedAnswer === option && (
                                                    <div className="w-3 h-3 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                            <span className="ml-4 font-medium text-gray-800">
                                                {option}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {quizSubmitted && quizzes[currentQuizIndex].explanation && (
                                <div className={`p-4 rounded-lg mb-6 mt-4 ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                                    <p className="font-bold mb-2 flex items-center gap-2">
                                        {isCorrect ? (
                                            <>
                                                <span className="text-2xl">✅</span>
                                                <span className="text-green-700">正解です！</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-2xl">❌</span>
                                                <span className="text-red-700">不正解です</span>
                                            </>
                                        )}
                                    </p>
                                    <p className="text-gray-700">{quizzes[currentQuizIndex].explanation}</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-4">
                                {!quizSubmitted ? (
                                    <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>
                                        回答を確認
                                    </Button>
                                ) : (
                                    <Button onClick={handleNextQuiz}>
                                        {currentQuizIndex < quizzes.length - 1 ? '次の問題へ' : 'クイズを完了'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                {quizCompleted && (
                    <Card className="p-6 sm:p-8 mb-8 bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-x-3">
                            <span className="text-4xl">🎉</span>
                            <span>クイズ完了！</span>
                        </h2>
                        <div className="mb-4">
                            <p className="text-xl font-bold text-purple-900 mb-2">
                                あなたのスコア: {quizScore} / {totalQuizPoints} ポイント
                            </p>
                            <p className="text-lg text-purple-800">
                                正答率: {totalQuizPoints > 0 ? Math.round((quizScore / totalQuizPoints) * 100) : 100}%
                            </p>
                        </div>
                        <p className="text-gray-700 mb-4">
                            {currentLesson.xp_reward && `+${currentLesson.xp_reward} XP を獲得しました！`}
                        </p>
                    </Card>
                )}

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
                            disabled={!quizCompleted && (quizzes.length > 0 || !allChecked)}
                        >
                            {hasNext ? '次のレッスンへ' : 'レベル一覧に戻る'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* レベルクリアモーダル */}
            {showLevelCompleteModal && level && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                レベルクリア！
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {level.title}を完了しました！
                            </p>

                            <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-6 mb-6">
                                <p className="text-sm text-gray-600 mb-2">ボーナスXP獲得</p>
                                <p className="text-4xl font-bold text-amber-600">
                                    +{levelBonusXP} XP
                                </p>
                            </div>

                            <button
                                onClick={closeLevelCompleteModal}
                                className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
                            >
                                次のレベルへ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonViewPage;
