import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

// 統計カード用のアイコン
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const CoursesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const ActivityIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
  </svg>
);

const CompletionIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: 'blue' | 'green' | 'purple' | 'amber';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
  };

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-md p-6 ${onClick ? 'cursor-pointer' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // モックデータ（後でSupabaseから取得）
  const stats = {
    totalUsers: 0,
    totalCourses: 0,
    activeUsers: 0,
    completionRate: '0%',
  };

  const quickActions = [
    {
      title: '新しいコースを作成',
      description: '新しいプログラミングコースを追加',
      color: 'bg-blue-500',
      onClick: () => navigate('/admin/courses/new'),
    },
    {
      title: 'ユーザーを管理',
      description: 'ユーザーの権限と情報を管理',
      color: 'bg-green-500',
      onClick: () => navigate('/admin/users'),
    },
    {
      title: '統計を表示',
      description: '詳細な分析データを確認',
      color: 'bg-purple-500',
      onClick: () => navigate('/admin/analytics'),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* ウェルカムメッセージ */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
          おかえりなさい、{user?.name}さん 👋
        </h1>
        <p className="text-slate-600">
          管理者ダッシュボードへようこそ。ここからプラットフォーム全体を管理できます。
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="総ユーザー数"
          value={stats.totalUsers}
          icon={UsersIcon}
          color="blue"
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          title="総コース数"
          value={stats.totalCourses}
          icon={CoursesIcon}
          color="green"
          onClick={() => navigate('/admin/courses')}
        />
        <StatCard
          title="アクティブユーザー"
          value={stats.activeUsers}
          icon={ActivityIcon}
          color="purple"
        />
        <StatCard
          title="平均完了率"
          value={stats.completionRate}
          icon={CompletionIcon}
          color="amber"
        />
      </div>

      {/* クイックアクション */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              onClick={action.onClick}
              className="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`${action.color} w-12 h-12 rounded-lg mb-4 flex items-center justify-center`}>
                <span className="text-white text-2xl">+</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{action.title}</h3>
              <p className="text-sm text-slate-600">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 最近のアクティビティ（プレースホルダー） */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">最近のアクティビティ</h2>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-slate-500 text-center py-8">
            アクティビティデータは近日公開予定です
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
