import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import LazyImage from '../common/LazyImage';
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

  // デスクトップのみで3Dティルト効果を有効化（パフォーマンス最適化）
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // 3D Tilt Effect Logic (デスクトップのみ)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return; // モバイルでは無効化
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    if (isMobile) return; // モバイルでは無効化
    x.set(0);
    y.set(0);
  };

  const handleClick = () => {
    navigate(`/creations/${creation.id}`);
  };

  const defaultThumbnail = 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=800&auto=format&fit=crop';

  // URLが有効かどうかをチェック
  const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const thumbnailUrl = isValidUrl(creation.thumbnail_url) ? creation.thumbnail_url : defaultThumbnail;

  return (
    <motion.div
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="group relative cursor-pointer perspective-1000"
    >
      {/* Glassmorphism Card Container */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-xl transition-all duration-300 group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/20">

        {/* Holographic Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <LazyImage
            src={imgError ? defaultThumbnail : thumbnailUrl}
            alt={creation.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Overlay with Play Button */}
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50 text-white"
            >
              <PlayIcon className="w-8 h-8 ml-1" />
            </motion.div>
          </div>

          {/* Stats Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
            <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-pink-400 flex items-center gap-1 border border-white/10">
              ❤️ {creation.likes}
            </div>
            <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-cyan-400 flex items-center gap-1 border border-white/10">
              ▶️ {creation.plays}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 relative z-20 bg-gradient-to-b from-transparent to-slate-900/80">
          <h3 className="font-bold text-white truncate group-hover:text-cyan-400 transition-colors text-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {creation.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {creation.creator?.avatar_style && creation.creator?.avatar_seed ? (
              <img
                src={`https://api.dicebear.com/7.x/${creation.creator.avatar_style}/svg?seed=${creation.creator.avatar_seed}`}
                alt={creation.creator.name}
                className="w-5 h-5 rounded-full border border-cyan-500/50"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                {creation.creator?.name?.charAt(0) || '?'}
              </div>
            )}
            <p className="text-xs text-gray-300 truncate">
              {creation.creator?.name || '匿名クリエイター'}
            </p>
          </div>
        </div>

        {/* Glowing Border Effect on Hover */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-cyan-400/30 transition-colors duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
};

export default CreationCard;