import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth, AuthProvider } from '@features/auth/hooks/useAuth';
import { LoadingSpinner } from '@shared/components/LoadingSpinner';
import { ErrorBoundary } from '@shared/components/ErrorBoundary';
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
import { AppLayout, DialogProvider } from '@design-system/index';

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage />;
  if (!user) {
    return <Navigate to="/login" state={{ reason: 'セッションの有効期限が切れました' }} />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function AdminLayoutRoute() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage />;
  if (!user) {
    return <Navigate to="/login" state={{ reason: 'セッションの有効期限が切れました' }} />;
  }
  if (!user.is_admin) return <Navigate to="/" />;

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<CallbackPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events/new" element={<CreateEditEventPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/events/:id/edit" element={<CreateEditEventPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route element={<AdminLayoutRoute />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/instances" element={<InstanceManagePage />} />
          <Route path="/admin/users" element={<UserManagePage />} />
          <Route path="/admin/events" element={<EventManagePage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <DialogProvider>
            <AppRoutes />
          </DialogProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
