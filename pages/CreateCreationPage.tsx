import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { createCreation } from '../services/supabaseService';
import { useAuthStore } from '../store/authStore';

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

// フォームバリデーションスキーマ
const creationSchema = z.object({
  title: z.string()
    .min(1, 'タイトルは必須です')
    .max(200, 'タイトルは200文字以内で入力してください'),
  description: z.string()
    .max(1000, '説明は1000文字以内で入力してください')
    .optional(),
  thumbnail_url: z.string()
    .url('有効なURLを入力してください')
    .optional()
    .or(z.literal('')),
  code_url: z.string()
    .min(1, 'コードURLは必須です')
    .url('有効なURLを入力してください'),
  is_published: z.boolean(),
});

type CreationFormData = z.infer<typeof creationSchema>;

const CreateCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreationFormData>({
    resolver: zodResolver(creationSchema),
    defaultValues: {
      title: '',
      description: '',
      thumbnail_url: '',
      code_url: '',
      is_published: true,
    },
  });

  const thumbnailUrl = watch('thumbnail_url');
  const codeUrl = watch('code_url');

  // サムネイルプレビューの更新
  React.useEffect(() => {
    if (thumbnailUrl && thumbnailUrl.startsWith('http')) {
      setPreviewUrl(thumbnailUrl);
    } else {
      setPreviewUrl('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=800&auto=format&fit=crop');
    }
  }, [thumbnailUrl]);

  const onSubmit = async (data: CreationFormData) => {
    if (!user) {
      toast.error('ログインが必要です');
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);

      const creation = await createCreation({
        user_id: user.uid,
        title: data.title,
        description: data.description || undefined,
        thumbnail_url: data.thumbnail_url || undefined,
        code_url: data.code_url,
        is_published: data.is_published,
      });

      toast.success('作品を投稿しました！');
      navigate(`/creations/${creation.id}`);
    } catch (error: any) {
      console.error('Error creating creation:', error);
      toast.error(error.message || '作品の投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">作品を投稿するにはログインが必要です</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
          >
            ログイン
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 text-gray-200">
      {/* Back Button */}
      <button
        onClick={() => navigate('/creations')}
        className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>作品一覧に戻る</span>
      </button>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">作品を投稿</h1>
        <p className="text-gray-400">あなたの作品を世界中の人と共有しましょう！</p>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                タイトル <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                {...register('title')}
                className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-gray-200 focus:outline-none focus:ring-2 ${
                  errors.title
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:ring-cyan-500'
                }`}
                placeholder="例: ギャラクシー・ランナー"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                説明
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={4}
                className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-gray-200 focus:outline-none focus:ring-2 resize-none ${
                  errors.description
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:ring-cyan-500'
                }`}
                placeholder="作品の説明を入力してください..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
              )}
            </div>

            {/* Thumbnail URL */}
            <div>
              <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-300 mb-2">
                サムネイルURL
              </label>
              <input
                id="thumbnail_url"
                type="url"
                {...register('thumbnail_url')}
                className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-gray-200 focus:outline-none focus:ring-2 ${
                  errors.thumbnail_url
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:ring-cyan-500'
                }`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.thumbnail_url && (
                <p className="mt-1 text-sm text-red-400">{errors.thumbnail_url.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                未入力の場合はデフォルト画像が使用されます
              </p>
            </div>

            {/* Code URL */}
            <div>
              <label htmlFor="code_url" className="block text-sm font-medium text-gray-300 mb-2">
                作品URL（Scratchプロジェクトなど） <span className="text-red-400">*</span>
              </label>
              <input
                id="code_url"
                type="url"
                {...register('code_url')}
                className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-gray-200 focus:outline-none focus:ring-2 ${
                  errors.code_url
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:ring-cyan-500'
                }`}
                placeholder="https://scratch.mit.edu/projects/123456789"
              />
              {errors.code_url && (
                <p className="mt-1 text-sm text-red-400">{errors.code_url.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                ScratchプロジェクトのURLを入力してください
              </p>
            </div>

            {/* Is Published */}
            <div className="flex items-center gap-3">
              <input
                id="is_published"
                type="checkbox"
                {...register('is_published')}
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="is_published" className="text-sm text-gray-300 cursor-pointer">
                公開する（チェックを外すと下書きとして保存されます）
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/creations')}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-6 py-3 font-bold rounded-lg transition-all ${
                  isSubmitting
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-600 hover:to-fuchsia-600 text-white shadow-lg hover:shadow-cyan-500/50'
                }`}
              >
                {isSubmitting ? '投稿中...' : '投稿する'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Preview */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-200 mb-4">プレビュー</h2>

          {/* Thumbnail Preview */}
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-2">サムネイル</p>
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=800&auto=format&fit=crop';
                }}
              />
            </div>
          </div>

          {/* Embed Preview */}
          {codeUrl && codeUrl.includes('scratch.mit.edu') && (
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">Scratch プレビュー</p>
              <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                <iframe
                  src={codeUrl.replace('/projects/', '/projects/') + '/embed'}
                  className="w-full h-full"
                  allowFullScreen
                  title="Preview"
                />
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-slate-900 rounded-lg p-4">
            <h3 className="text-sm font-bold text-cyan-400 mb-2">💡 投稿のヒント</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• わかりやすいタイトルをつけましょう</li>
              <li>• 作品の遊び方や特徴を説明に書きましょう</li>
              <li>• 魅力的なサムネイル画像を設定しましょう</li>
              <li>• ScratchプロジェクトのURLを正確に入力してください</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCreationPage;
