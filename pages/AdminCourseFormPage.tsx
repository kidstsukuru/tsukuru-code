import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getCourseById, createCourse, updateCourse } from '../services/adminService';
import { Course } from '../types/index';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const courseSchema = z.object({
  id: z.string().min(1, 'コースIDは必須です').regex(/^[a-z0-9-]+$/, 'コースIDは小文字、数字、ハイフンのみ使用できます'),
  title: z.string().min(1, 'コース名は必須です'),
  description: z.string().min(1, '説明は必須です'),
  icon: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimated_hours: z.number().min(1, '推定時間は1以上である必要があります'),
  is_published: z.boolean(),
  order_index: z.number().min(0),
});

type CourseFormData = z.infer<typeof courseSchema>;

const AdminCourseFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const isEditMode = courseId !== 'new';

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      id: '',
      title: '',
      description: '',
      icon: '📚',
      difficulty: 'beginner',
      estimated_hours: 5,
      is_published: false,
      order_index: 0,
    }
  });

  useEffect(() => {
    if (isEditMode && courseId) {
      loadCourse(courseId);
    }
  }, [isEditMode, courseId]);

  const loadCourse = async (id: string) => {
    try {
      setInitialLoading(true);
      const course = await getCourseById(id);
      if (course) {
        reset({
          id: course.id,
          title: course.title,
          description: course.description,
          icon: course.icon || '📚',
          difficulty: course.difficulty,
          estimated_hours: course.estimated_hours,
          is_published: course.is_published,
          order_index: course.order_index,
        });
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('コースの読み込みに失敗しました');
      navigate('/admin/courses');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: CourseFormData) => {
    try {
      setLoading(true);

      if (isEditMode) {
        const { id, ...courseData } = data;
        await updateCourse(id, courseData);
        toast.success('コースを更新しました');
      } else {
        await createCourse({
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        toast.success('コースを作成しました');
      }

      navigate('/admin/courses');
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(isEditMode ? 'コースの更新に失敗しました' : 'コースの作成に失敗しました');
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
          onClick={() => navigate('/admin/courses')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          コース一覧に戻る
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'コース編集' : '新規コース作成'}
        </h1>
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-8 space-y-6">
        {/* コースID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            コースID *
          </label>
          <Input
            {...register('id')}
            disabled={isEditMode}
            placeholder="scratch-intro"
            error={errors.id?.message}
          />
          <p className="mt-1 text-sm text-gray-500">
            小文字、数字、ハイフンのみ使用可能（例: scratch-intro）
          </p>
        </div>

        {/* コース名（日本語） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            コース名（日本語） *
          </label>
          <Input
            {...register('title')}
            placeholder="Scratch入門"
            error={errors.title?.message}
          />
        </div>

        {/* アイコン */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            アイコン（絵文字）
          </label>
          <Input
            {...register('icon')}
            placeholder="📚"
            maxLength={2}
          />
          <p className="mt-1 text-sm text-gray-500">
            絵文字1文字を入力してください
          </p>
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
            placeholder="このコースで学べることを説明してください"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* 難易度 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            難易度 *
          </label>
          <select
            {...register('difficulty')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="beginner">初級</option>
            <option value="intermediate">中級</option>
            <option value="advanced">上級</option>
          </select>
        </div>

        {/* 推定時間 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            推定時間（時間） *
          </label>
          <Input
            type="number"
            {...register('estimated_hours', { valueAsNumber: true })}
            min={1}
            error={errors.estimated_hours?.message}
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
            onClick={() => navigate('/admin/courses')}
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

export default AdminCourseFormPage;
