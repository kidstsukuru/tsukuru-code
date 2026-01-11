import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import CreationCard from '../components/creations/CreationCard';
import GalaxyBackground from '../components/creations/GalaxyBackground';
import LazyImage from '../components/common/LazyImage';
import { getCreations } from '../services/supabaseService';
import { useAuthStore } from '../store/authStore';
import type { Creation } from '../types';

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const CreationsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [creations, setCreations] = useState<Creation[]>([]);
  const [filteredCreations, setFilteredCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'plays' | 'likes' | 'created_at'>('plays');
  const [featuredImgError, setFeaturedImgError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCreations();
  }, [sortBy, user]);

  useEffect(() => {
    filterCreations();
  }, [searchQuery, creations]);

  useEffect(() => {
    setFeaturedImgError(false);
  }, [creations]);

  const loadCreations = async () => {
    try {
      setLoading(true);
      const data = await getCreations(50, 0, sortBy, user?.uid);
      setCreations(data);
      setFilteredCreations(data);
    } catch (error) {
      console.error('Error loading creations:', error);
      toast.error(t('creations.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const filterCreations = () => {
    if (!searchQuery.trim()) {
      setFilteredCreations(creations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = creations.filter(creation =>
      creation.title.toLowerCase().includes(query) ||
      creation.creator?.name?.toLowerCase().includes(query) ||
      creation.description?.toLowerCase().includes(query)
    );
    setFilteredCreations(filtered);
  };

  const featuredCreation = filteredCreations.length > 0 ? filteredCreations[0] : null;
  const defaultThumbnail = 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="relative min-h-screen text-gray-200 overflow-hidden">
      <GalaxyBackground />

      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 landscape:py-2 landscape:px-3 relative z-10">

        {/* Header Section */}
        <div className="flex flex-col items-center justify-center mb-12 landscape:mb-4 text-center">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-4xl sm:text-5xl md:text-7xl landscape:text-2xl font-black tracking-tight mb-4 landscape:mb-2"
            style={{
              textShadow: '0 0 20px rgba(6, 182, 212, 0.8), 0 0 40px rgba(217, 70, 239, 0.6)',
              background: 'linear-gradient(to right, #22d3ee, #e879f9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('creations.galaxyTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-cyan-200 text-lg sm:text-xl landscape:text-sm font-medium tracking-widest uppercase"
          >
            {t('creations.description')}
          </motion.p>
        </div>

        {/* Featured Section (Holographic Display) */}
        <div className="mb-16 landscape:mb-4 landscape:hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
              <p className="ml-4 text-cyan-300">{t('creations.loadingCreations')}</p>
            </div>
          ) : featuredCreation ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-slate-900/40 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.2)]"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-96 overflow-hidden group">
                  <LazyImage
                    src={featuredImgError ? defaultThumbnail : (featuredCreation.thumbnail_url || defaultThumbnail)}
                    alt={featuredCreation.title}
                    onError={() => setFeaturedImgError(true)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent md:bg-gradient-to-t" />
                </div>

                <div className="p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
                  {/* Decorative HUD Elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-3xl" />
                  <div className="absolute bottom-4 left-4 w-20 h-20 border-b-2 border-l-2 border-fuchsia-500/30 rounded-bl-3xl" />

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-xs font-bold uppercase tracking-wider w-fit mb-4">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    {t('creations.featuredCreation')}
                  </div>

                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {featuredCreation.title}
                  </h2>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white">
                        {featuredCreation.creator?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-cyan-100 font-medium">{featuredCreation.creator?.name || t('creations.creator')}</span>
                    </div>
                    <div className="h-4 w-px bg-white/20" />
                    <div className="flex gap-4 text-sm font-mono text-cyan-300">
                      <span>❤️ {featuredCreation.likes} {t('creations.likes')}</span>
                      <span>▶️ {featuredCreation.plays} {t('creations.plays')}</span>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-8 line-clamp-2 text-lg">
                    {featuredCreation.description || t('creations.description')}
                  </p>

                  <div className="flex gap-4">
                    <button
                      onClick={() => navigate(`/creations/${featuredCreation.id}`)}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2"
                    >
                      <PlayIcon className="w-6 h-6" />
                      {t('creations.play').toUpperCase()}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>

        {/* Control Panel (HUD Style) */}
        <div className="sticky top-4 z-30 mb-8 landscape:mb-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 landscape:p-2 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">

            {/* Search HUD */}
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-cyan-500 group-focus-within:text-cyan-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl leading-5 bg-slate-800/50 text-cyan-100 placeholder-cyan-700 focus:outline-none focus:bg-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm transition-all"
                placeholder={t('creations.searchPlaceholder')}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-800/50 text-cyan-300 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <option value="plays">{t('creations.sortByPlays')}</option>
                <option value="likes">{t('creations.sortByLikes')}</option>
                <option value="created_at">{t('creations.sortByNew')}</option>
              </select>

              {user && (
                <button
                  onClick={() => navigate('/creations/new')}
                  className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all transform hover:scale-105 hover:shadow-[0_0_15px_rgba(217,70,239,0.5)] whitespace-nowrap"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>{t('creations.createNew')}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grid Display */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-cyan-500 animate-pulse text-xl font-mono">{t('creations.loadingCreations')}</div>
          </div>
        ) : filteredCreations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 landscape:grid-cols-4 gap-6 landscape:gap-2">
            {filteredCreations.map((creation, index) => (
              <motion.div
                key={creation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index < 20 ? index * 0.05 : 0,  // 最初の20要素のみ遅延適用
                  duration: 0.3
                }}
              >
                <CreationCard creation={creation} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/5">
            <div className="text-6xl mb-4">🪐</div>
            <h3 className="text-2xl font-bold text-white mb-2">{t('creations.noCreationsFound')}</h3>
            <p className="text-gray-400">{t('creations.searchPlaceholder')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreationsPage;