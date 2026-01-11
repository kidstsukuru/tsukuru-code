import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAllCourses, getCourseById, getLevelsByCourseId, getLessonsByLevelId, deleteCourse, deleteLevel, deleteLesson } from '../services/adminService';
import { Course, Level, Lesson } from '../types/index';
import Button from '../components/common/Button';

// 展開状態を管理するための型
interface ExpandedState {
    courses: Record<string, boolean>;
    levels: Record<string, boolean>;
}

const AdminCourseManagerPage: React.FC = () => {
    const navigate = useNavigate();
    const { courseId: selectedCourseId } = useParams<{ courseId?: string }>();

    const [courses, setCourses] = useState<Course[]>([]);
    const [levelsMap, setLevelsMap] = useState<Record<string, Level[]>>({});
    const [lessonsMap, setLessonsMap] = useState<Record<string, Lesson[]>>({});
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<ExpandedState>({ courses: {}, levels: {} });
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'course' | 'level' | 'lesson'; id: string } | null>(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourseId) {
            setExpanded(prev => ({ ...prev, courses: { ...prev.courses, [selectedCourseId]: true } }));
            loadLevelsForCourse(selectedCourseId);
        }
    }, [selectedCourseId]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await getAllCourses();
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('コース一覧の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const loadLevelsForCourse = async (courseId: string) => {
        if (levelsMap[courseId]) return; // Already loaded
        try {
            const levels = await getLevelsByCourseId(courseId);
            setLevelsMap(prev => ({ ...prev, [courseId]: levels }));
        } catch (error) {
            console.error('Error fetching levels:', error);
            toast.error('レベルの取得に失敗しました');
        }
    };

    const loadLessonsForLevel = async (levelId: string) => {
        if (lessonsMap[levelId]) return; // Already loaded
        try {
            const lessons = await getLessonsByLevelId(levelId);
            setLessonsMap(prev => ({ ...prev, [levelId]: lessons }));
        } catch (error) {
            console.error('Error fetching lessons:', error);
            toast.error('レッスンの取得に失敗しました');
        }
    };

    const toggleCourse = async (courseId: string) => {
        const isExpanding = !expanded.courses[courseId];
        setExpanded(prev => ({
            ...prev,
            courses: { ...prev.courses, [courseId]: isExpanding }
        }));
        if (isExpanding) {
            await loadLevelsForCourse(courseId);
        }
    };

    const toggleLevel = async (levelId: string) => {
        const isExpanding = !expanded.levels[levelId];
        setExpanded(prev => ({
            ...prev,
            levels: { ...prev.levels, [levelId]: isExpanding }
        }));
        if (isExpanding) {
            await loadLessonsForLevel(levelId);
        }
    };

    const handleDeleteCourse = async (id: string) => {
        try {
            await deleteCourse(id);
            toast.success('コースを削除しました');
            fetchCourses();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting course:', error);
            toast.error('コースの削除に失敗しました');
        }
    };

    const handleDeleteLevel = async (id: string, courseId: string) => {
        try {
            await deleteLevel(id);
            toast.success('レベルを削除しました');
            setLevelsMap(prev => ({ ...prev, [courseId]: prev[courseId]?.filter(l => l.id !== id) || [] }));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting level:', error);
            toast.error('レベルの削除に失敗しました');
        }
    };

    const handleDeleteLesson = async (id: string, levelId: string) => {
        try {
            await deleteLesson(id);
            toast.success('レッスンを削除しました');
            setLessonsMap(prev => ({ ...prev, [levelId]: prev[levelId]?.filter(l => l.id !== id) || [] }));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting lesson:', error);
            toast.error('レッスンの削除に失敗しました');
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return '初級';
            case 'intermediate': return '中級';
            case 'advanced': return '上級';
            default: return difficulty;
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-100 text-green-800';
            case 'intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-xl text-gray-600">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">📚 コンテンツ管理</h1>
                    <p className="mt-2 text-gray-600">コース・レベル・レッスンを一括で管理できます</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => navigate('/admin/courses/new')}
                    className="flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>新規コース</span>
                </Button>
            </div>

            {/* コース一覧（ツリー表示） */}
            {courses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">コースがありません</h3>
                    <p className="mt-1 text-sm text-gray-500">最初のコースを作成しましょう</p>
                    <div className="mt-6">
                        <Button variant="primary" onClick={() => navigate('/admin/courses/new')}>
                            新規コース作成
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {courses.map((course, courseIndex) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: courseIndex * 0.05 }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-transparent hover:border-amber-200 transition-colors"
                        >
                            {/* コースヘッダー */}
                            <div
                                className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 cursor-pointer"
                                onClick={() => toggleCourse(course.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <motion.div
                                            animate={{ rotate: expanded.courses[course.id] ? 90 : 0 }}
                                            className="text-amber-600"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </motion.div>
                                        <span className="text-3xl">{course.icon || '📚'}</span>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                                            <div className="flex items-center space-x-3 mt-1">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                                                    {getDifficultyLabel(course.difficulty)}
                                                </span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${course.required_plan === 'free' ? 'bg-gray-100 text-gray-600' :
                                                        course.required_plan === 'premium' ? 'bg-purple-100 text-purple-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {course.required_plan === 'free' ? '🆓 無料' :
                                                        course.required_plan === 'premium' ? '⭐ プレミアム' :
                                                            '👨‍👩‍👧‍👦 ファミリー'}
                                                </span>
                                                <span className={`text-xs font-medium ${course.is_published ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {course.is_published ? '✓ 公開中' : '⏸ 非公開'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {levelsMap[course.id]?.length || 0} レベル
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                                            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                                            title="編集"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => navigate(`/admin/courses/${course.id}/levels/new`)}
                                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                            title="レベル追加"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                        {deleteConfirm?.type === 'course' && deleteConfirm.id === course.id ? (
                                            <div className="flex items-center space-x-1">
                                                <button
                                                    onClick={() => handleDeleteCourse(course.id)}
                                                    className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                                >
                                                    削除
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(null)}
                                                    className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeleteConfirm({ type: 'course', id: course.id })}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="削除"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* レベル一覧 */}
                            <AnimatePresence>
                                {expanded.courses[course.id] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="border-t border-gray-100"
                                    >
                                        {(levelsMap[course.id] || []).length === 0 ? (
                                            <div className="p-4 pl-12 text-gray-500 text-sm flex items-center justify-between">
                                                <span>レベルがありません</span>
                                                <button
                                                    onClick={() => navigate(`/admin/courses/${course.id}/levels/new`)}
                                                    className="text-amber-600 hover:text-amber-700 font-medium"
                                                >
                                                    + 最初のレベルを作成
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-50">
                                                {(levelsMap[course.id] || []).map((level, levelIndex) => (
                                                    <div key={level.id}>
                                                        {/* レベルヘッダー */}
                                                        <div
                                                            className="p-3 pl-12 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                                                            onClick={() => toggleLevel(level.id)}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-3">
                                                                    <motion.div
                                                                        animate={{ rotate: expanded.levels[level.id] ? 90 : 0 }}
                                                                        className="text-gray-400"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                        </svg>
                                                                    </motion.div>
                                                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-sm shadow">
                                                                        {level.level_number}
                                                                    </span>
                                                                    <div>
                                                                        <h4 className="font-bold text-gray-800">{level.title}</h4>
                                                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                                            <span>⭐ {level.bonus_xp} XP</span>
                                                                            <span className={level.is_published ? 'text-green-600' : 'text-gray-400'}>
                                                                                {level.is_published ? '✓ 公開' : '非公開'}
                                                                            </span>
                                                                            <span>{lessonsMap[level.id]?.length || 0} レッスン</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                                                                    <button
                                                                        onClick={() => navigate(`/admin/courses/${course.id}/levels/${level.id}/edit`)}
                                                                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                                                        title="編集"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => navigate(`/admin/courses/${course.id}/levels/${level.id}/lessons/new`)}
                                                                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                                                        title="レッスン追加"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                        </svg>
                                                                    </button>
                                                                    {deleteConfirm?.type === 'level' && deleteConfirm.id === level.id ? (
                                                                        <div className="flex items-center space-x-1">
                                                                            <button
                                                                                onClick={() => handleDeleteLevel(level.id, course.id)}
                                                                                className="px-2 py-0.5 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                                                            >
                                                                                削除
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setDeleteConfirm(null)}
                                                                                className="px-1 py-0.5 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => setDeleteConfirm({ type: 'level', id: level.id })}
                                                                            className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                            title="削除"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* レッスン一覧 */}
                                                        <AnimatePresence>
                                                            {expanded.levels[level.id] && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.15 }}
                                                                    className="bg-white"
                                                                >
                                                                    {(lessonsMap[level.id] || []).length === 0 ? (
                                                                        <div className="p-3 pl-20 text-gray-400 text-sm flex items-center justify-between">
                                                                            <span>レッスンがありません</span>
                                                                            <button
                                                                                onClick={() => navigate(`/admin/courses/${course.id}/levels/${level.id}/lessons/new`)}
                                                                                className="text-amber-600 hover:text-amber-700 font-medium text-xs"
                                                                            >
                                                                                + レッスンを追加
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="divide-y divide-gray-50">
                                                                            {(lessonsMap[level.id] || []).map((lesson, lessonIndex) => (
                                                                                <div
                                                                                    key={lesson.id}
                                                                                    className="p-2 pl-20 hover:bg-amber-50 flex items-center justify-between group"
                                                                                >
                                                                                    <div className="flex items-center space-x-3">
                                                                                        <span className="flex items-center justify-center w-6 h-6 rounded bg-amber-100 text-amber-700 font-bold text-xs">
                                                                                            {lessonIndex + 1}
                                                                                        </span>
                                                                                        <div>
                                                                                            <p className="font-medium text-gray-700 text-sm">{lesson.title}</p>
                                                                                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                                                                {lesson.xp_reward && <span>⭐ {lesson.xp_reward} XP</span>}
                                                                                                {lesson.duration_minutes && <span>⏱️ {lesson.duration_minutes}分</span>}
                                                                                                <span className={lesson.is_published ? 'text-green-600' : ''}>
                                                                                                    {lesson.is_published ? '✓' : '非公開'}
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                        <button
                                                                                            onClick={() => navigate(`/admin/courses/${course.id}/levels/${level.id}/lessons/${lesson.id}/edit`)}
                                                                                            className="p-1 text-gray-400 hover:text-amber-600 rounded"
                                                                                            title="編集"
                                                                                        >
                                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                            </svg>
                                                                                        </button>
                                                                                        {deleteConfirm?.type === 'lesson' && deleteConfirm.id === lesson.id ? (
                                                                                            <div className="flex items-center space-x-1">
                                                                                                <button
                                                                                                    onClick={() => handleDeleteLesson(lesson.id, level.id)}
                                                                                                    className="px-1.5 py-0.5 bg-red-600 text-white text-xs rounded"
                                                                                                >
                                                                                                    削除
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => setDeleteConfirm(null)}
                                                                                                    className="px-1 py-0.5 bg-gray-300 text-gray-700 text-xs rounded"
                                                                                                >
                                                                                                    ✕
                                                                                                </button>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <button
                                                                                                onClick={() => setDeleteConfirm({ type: 'lesson', id: lesson.id })}
                                                                                                className="p-1 text-gray-300 hover:text-red-600 rounded"
                                                                                                title="削除"
                                                                                            >
                                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                                </svg>
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCourseManagerPage;
