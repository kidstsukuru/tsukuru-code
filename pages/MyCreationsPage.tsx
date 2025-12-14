import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getUserCreations, deleteCreation } from '../services/supabaseService';
import { useAuthStore } from '../store/authStore';
import type { Creation } from '../types';

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const MyCreationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      toast.error('ログインが必要です');
      navigate('/login');
      return;
    }
    loadMyCreations();
  }, [user]);

  const loadMyCreations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getUserCreations(user.uid, true); // 非公開作品も含める
      setCreations(data);
    } catch (error) {
      console.error('Error loading my creations:', error);
      toast.error('作品の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (creationId: string, title: string) => {
    if (!confirm(`本当に「${title}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    try {
      setDeletingId(creationId);
      await deleteCreation(creationId);
      setCreations(creations.filter(c => c.id !== creationId));
      toast.success('作品を削除しました');
    } catch (error) {
      console.error('Error deleting creation:', error);
      toast.error('作品の削除に失敗しました');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (creationId: string) => {
    navigate(`/creations/${creationId}/edit`);
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

  return (
    <div className="container mx-auto px-6 py-12 text-gray-200">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/creations')}
          className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>作品一覧に戻る</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">マイ作品</h1>
            <p className="text-gray-400">あなたが投稿した作品の一覧です</p>
          </div>
          <button
            onClick={() => navigate('/creations/new')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-600 hover:to-fuchsia-600 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/50 transform hover:-translate-y-0.5 transition-all duration-150"
          >
            <PlusIcon className="w-5 h-5" />
            <span>新しい作品を投稿</span>
          </button>
        </div>
      </div>

      {/* Creations List */}
      {creations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creations.map(creation => (
            <div
              key={creation.id}
              className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video">
                <img
                  src={creation.thumbnail_url || 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=800&auto=format&fit=crop'}
                  alt={creation.title}
                  className="w-full h-full object-cover"
                />
                {!creation.is_published && (
                  <div className="absolute top-2 right-2 px-3 py-1 bg-slate-900/90 text-yellow-400 text-xs font-bold rounded-full">
                    非公開
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2 truncate">{creation.title}</h3>
                {creation.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{creation.description}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                  <span>❤️ {creation.likes}</span>
                  <span>▶️ {creation.plays}</span>
                  <span className="ml-auto text-xs">
                    {new Date(creation.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/creations/${creation.id}`)}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-200 rounded-lg transition-colors"
                  >
                    表示
                  </button>
                  <button
                    onClick={() => handleEdit(creation.id)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                  >
                    <EditIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(creation.id, creation.title)}
                    disabled={deletingId === creation.id}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">まだ作品を投稿していません</p>
          <button
            onClick={() => navigate('/creations/new')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-600 hover:to-fuchsia-600 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/50 transform hover:-translate-y-0.5 transition-all duration-150"
          >
            最初の作品を投稿
          </button>
        </div>
      )}
    </div>
  );
};

export default MyCreationsPage;
