import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getCourseById, getLevelsByCourse, getUserLevelProgress, getLessonsByLevel, getUserProgress } from '../services/supabaseService';
import { useAuthStore } from '../store/authStore';
import { Course, Level, UserLevelProgress, Lesson } from '../types/index';

interface LevelWithProgress extends Level {
  isUnlocked: boolean;
  isCompleted: boolean;
  completedLessonsCount: number;
  totalLessonsCount: number;
}

const CoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [levels, setLevels] = useState<LevelWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId && user) {
      loadData();
    }
  }, [courseId, user]);

  const loadData = async () => {
    if (!courseId || !user) return;

    try {
      setLoading(true);

      const [courseData, levelsData, levelProgressData] = await Promise.all([
        getCourseById(courseId),
        getLevelsByCourse(courseId),
        getUserLevelProgress(user.uid),
      ]);

      setCourse(courseData);

      const levelsWithProgress: LevelWithProgress[] = await Promise.all(
        levelsData.map(async (level, index) => {
          const levelProgress = levelProgressData.find(
            (p: UserLevelProgress) => p.level_id === level.id
          );

          const lessons = await getLessonsByLevel(level.id);

          const userProgressData = await getUserProgress(user.uid);
          const completedLessons = lessons.filter(lesson =>
            userProgressData.some(p => p.lesson_id === lesson.id && p.completed)
          );

          const isUnlocked = index === 0 ||
            (levelProgressData.some((p: UserLevelProgress) =>
              p.level_id === levelsData[index - 1]?.id && p.is_completed
            ));

          return {
            ...level,
            isUnlocked,
            isCompleted: levelProgress?.is_completed || false,
            completedLessonsCount: completedLessons.length,
            totalLessonsCount: lessons.length,
          };
        })
      );

      setLevels(levelsWithProgress);
    } catch (error) {
      console.error('Error loading course levels:', error);
      toast.error('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLevelClick = (level: LevelWithProgress) => {
    if (!level.isUnlocked) {
      toast.error('前のレベルをクリアしてください');
      return;
    }

    if (level.totalLessonsCount === 0) {
      toast.error('このレベルにはまだレッスンがありません');
      return;
    }

    // レッスン一覧画面に遷移
    navigate(`/course/${courseId}/level/${level.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">コースが見つかりません</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-8 px-4 landscape:py-2 landscape:px-3">
      <div className="max-w-4xl mx-auto landscape:max-w-full">
        {/* ヘッダー */}
        <div className="mb-8 landscape:mb-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ダッシュボードに戻る
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8 landscape:p-4 mb-8 landscape:mb-3">
            <div className="flex items-center space-x-4 landscape:space-x-2 mb-4 landscape:mb-2">
              <span className="text-6xl landscape:text-3xl">{course.icon || '📚'}</span>
              <div>
                <h1 className="text-4xl landscape:text-xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600 mt-2 landscape:mt-1 landscape:text-sm">{course.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* レベル一覧 */}
        <div className="space-y-6 landscape:space-y-2 landscape:grid landscape:grid-cols-2 landscape:gap-3">
          {levels.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleLevelClick(level)}
              className={`
                relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all
                ${level.isUnlocked
                  ? 'cursor-pointer hover:shadow-2xl hover:scale-105 transform'
                  : 'opacity-60 cursor-not-allowed'
                }
              `}
            >
              {/* ロックオーバーレイ */}
              {!level.isUnlocked && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-10">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-white mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <p className="text-white font-bold text-lg">ロック中</p>
                  </div>
                </div>
              )}

              <div className="p-8 landscape:p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 landscape:space-x-2 flex-1">
                    {/* レベル番号バッジ */}
                    <div className={`
                      flex items-center justify-center w-16 h-16 landscape:w-10 landscape:h-10 rounded-full font-bold text-2xl landscape:text-lg shadow-lg
                      ${level.isCompleted
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                        : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                      }
                    `}>
                      {level.isCompleted ? '✓' : level.level_number}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl landscape:text-lg font-bold text-gray-900 mb-2 landscape:mb-1">{level.title}</h3>
                      {level.description && (
                        <p className="text-gray-600 mb-3 landscape:mb-1 landscape:text-sm landscape:line-clamp-1">{level.description}</p>
                      )}

                      {/* 進捗バー */}
                      {level.totalLessonsCount > 0 && (
                        <div className="mb-3 landscape:mb-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm landscape:text-xs text-gray-600">
                              進捗: {level.completedLessonsCount} / {level.totalLessonsCount} レッスン
                            </span>
                            <span className="text-sm landscape:text-xs font-semibold text-amber-600">
                              {Math.round((level.completedLessonsCount / level.totalLessonsCount) * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-3 landscape:h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(level.completedLessonsCount / level.totalLessonsCount) * 100}%` }}
                              transition={{ duration: 0.8, delay: index * 0.1 }}
                              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                            />
                          </div>
                        </div>
                      )}

                      {/* ステータスとボーナスXP */}
                      <div className="flex items-center space-x-4">
                        {level.isCompleted && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            ✓ クリア済み
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          ⭐ ボーナスXP: {level.bonus_xp}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 矢印アイコン */}
                  {level.isUnlocked && (
                    <div className="ml-4">
                      <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        {levels.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-600 mb-4">まだレベルがありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePage;
