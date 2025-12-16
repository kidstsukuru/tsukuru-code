import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { createCreation } from '../services/supabaseService';
import { useAuthStore } from '../store/authStore';
import { extractEmbedUrl, validateEmbedInput, getEmbedCodeExample, isValidGameUrl } from '../utils/embedHelpers';

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

// フォームバリデーションスキーマ
const creationSchema = z.object({
  title: z.string()
    .min(1, 'validation.required.title')
    .max(200, 'validation.max.title'),
  description: z.string()
    .max(1000, 'validation.max.description')
    .optional(),
  thumbnail_url: z.string()
    .url('validation.invalid.url')
    .optional()
    .or(z.literal('')),
  code_url: z.string()
    .min(1, 'validation.required.title'),
  is_published: z.boolean(),
});

type CreationFormData = z.infer<typeof creationSchema>;

const CreateCreationPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [urlType, setUrlType] = useState<'embed' | 'url'>('embed');

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
  const [embedPreviewUrl, setEmbedPreviewUrl] = useState<string>('');

  // サムネイルプレビューの更新
  React.useEffect(() => {
    if (thumbnailUrl && thumbnailUrl.startsWith('http')) {
      setPreviewUrl(thumbnailUrl);
    } else {
      setPreviewUrl('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=800&auto=format&fit=crop');
    }
  }, [thumbnailUrl]);

  // 埋め込みプレビューの更新
  React.useEffect(() => {
    if (codeUrl) {
      if (urlType === 'embed') {
        // Scratch埋め込みコードの場合、URLを抽出
        const extracted = extractEmbedUrl(codeUrl);
        setEmbedPreviewUrl(extracted || '');
      } else {
        // ゲームURLの場合、そのまま使用
        if (isValidGameUrl(codeUrl)) {
          setEmbedPreviewUrl(codeUrl);
        } else {
          setEmbedPreviewUrl('');
        }
      }
    } else {
      setEmbedPreviewUrl('');
    }
  }, [codeUrl, urlType]);

  const onSubmit = async (data: CreationFormData) => {
    if (!user) {
      toast.error(t('auth.loginTitle'));
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);

      let finalUrl: string;

      if (urlType === 'embed') {
        // 埋め込みコードからURLを抽出
        const extractedUrl = extractEmbedUrl(data.code_url);
        if (!extractedUrl) {
          toast.error('有効な埋め込みコードまたはURLを入力してください');
          setIsSubmitting(false);
          return;
        }
        finalUrl = extractedUrl;
      } else {
        // ゲームURLの場合、そのまま使用
        if (!isValidGameUrl(data.code_url)) {
          toast.error('有効なURLを入力してください');
          setIsSubmitting(false);
          return;
        }
        finalUrl = data.code_url.trim();
      }

      const creation = await createCreation({
        user_id: user.uid,
        title: data.title,
        description: data.description || undefined,
        thumbnail_url: data.thumbnail_url || undefined,
        code_url: finalUrl,
        is_published: data.is_published,
      });

      toast.success(t('createCreation.success'));
      navigate(`/creations/${creation.id}`);
    } catch (error: any) {
      console.error('Error creating creation:', error);
      toast.error(error.message || t('createCreation.failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">{t('auth.loginTitle')}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
          >
            {t('common.login')}
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
        <span>{t('creations.backToGallery')}</span>
      </button>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">{t('createCreation.title')}</h1>
        <p className="text-gray-400">{t('creations.description')}</p>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                {t('createCreation.form.title')} <span className="text-red-400">*</span>
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
                placeholder={t('createCreation.form.titlePlaceholder')}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400">{t(errors.title.message as string)}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                {t('createCreation.form.description')}
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
                placeholder={t('createCreation.form.descriptionPlaceholder')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">{t(errors.description.message as string)}</p>
              )}
            </div>

            {/* Thumbnail URL */}
            <div>
              <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-300 mb-2">
                {t('createCreation.form.thumbnailUrl')}
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
                placeholder={t('createCreation.form.thumbnailPlaceholder')}
              />
              {errors.thumbnail_url && (
                <p className="mt-1 text-sm text-red-400">{t(errors.thumbnail_url.message as string)}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {t('createCreation.form.thumbnailPreview')}
              </p>
            </div>

            {/* URL Type Selector */}
            <div>
              <label htmlFor="url_type" className="block text-sm font-medium text-gray-300 mb-2">
                作品のタイプ <span className="text-red-400">*</span>
              </label>
              <select
                id="url_type"
                value={urlType}
                onChange={(e) => setUrlType(e.target.value as 'embed' | 'url')}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="embed">Scratch埋め込みコード</option>
                <option value="url">ゲームURL（サーバーアップロード済み）</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {urlType === 'embed'
                  ? '💡 Scratchプロジェクトの埋め込みコードまたはURLを入力'
                  : '🎮 サーバーにアップロードしたゲームのURLを入力'}
              </p>
            </div>

            {/* Code URL / Embed Code */}
            <div>
              <label htmlFor="code_url" className="block text-sm font-medium text-gray-300 mb-2">
                {urlType === 'embed' ? 'Scratch埋め込みコード / URL' : 'ゲームURL'} <span className="text-red-400">*</span>
              </label>
              <textarea
                id="code_url"
                {...register('code_url')}
                rows={urlType === 'embed' ? 5 : 2}
                className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-gray-200 focus:outline-none focus:ring-2 font-mono text-sm resize-none ${
                  errors.code_url
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:ring-cyan-500'
                }`}
                placeholder={urlType === 'embed'
                  ? getEmbedCodeExample()
                  : 'https://example.com/games/my-game/index.html'}
              />
              {errors.code_url && (
                <p className="mt-1 text-sm text-red-400">{errors.code_url.message as string}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                {urlType === 'embed'
                  ? '💡 Scratchの「共有」→「埋め込みコード」をコピーして貼り付けるか、プロジェクトURLを入力してください'
                  : '🎮 iframe で表示可能なゲームページのURLを入力してください'}
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
                {t('admin.courses.form.published')}
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/creations')}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
              >
                {t('common.cancel')}
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
                {isSubmitting ? t('createCreation.publishing') : t('createCreation.submit')}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Preview */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-200 mb-4">{t('createCreation.form.preview')}</h2>

          {/* Thumbnail Preview */}
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-2">{t('createCreation.form.thumbnailPreview')}</p>
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
          {embedPreviewUrl && (
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">{t('createCreation.form.embedPreview')}</p>
              <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden shadow-lg border border-slate-700">
                <iframe
                  src={embedPreviewUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title="Preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-slate-900 rounded-lg p-4">
            <h3 className="text-sm font-bold text-cyan-400 mb-2">{t('creations.description')}</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• {t('validation.required.title')}</li>
              <li>• {t('validation.required.description')}</li>
              <li>• {t('createCreation.form.thumbnailUrl')}</li>
              <li>• {t('createCreation.form.codeUrl')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCreationPage;
