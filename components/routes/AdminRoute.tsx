import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface AdminRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

/**
 * 管理者専用ルートを保護するコンポーネント
 * - 認証されていないユーザーはログインページへリダイレクト
 * - 管理者権限がないユーザーはダッシュボードへリダイレクト
 * - requireSuperAdmin=trueの場合、スーパー管理者のみアクセス可能
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children, requireSuperAdmin = false }) => {
  const { isAuthenticated, isAdmin, isSuperAdmin } = useAuthStore();

  // 未認証ユーザーはログインページへ
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // スーパー管理者権限が必要な場合
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // 管理者権限が必要な場合
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // 権限がある場合はコンテンツを表示
  return <>{children}</>;
};

export default AdminRoute;
