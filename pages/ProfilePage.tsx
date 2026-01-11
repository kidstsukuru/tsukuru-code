import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import Card from '../components/common/Card';
import BadgeIcon from '../components/dashboard/BadgeIcon';
import Button from '../components/common/Button';
import Header from '../components/layout/Header';
import BottomNav from '../components/navigation/BottomNav';
import { getDiceBearUrl } from '../utils/avatarHelpers';

const ProfilePage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return null;
    }

    // レベルアップに必要なXP計算
    const xpForNextLevel = user.level * 100;
    const xpProgress = (user.xp % xpForNextLevel) / xpForNextLevel * 100;

    // 獲得バッジ数
    const earnedBadges = user.badges.filter(b => b.acquired).length;
    const totalBadges = user.badges.length;

    return (
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 min-h-screen pb-20 lg:pb-0">
            <Header />

            <main id="main-content" className="container mx-auto px-4 py-6 max-w-4xl">
                {/* プロフィールヘッダー */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Card className="p-6 sm:p-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white overflow-hidden relative">
                        {/* 背景装飾 */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                            {/* アバター */}
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white"
                            >
                                <img
                                    src={getDiceBearUrl(user.avatarStyle || 'adventurer', user.avatarSeed || user.name)}
                                    alt="アバター"
                                    className="w-full h-full"
                                />
                            </motion.div>

                            {/* ユーザー情報 */}
                            <div className="text-center sm:text-left flex-1">
                                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{user.name}</h1>
                                <p className="text-amber-100 mb-4">{user.email}</p>

                                {/* レベル・XP */}
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                                        <span className="text-2xl">⭐</span>
                                        <span className="font-bold">Lv.{user.level}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                                        <span className="text-2xl">✨</span>
                                        <span className="font-bold">{user.xp} XP</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                                        <span className="text-2xl">🔥</span>
                                        <span className="font-bold">{user.loginStreak}{t('dashboard.dayStreak')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 設定ボタン */}
                            <Button
                                variant="secondary"
                                onClick={() => navigate('/settings')}
                                className="!bg-white !text-amber-600 hover:!bg-amber-50"
                            >
                                ⚙️ {t('settings.profile.title')}
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                {/* 統計カード */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
                >
                    <Card className="p-4 text-center">
                        <div className="text-3xl mb-2">📚</div>
                        <p className="text-2xl font-bold text-gray-800">
                            {Object.values(user.progress).reduce((acc, p) => acc + p.completedLessons.length, 0)}
                        </p>
                        <p className="text-sm text-gray-500">完了レッスン</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <div className="text-3xl mb-2">🏆</div>
                        <p className="text-2xl font-bold text-gray-800">{earnedBadges}</p>
                        <p className="text-sm text-gray-500">獲得バッジ</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <div className="text-3xl mb-2">⭐</div>
                        <p className="text-2xl font-bold text-gray-800">{user.level}</p>
                        <p className="text-sm text-gray-500">現在レベル</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <div className="text-3xl mb-2">🔥</div>
                        <p className="text-2xl font-bold text-gray-800">{user.loginStreak}</p>
                        <p className="text-sm text-gray-500">連続ログイン</p>
                    </Card>
                </motion.div>

                {/* XP進捗 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800">次のレベルまで</h2>
                            <span className="text-sm text-gray-500">
                                {user.xp % xpForNextLevel} / {xpForNextLevel} XP
                            </span>
                        </div>
                        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${xpProgress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                            />
                        </div>
                        <p className="text-center mt-3 text-sm text-gray-600">
                            あと <span className="font-bold text-amber-600">{xpForNextLevel - (user.xp % xpForNextLevel)} XP</span> でレベルアップ！
                        </p>
                    </Card>
                </motion.div>

                {/* バッジコレクション */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">🏆 {t('badges.badges')}</h2>
                        <span className="text-sm text-gray-500">{earnedBadges} / {totalBadges}</span>
                    </div>
                    <Card className="p-6">
                        {user.badges.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-4xl mb-3">🎯</div>
                                <p>まだバッジを獲得していません</p>
                                <p className="text-sm mt-2">レッスンをクリアしてバッジをゲットしよう！</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                                {user.badges.map((badge, index) => (
                                    <motion.div
                                        key={badge.id}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 + index * 0.05 }}
                                    >
                                        <BadgeIcon badge={badge} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* アクションボタン */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Button
                        variant="primary"
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center justify-center gap-2"
                    >
                        📚 {t('dashboard.startLearning')}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/creations')}
                        className="flex items-center justify-center gap-2"
                    >
                        🎮 クリエイターズワールド
                    </Button>
                </motion.div>
            </main>

            <BottomNav />
        </div>
    );
};

export default ProfilePage;
