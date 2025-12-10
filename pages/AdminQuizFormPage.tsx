import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getQuizById, createQuiz, updateQuiz, getLessonById } from '../services/adminService';
import { Lesson } from '../types/index';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const quizSchema = z.object({
  question: z.string().min(1, '問題文は必須です'),
  question_type: z.enum(['multiple_choice', 'code', 'drag_drop']),
  options: z.string().optional(),
  correct_answer: z.string().min(1, '正解は必須です'),
  explanation: z.string().optional(),
  points: z.number().min(1, '配点は1以上である必要があります'),
  order_index: z.number().min(0),
});

type QuizFormData = z.infer<typeof quizSchema>;

const AdminQuizFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId, lessonId, quizId } = useParams<{ courseId: string; lessonId: string; quizId: string }>();
  const isEditMode = quizId !== 'new';

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [lesson, setLesson] = useState<Lesson | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      question: '',
      question_type: 'multiple_choice',
      options: '',
      correct_answer: '',
      explanation: '',
      points: 10,
      order_index: 0,
    }
  });

  const questionType = watch('question_type');

  useEffect(() => {
    const init = async () => {
      if (!lessonId) return;

      try {
        setInitialLoading(true);
        const lessonData = await getLessonById(lessonId);
        setLesson(lessonData);

        if (isEditMode && quizId) {
          const quiz = await getQuizById(quizId);
          if (quiz) {
            reset({
              question: quiz.question,
              question_type: quiz.question_type,
              options: quiz.options ? JSON.stringify(quiz.options) : '',
              correct_answer: quiz.correct_answer,
              explanation: quiz.explanation || '',
              points: quiz.points || 10,
              order_index: quiz.order_index,
            });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('データの読み込みに失敗しました');
        navigate(`/admin/courses/${courseId}/lessons/${lessonId}/quizzes`);
      } finally {
        setInitialLoading(false);
      }
    };

    init();
  }, [courseId, lessonId, isEditMode, quizId]);

  const onSubmit = async (data: QuizFormData) => {
    if (!lessonId) return;

    try {
      setLoading(true);

      // optionsをJSONBに変換
      let optionsData = null;
      if (data.options) {
        try {
          optionsData = JSON.parse(data.options);
        } catch (e) {
          toast.error('選択肢のJSON形式が正しくありません');
          return;
        }
      }

      const quizData = {
        lesson_id: lessonId,
        question: data.question,
        question_type: data.question_type,
        options: optionsData,
        correct_answer: data.correct_answer,
        explanation: data.explanation || null,
        points: data.points,
        order_index: data.order_index,
      };

      if (isEditMode && quizId) {
        await updateQuiz(quizId, quizData);
        toast.success('クイズを更新しました');
      } else {
        await createQuiz(quizData);
        toast.success('クイズを作成しました');
      }

      navigate(`/admin/courses/${courseId}/lessons/${lessonId}/quizzes`);
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error(isEditMode ? 'クイズの更新に失敗しました' : 'クイズの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}/quizzes`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          クイズ一覧に戻る
        </button>
        {lesson && (
          <div className="mb-4">
            <p className="text-gray-600">レッスン: {lesson.title}</p>
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'クイズ編集' : '新規クイズ作成'}
        </h1>
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-8 space-y-6">
        {/* 問題文 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            問題文 *
          </label>
          <textarea
            {...register('question')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="問題文を入力してください"
          />
          {errors.question && (
            <p className="mt-1 text-sm text-red-600">{errors.question.message}</p>
          )}
        </div>

        {/* 問題形式 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            問題形式 *
          </label>
          <select
            {...register('question_type')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="multiple_choice">選択式</option>
            <option value="code">コード入力</option>
            <option value="drag_drop">ドラッグ&ドロップ</option>
          </select>
        </div>

        {/* 選択肢（選択式の場合のみ） */}
        {questionType === 'multiple_choice' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              選択肢（JSON形式）
            </label>
            <textarea
              {...register('options')}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm"
              placeholder={'["選択肢1", "選択肢2", "選択肢3", "選択肢4"]'}
            />
            <p className="mt-1 text-sm text-gray-500">
              JSON配列形式で選択肢を入力してください（例: ["A", "B", "C", "D"]）
            </p>
            {errors.options && (
              <p className="mt-1 text-sm text-red-600">{errors.options.message}</p>
            )}
          </div>
        )}

        {/* 正解 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            正解 *
          </label>
          <Input
            {...register('correct_answer')}
            placeholder={questionType === 'multiple_choice' ? '選択肢1' : '正解を入力'}
            error={errors.correct_answer?.message}
          />
          <p className="mt-1 text-sm text-gray-500">
            {questionType === 'multiple_choice' && '選択肢の中から正解となるものを入力してください'}
          </p>
        </div>

        {/* 解説 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            解説
          </label>
          <textarea
            {...register('explanation')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="解説を入力してください（任意）"
          />
        </div>

        {/* 配点 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            配点 *
          </label>
          <Input
            type="number"
            {...register('points', { valueAsNumber: true })}
            min={1}
            error={errors.points?.message}
          />
        </div>

        {/* 表示順序 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            表示順序
          </label>
          <Input
            type="number"
            {...register('order_index', { valueAsNumber: true })}
            min={0}
          />
          <p className="mt-1 text-sm text-gray-500">
            数字が小さいほど先に表示されます
          </p>
        </div>

        {/* ボタン */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}/quizzes`)}
            disabled={loading}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? '保存中...' : isEditMode ? '更新する' : '作成する'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminQuizFormPage;
