import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import GalaxyBackground from '../components/creations/GalaxyBackground';
import CreationCard from '../components/creations/CreationCard';
import {
  getCreationById,
  likeCreation,
  unlikeCreation,
  recordPlay,
  getUserCreations
} from '../services/supabaseService';
import { useAuthStore } from '../store/authStore';
import { getVisitorId, addLocalLike, removeLocalLike, isLocallyLiked } from '../utils/visitorId';
import type { Creation } from '../types';

const HeartIcon = ({ filled, ...props }: React.SVGProps<SVGSVGElement> & { filled?: boolean }) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const MaximizeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
  </svg>
);

const CreationDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [creation, setCreation] = useState<Creation | null>(null);
  const [otherCreations, setOtherCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ページロード時にトップにスクロール
    window.scrollTo(0, 0);
    if (id) {
      loadCreation();
    }
  }, [id, user]);

  useEffect(() => {
    setImgError(false);
    setIframeLoaded(false);
  }, [creation]);

  // 十字キーでのスクロール防止
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        const target = e.target as HTMLElement;
        // 入力フォーム以外での矢印キー操作時はスクロールを防止
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadCreation = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const visitorId = getVisitorId();
      const data = await getCreationById(id, user?.uid, !user ? visitorId : undefined);

      // ローカルストレージのいいね状態も確認（フォールバック）
      const localLiked = isLocallyLiked(id);
      setCreation({
        ...data,
        is_liked: data.is_liked || localLiked,
      });

      // 再生回数を記録
      await recordPlay(id, user?.uid);

      // 同じ作者の他の作品を取得
      if (data.user_id) {
        const userCreations = await getUserCreations(data.user_id, false);
        setOtherCreations(userCreations.filter(c => c.id !== id).slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading creation:', error);
      toast.error(t('creations.loadFailed'));
      navigate('/creations');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!creation || isLiking) return;

    try {
      setIsLiking(true);
      const visitorId = getVisitorId();

      if (creation.is_liked) {
        // いいねを解除
        try {
          await unlikeCreation(user?.uid || null, creation.id, !user ? visitorId : undefined);
        } catch {
          // データベースエラーは無視（ローカルストレージのみで処理）
        }
        removeLocalLike(creation.id);
        setCreation({
          ...creation,
          is_liked: false,
          likes: Math.max(0, creation.likes - 1),
        });
        toast.success(t('creations.unlike'));
      } else {
        // いいねを追加
        try {
          await likeCreation(user?.uid || null, creation.id, !user ? visitorId : undefined);
        } catch (error: any) {
          // 既にいいね済みエラーは許容（ローカルストレージで処理）
          if (!error.message?.includes('既にいいね済み')) {
            console.warn('Like creation failed, using local storage fallback:', error);
          }
        }
        addLocalLike(creation.id);
        setCreation({
          ...creation,
          is_liked: true,
          likes: creation.likes + 1,
        });

        // Particle Effect
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d946ef', '#06b6d4', '#fbbf24']
        });

        toast.success(t('creations.like'));
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error(error.message || t('errors.updateFailed'));
    } finally {
      setIsLiking(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#0f172a] flex items-center justify-center">
        <GalaxyBackground />
        <div className="text-cyan-400 text-2xl font-mono animate-pulse">{t('common.loading')}</div>
      </div>
    );
  }

  if (!creation) {
    return (
      <div className="relative min-h-screen bg-[#0f172a] flex items-center justify-center">
        <GalaxyBackground />
        <div className="text-center p-8 bg-slate-900/80 rounded-2xl border border-red-500/50 backdrop-blur-md">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 text-xl mb-6">{t('creations.noCreationsFound')}</p>
          <button
            onClick={() => navigate('/creations')}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-bold"
          >
            {t('creations.backToGallery')}
          </button>
        </div>
      </div>
    );
  }

  const defaultThumbnail = 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="relative min-h-screen text-gray-200 overflow-x-hidden">
      <GalaxyBackground />

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Navigation HUD */}
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => navigate('/creations')}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-6 group bg-slate-900/50 px-4 py-2 rounded-full border border-cyan-500/30 backdrop-blur-sm hover:border-cyan-500/80"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono uppercase tracking-wider text-sm">{t('creations.backToGallery').toUpperCase()}</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Cockpit View (Left Column) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Project Viewer Frame */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative bg-slate-900/80 rounded-3xl p-1 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-xl"
            >
              {/* Decorative Cockpit Elements */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-cyan-500/50 rounded-b-full shadow-[0_0_10px_#06b6d4]" />
              <div className="absolute -left-1 top-10 bottom-10 w-1 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
              <div className="absolute -right-1 top-10 bottom-10 w-1 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />

              <div
                ref={containerRef}
                className="aspect-video bg-black rounded-2xl overflow-hidden relative group"
              >
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                      <p className="text-cyan-400 font-mono text-sm animate-pulse">LOADING SYSTEM...</p>
                    </div>
                  </div>
                )}
                {/* 埋め込みURLを直接表示（作成・編集時に検証済み） */}
                <iframe
                  src={creation.code_url}
                  className={`w-full h-full transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                  allowFullScreen
                  title={creation.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  onLoad={() => setIframeLoaded(true)}
                />

                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-cyan-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm border border-white/20 z-20"
                  title="全画面表示"
                >
                  <MaximizeIcon className="w-6 h-6" />
                </button>
              </div>
            </motion.div>

            {/* Mission Briefing (Description) */}
            {creation.description && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/60 rounded-2xl p-6 border border-white/10 backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                <h3 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2 font-mono">
                  <span className="text-2xl">📝</span> {t('creations.description').toUpperCase()}
                </h3>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
                  {creation.description}
                </p>
              </motion.div>
            )}
          </div>

          {/* Right Column - Data Panel */}
          <div className="lg:col-span-1 space-y-6">

            {/* Creator & Stats Panel */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/80 rounded-3xl p-6 border border-fuchsia-500/20 shadow-lg backdrop-blur-xl relative overflow-hidden"
            >
              {/* Holographic Scan Line */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-500/5 to-transparent animate-scan pointer-events-none" style={{ height: '200%' }} />

              <h1 className="text-3xl font-bold text-white mb-6 leading-tight relative z-10">
                {creation.title}
              </h1>

              <div className="flex items-center gap-4 mb-8 p-4 bg-white/5 rounded-xl border border-white/5 relative z-10">
                {creation.creator?.avatar_style && creation.creator?.avatar_seed ? (
                  <img
                    src={`https://api.dicebear.com/7.x/${creation.creator.avatar_style}/svg?seed=${creation.creator.avatar_seed}`}
                    alt={creation.creator.name}
                    className="w-14 h-14 rounded-full border-2 border-fuchsia-500 shadow-lg shadow-fuchsia-500/30"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-fuchsia-500/30">
                    {creation.creator?.name?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <p className="text-xs text-fuchsia-300 uppercase tracking-wider font-bold">{t('creations.creator')}</p>
                  <p className="text-xl font-bold text-white">{creation.creator?.name || t('creations.creator')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                <div className="bg-black/40 rounded-xl p-4 text-center border border-cyan-500/20">
                  <div className="text-3xl font-black text-cyan-400 font-mono">{creation.plays}</div>
                  <div className="text-xs text-cyan-200/70 uppercase tracking-widest mt-1">{t('creations.plays')}</div>
                </div>
                <div className="bg-black/40 rounded-xl p-4 text-center border border-fuchsia-500/20">
                  <div className="text-3xl font-black text-fuchsia-400 font-mono">{creation.likes}</div>
                  <div className="text-xs text-fuchsia-200/70 uppercase tracking-widest mt-1">{t('creations.likes')}</div>
                </div>
              </div>

              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`w-full relative overflow-hidden group px-6 py-4 rounded-xl font-bold transition-all transform active:scale-95 ${creation.is_liked
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                  : 'bg-slate-800 hover:bg-slate-700 text-gray-200 border border-white/10'
                  } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <HeartIcon filled={creation.is_liked} className={`w-7 h-7 ${creation.is_liked ? 'animate-bounce' : 'group-hover:text-pink-500 transition-colors'}`} />
                  <span className="text-lg">{creation.is_liked ? t('creations.like').toUpperCase() + '!' : t('creations.like').toUpperCase()}</span>
                </div>
              </button>

              <div className="mt-6 text-center text-xs text-gray-500 font-mono relative z-10">
                {t('creations.createdAt')}: {new Date(creation.created_at).toLocaleDateString('ja-JP')}
              </div>
            </motion.div>

            {/* Related Projects */}
            {otherCreations.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-900/60 rounded-2xl p-6 border border-white/5 backdrop-blur-md"
              >
                <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                  <span className="text-xl">🚀</span> {t('creations.otherCreations')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {otherCreations.map(other => (
                    <CreationCard key={other.id} creation={other} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreationDetailPage;
