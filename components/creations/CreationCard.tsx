import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Creation } from '../../types';

type CreationCardProps = {
  creation: Creation;
};

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);

const CreationCard: React.FC<CreationCardProps> = ({ creation }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = React.useState(false);

  const handleClick = () => {
    navigate(`/creations/${creation.id}`);
  };

  const defaultThumbnail = 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=800&auto=format&fit=crop';

  return (
    <button
      onClick={handleClick}
      className="group text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400 rounded-2xl transition-transform duration-200 hover:-translate-y-1 w-full"
    >
      <div className="relative">
        <img
            src={imgError ? defaultThumbnail : (creation.thumbnail_url || defaultThumbnail)}
            alt={creation.title}
            onError={() => setImgError(true)}
            className="aspect-square w-full object-cover rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:shadow-cyan-500/20"
        />
        <div className="absolute inset-0 bg-slate-900/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <PlayIcon className="w-10 h-10 text-white/80 transform group-hover:scale-110 transition-transform duration-200" />
        </div>

        {/* いいね・再生回数 */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <div className="bg-slate-900/80 px-2 py-1 rounded-lg text-xs text-white flex items-center gap-1">
            ❤️ {creation.likes}
          </div>
          <div className="bg-slate-900/80 px-2 py-1 rounded-lg text-xs text-white flex items-center gap-1">
            ▶️ {creation.plays}
          </div>
        </div>
      </div>

      <div className="mt-3 px-1">
        <h3 className="font-bold text-sm text-gray-100 truncate group-hover:text-cyan-400 transition-colors">{creation.title}</h3>
        <p className="text-xs text-gray-400 truncate">作: {creation.creator?.name || '匿名'}</p>
      </div>
    </button>
  );
};

export default CreationCard;