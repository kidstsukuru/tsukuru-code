import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CreationCard from '../components/creations/CreationCard';
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
      toast.error('作品の読み込みに失敗しました');
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
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 text-gray-200">
      {/* Hero Section for Featured Creation */}
      <div className="mb-8 sm:mb-12 lg:mb-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-center sm:text-left leading-tight"
              style={{ textShadow: '0 0 15px #06b6d4, 0 0 25px #d946ef' }}
          >
              <span className="text-cyan-400">クリエイターズ</span>
              <span className="text-fuchsia-500">ワールド</span>
          </h1>
          <div className="flex gap-2 sm:gap-3">
            {user && (
              <button
                onClick={() => navigate('/creations/my')}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white text-sm sm:text-base font-bold rounded-lg shadow-lg transform hover:-translate-y-0.5 transition-all duration-150 whitespace-nowrap"
              >
                <span>マイ作品</span>
              </button>
            )}
            <button
              onClick={() => navigate('/creations/new')}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-600 hover:to-fuchsia-600 active:from-cyan-700 active:to-fuchsia-700 text-white text-sm sm:text-base font-bold rounded-lg shadow-lg hover:shadow-cyan-500/50 transform hover:-translate-y-0.5 transition-all duration-150 whitespace-nowrap"
            >
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>作品を投稿</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 md:h-96">
            <div className="text-xl text-gray-400">読み込み中...</div>
          </div>
        ) : featuredCreation ? (
          <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-cyan-500/20">
            <img
              src={featuredImgError ? defaultThumbnail : (featuredCreation.thumbnail_url || defaultThumbnail)}
              alt={featuredCreation.title}
              onError={() => setFeaturedImgError(true)}
              className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/20" />
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1.5 sm:mb-2 leading-tight" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}>
                {featuredCreation.title}
              </h2>
              <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">作: {featuredCreation.creator?.name || '匿名'}</p>
              <button
                onClick={() => navigate(`/creations/${featuredCreation.id}`)}
                className="flex items-center gap-x-1.5 sm:gap-x-2 px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white text-sm sm:text-base font-bold rounded-lg shadow-lg hover:shadow-cyan-500/50 transform hover:-translate-y-0.5 transition-all duration-150"
              >
                <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>今すぐプレイ！</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">まだ作品が投稿されていません</p>
          </div>
        )}
      </div>

      {/* Search and Sorting Controls */}
      {!loading && creations.length > 0 && (
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          {/* Search Bar */}
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="作品名・作者名で検索..."
              className="w-full bg-slate-800 text-gray-200 px-4 py-2.5 pl-10 min-h-[44px] text-sm sm:text-base rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 placeholder-gray-500"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">並び替え:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'plays' | 'likes' | 'created_at')}
              className="flex-1 sm:flex-none bg-slate-800 text-gray-200 px-3 sm:px-4 py-2 min-h-[44px] text-sm sm:text-base rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
            >
              <option value="plays">人気順</option>
              <option value="likes">いいね順</option>
              <option value="created_at">新着順</option>
            </select>
          </div>
        </div>
      )}

      {/* Gallery of Creations */}
      <div>
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-200 leading-tight">
            みんなの作品
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-1.5 sm:mt-2">未来のクリエイターたちの作品がここに集結！</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg sm:text-xl text-gray-400">読み込み中...</div>
          </div>
        ) : filteredCreations.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:gap-x-6">
            {filteredCreations.map(creation => (
              <CreationCard key={creation.id} creation={creation} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {searchQuery ? `"${searchQuery}" に一致する作品が見つかりませんでした` : '作品が見つかりませんでした'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-200 rounded-lg transition-colors"
              >
                検索をクリア
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreationsPage;