import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getCourseById, getLevelById, getLessonsByLevel, getUserProgress } from '../services/supabaseService';
import { useAuthStore } from '../store/authStore';
import { Course, Level, Lesson, UserProgress } from '../types/index';

interface LessonWithProgress extends Lesson {
  isUnlocked: boolean;
  isCompleted: boolean;
  progress?: UserProgress;
}

const LevelLessonsPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId, levelId } = useParams<{ courseId: string; levelId: string }>();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId && levelId && user) {
      loadData();
    }
  }, [courseId, levelId, user]);

  const loadData = async () => {
    if (!courseId || !levelId || !user) return;

    try {
      setLoading(true);

      const [courseData, levelData, lessonsData, userProgressData] = await Promise.all([
        getCourseById(courseId),
        getLevelById(levelId),
        getLessonsByLevel(levelId),
        getUserProgress(user.uid),
      ]);

      setCourse(courseData);
      setLevel(levelData);

      const lessonsWithProgress: LessonWithProgress[] = lessonsData.map((lesson, index) => {
        const progress = userProgressData.find(p => p.lesson_id === lesson.id);

        // 最初のレッスンは常にアンロック、それ以降は前のレッスンが完了していればアンロック
        const isUnlocked = index === 0 ||
          (userProgressData.some(p =>
            p.lesson_id === lessonsData[index - 1]?.id && p.completed
          ));

        return {
          ...lesson,
          isUnlocked,
          isCompleted: progress?.completed || false,
          progress,
        };
      });

      setLessons(lessonsWithProgress);
    } catch (error) {
      console.error('Error loading level lessons:', error);
      toast.error('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lesson: LessonWithProgress) => {
    if (!lesson.isUnlocked) {
      toast.error('前のレッスンを完了してください');
      return;
    }

    navigate(`/course/${courseId}/level/${levelId}/lesson/${lesson.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!course || !level) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">レベルが見つかりません</p>
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            レベル一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const completedCount = lessons.filter(l => l.isCompleted).length;
  const progressPercentage = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            レベル一覧に戻る
          </button>

          {/* レベル情報カード */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-2xl shadow-lg">
                {level.level_number}
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900">{level.title}</h1>
                <p className="text-sm text-gray-500">{course.title}</p>
                {level.description && (
                  <p className="text-gray-600 mt-2">{level.description}</p>
                )}
              </div>
            </div>

            {/* 進捗バー */}
            {lessons.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    進捗: {completedCount} / {lessons.length} レッスン
                  </span>
                  <span className="text-sm font-semibold text-amber-600">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* レッスン一覧 */}
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleLessonClick(lesson)}
              className={`
                relative bg-white rounded-xl shadow-md overflow-hidden transition-all
                ${lesson.isUnlocked
                  ? 'cursor-pointer hover:shadow-xl hover:scale-102 transform'
                  : 'opacity-50 cursor-not-allowed'
                }
              `}
            >
              {/* ロックオーバーレイ */}
              {!lesson.isUnlocked && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-10">
                  <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* レッスン番号 */}
                    <div className={`
                      flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg
                      ${lesson.isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                      }
                    `}>
                      {lesson.isCompleted ? '✓' : index + 1}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{lesson.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{lesson.description}</p>

                      <div className="flex items-center space-x-4 mt-3">
                        {lesson.xp_reward && (
                          <span className="text-sm text-amber-600">⭐ {lesson.xp_reward} XP</span>
                        )}
                        {lesson.duration_minutes && (
                          <span className="text-sm text-gray-500">⏱️ {lesson.duration_minutes}分</span>
                        )}
                        {lesson.isCompleted && (
                          <span className="text-sm font-medium text-green-600">✓ 完了</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 矢印アイコン */}
                  {lesson.isUnlocked && (
                    <div className="ml-4">
                      <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 空の状態 */}
        {lessons.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-600">まだレッスンがありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelLessonsPage;
