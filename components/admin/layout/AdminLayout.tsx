import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * 管理画面の共通レイアウト
 * サイドバー + ヘッダー + メインコンテンツ
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* サイドバー */}
      <AdminSidebar />

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col">
        {/* ヘッダー */}
        <AdminHeader />

        {/* コンテンツ */}
        <main id="main-content" className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
