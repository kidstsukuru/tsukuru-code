import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import {
  getUserSubscription,
  getSubscriptionHistory,
  getDaysUntilRenewal,
  cancelSubscription,
} from '../services/subscriptionService';
import type { Subscription, SubscriptionHistory } from '../types';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const CrownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v.756a49.106 49.106 0 019.152 1 .75.75 0 01-.152 1.485h-1.918l2.474 10.124a.75.75 0 01-.375.84A6.723 6.723 0 0118.75 18a6.723 6.723 0 01-3.181-.795.75.75 0 01-.375-.84l2.474-10.124H12.75v13.28c0 .414.336.75.75.75h2.25a.75.75 0 010 1.5H8.25a.75.75 0 010-1.5h2.25a.75.75 0 00.75-.75V6.241H6.332l2.474 10.124a.75.75 0 01-.375.84A6.723 6.723 0 015.25 18a6.723 6.723 0 01-3.181-.795.75.75 0 01-.375-.84L4.168 6.241H2.25a.75.75 0 01-.152-1.485 49.105 49.105 0 019.152-1V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [subData, historyData] = await Promise.all([
        getUserSubscription(user.uid),
        getSubscriptionHistory(user.uid, 10),
      ]);

      setSubscription(subData);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error('サブスクリプション情報の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription || !window.confirm('本当にサブスクリプションをキャンセルしますか？\n現在の期間終了後にダウングレードされます。')) {
      return;
    }

    try {
      setCanceling(true);
      await cancelSubscription(subscription.id, true);
      toast.success('サブスクリプションのキャンセルを受け付けました');
      await loadSubscriptionData();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('キャンセル処理に失敗しました');
    } finally {
      setCanceling(false);
    }
  };

  const getPlanDisplayInfo = (planName: string) => {
    switch (planName) {
      case 'free':
        return {
          name: '無料プラン',
          color: 'from-gray-500 to-gray-700',
          icon: '🌟',
        };
      case 'premium':
        return {
          name: 'プレミアムプラン',
          color: 'from-cyan-500 to-blue-600',
          icon: '💎',
        };
      case 'family':
        return {
          name: 'ファミリープラン',
          color: 'from-fuchsia-500 to-purple-600',
          icon: '👨‍👩‍👧‍👦',
        };
      default:
        return {
          name: 'プラン',
          color: 'from-gray-500 to-gray-700',
          icon: '📦',
        };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: '作成',
      upgraded: 'アップグレード',
      downgraded: 'ダウングレード',
      canceled: 'キャンセル',
      renewed: '更新',
      payment_failed: '支払い失敗',
      status_changed: 'ステータス変更',
    };
    return labels[action] || action;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">サブスクリプション情報が見つかりません</h2>
          <Button onClick={() => navigate('/pricing')}>プランを選択</Button>
        </div>
      </div>
    );
  }

  const planInfo = getPlanDisplayInfo(subscription.plan?.name || 'free');
  const daysUntilRenewal = getDaysUntilRenewal(subscription);
  const isFree = subscription.plan?.name === 'free';
  const isPremium = subscription.plan?.name === 'premium' || subscription.plan?.name === 'family';

  return (
    <div className="min-h-screen bg-amber-50 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">サブスクリプション管理</h1>
          <p className="text-gray-600">プランの確認と変更ができます</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="overflow-hidden">
                <div className={`h-32 bg-gradient-to-r ${planInfo.color} relative`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl mb-2">{planInfo.icon}</div>
                      <h2 className="text-2xl font-bold text-white">{planInfo.name}</h2>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">月額料金</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {subscription.plan?.price === 0 ? '無料' : `¥${subscription.plan?.price.toLocaleString()}`}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">ステータス</p>
                      <div className="flex items-center gap-2">
                        {subscription.status === 'active' ? (
                          <>
                            <CheckCircleIcon className="w-6 h-6 text-green-500" />
                            <span className="text-lg font-semibold text-green-600">アクティブ</span>
                          </>
                        ) : (
                          <span className="text-lg font-semibold text-gray-600">{subscription.status}</span>
                        )}
                      </div>
                    </div>

                    {!isFree && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            開始日
                          </p>
                          <p className="text-gray-800 font-medium">{formatDate(subscription.current_period_start)}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            次回更新日
                          </p>
                          <p className="text-gray-800 font-medium">
                            {formatDate(subscription.current_period_end)}
                            {daysUntilRenewal > 0 && (
                              <span className="text-sm text-gray-500 ml-2">({daysUntilRenewal}日後)</span>
                            )}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {subscription.cancel_at_period_end && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-yellow-800 font-medium">
                        ⚠️ このサブスクリプションは {formatDate(subscription.current_period_end)} に終了します
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {isFree && (
                      <Button
                        onClick={() => navigate('/pricing')}
                        variant="primary"
                        className="flex items-center gap-2"
                      >
                        <CrownIcon className="w-5 h-5" />
                        プレミアムにアップグレード
                      </Button>
                    )}

                    {isPremium && !subscription.cancel_at_period_end && (
                      <>
                        <Button onClick={() => navigate('/pricing')} variant="secondary">
                          プランを変更
                        </Button>
                        <Button
                          onClick={handleCancelSubscription}
                          disabled={canceling}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                        >
                          {canceling ? 'キャンセル中...' : 'サブスクリプションをキャンセル'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Features Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">プラン機能</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {subscription.plan?.features && (
                      <>
                        <div className="flex items-start gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-800">コースアクセス</p>
                            <p className="text-sm text-gray-600">
                              {subscription.plan.features.courses_access === 'all' ? '全コース無制限' : `${subscription.plan.limits.max_courses}コースまで`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-800">レベル制限</p>
                            <p className="text-sm text-gray-600">
                              {subscription.plan.features.max_level === 'unlimited' ? '無制限' : `レベル${subscription.plan.features.max_level}まで`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-800">作品投稿</p>
                            <p className="text-sm text-gray-600">
                              {subscription.plan.features.creations_per_month === 'unlimited' ? '無制限' : `月${subscription.plan.features.creations_per_month}作品まで`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-800">広告</p>
                            <p className="text-sm text-gray-600">
                              {subscription.plan.features.ads ? 'あり' : 'なし'}
                            </p>
                          </div>
                        </div>

                        {subscription.plan.features.badges && (
                          <div className="flex items-start gap-2">
                            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-800">特別バッジ</p>
                              <p className="text-sm text-gray-600">獲得可能</p>
                            </div>
                          </div>
                        )}

                        {subscription.plan.features.priority_support && (
                          <div className="flex items-start gap-2">
                            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-800">優先サポート</p>
                              <p className="text-sm text-gray-600">{subscription.plan.features.priority_response_time}以内に対応</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* History Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">履歴</h3>
                  {history.length > 0 ? (
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div key={item.id} className="border-l-2 border-amber-500 pl-3 py-1">
                          <p className="text-sm font-medium text-gray-800">{getActionLabel(item.action)}</p>
                          <p className="text-xs text-gray-500">{formatDate(item.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">履歴はありません</p>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">クイックアクション</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/pricing')}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors text-gray-800"
                    >
                      プラン一覧を見る
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors text-gray-800"
                    >
                      ダッシュボードに戻る
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
