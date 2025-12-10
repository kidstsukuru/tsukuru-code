import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAllCourses, deleteCourse } from '../services/adminService';
import { Course } from '../types/index';
import Button from '../components/common/Button';

const AdminCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

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

  const handleDelete = async (id: string) => {
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
          <h1 className="text-3xl font-bold text-gray-900">コース管理</h1>
          <p className="mt-2 text-gray-600">コースの作成・編集・削除ができます</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/admin/courses/new')}
          className="flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>新規コース作成</span>
        </Button>
      </div>

      {/* コース一覧 */}
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
        <div className="grid gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{course.icon || '📚'}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                        {course.title_en && (
                          <p className="text-sm text-gray-500">{course.title_en}</p>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-gray-600">{course.description}</p>
                    <div className="mt-4 flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(course.difficulty)}`}>
                        {getDifficultyLabel(course.difficulty)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ⏱️ {course.estimated_hours}時間
                      </span>
                      <span className={`text-sm font-medium ${course.is_published ? 'text-green-600' : 'text-gray-400'}`}>
                        {course.is_published ? '✓ 公開中' : '⏸ 非公開'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                      className="text-sm"
                    >
                      編集
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/admin/courses/${course.id}/levels`)}
                      className="text-sm"
                    >
                      レベル管理
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/admin/courses/${course.id}/lessons`)}
                      className="text-sm"
                    >
                      レッスン管理
                    </Button>
                    {deleteConfirm === course.id ? (
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleDelete(course.id)}
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
                        onClick={() => setDeleteConfirm(course.id)}
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

export default AdminCoursesPage;
