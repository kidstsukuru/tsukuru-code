import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getCreationById,
  likeCreation,
  unlikeCreation,
  recordPlay,
  getUserCreations
} from '../services/supabaseService';
import { useAuthStore } from '../store/authStore';
import type { Creation } from '../types';
import CreationCard from '../components/creations/CreationCard';

const HeartIcon = ({ filled, ...props }: React.SVGProps<SVGSVGElement> & { filled?: boolean }) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
);

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const CreationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [creation, setCreation] = useState<Creation | null>(null);
  const [otherCreations, setOtherCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (id) {
      loadCreation();
    }
  }, [id, user]);

  useEffect(() => {
    setImgError(false);
  }, [creation]);

  const loadCreation = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await getCreationById(id, user?.uid);
      setCreation(data);

      // 再生回数を記録
      await recordPlay(id, user?.uid);

      // 同じ作者の他の作品を取得
      if (data.user_id) {
        const userCreations = await getUserCreations(data.user_id, false);
        setOtherCreations(userCreations.filter(c => c.id !== id).slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading creation:', error);
      toast.error('作品の読み込みに失敗しました');
      navigate('/creations');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('いいねするにはログインが必要です');
      navigate('/login');
      return;
    }

    if (!creation || isLiking) return;

    try {
      setIsLiking(true);

      if (creation.is_liked) {
        // いいねを解除
        await unlikeCreation(user.uid, creation.id);
        setCreation({
          ...creation,
          is_liked: false,
          likes: creation.likes - 1,
        });
        toast.success('いいねを解除しました');
      } else {
        // いいねを追加
        await likeCreation(user.uid, creation.id);
        setCreation({
          ...creation,
          is_liked: true,
          likes: creation.likes + 1,
        });
        toast.success('いいねしました！');
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error(error.message || 'いいねの処理に失敗しました');
    } finally {
      setIsLiking(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-400">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!creation) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center py-12">
          <p className="text-gray-400">作品が見つかりませんでした</p>
          <button
            onClick={() => navigate('/creations')}
            className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
          >
            作品一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const defaultThumbnail = 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=800&auto=format&fit=crop';

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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Creation Preview */}
        <div className="lg:col-span-2">
          {/* Thumbnail */}
          <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-cyan-500/20 mb-6">
            <img
              src={imgError ? defaultThumbnail : (creation.thumbnail_url || defaultThumbnail)}
              alt={creation.title}
              onError={() => setImgError(true)}
              className="w-full h-64 md:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/20" />
          </div>

          {/* Embed - Scratch Project */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-200 mb-4">作品を実行</h3>
            <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
              {creation.code_url.includes('scratch.mit.edu') ? (
                <iframe
                  src={creation.code_url.replace('/projects/', '/projects/') + '/embed'}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  title={creation.title}
                />
              ) : (
                <div className="text-center p-8">
                  <PlayIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">この作品を見るには外部リンクを開いてください</p>
                  <a
                    href={creation.code_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors"
                  >
                    作品を開く
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {creation.description && (
            <div className="mt-6 bg-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-gray-200 mb-3">作品の説明</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{creation.description}</p>
            </div>
          )}
        </div>

        {/* Right Column - Info & Stats */}
        <div className="lg:col-span-1">
          {/* Title & Creator */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-xl mb-6">
            <h1 className="text-3xl font-bold text-gray-100 mb-4">{creation.title}</h1>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {creation.creator?.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="text-sm text-gray-400">作者</p>
                <p className="text-lg font-semibold text-gray-200">{creation.creator?.name || '匿名'}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">{creation.plays}</div>
                <div className="text-sm text-gray-400">再生回数</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-fuchsia-400">{creation.likes}</div>
                <div className="text-sm text-gray-400">いいね</div>
              </div>
            </div>

            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                creation.is_liked
                  ? 'bg-fuchsia-500 hover:bg-fuchsia-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-gray-200'
              } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <HeartIcon filled={creation.is_liked} className="w-6 h-6" />
              <span>{creation.is_liked ? 'いいね済み' : 'いいね！'}</span>
            </button>

            {/* Created Date */}
            <div className="mt-4 text-sm text-gray-400 text-center">
              投稿日: {new Date(creation.created_at).toLocaleDateString('ja-JP')}
            </div>
          </div>

          {/* Other Creations by Same Creator */}
          {otherCreations.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-gray-200 mb-4">
                {creation.creator?.name || '同じ作者'}の他の作品
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {otherCreations.map(other => (
                  <CreationCard key={other.id} creation={other} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreationDetailPage;
