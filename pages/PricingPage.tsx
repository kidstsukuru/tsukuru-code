import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import GalaxyBackground from '../components/creations/GalaxyBackground';
import Button from '../components/common/Button';
import { getPlans } from '../services/subscriptionService';
import { useAuthStore } from '../store/authStore';
import type { Plan } from '../types';

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
  </svg>
);

const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('プランの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planName: string) => {
    if (!user) {
      toast.error('プランを選択するにはログインが必要です');
      navigate('/login');
      return;
    }

    if (planName === 'free') {
      toast.success('無料プランは自動的に適用されています');
      return;
    }

    setSelectedPlan(planName);
    // TODO: Stripe Checkoutへのリダイレクト
    toast.success(`${planName === 'premium' ? 'プレミアム' : 'ファミリー'}プランが選択されました`);
  };

  const getPlanFeatures = (plan: Plan): string[] => {
    const features: string[] = [];

    // コースアクセス
    if (plan.features.courses_access === 'all') {
      features.push('全コース無制限アクセス');
    } else {
      features.push(`${plan.limits.max_courses}つのコースまで利用可能`);
    }

    // レベル制限
    if (plan.features.max_level === 'unlimited') {
      features.push('全レベル無制限チャレンジ');
    } else {
      features.push(`レベル${plan.features.max_level}まで挑戦可能`);
    }

    // 作品投稿
    if (plan.features.creations_per_month === 'unlimited') {
      features.push('作品投稿無制限');
    } else {
      features.push(`月${plan.features.creations_per_month}作品まで投稿可能`);
    }

    // 広告
    if (!plan.features.ads) {
      features.push('広告なし');
    }

    // バッジ
    if (plan.features.badges) {
      features.push('特別バッジ獲得');
    }

    // 学習レポート
    if (plan.features.progress_reports) {
      features.push('詳細な学習レポート');
    }

    // 優先サポート
    if (plan.features.priority_support) {
      features.push(`優先サポート（${plan.features.priority_response_time || '24h'}以内）`);
    } else {
      features.push('コミュニティサポート');
    }

    // ファミリープラン特典
    if (plan.features.family_accounts) {
      features.push(`家族${plan.features.family_accounts}人分のアカウント`);
    }

    if (plan.features.parent_dashboard) {
      features.push('保護者ダッシュボード');
    }

    if (plan.features.learning_time_management) {
      features.push('学習時間管理機能');
    }

    if (plan.features.family_gallery) {
      features.push('ファミリーギャラリー');
    }

    return features;
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'free':
        return 'from-gray-500 to-gray-700';
      case 'premium':
        return 'from-cyan-500 to-blue-600';
      case 'family':
        return 'from-fuchsia-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  const isPlanPopular = (planName: string) => planName === 'premium';

  return (
    <div className="relative min-h-screen text-gray-200 overflow-hidden">
      <GalaxyBackground />

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4"
            style={{
              textShadow: '0 0 20px rgba(6, 182, 212, 0.8), 0 0 40px rgba(217, 70, 239, 0.6)',
              background: 'linear-gradient(to right, #22d3ee, #e879f9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            あなたに最適なプランを選ぼう
          </h1>
          <p className="text-cyan-200 text-lg sm:text-xl font-medium">
            プログラミングの宇宙で、無限の可能性を解き放とう
          </p>
        </motion.div>

        {/* Pricing Cards */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => {
              const features = getPlanFeatures(plan);
              const isPopular = isPlanPopular(plan.name);

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="relative"
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                        <StarIcon className="w-4 h-4" />
                        人気No.1
                      </div>
                    </div>
                  )}

                  {/* Card */}
                  <div
                    className={`relative h-full rounded-3xl overflow-hidden border-2 transition-all duration-300 ${
                      isPopular
                        ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)] scale-105'
                        : 'border-white/20 hover:border-cyan-500/50'
                    } bg-slate-900/60 backdrop-blur-xl`}
                  >
                    {/* Gradient Header */}
                    <div className={`h-32 bg-gradient-to-r ${getPlanColor(plan.name)} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <h3 className="text-2xl font-bold text-white mb-1">{plan.display_name}</h3>
                        {plan.description && (
                          <p className="text-white/80 text-sm">{plan.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      {/* Price */}
                      <div className="mb-6 text-center">
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-5xl font-black text-white">
                            {plan.price === 0 ? '無料' : `¥${plan.price.toLocaleString()}`}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-gray-400 text-lg">/月</span>
                          )}
                        </div>
                        {plan.price > 0 && (
                          <p className="text-gray-400 text-sm mt-2">
                            年払いで2ヶ月分お得（準備中）
                          </p>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-3 mb-8">
                        {features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-200">
                            <CheckIcon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <Button
                        onClick={() => handleSelectPlan(plan.name)}
                        variant={isPopular ? 'primary' : 'secondary'}
                        className="w-full"
                        disabled={selectedPlan === plan.name}
                      >
                        {plan.name === 'free'
                          ? '利用中'
                          : selectedPlan === plan.name
                          ? '選択済み'
                          : 'このプランを選ぶ'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center text-white mb-8">よくある質問</h2>
          <div className="space-y-4">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-cyan-400 mb-2">無料プランでどこまで学べますか？</h3>
              <p className="text-gray-300">
                無料プランでは3つのコースとレベル5までチャレンジ可能です。プログラミングの基礎をしっかり学べます。
              </p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-cyan-400 mb-2">いつでもプランを変更できますか？</h3>
              <p className="text-gray-300">
                はい、いつでもアップグレード・ダウングレードが可能です。差額は日割り計算されます。
              </p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-cyan-400 mb-2">ファミリープランは何人まで使えますか？</h3>
              <p className="text-gray-300">
                ファミリープランでは、親アカウント1つと子アカウント最大4つ（合計5人）まで利用できます。
              </p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-cyan-400 mb-2">支払い方法は何が使えますか？</h3>
              <p className="text-gray-300">
                クレジットカード（Visa、Mastercard、American Express、JCB）に対応しています。
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-4">
            まだ迷っていますか？無料プランで始めて、いつでもアップグレードできます。
          </p>
          <Button onClick={() => navigate('/dashboard')} variant="secondary">
            ダッシュボードに戻る
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;
