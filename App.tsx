import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import BottomNav from './components/navigation/BottomNav';
import SkipLink from './components/common/SkipLink';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import AdminRoute from './components/routes/AdminRoute';
import AdminLayout from './components/admin/layout/AdminLayout';
import { useAuthStore } from './store/authStore';
import './src/i18n/config'; // i18nの初期化

// 遅延ロード: 公開ページ（初期ロード時に必要な可能性が高い）
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// 遅延ロード: 保護されたページ（ログイン後）
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CoursePage = lazy(() => import('./pages/CoursePage'));
const LevelLessonsPage = lazy(() => import('./pages/LevelLessonsPage'));
const LessonViewPage = lazy(() => import('./pages/LessonViewPage'));

// 遅延ロード: クリエイターズワールド
const CreationsPage = lazy(() => import('./pages/CreationsPage'));
const CreationDetailPage = lazy(() => import('./pages/CreationDetailPage'));
const CreateCreationPage = lazy(() => import('./pages/CreateCreationPage'));
const EditCreationPage = lazy(() => import('./pages/EditCreationPage'));
const MyCreationsPage = lazy(() => import('./pages/MyCreationsPage'));

// 遅延ロード: サブスクリプション
const PricingPage = lazy(() => import('./pages/PricingPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));

// 遅延ロード: 設定
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// 遅延ロード: 管理画面（管理者のみアクセス）
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminCoursesPage = lazy(() => import('./pages/AdminCoursesPage'));
const AdminCourseFormPage = lazy(() => import('./pages/AdminCourseFormPage'));
const AdminLessonsPage = lazy(() => import('./pages/AdminLessonsPage'));
const AdminLessonFormPage = lazy(() => import('./pages/AdminLessonFormPage'));
const AdminLevelsPage = lazy(() => import('./pages/AdminLevelsPage'));
const AdminLevelFormPage = lazy(() => import('./pages/AdminLevelFormPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/AdminAnalyticsPage'));

// 認証が必要なルートを保護するコンポーネント
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// 認証済みユーザーがアクセスできないルート（ログイン、登録など）
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { authInitialized, initialize } = useAuthStore();

  // 初回マウント時に認証状態を復元
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 認証状態の初期化が完了するまでローディングを表示
  if (!authInitialized) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SkipLink />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#f59e0b',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            {/* 公開ルート */}
            <Route path="/" element={
              <div className="bg-amber-50 min-h-screen text-gray-800">
                <Header />
                <main id="main-content">
                  <HomePage />
                </main>
              </div>
            } />

            <Route path="/login" element={
              <PublicOnlyRoute>
                <div className="bg-amber-50 min-h-screen text-gray-800">
                  <Header />
                  <main id="main-content">
                    <LoginPage />
                  </main>
                </div>
              </PublicOnlyRoute>
            } />

            <Route path="/register" element={
              <PublicOnlyRoute>
                <div className="bg-amber-50 min-h-screen text-gray-800">
                  <Header />
                  <main id="main-content">
                    <RegisterPage />
                  </main>
                </div>
              </PublicOnlyRoute>
            } />

            {/* プライシングページ（誰でもアクセス可能） */}
            <Route path="/pricing" element={
              <div className="bg-slate-900 min-h-screen text-gray-800 pb-20 lg:pb-0">
                <Header />
                <main id="main-content">
                  <PricingPage />
                </main>
                <BottomNav />
              </div>
            } />

            {/* 保護されたルート（認証必須） */}
            <Route path="/subscription" element={
              <ProtectedRoute>
                <div className="bg-amber-50 min-h-screen text-gray-800 pb-20 lg:pb-0">
                  <Header />
                  <main id="main-content">
                    <SubscriptionPage />
                  </main>
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <div className="bg-amber-50 min-h-screen text-gray-800 pb-20 lg:pb-0">
                  <Header />
                  <main id="main-content">
                    <DashboardPage />
                  </main>
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/course/:courseId/level/:levelId/lesson/:lessonId" element={
              <ProtectedRoute>
                <div className="bg-amber-50 min-h-screen text-gray-800 pb-20 lg:pb-0">
                  <Header />
                  <main id="main-content">
                    <LessonViewPage />
                  </main>
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/course/:courseId/level/:levelId" element={
              <ProtectedRoute>
                <div className="bg-amber-50 min-h-screen text-gray-800 pb-20 lg:pb-0">
                  <Header />
                  <main id="main-content">
                    <LevelLessonsPage />
                  </main>
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/course/:courseId" element={
              <ProtectedRoute>
                <div className="bg-amber-50 min-h-screen text-gray-800 pb-20 lg:pb-0">
                  <Header />
                  <main id="main-content">
                    <CoursePage />
                  </main>
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/creations" element={
              <ProtectedRoute>
                <div className="bg-slate-900 min-h-screen text-gray-800 pb-20 lg:pb-0">
                  <Header />
                  <main id="main-content">
                    <CreationsPage />
                  </main>
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/creations/new" element={
              <ProtectedRoute>
                <div className="bg-slate-900 min-h-screen text-gray-800 pb-20 lg:pb-0">
                  <Header />
                  <main id="main-content">
                    <CreateCreationPage />
                  </main>
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/creations/my" element={
              <ProtectedRoute>
                <div className="bg-slate-900 min-h-screen text-gray-800 pb-20 lg:pb-0">
                  <Header />
                  <main id="main-content">
                    <MyCreationsPage />
                  </main>
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/creations/:id" element={
              <ProtectedRoute>
                <div className="bg-slate-900 min-h-screen text-gray-800 pb-20 lg:pb-0">
                  <Header />
                  <main id="main-content">
                    <CreationDetailPage />
                  </main>
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/creations/:id/edit" element={
              <ProtectedRoute>
                <div className="bg-slate-900 min-h-screen text-gray-800 pb-20 lg:pb-0">
                  <Header />
                  <main id="main-content">
                    <EditCreationPage />
                  </main>
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />

            {/* 管理画面ルート（管理者専用） */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/courses" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminCoursesPage />
                </AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/courses/:courseId/edit" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminCourseFormPage />
                </AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/courses/:courseId/levels" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminLevelsPage />
                </AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/courses/:courseId/levels/new" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminLevelFormPage />
                </AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/courses/:courseId/levels/:levelId/edit" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminLevelFormPage />
                </AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/courses/:courseId/levels/:levelId/lessons" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminLessonsPage />
                </AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/courses/:courseId/lessons" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminLessonsPage />
                </AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/courses/:courseId/lessons/new" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminLessonFormPage />
                </AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/courses/:courseId/lessons/:lessonId/edit" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminLessonFormPage />
                </AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/users" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminUsersPage />
                </AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/analytics" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminAnalyticsPage />
                </AdminLayout>
              </AdminRoute>
            } />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;