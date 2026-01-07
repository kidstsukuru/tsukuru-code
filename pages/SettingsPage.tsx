import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore, FontSize, Theme } from '../store/settingsStore';
import { supabase } from '../services/supabaseService';

// アイコンコンポーネント
const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

const PaintBrushIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
);

const AcademicCapIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
);

// トグルスイッチコンポーネント
const ToggleSwitch: React.FC<{
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    label: string;
    description?: string;
}> = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
        <div className="flex-1">
            <p className="font-medium text-gray-800">{label}</p>
            {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${enabled ? 'bg-amber-500' : 'bg-gray-200'
                }`}
            role="switch"
            aria-checked={enabled}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    </div>
);

// セクションカードコンポーネント
const SettingsSection: React.FC<{
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}> = ({ icon, title, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-6"
    >
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                {icon}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        {children}
    </motion.div>
);

// DiceBear アバタースタイル
const AVATAR_STYLES = [
    { id: 'adventurer', name: '冒険者', emoji: '🗡️' },
    { id: 'avataaars', name: 'カートゥーン', emoji: '😎' },
    { id: 'big-ears', name: 'ビッグイヤー', emoji: '👂' },
    { id: 'bottts', name: 'ロボット', emoji: '🤖' },
    { id: 'fun-emoji', name: '絵文字', emoji: '😀' },
    { id: 'lorelei', name: 'ロレライ', emoji: '👩' },
    { id: 'micah', name: 'ミカ', emoji: '🧑' },
    { id: 'pixel-art', name: 'ピクセル', emoji: '👾' },
    { id: 'thumbs', name: 'サムズ', emoji: '👍' },
];

// DiceBear アバターURL生成
const getDiceBearUrl = (style: string, seed: string) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=fef3c7,fed7aa,fecaca,d9f99d,a5f3fc,c4b5fd`;
};

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, updateAvatar } = useAuthStore();
    const settings = useSettingsStore();

    // プロフィール編集用の状態
    const [nickname, setNickname] = useState(user?.name || '');
    const [bio, setBio] = useState('');
    const [avatarStyle, setAvatarStyle] = useState('adventurer');
    const [avatarSeed, setAvatarSeed] = useState(user?.name || 'default');
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    // パスワード変更用の状態
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    // メールアドレス変更用の状態
    const [newEmail, setNewEmail] = useState('');
    const [isEmailLoading, setIsEmailLoading] = useState(false);

    // アカウント削除確認
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // プロフィール情報を読み込み
    useEffect(() => {
        const loadProfile = async () => {
            if (!user?.uid) return;

            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('name, bio, avatar_style, avatar_seed')
                    .eq('id', user.uid)
                    .single();

                if (data && !error) {
                    setNickname(data.name || '');
                    setBio(data.bio || '');
                    setAvatarStyle(data.avatar_style || 'adventurer');
                    setAvatarSeed(data.avatar_seed || data.name || 'default');
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            }
        };

        loadProfile();
    }, [user?.uid]);

    // プロフィール更新
    const handleUpdateProfile = async () => {
        if (!user?.uid) return;

        setIsProfileLoading(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    name: nickname,
                    bio: bio,
                    avatar_style: avatarStyle,
                    avatar_seed: avatarSeed,
                })
                .eq('id', user.uid);

            if (error) throw error;

            // ストアのアバター情報を更新（ヘッダーに即座に反映）
            updateAvatar(avatarStyle, avatarSeed);

            toast.success('プロフィールを更新しました！');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error('プロフィールの更新に失敗しました');
        } finally {
            setIsProfileLoading(false);
        }
    };

    // パスワード変更
    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('新しいパスワードが一致しません');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('パスワードは6文字以上である必要があります');
            return;
        }

        setIsPasswordLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;

            toast.success('パスワードを変更しました！');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            toast.error('パスワードの変更に失敗しました');
        } finally {
            setIsPasswordLoading(false);
        }
    };

    // メールアドレス変更
    const handleChangeEmail = async () => {
        if (!newEmail || !newEmail.includes('@')) {
            toast.error('正しいメールアドレスを入力してください');
            return;
        }

        setIsEmailLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                email: newEmail,
            });

            if (error) throw error;

            toast.success('確認メールを送信しました。メールを確認してください。');
            setNewEmail('');
        } catch (error: any) {
            console.error('Error changing email:', error);
            toast.error('メールアドレスの変更に失敗しました');
        } finally {
            setIsEmailLoading(false);
        }
    };

    // アカウント削除
    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== '削除する') {
            toast.error('確認のため「削除する」と入力してください');
            return;
        }

        // 注意: Supabaseでのアカウント削除は管理者権限が必要
        // ここでは削除リクエストを記録する形にするか、
        // Edge Functionを使用する必要があります
        toast.error('アカウント削除は管理者にお問い合わせください');
        setShowDeleteConfirm(false);
        setDeleteConfirmText('');
    };

    // プッシュ通知の許可をリクエスト
    const handleEnablePushNotifications = async () => {
        if (!('Notification' in window)) {
            toast.error('このブラウザはプッシュ通知に対応していません');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                settings.setPushNotificationsEnabled(true);
                toast.success('プッシュ通知を有効にしました！');
            } else {
                settings.setPushNotificationsEnabled(false);
                toast.error('プッシュ通知の許可が拒否されました');
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            toast.error('プッシュ通知の設定に失敗しました');
        }
    };

    const fontSizeOptions: { value: FontSize; label: string }[] = [
        { value: 'small', label: '小' },
        { value: 'medium', label: '中' },
        { value: 'large', label: '大' },
    ];

    const themeOptions: { value: Theme; label: string; icon: string }[] = [
        { value: 'light', label: 'ライト', icon: '☀️' },
        { value: 'dark', label: 'ダーク', icon: '🌙' },
        { value: 'system', label: 'システム', icon: '💻' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pb-24 lg:pb-8">
            {/* ヘッダー */}
            <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="戻る"
                        >
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">⚙️ 設定</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 max-w-2xl">
                {/* プロフィール設定 */}
                <SettingsSection icon={<UserIcon className="w-5 h-5" />} title="プロフィール設定">
                    <div className="space-y-4">
                        {/* アバター選択 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                アバターを選択
                            </label>
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                {/* 現在のアバタープレビュー */}
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 p-2 shadow-lg">
                                        <img
                                            src={getDiceBearUrl(avatarStyle, avatarSeed)}
                                            alt="アバタープレビュー"
                                            className="w-full h-full rounded-xl"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setAvatarSeed(`${nickname}-${Date.now()}`)}
                                        className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                                    >
                                        🎲 ランダム生成
                                    </button>
                                </div>

                                {/* スタイル選択グリッド */}
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-2">スタイルを選択:</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {AVATAR_STYLES.map((style) => (
                                            <button
                                                key={style.id}
                                                type="button"
                                                onClick={() => setAvatarStyle(style.id)}
                                                className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${avatarStyle === style.id
                                                    ? 'border-amber-500 bg-amber-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <img
                                                    src={getDiceBearUrl(style.id, avatarSeed)}
                                                    alt={style.name}
                                                    className="w-10 h-10 rounded-lg"
                                                />
                                                <span className="text-xs font-medium">{style.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ニックネーム */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ニックネーム
                            </label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="表示名を入力"
                            />
                        </div>

                        {/* 自己紹介 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                自己紹介
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                                placeholder="自己紹介を入力（作品ページなどで表示されます）"
                            />
                        </div>

                        <button
                            onClick={handleUpdateProfile}
                            disabled={isProfileLoading}
                            className="w-full py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                        >
                            {isProfileLoading ? '保存中...' : 'プロフィールを保存'}
                        </button>
                    </div>
                </SettingsSection>

                {/* アカウント・セキュリティ */}
                <SettingsSection icon={<LockIcon className="w-5 h-5" />} title="アカウント・セキュリティ">
                    <div className="space-y-6">
                        {/* メールアドレス変更 */}
                        <div>
                            <h3 className="font-medium text-gray-800 mb-2">メールアドレス変更</h3>
                            <p className="text-sm text-gray-500 mb-2">現在: {user?.email}</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="新しいメールアドレス"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleChangeEmail}
                                    disabled={isEmailLoading}
                                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                                >
                                    {isEmailLoading ? '...' : '変更'}
                                </button>
                            </div>
                        </div>

                        {/* パスワード変更 */}
                        <div>
                            <h3 className="font-medium text-gray-800 mb-2">パスワード変更</h3>
                            <div className="space-y-2">
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="新しいパスワード"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="新しいパスワード（確認）"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleChangePassword}
                                    disabled={isPasswordLoading}
                                    className="w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                                >
                                    {isPasswordLoading ? '変更中...' : 'パスワードを変更'}
                                </button>
                            </div>
                        </div>

                        {/* アカウント削除 */}
                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="font-medium text-red-600 mb-2">⚠️ 危険な操作</h3>
                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    アカウントを削除
                                </button>
                            ) : (
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <p className="text-sm text-red-700 mb-3">
                                        アカウントと全てのデータが削除されます。この操作は取り消せません。
                                        <br />確認のため「削除する」と入力してください。
                                    </p>
                                    <input
                                        type="text"
                                        value={deleteConfirmText}
                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                        placeholder="削除する"
                                        className="w-full px-4 py-2 border border-red-300 rounded-lg mb-2"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setShowDeleteConfirm(false);
                                                setDeleteConfirmText('');
                                            }}
                                            className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            キャンセル
                                        </button>
                                        <button
                                            onClick={handleDeleteAccount}
                                            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            削除する
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </SettingsSection>

                {/* 通知設定 */}
                <SettingsSection icon={<BellIcon className="w-5 h-5" />} title="通知設定">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between py-3">
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">プッシュ通知</p>
                                <p className="text-sm text-gray-500">ブラウザ通知でお知らせを受け取る</p>
                            </div>
                            <button
                                onClick={handleEnablePushNotifications}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${settings.pushNotificationsEnabled
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-amber-500 text-white hover:bg-amber-600'
                                    }`}
                            >
                                {settings.pushNotificationsEnabled ? '有効' : '許可する'}
                            </button>
                        </div>

                        <ToggleSwitch
                            enabled={settings.emailNotificationsEnabled}
                            onChange={settings.setEmailNotificationsEnabled}
                            label="お知らせメール"
                            description="新機能やイベントのお知らせを受け取る"
                        />

                        <ToggleSwitch
                            enabled={settings.learningReminderEnabled}
                            onChange={settings.setLearningReminderEnabled}
                            label="学習リマインダー"
                            description="毎日の学習を忘れないようにお知らせ"
                        />

                        {settings.learningReminderEnabled && (
                            <div className="pl-4 border-l-2 border-amber-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    リマインダー時刻
                                </label>
                                <input
                                    type="time"
                                    value={settings.reminderTime}
                                    onChange={(e) => settings.setReminderTime(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                        )}
                    </div>
                </SettingsSection>

                {/* 表示・UI設定 */}
                <SettingsSection icon={<PaintBrushIcon className="w-5 h-5" />} title="表示・UI設定">
                    <div className="space-y-6">
                        {/* テーマ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                テーマ
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {themeOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => settings.setTheme(option.value)}
                                        className={`p-4 rounded-xl border-2 transition-all ${settings.theme === option.value
                                            ? 'border-amber-500 bg-amber-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="text-2xl block mb-1">{option.icon}</span>
                                        <span className="text-sm font-medium">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 文字サイズ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                文字サイズ
                            </label>
                            <div className="flex gap-3">
                                {fontSizeOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => settings.setFontSize(option.value)}
                                        className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${settings.fontSize === option.value
                                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                        style={{
                                            fontSize: option.value === 'small' ? '14px' : option.value === 'large' ? '18px' : '16px',
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <ToggleSwitch
                            enabled={settings.animationsEnabled}
                            onChange={settings.setAnimationsEnabled}
                            label="アニメーション"
                            description="画面の動きやエフェクトを表示する"
                        />
                    </div>
                </SettingsSection>

                {/* 学習設定 */}
                <SettingsSection icon={<AcademicCapIcon className="w-5 h-5" />} title="学習設定">
                    <div className="space-y-4">
                        <ToggleSwitch
                            enabled={settings.soundEnabled}
                            onChange={settings.setSoundEnabled}
                            label="効果音"
                            description="レッスン完了時などに効果音を鳴らす"
                        />

                        {/* 学習目標 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                1日の学習目標
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="10"
                                    max="120"
                                    step="10"
                                    value={settings.dailyGoalMinutes}
                                    onChange={(e) => settings.setDailyGoalMinutes(Number(e.target.value))}
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                                <span className="w-20 text-center font-bold text-amber-600">
                                    {settings.dailyGoalMinutes}分
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                毎日 {settings.dailyGoalMinutes} 分を目標に学習しましょう！
                            </p>
                        </div>
                    </div>
                </SettingsSection>

                {/* リセットボタン */}
                <div className="text-center mt-8">
                    <button
                        onClick={() => {
                            settings.resetSettings();
                            toast.success('設定をリセットしました');
                        }}
                        className="text-gray-500 hover:text-gray-700 text-sm underline"
                    >
                        すべての設定をデフォルトに戻す
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
