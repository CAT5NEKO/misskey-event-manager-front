import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth, AuthProvider } from '@features/auth/hooks/useAuth';
import { useEffect, useState } from 'react';
import { api } from '@shared/api/client';
import { LoadingSpinner } from '@shared/components/LoadingSpinner';
import { ErrorBoundary } from '@shared/components/ErrorBoundary';
import { AccountSwitcher } from '@features/auth/components/AccountSwitcher';
import { AdminLayout } from '@features/admin/components/AdminLayout';
import { LoginPage } from '@features/auth/pages/LoginPage';
import { CallbackPage } from '@features/auth/pages/CallbackPage';
import { HomePage } from '@features/events/pages/HomePage';
import { EventDetailPage } from '@features/events/pages/EventDetailPage';
import { CreateEditEventPage } from '@features/events/pages/CreateEditEventPage';
import { SettingsPage } from '@features/settings/pages/SettingsPage';
import { DashboardPage } from '@features/admin/pages/DashboardPage';
import { InstanceManagePage } from '@features/admin/pages/InstanceManagePage';
import { UserManagePage } from '@features/admin/pages/UserManagePage';
import { EventManagePage } from '@features/admin/pages/EventManagePage';
import { AuditLogsPage } from '@features/admin/pages/AuditLogsPage';
import { AdminSettingsPage } from '@features/admin/pages/AdminSettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (!user.is_admin) return <Navigate to="/" />;
  return <>{children}</>;
}

function AdminHeader() {
  const { logout } = useAuth();
  const [appName, setAppName] = useState('miSchedule');
  useEffect(() => {
    api<{ name: string }>('/app/name')
      .then((res) => setAppName(res.name))
      .catch(() => {});
  }, []);
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-6">
          <Link to="/" className="text-lg sm:text-xl font-bold text-blue-600 shrink-0">
            {appName}
          </Link>
          <Link
            to="/events/new"
            className="text-xs sm:text-sm bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-blue-700 whitespace-nowrap"
          >
            新規イベント
          </Link>
        </div>
        <nav className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          <Link to="/" className="text-gray-600 hover:text-gray-800 hidden sm:inline">
            予定管理
          </Link>
          <Link to="/admin" className="text-gray-600 hover:text-gray-800 hidden sm:inline">
            管理者設定
          </Link>
          <Link to="/settings" className="text-gray-600 hover:text-gray-800 hidden sm:inline">
            ユーザー設定
          </Link>
          <AccountSwitcher />
          <button
            onClick={async () => {
              await logout();
              window.location.href = '/login';
            }}
            className="text-red-600 hover:text-red-800 whitespace-nowrap"
          >
            ログアウト
          </button>
        </nav>
      </div>
    </header>
  );
}

function AdminPage({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="max-w-6xl mx-auto px-4 py-6">
          <AdminLayout>{children}</AdminLayout>
        </div>
      </div>
    </AdminRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<CallbackPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/new"
        element={
          <ProtectedRoute>
            <CreateEditEventPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id"
        element={
          <ProtectedRoute>
            <EventDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id/edit"
        element={
          <ProtectedRoute>
            <CreateEditEventPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminPage>
            <DashboardPage />
          </AdminPage>
        }
      />
      <Route
        path="/admin/instances"
        element={
          <AdminPage>
            <InstanceManagePage />
          </AdminPage>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminPage>
            <UserManagePage />
          </AdminPage>
        }
      />
      <Route
        path="/admin/events"
        element={
          <AdminPage>
            <EventManagePage />
          </AdminPage>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <AdminPage>
            <AuditLogsPage />
          </AdminPage>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminPage>
            <AdminSettingsPage />
          </AdminPage>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
