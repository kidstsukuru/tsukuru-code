import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getLessonById, createLesson, updateLesson, getCourseById } from '../services/adminService';
import { Course } from '../types/index';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const lessonSchema = z.object({
  id: z.string().min(1, 'レッスンIDは必須です').regex(/^[a-z0-9-]+$/, 'レッスンIDは小文字、数字、ハイフンのみ使用できます'),
  title: z.string().min(1, 'レッスン名は必須です'),
  description: z.string().min(1, '説明は必須です'),
  youtube_url: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
  xp_reward: z.number().min(1, 'XPは1以上である必要があります'),
  duration_minutes: z.number().min(1, '所要時間は1以上である必要があります'),
  is_published: z.boolean(),
  order_index: z.number().min(0),
});

type LessonFormData = z.infer<typeof lessonSchema>;

const AdminLessonFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const isEditMode = !!(lessonId && lessonId !== 'new');

  // デバッグ用
  console.log('AdminLessonFormPage:', { courseId, lessonId, isEditMode });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      id: '',
      title: '',
      description: '',
      youtube_url: '',
      xp_reward: 10,
      duration_minutes: 15,
      is_published: false,
      order_index: 0,
    }
  });

  useEffect(() => {
    const init = async () => {
      if (!courseId) return;

      try {
        setInitialLoading(true);
        const courseData = await getCourseById(courseId);
        setCourse(courseData);

        if (isEditMode && lessonId) {
          const lesson = await getLessonById(lessonId);
          if (lesson) {
            reset({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              youtube_url: lesson.youtube_url || '',
              xp_reward: lesson.xp_reward || 10,
              duration_minutes: lesson.duration_minutes || 15,
              is_published: lesson.is_published,
              order_index: lesson.order_index,
            });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('データの読み込みに失敗しました');
        navigate(`/admin/courses/${courseId}/lessons`);
      } finally {
        setInitialLoading(false);
      }
    };

    init();
  }, [courseId, isEditMode, lessonId]);

  const onSubmit = async (data: LessonFormData) => {
    if (!courseId) return;

    try {
      setLoading(true);

      if (isEditMode) {
        const { id, ...lessonData } = data;
        await updateLesson(id, {
          ...lessonData,
          course_id: courseId,
        });
        toast.success('レッスンを更新しました');
      } else {
        await createLesson({
          ...data,
          course_id: courseId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        toast.success('レッスンを作成しました');
      }

      navigate(`/admin/courses/${courseId}/lessons`);
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error(isEditMode ? 'レッスンの更新に失敗しました' : 'レッスンの作成に失敗しました');
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
          onClick={() => navigate(`/admin/courses/${courseId}/lessons`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          レッスン一覧に戻る
        </button>
        {course && (
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-3xl">{course.icon || '📚'}</span>
            <span className="text-gray-600">{course.title}</span>
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'レッスン編集' : '新規レッスン作成'}
        </h1>
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-8 space-y-6">
        {/* レッスンID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            レッスンID *
          </label>
          <Input
            {...register('id')}
            disabled={isEditMode}
            placeholder={`${courseId}-lesson-1`}
            error={errors.id?.message}
          />
          <p className="mt-1 text-sm text-gray-500">
            小文字、数字、ハイフンのみ使用可能（例: {courseId}-lesson-1）
          </p>
        </div>

        {/* レッスン名（日本語） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            レッスン名（日本語） *
          </label>
          <Input
            {...register('title')}
            placeholder="Scratchってなに？"
            error={errors.title?.message}
          />
        </div>

        {/* 説明 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            説明 *
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="このレッスンで学べることを説明してください"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* YouTube URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            YouTube URL
          </label>
          <Input
            {...register('youtube_url')}
            placeholder="https://www.youtube.com/watch?v=xxxxx"
            error={errors.youtube_url?.message}
          />
          <p className="mt-1 text-sm text-gray-500">
            YouTubeの動画URLを入力すると、レッスン画面で動画が表示されます
          </p>
        </div>

        {/* XP報酬 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            XP報酬 *
          </label>
          <Input
            type="number"
            {...register('xp_reward', { valueAsNumber: true })}
            min={1}
            error={errors.xp_reward?.message}
          />
          <p className="mt-1 text-sm text-gray-500">
            レッスン完了時に獲得できる経験値
          </p>
        </div>

        {/* 所要時間 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            所要時間（分） *
          </label>
          <Input
            type="number"
            {...register('duration_minutes', { valueAsNumber: true })}
            min={1}
            error={errors.duration_minutes?.message}
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
            数字が小さいほど上に表示されます
          </p>
        </div>

        {/* 公開状態 */}
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('is_published')}
            id="is_published"
            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
          />
          <label htmlFor="is_published" className="ml-2 block text-sm text-gray-700">
            公開する
          </label>
        </div>

        {/* ボタン */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/admin/courses/${courseId}/lessons`)}
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

export default AdminLessonFormPage;
