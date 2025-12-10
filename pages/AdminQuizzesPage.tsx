import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuizzesByLessonId, getLessonById, deleteQuiz } from '../services/adminService';
import { Quiz, Lesson } from '../types/index';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import toast from 'react-hot-toast';

const AdminQuizzesPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId) {
      fetchData();
    }
  }, [lessonId]);

  const fetchData = async () => {
    if (!lessonId) return;

    try {
      setLoading(true);
      const [quizzesData, lessonData] = await Promise.all([
        getQuizzesByLessonId(lessonId),
        getLessonById(lessonId),
      ]);
      setQuizzes(quizzesData);
      setLesson(lessonData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('このクイズを削除しますか？')) {
      return;
    }

    try {
      await deleteQuiz(id);
      toast.success('クイズを削除しました');
      fetchData();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('クイズの削除に失敗しました');
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
    <div className="max-w-6xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/admin/courses/${courseId}/lessons`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          レッスン一覧に戻る
        </button>
        {lesson && (
          <div className="mb-4">
            <p className="text-gray-600">レッスン: {lesson.title}</p>
          </div>
        )}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">クイズ管理</h1>
          <Button
            variant="primary"
            onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}/quizzes/new/edit`)}
          >
            新規クイズ作成
          </Button>
        </div>
      </div>

      {/* クイズ一覧 */}
      {quizzes.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">クイズがまだありません</p>
          <Button
            variant="primary"
            onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}/quizzes/new/edit`)}
          >
            最初のクイズを作成
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz, index) => (
            <Card key={quiz.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{quiz.question}</h3>
                  </div>
                  <div className="ml-11 space-y-2">
                    <p className="text-gray-600">
                      <span className="font-semibold">問題形式:</span>{' '}
                      {quiz.question_type === 'multiple_choice' && '選択式'}
                      {quiz.question_type === 'code' && 'コード入力'}
                      {quiz.question_type === 'drag_drop' && 'ドラッグ&ドロップ'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">配点:</span> {quiz.points}点
                    </p>
                    {quiz.explanation && (
                      <p className="text-gray-600">
                        <span className="font-semibold">解説:</span> {quiz.explanation}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}/quizzes/${quiz.id}/edit`)}
                  >
                    編集
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleDelete(quiz.id)}
                  >
                    削除
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQuizzesPage;
