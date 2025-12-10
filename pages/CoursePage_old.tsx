import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import YouTubeEmbed from '../components/common/YouTubeEmbed';
import { useAuthStore } from '../store/authStore';
import { getCourseById, getLessonsByCourse } from '../services/supabaseService';
import { Lesson as LessonType, Course as CourseType } from '../types/index';
import toast from 'react-hot-toast';

type Checkpoint = {
  text: string;
};

type Lesson = LessonType & {
  checkpoints: Checkpoint[];
};

// デフォルトのチェックポイント（将来的にはDBから取得）
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

const LessonDetailView: React.FC<{
    course: Course;
    lesson: Lesson;
    onBack: () => void;
    onNavigateLesson: (lessonId: string) => void;
}> = ({ course, lesson, onBack, onNavigateLesson }) => {
    const { completeLesson } = useAuthStore();
    const allLessons = course.chapters.flatMap(c => c.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
    
    const currentChapter = course.chapters.find(c => c.lessons.some(l => l.id === lesson.id));
    const isLastLessonInChapter = currentChapter ? currentChapter.lessons[currentChapter.lessons.length - 1].id === lesson.id : false;

    const hasPrev = currentIndex > 0;
    const hasNext = !isLastLessonInChapter && (currentIndex < allLessons.length - 1);

    const [checkpoints, setCheckpoints] = useState<CheckpointState[]>([]);

    useEffect(() => {
        setCheckpoints(lesson.checkpoints.map(cp => ({ ...cp, checked: false })));
    }, [lesson]);

    const handleCheckboxChange = (index: number) => {
        const newCheckpoints = [...checkpoints];
        newCheckpoints[index].checked = !newCheckpoints[index].checked;
        setCheckpoints(newCheckpoints);
    };
    
    const allChecked = checkpoints.every(cp => cp.checked);

    const handleNext = () => {
        completeLesson(course.id, lesson.id);
        if (isLastLessonInChapter) {
            onBack();
        } else if (hasNext) {
            onNavigateLesson(allLessons[currentIndex + 1].id);
        }
    };

    return (
         <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <button onClick={onBack} className="text-amber-600 font-bold hover:underline mb-2">
                    &larr; {course.title}のマップにもどる
                </button>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800">
                    {lesson.title}
                </h1>
            </header>
            
            <Card className="mb-8">
                {lesson.youtube_url ? (
                    <YouTubeEmbed url={lesson.youtube_url} title={lesson.title} />
                ) : (
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                        <p className="text-gray-600">このレッスンには動画が設定されていません</p>
                    </div>
                )}
            </Card>

            <Card className="p-6 mb-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">このレッスンのポイント</h2>
                <p className="text-gray-700 leading-relaxed text-base">
                    {lesson.description}
                </p>
            </Card>

            <Card className="p-6 sm:p-8 mb-8 bg-amber-50 border-2 border-amber-200">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-x-3">
                    <span className="text-3xl">🎯</span>
                    <span>理解度チェック</span>
                </h2>
                <p className="text-gray-600 mb-6">
                    動画で学んだことを確認しよう！
                    <br className="sm:hidden"/>
                    できたらタップしてチェック！
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
                                className="sr-only" // Hide the default checkbox
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

            <div className="flex justify-between items-center">
                <div>
                    <div className="h-5 mb-1" />
                    <Button onClick={() => onNavigateLesson(allLessons[currentIndex - 1].id)} variant="secondary" disabled={!hasPrev}>
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
                    <Button onClick={handleNext} disabled={!allChecked}>
                        {isLastLessonInChapter ? 'レベルクリア！' : '次のレッスンへ'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

type StageStatus = 'locked' | 'current' | 'completed';

const GoalNode: React.FC<{ isCompleted: boolean }> = ({ isCompleted }) => {
    const icon = isCompleted ? '🏆' : '🌟';
    const text = isCompleted ? 'コースクリア！' : 'ゴール';
    const colorMap = isCompleted 
        ? 'bg-yellow-400 border-yellow-200 text-yellow-800 shadow-2xl shadow-yellow-300/80' 
        : 'bg-slate-700 border-slate-500 text-slate-300';
    const textColor = isCompleted ? 'text-yellow-100' : 'text-slate-400';

    return (
        <div className="text-center">
            <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-300 ${colorMap}`}>
                <div className="text-5xl" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>{icon}</div>
            </div>
            <p className={`mt-2 font-bold text-lg ${textColor}`} style={{textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>{text}</p>
        </div>
    );
};

const StageNode: React.FC<{
    chapter: Chapter;
    status: StageStatus;
    isCurrent: boolean;
    onClick: () => void;
    color: string;
}> = ({ chapter, status, isCurrent, onClick, color }) => {
    const iconMap: Record<StageStatus, string> = { locked: '🔒', current: '💎', completed: '✅' };
    
    const baseColor = status === 'completed' 
        ? 'bg-emerald-600 border-emerald-400 shadow-lg shadow-emerald-500/40' 
        : status === 'locked' 
        ? 'bg-slate-600 border-slate-400' 
        : color;
    
    const statusClasses: Record<StageStatus, string> = {
        locked: 'text-slate-300 cursor-not-allowed opacity-70',
        current: 'text-white cursor-pointer hover:opacity-90',
        completed: 'text-white cursor-pointer hover:opacity-90',
    };
    
    const currentRing = isCurrent ? 'ring-4 ring-offset-4 ring-offset-slate-900 ring-white/80' : '';
    const titleColor = status === 'locked' ? 'text-slate-400' : 'text-white';

    return (
        <button
            onClick={onClick}
            disabled={status === 'locked'}
            className="group text-center focus:outline-none relative"
            aria-label={`${chapter.title} - ${status}`}
        >
            {isCurrent && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-4xl animate-bounce" style={{textShadow: '0 4px 8px rgba(0,0,0,0.2)'}}>🧑‍🚀</div>
            )}
            <div
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-300 ${baseColor} ${statusClasses[status]} ${currentRing}`}
            >
                <div className="text-3xl" style={{textShadow: '0 2px 2px rgba(0,0,0,0.3)'}}>{iconMap[status]}</div>
                <div className="font-extrabold text-sm mt-1">{`Lv.${chapter.id}`}</div>
            </div>
            <p className={`mt-2 font-bold text-sm max-w-[100px] break-words ${titleColor}`} style={{textShadow: '0 1px 2px rgba(0,0,0,0.7)'}}>{chapter.title.split(': ')[1]}</p>
        </button>
    );
};

const LessonListModal: React.FC<{
    chapter: Chapter;
    onClose: () => void;
    onSelectLesson: (lesson: Lesson) => void;
}> = ({ chapter, onClose, onSelectLesson }) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex justify-center items-center p-4" onClick={onClose}>
            <div className="w-full max-w-lg animate-modal-card" onClick={(e) => e.stopPropagation()}>
                <Card className="p-0">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold text-gray-800">{chapter.title}</h2>
                        <p className="text-gray-600 mt-1">挑戦するレッスンを選ぼう！</p>
                    </div>
                    <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
                        <ul className="space-y-3">
                            {chapter.lessons.map(lesson => (
                                <li key={lesson.id} className="p-4 rounded-lg hover:bg-yellow-50 flex justify-between items-center transition-colors">
                                    <span className="font-bold text-gray-700">{lesson.title}</span>
                                    <Button size="normal" variant="secondary" onClick={() => onSelectLesson(lesson)}>
                                        学習する
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div className="p-4 bg-gray-50 text-right rounded-b-xl">
                        <Button variant="secondary" onClick={onClose}>とじる</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const stageColors = [
    'bg-sky-500 border-sky-300 shadow-lg shadow-sky-400/50',
    'bg-rose-500 border-rose-300 shadow-lg shadow-rose-400/50',
    'bg-amber-500 border-amber-300 shadow-lg shadow-amber-400/50',
    'bg-violet-500 border-violet-300 shadow-lg shadow-violet-400/50',
    'bg-teal-500 border-teal-300 shadow-lg shadow-teal-400/50',
    'bg-pink-500 border-pink-300 shadow-lg shadow-pink-400/50',
];

const CoursePage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const user = useAuthStore((state) => state.user);

    // Supabaseからレッスンデータを取得
    useEffect(() => {
        const fetchLessons = async () => {
            if (!courseId) return;

            try {
                setLoading(true);
                const data = await getLessonsByCourse(courseId);

                // Supabaseのレッスンデータを内部形式に変換
                const formattedLessons: Lesson[] = data.map(lesson => ({
                    ...lesson,
                    checkpoints: [], // 将来的にはDBから取得
                }));

                setLessons(formattedLessons);
            } catch (error) {
                console.error('Error fetching lessons:', error);
                toast.error('レッスンデータの取得に失敗しました');
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, [courseId]);

    // ダミーデータからSupabaseデータへの移行（フォールバック）
    const course = courseId ? courseData[courseId] : null;

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-12 text-center">
                <h1 className="text-2xl font-bold">読み込み中...</h1>
            </div>
        );
    }

    if (!course || !user) {
        return (
            <div className="container mx-auto px-6 py-12 text-center">
                <h1 className="text-2xl font-bold">コースが見つからないか、ログインしていません。</h1>
                <Button onClick={() => navigate('/dashboard')} className="mt-4">ダッシュボードにもどる</Button>
            </div>
        )
    }
    
    const completedLessons = user.progress[course.id]?.completedLessons || [];

    const isChapterCompleted = (chapter: Chapter) => {
        return chapter.lessons.every(lesson => completedLessons.includes(lesson.id));
    };
    
    let currentChapterId = 1;
    for (const chapter of course.chapters) {
        if (isChapterCompleted(chapter)) {
            currentChapterId = chapter.id + 1;
        } else {
            break;
        }
    }
     currentChapterId = Math.min(currentChapterId, course.chapters.length + 1);

    const handleSelectLesson = (lesson: Lesson) => {
        setSelectedChapter(null); // Close modal
        setSelectedLesson(lesson);
        window.scrollTo(0, 0);
    }

    const handleBackToCourseMap = () => {
        setSelectedLesson(null);
    }
    
    const handleNavigateLesson = (lessonId: string) => {
        const lesson = course.chapters.flatMap(c => c.lessons).find(l => l.id === lessonId);
        if (lesson) {
            setSelectedLesson(lesson);
            window.scrollTo(0, 0);
        }
    }

    if (selectedLesson) {
        return (
            <div className="bg-amber-50 min-h-screen">
                <div className="container mx-auto px-6 py-12">
                    <LessonDetailView 
                        course={course} 
                        lesson={selectedLesson} 
                        onBack={handleBackToCourseMap} 
                        onNavigateLesson={handleNavigateLesson}
                    />
                </div>
            </div>
        )
    }
    
    const allChaptersCompleted = course.chapters.every(isChapterCompleted);

  return (
    <div className="bg-slate-900 h-full overflow-hidden flex flex-col" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    }}>
        <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col flex-grow">
            <header className="mb-4 text-center relative z-20 flex-shrink-0">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>
                    {course.title}
                </h1>
                <p className="mt-2 text-sm sm:text-base text-white/90 max-w-md md:max-w-2xl mx-auto" style={{textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>
                    {course.description}
                </p>
            </header>
            
            <div className="relative w-full flex-grow">
                
                {(() => {
                    const delta = course.chapters.length - currentChapterId + 1;
                    const isVisible = currentChapterId <= course.chapters.length + 1;

                    let yPos = 10 + Math.pow(Math.max(0, delta), 1.5) * 10;
                    let scale = 1 / (1 + Math.max(0, delta) * 0.5);
                    let zIndex = course.chapters.length - delta;

                    if(allChaptersCompleted) {
                        yPos = 20;
                        scale = 1.5;
                        zIndex = 101;
                    }
                    
                    return (
                        <div
                            className="absolute left-1/2"
                            style={{
                                bottom: `${yPos}%`,
                                transform: `translateX(-50%) scale(${scale})`,
                                zIndex: zIndex,
                                opacity: isVisible ? 1 : 0,
                                transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            <GoalNode isCompleted={allChaptersCompleted} />
                        </div>
                    );
                })()}

                {course.chapters.map((chapter) => {
                    const isCompleted = isChapterCompleted(chapter);
                    const isCurrent = chapter.id === currentChapterId && !allChaptersCompleted;
                    const isLocked = chapter.id > currentChapterId;
                    const status: StageStatus = isCompleted ? 'completed' : isCurrent ? 'current' : 'locked';

                    const delta = chapter.id - currentChapterId;
                    const side = (chapter.id % 2 === 1) ? -1 : 1;
                    
                    let yPos = 0, scale = 1, opacity = 1, zIndex = 50 - delta, filter = 'none', xPos = 0;
                    
                    if (allChaptersCompleted) {
                        yPos = -50;
                        opacity = 0;
                    } else if (delta < 0) { // クリア済みのチャプター (背後)
                        const behindDelta = Math.abs(delta);
                        yPos = 10 - behindDelta * 8;
                        scale = 1.6 / (1 + behindDelta * 0.7);
                        opacity = 0.4;
                        zIndex = 99 - behindDelta;
                        filter = 'grayscale(1) blur(1px)';
                        xPos = side * 20 * scale;
                    } else if (delta === 0) { // 現在のチャプター
                        yPos = 10; 
                        scale = 1.6;
                        zIndex = 100;
                        xPos = side * 25;
                    } else { // これからのチャプター (前方)
                        yPos = 10 + Math.pow(delta, 1.5) * 12;
                        scale = 1 / (1 + delta * 0.6);
                        xPos = side * 30 * (1 / (1 + delta * 0.2));
                    }

                    return (
                        <div
                            key={chapter.id}
                            className="absolute left-1/2"
                            style={{
                                bottom: `${yPos}%`,
                                transform: `translateX(calc(-50% + ${xPos}%)) scale(${scale})`,
                                zIndex: zIndex,
                                opacity: opacity,
                                transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                filter: filter,
                            }}
                        >
                            <StageNode
                                chapter={chapter}
                                status={status}
                                isCurrent={isCurrent}
                                onClick={() => setSelectedChapter(chapter)}
                                color={stageColors[(chapter.id - 1) % stageColors.length]}
                            />
                        </div>
                    );
                })}
            </div>

             <div className="text-center py-4 relative z-20 flex-shrink-0">
                <Button onClick={() => navigate('/dashboard')} variant="secondary">
                    ダッシュボードへもどる
                </Button>
            </div>
        </div>
        {selectedChapter && (
            <LessonListModal 
                chapter={selectedChapter}
                onClose={() => setSelectedChapter(null)}
                onSelectLesson={handleSelectLesson}
            />
        )}
    </div>
  );
};

export default CoursePage;