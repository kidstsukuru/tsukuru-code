import React from 'react';
import CreationCard from '../components/creations/CreationCard';

type Creation = {
  id: string;
  title: string;
  creator: string;
  thumbnailUrl: string;
  plays: number;
  likes: number;
};

const dummyCreations: Creation[] = [
    { id: '1', title: 'ギャラクシー・ランナー', creator: '宇宙コーダー', thumbnailUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=800&auto=format&fit=crop', plays: 1024, likes: 256 },
    { id: '2', title: 'サイバー・メイズ', creator: 'ネオンハッカー', thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=800&auto=format&fit=crop', plays: 876, likes: 192 },
    { id: '3', title: '時空を超える猫', creator: 'クロノキャット', thumbnailUrl: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=800&auto=format&fit=crop', plays: 1532, likes: 411 },
    { id: '4', title: 'ロボット・ファクトリー', creator: 'メカニックマスター', thumbnailUrl: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?q=80&w=800&auto=format&fit=crop', plays: 541, likes: 98 },
    { id: '5', title: 'エイリアン・インベージョン', creator: 'スペースガード', thumbnailUrl: 'https://images.unsplash.com/photo-1610986612456-107ac7533658?q=80&w=800&auto=format&fit=crop', plays: 2048, likes: 512 },
    { id: '6', title: 'スターライト・パズル', creator: 'パズル博士', thumbnailUrl: 'https://images.unsplash.com/photo-1597773150796-e5c14ebecbf5?q=80&w=800&auto=format&fit=crop', plays: 789, likes: 150 },
    { id: '7', title: '深海ドローン', creator: 'アクアプログラマー', thumbnailUrl: 'https://images.unsplash.com/photo-1560303970-d538a867b355?q=80&w=800&auto=format&fit=crop', plays: 630, likes: 120 },
    { id: '8', title: 'ピクセル・ジャンパー', creator: 'ドット絵職人', thumbnailUrl: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?q=80&w=800&auto=format&fit=crop', plays: 3012, likes: 890 },
    { id: '9', title: '軌道エレベーター物語', creator: 'SF作家', thumbnailUrl: 'https://images.unsplash.com/photo-1520034475321-cbe63696469a?q=80&w=800&auto=format&fit=crop', plays: 998, likes: 234 },
    { id: '10', title: 'コード・オブ・ドラゴン', creator: 'ファンタジスタ', thumbnailUrl: 'https://images.unsplash.com/photo-1551739440-5dd934d3a94a?q=80&w=800&auto=format&fit=crop', plays: 1842, likes: 456 },
    { id: '11', title: '反重力レーサー', creator: 'スピード狂', thumbnailUrl: 'https://images.unsplash.com/photo-1541410965328-3e9565557a26?q=80&w=800&auto=format&fit=crop', plays: 1120, likes: 333 },
    { id: '12', title: 'AIペット育成', creator: 'デジタルブリーダー', thumbnailUrl: 'https://images.unsplash.com/photo-1593349480503-62516c52b803?q=80&w=800&auto=format&fit=crop', plays: 2500, likes: 670 },
];

const featuredCreation = dummyCreations[4];

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);


const CreationsPage: React.FC = () => {
    
  return (
    <div className="container mx-auto px-6 py-12 text-gray-200">
      
      {/* Hero Section for Featured Creation */}
      <div className="mb-16">
        <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center mb-8"
            style={{ textShadow: '0 0 15px #06b6d4, 0 0 25px #d946ef' }}
        >
            <span className="text-cyan-400">クリエイターズ</span>
            <span className="text-fuchsia-500">ワールド</span>
        </h1>
        
        <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-cyan-500/20">
            <img src={featuredCreation.thumbnailUrl} alt={featuredCreation.title} className="w-full h-64 md:h-96 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/20" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}>
                    {featuredCreation.title}
                </h2>
                <p className="text-gray-300 mb-4">作: {featuredCreation.creator}</p>
                <button className="flex items-center gap-x-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/50 transform hover:-translate-y-0.5 transition-all duration-150">
                    <PlayIcon className="w-6 h-6" />
                    <span>今すぐプレイ！</span>
                </button>
            </div>
        </div>
      </div>
      
      {/* Gallery of Creations */}
      <div>
        <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-200">
                みんなの作品
            </h2>
            <p className="text-gray-400 mt-2">未来のクリエイターたちの作品がここに集結！</p>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-6">
          {dummyCreations.map(creation => (
            <CreationCard key={creation.id} creation={creation} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreationsPage;