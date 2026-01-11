import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getLevelById, createLevel, updateLevel, getCourseById } from '../services/adminService';
import { Course } from '../types/index';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const levelSchema = z.object({
  title: z.string().min(1, 'レベル名は必須です'),
  description: z.string().optional(),
  level_number: z.number().min(1, 'レベル番号は1以上である必要があります'),
  bonus_xp: z.number().min(0, 'ボーナスXPは0以上である必要があります'),
  is_published: z.boolean(),
});

type LevelFormData = z.infer<typeof levelSchema>;

const AdminLevelFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId, levelId } = useParams<{ courseId: string; levelId: string }>();
  const isEditMode = !!(levelId && levelId !== 'new');

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LevelFormData>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      title: '',
      description: '',
      level_number: 1,
      bonus_xp: 50,
      is_published: false,
    }
  });

  useEffect(() => {
    const init = async () => {
      if (!courseId) return;

      try {
        setInitialLoading(true);
        const courseData = await getCourseById(courseId);
        setCourse(courseData);

        if (isEditMode && levelId) {
          const level = await getLevelById(levelId);
          if (level) {
            reset({
              title: level.title,
              description: level.description || '',
              level_number: level.level_number,
              bonus_xp: level.bonus_xp,
              is_published: level.is_published,
            });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('データの読み込みに失敗しました');
        navigate(`/admin/courses/${courseId}/levels`);
      } finally {
        setInitialLoading(false);
      }
    };

    init();
  }, [courseId, isEditMode, levelId]);

  const onSubmit = async (data: LevelFormData) => {
    if (!courseId) return;

    try {
      setLoading(true);

      if (isEditMode && levelId) {
        await updateLevel(levelId, {
          ...data,
          course_id: courseId,
        });
        toast.success('レベルを更新しました');
      } else {
        const newLevelId = crypto.randomUUID();
        await createLevel({
          id: newLevelId,
          ...data,
          course_id: courseId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        toast.success('レベルを作成しました');
      }

      navigate(`/admin/courses/${courseId}/levels`);
    } catch (error) {
      console.error('Error saving level:', error);
      toast.error(isEditMode ? 'レベルの更新に失敗しました' : 'レベルの作成に失敗しました');
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
          onClick={() => navigate(`/admin/courses/${courseId}/levels`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          レベル一覧に戻る
        </button>
        {course && (
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-3xl">{course.icon || '📚'}</span>
            <span className="text-gray-600">{course.title}</span>
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'レベル編集' : '新規レベル作成'}
        </h1>
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-8 space-y-6">
        {/* レベル名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            レベル名 *
          </label>
          <Input
            {...register('title')}
            placeholder="レベル2"
            error={errors.title?.message}
          />
        </div>

        {/* 説明 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            説明
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="このレベルで学べることを説明してください"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* レベル番号 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            レベル番号 *
          </label>
          <Input
            type="number"
            {...register('level_number', { valueAsNumber: true })}
            min={1}
            error={errors.level_number?.message}
          />
          <p className="mt-1 text-sm text-gray-500">
            レベルの順序を表す番号（1, 2, 3...）
          </p>
        </div>

        {/* ボーナスXP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ボーナスXP *
          </label>
          <Input
            type="number"
            {...register('bonus_xp', { valueAsNumber: true })}
            min={0}
            error={errors.bonus_xp?.message}
          />
          <p className="mt-1 text-sm text-gray-500">
            レベル完了時に獲得できるボーナス経験値
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
            onClick={() => navigate(`/admin/courses/${courseId}/levels`)}
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

export default AdminLevelFormPage;
