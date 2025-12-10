import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import SkipLink from './components/common/SkipLink';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import CoursePage from './pages/CoursePage';
import LevelLessonsPage from './pages/LevelLessonsPage';
import LessonViewPage from './pages/LessonViewPage';
import CreationsPage from './pages/CreationsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCoursesPage from './pages/AdminCoursesPage';
import AdminCourseFormPage from './pages/AdminCourseFormPage';
import AdminLessonsPage from './pages/AdminLessonsPage';
import AdminLessonFormPage from './pages/AdminLessonFormPage';
import AdminLevelsPage from './pages/AdminLevelsPage';
import AdminLevelFormPage from './pages/AdminLevelFormPage';
import AdminQuizzesPage from './pages/AdminQuizzesPage';
import AdminQuizFormPage from './pages/AdminQuizFormPage';
import AdminRoute from './components/routes/AdminRoute';
import AdminLayout from './components/admin/layout/AdminLayout';
import { useAuthStore } from './store/authStore';
import './src/i18n/config'; // i18nの初期化

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
  return (
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

        {/* 保護されたルート（認証必須） */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div className="bg-amber-50 min-h-screen text-gray-800">
              <Header />
              <main id="main-content">
                <DashboardPage />
              </main>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/course/:courseId/level/:levelId/lesson/:lessonId" element={
          <ProtectedRoute>
            <div className="bg-amber-50 min-h-screen text-gray-800">
              <Header />
              <main id="main-content">
                <LessonViewPage />
              </main>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/course/:courseId/level/:levelId" element={
          <ProtectedRoute>
            <div className="bg-amber-50 min-h-screen text-gray-800">
              <Header />
              <main id="main-content">
                <LevelLessonsPage />
              </main>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/course/:courseId" element={
          <ProtectedRoute>
            <div className="bg-amber-50 min-h-screen text-gray-800">
              <Header />
              <main id="main-content">
                <CoursePage />
              </main>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/creations" element={
          <ProtectedRoute>
            <div className="bg-slate-900 min-h-screen text-gray-800">
              <Header />
              <main id="main-content">
                <CreationsPage />
              </main>
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

        <Route path="/admin/courses/:courseId/lessons/:lessonId/quizzes" element={
          <AdminRoute>
            <AdminLayout>
              <AdminQuizzesPage />
            </AdminLayout>
          </AdminRoute>
        } />

        <Route path="/admin/courses/:courseId/lessons/:lessonId/quizzes/:quizId/edit" element={
          <AdminRoute>
            <AdminLayout>
              <AdminQuizFormPage />
            </AdminLayout>
          </AdminRoute>
        } />

        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">ユーザー管理</h2>
                <p className="text-slate-600">この機能は次のフェーズで実装予定です</p>
              </div>
            </AdminLayout>
          </AdminRoute>
        } />

        <Route path="/admin/analytics" element={
          <AdminRoute>
            <AdminLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">分析・統計</h2>
                <p className="text-slate-600">この機能は次のフェーズで実装予定です</p>
              </div>
            </AdminLayout>
          </AdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;