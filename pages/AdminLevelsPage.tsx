import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getCourseById, getLevelsByCourseId, deleteLevel } from '../services/adminService';
import { Course, Level } from '../types/index';
import Button from '../components/common/Button';

const AdminLevelsPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchData(courseId);
    }
  }, [courseId]);

  const fetchData = async (id: string) => {
    try {
      setLoading(true);
      const [courseData, levelsData] = await Promise.all([
        getCourseById(id),
        getLevelsByCourseId(id)
      ]);
      setCourse(courseData);
      setLevels(levelsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLevel(id);
      toast.success('レベルを削除しました');
      if (courseId) {
        fetchData(courseId);
      }
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting level:', error);
      toast.error('レベルの削除に失敗しました');
    }
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
          onClick={() => navigate('/admin/courses')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          コース一覧に戻る
        </button>
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-4xl">{course.icon || '📚'}</span>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            </div>
            <p className="text-gray-600">レベルの作成・編集・削除ができます</p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate(`/admin/courses/${courseId}/levels/new`)}
            className="flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>新規レベル作成</span>
          </Button>
        </div>
      </div>

      {/* レベル一覧 */}
      {levels.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">レベルがありません</h3>
          <p className="mt-1 text-sm text-gray-500">最初のレベルを作成しましょう</p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={() => navigate(`/admin/courses/${courseId}/levels/new`)}
            >
              新規レベル作成
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {levels.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-lg shadow-md">
                        {level.level_number}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{level.title}</h3>
                      </div>
                    </div>
                    {level.description && (
                      <p className="mt-3 text-gray-600">{level.description}</p>
                    )}
                    <div className="mt-4 flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        ⭐ ボーナスXP: {level.bonus_xp}
                      </span>
                      <span className={`text-sm font-medium ${level.is_published ? 'text-green-600' : 'text-gray-400'}`}>
                        {level.is_published ? '✓ 公開中' : '⏸ 非公開'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/admin/courses/${courseId}/levels/${level.id}/lessons`)}
                      className="text-sm"
                    >
                      レッスン管理
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/admin/courses/${courseId}/levels/${level.id}/edit`)}
                      className="text-sm"
                    >
                      編集
                    </Button>
                    {deleteConfirm === level.id ? (
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleDelete(level.id)}
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
                        onClick={() => setDeleteConfirm(level.id)}
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

export default AdminLevelsPage;
