import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { getCreationById, updateCreation, uploadCreationThumbnail } from '../services/supabaseService';
import { useAuthStore } from '../store/authStore';
import { extractEmbedUrl, getEmbedCodeExample, isValidGameUrl } from '../utils/embedHelpers';
import { validateThumbnailImage, getImageAcceptString, formatFileSize, MAX_FILE_SIZE } from '../utils/fileValidation';
import type { Creation } from '../types';

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
    .min(1, 'コードURLは必須です'),
  is_published: z.boolean(),
});

type CreationFormData = z.infer<typeof creationSchema>;

const EditCreationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creation, setCreation] = useState<Creation | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [urlType, setUrlType] = useState<'embed' | 'url'>('embed');
  const [embedPreviewUrl, setEmbedPreviewUrl] = useState<string>('');
  const [thumbnailInputType, setThumbnailInputType] = useState<'url' | 'file' | 'keep'>('keep');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
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

  // 既存データの読み込み
  useEffect(() => {
    if (!id || !user) return;

    const loadCreation = async () => {
      try {
        setLoading(true);
        const data = await getCreationById(id, user.uid);

        // 作者本人でない場合は編集できない
        if (data.user_id !== user.uid) {
          toast.error('この作品は編集できません');
          navigate('/creations');
          return;
        }

        setCreation(data);
        reset({
          title: data.title,
          description: data.description || '',
          thumbnail_url: data.thumbnail_url || '',
          code_url: data.code_url,
          is_published: data.is_published,
        });
      } catch (error) {
        console.error('Error loading creation:', error);
        toast.error('作品の読み込みに失敗しました');
        navigate('/creations');
      } finally {
        setLoading(false);
      }
    };

    loadCreation();
  }, [id, user]);

  // サムネイルプレビューの更新
  React.useEffect(() => {
    if (thumbnailInputType === 'file' && thumbnailFile) {
      // ファイルの場合はDataURLを生成
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(thumbnailFile);
    } else if (thumbnailInputType === 'url' && thumbnailUrl && thumbnailUrl.startsWith('http')) {
      setPreviewUrl(thumbnailUrl);
    } else if (thumbnailInputType === 'keep' && creation?.thumbnail_url) {
      setPreviewUrl(creation.thumbnail_url);
    } else {
      setPreviewUrl('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=800&auto=format&fit=crop');
    }
  }, [thumbnailUrl, thumbnailFile, thumbnailInputType, creation]);

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

  // ファイル選択時のハンドラー
  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setThumbnailFile(null);
      return;
    }

    // バリデーション
    const validation = validateThumbnailImage(file);
    if (!validation.valid) {
      toast.error(validation.message || 'ファイルのバリデーションに失敗しました');
      e.target.value = '';
      return;
    }

    setThumbnailFile(file);
  };

  const onSubmit = async (data: CreationFormData) => {
    if (!user || !id) {
      toast.error('ログインが必要です');
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

      // サムネイルURLの取得（ファイルアップロード、URL、または既存を維持）
      let thumbnailUrl: string | undefined;
      console.log('Thumbnail input type:', thumbnailInputType, 'File:', thumbnailFile);

      if (thumbnailInputType === 'file' && thumbnailFile) {
        setIsUploadingThumbnail(true);
        try {
          thumbnailUrl = await uploadCreationThumbnail(user.uid, thumbnailFile);
          console.log('Uploaded thumbnail URL:', thumbnailUrl);
        } catch (uploadError: any) {
          toast.error(uploadError.message || 'サムネイルのアップロードに失敗しました');
          setIsSubmitting(false);
          setIsUploadingThumbnail(false);
          return;
        }
        setIsUploadingThumbnail(false);
      } else if (thumbnailInputType === 'url' && data.thumbnail_url) {
        thumbnailUrl = data.thumbnail_url;
      } else if (thumbnailInputType === 'keep') {
        thumbnailUrl = creation?.thumbnail_url;
      }

      console.log('Final thumbnail URL to update:', thumbnailUrl);

      const updateData = {
        title: data.title,
        description: data.description || undefined,
        thumbnail_url: thumbnailUrl,
        code_url: finalUrl,
        is_published: data.is_published,
      };
      console.log('Updating creation with:', updateData);

      await updateCreation(id, updateData);

      toast.success('作品を更新しました！');
      navigate(`/creations/${id}`);
    } catch (error: any) {
      console.error('Error updating creation:', error);
      toast.error(error.message || '作品の更新に失敗しました');
    } finally {
      setIsSubmitting(false);
      setIsUploadingThumbnail(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">作品を編集するにはログインが必要です</p>
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

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-400">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 text-gray-200">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/creations/${id}`)}
        className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>作品詳細に戻る</span>
      </button>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">作品を編集</h1>
        <p className="text-gray-400">作品の情報を更新します</p>
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
                className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-gray-200 focus:outline-none focus:ring-2 ${errors.title
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
                className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-gray-200 focus:outline-none focus:ring-2 resize-none ${errors.description
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:ring-cyan-500'
                  }`}
                placeholder="作品の説明を入力してください..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
              )}
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                サムネイル画像
              </label>

              {/* Thumbnail input type selector */}
              <div className="flex gap-2 mb-3 flex-wrap">
                {creation?.thumbnail_url && (
                  <button
                    type="button"
                    onClick={() => setThumbnailInputType('keep')}
                    className={`flex-1 min-w-[100px] px-3 py-2 text-sm font-medium rounded-lg transition-colors ${thumbnailInputType === 'keep'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                  >
                    📌 現在の画像を維持
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setThumbnailInputType('file')}
                  className={`flex-1 min-w-[100px] px-3 py-2 text-sm font-medium rounded-lg transition-colors ${thumbnailInputType === 'file'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                >
                  📁 新しい画像をアップロード
                </button>
                <button
                  type="button"
                  onClick={() => setThumbnailInputType('url')}
                  className={`flex-1 min-w-[100px] px-3 py-2 text-sm font-medium rounded-lg transition-colors ${thumbnailInputType === 'url'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                >
                  🔗 URLで指定
                </button>
              </div>

              {/* Keep current thumbnail */}
              {thumbnailInputType === 'keep' && creation?.thumbnail_url && (
                <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">現在のサムネイル:</p>
                  <img
                    src={creation.thumbnail_url}
                    alt="現在のサムネイル"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=800&auto=format&fit=crop';
                    }}
                  />
                </div>
              )}

              {/* File upload input */}
              {thumbnailInputType === 'file' && (
                <div>
                  <div className="relative">
                    <input
                      id="thumbnail_file"
                      type="file"
                      accept={getImageAcceptString()}
                      onChange={handleThumbnailFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="thumbnail_file"
                      className={`flex items-center justify-center w-full px-4 py-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${thumbnailFile
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-900'
                        }`}
                    >
                      {thumbnailFile ? (
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">✅</span>
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-200">{thumbnailFile.name}</p>
                            <p className="text-xs text-gray-400">{formatFileSize(thumbnailFile.size)}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-3xl mb-2 block">📷</span>
                          <p className="text-sm text-gray-300">クリックして画像を選択</p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF, WebP（最大 {formatFileSize(MAX_FILE_SIZE.THUMBNAIL)}）
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                  {thumbnailFile && (
                    <button
                      type="button"
                      onClick={() => setThumbnailFile(null)}
                      className="mt-2 text-sm text-red-400 hover:text-red-300"
                    >
                      ✕ 画像を削除
                    </button>
                  )}
                </div>
              )}

              {/* URL input */}
              {thumbnailInputType === 'url' && (
                <div>
                  <input
                    id="thumbnail_url"
                    type="url"
                    {...register('thumbnail_url')}
                    className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-gray-200 focus:outline-none focus:ring-2 ${errors.thumbnail_url
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-700 focus:ring-cyan-500'
                      }`}
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.thumbnail_url && (
                    <p className="mt-1 text-sm text-red-400">{errors.thumbnail_url.message}</p>
                  )}
                </div>
              )}

              <p className="mt-2 text-xs text-gray-500">
                {thumbnailInputType === 'keep'
                  ? '💡 変更しない場合は現在の画像が維持されます'
                  : thumbnailInputType === 'file'
                    ? '💡 新しいサムネイル画像をアップロードしてください'
                    : '💡 URLを入力しない場合はデフォルト画像が使用されます'}
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
                className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-gray-200 focus:outline-none focus:ring-2 font-mono text-sm resize-none ${errors.code_url
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:ring-cyan-500'
                  }`}
                placeholder={urlType === 'embed'
                  ? getEmbedCodeExample()
                  : 'https://example.com/games/my-game/index.html'}
              />
              {errors.code_url && (
                <p className="mt-1 text-sm text-red-400">{errors.code_url.message}</p>
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
                公開する（チェックを外すと下書きとして保存されます）
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(`/creations/${id}`)}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-6 py-3 font-bold rounded-lg transition-all ${isSubmitting
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-600 hover:to-fuchsia-600 text-white shadow-lg hover:shadow-cyan-500/50'
                  }`}
              >
                {isSubmitting
                  ? (isUploadingThumbnail ? '画像をアップロード中...' : '更新中...')
                  : '更新する'}
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
          {embedPreviewUrl && (
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">プレビュー</p>
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

export default EditCreationPage;
