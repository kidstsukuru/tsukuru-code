import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getCourseById, getLevelById, getLessonsByCourseId, getLessonsByLevelId, deleteLesson } from '../services/adminService';
import { Course, Level, Lesson } from '../types/index';
import Button from '../components/common/Button';

const AdminLessonsPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId, levelId } = useParams<{ courseId: string; levelId?: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchData(courseId, levelId);
    }
  }, [courseId, levelId]);

  const fetchData = async (id: string, lvlId?: string) => {
    try {
      setLoading(true);

      if (lvlId) {
        // レベル別のレッスン管理
        const [courseData, levelData, lessonsData] = await Promise.all([
          getCourseById(id),
          getLevelById(lvlId),
          getLessonsByLevelId(lvlId)
        ]);
        setCourse(courseData);
        setLevel(levelData);
        setLessons(lessonsData);
      } else {
        // コース全体のレッスン管理
        const [courseData, lessonsData] = await Promise.all([
          getCourseById(id),
          getLessonsByCourseId(id)
        ]);
        setCourse(courseData);
        setLevel(null);
        setLessons(lessonsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLesson(id);
      toast.success('レッスンを削除しました');
      if (courseId) {
        fetchData(courseId, levelId);
      }
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('レッスンの削除に失敗しました');
    }
  };

  const getBackPath = () => {
    return levelId ? `/admin/courses/${courseId}/levels` : '/admin/courses';
  };

  const getNewLessonPath = () => {
    return levelId ? `/admin/courses/${courseId}/levels/${levelId}/lessons/new` : `/admin/courses/${courseId}/lessons/new`;
  };

  const getEditLessonPath = (lessonId: string) => {
    return levelId ? `/admin/courses/${courseId}/levels/${levelId}/lessons/${lessonId}/edit` : `/admin/courses/${courseId}/lessons/${lessonId}/edit`;
  };

  const getQuizPath = (lessonId: string) => {
    return `/admin/courses/${courseId}/lessons/${lessonId}/quizzes`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">コースが見つかりません</p>
        <Button
          variant="secondary"
          onClick={() => navigate('/admin/courses')}
          className="mt-4"
        >
          コース一覧に戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-8">
        <button
          onClick={() => navigate(getBackPath())}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {levelId ? 'レベル一覧に戻る' : 'コース一覧に戻る'}
        </button>
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-4xl">{course.icon || '📚'}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {level ? level.title : course.title}
                </h1>
                {level && (
                  <p className="text-sm text-gray-500">{course.title}</p>
                )}
              </div>
            </div>
            <p className="text-gray-600">レッスンの作成・編集・削除ができます</p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate(getNewLessonPath())}
            className="flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>新規レッスン作成</span>
          </Button>
        </div>
      </div>

      {/* レッスン一覧 */}
      {lessons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">レッスンがありません</h3>
          <p className="mt-1 text-sm text-gray-500">最初のレッスンを作成しましょう</p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={() => navigate(getNewLessonPath())}
            >
              新規レッスン作成
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{lesson.title}</h3>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-600">{lesson.description}</p>
                    <div className="mt-4 flex items-center space-x-4">
                      {lesson.xp_reward && (
                        <span className="text-sm text-gray-500">
                          ⭐ {lesson.xp_reward} XP
                        </span>
                      )}
                      {lesson.duration_minutes && (
                        <span className="text-sm text-gray-500">
                          ⏱️ {lesson.duration_minutes}分
                        </span>
                      )}
                      <span className={`text-sm font-medium ${lesson.is_published ? 'text-green-600' : 'text-gray-400'}`}>
                        {lesson.is_published ? '✓ 公開中' : '⏸ 非公開'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(getEditLessonPath(lesson.id))}
                      className="text-sm"
                    >
                      編集
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => navigate(getQuizPath(lesson.id))}
                      className="text-sm"
                    >
                      クイズ管理
                    </Button>
                    {deleteConfirm === lesson.id ? (
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleDelete(lesson.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          本当に削除
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(lesson.id)}
                        className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLessonsPage;
