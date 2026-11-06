import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { safeLocalStorage } from './utils/storage.js';
import { useApp } from './context/AppContext.jsx';
import { useChat } from './context/ChatContext.jsx';
import { AppToastBridge } from './components/common/AppToastBridge.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { LoginView } from './features/auth/LoginView.jsx';
import { ActivateView } from './features/auth/ActivateView.jsx';
import { ForgotView } from './features/auth/ForgotView.jsx';
import { ResetPasswordView } from './features/auth/ResetPasswordView.jsx';
import { GetAppView } from './features/auth/GetAppView.jsx';
import { ChannelListView } from './features/chat/ChannelListView.jsx';
import { ChatAreaView } from './features/chat/ChatAreaView.jsx';
import { AdminView } from './features/admin/AdminView.jsx';

function WorkspaceLayout() {
  const { id: channelId } = useParams();

  return (
    <div className="h-full w-full flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile view (< 1024px): single column */}
      <div className="lg:hidden h-full w-full overflow-hidden">
        {channelId ? <ChatAreaView key={channelId} /> : <ChannelListView />}
      </div>

      {/* Desktop view (>= 1024px): 320px sidebar + chat pane */}
      <div className="hidden lg:flex h-full w-full overflow-hidden">
        <aside className="w-80 shrink-0 border-r border-line h-full overflow-hidden">
          <ChannelListView />
        </aside>
        <main className="flex-1 min-w-0 h-full overflow-hidden">
          <ChatAreaView key={channelId || 'general'} defaultChannelId="general" />
        </main>
      </div>
    </div>
  );
}

function ChannelRedirect() {
  const { id } = useParams();
  return <Navigate to={`/channels/${id || 'general'}`} replace />;
}

function AppContent() {
  const location = useLocation();
  const { currentUserId } = useChat();
  const { pendingToast, clearPendingToast } = useApp();

  // Track current route for refresh persistence
  useEffect(() => {
    safeLocalStorage.set('last_route', location.pathname);
  }, [location.pathname]);

  const isAuthenticated = Boolean(currentUserId);

  return (
    <>
      <AppToastBridge pendingToast={pendingToast} clearPendingToast={clearPendingToast} />
      <Routes>
        {/* Unauthenticated Login Route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/channels" replace /> : <LoginView />
          }
        />

        {/* Public Get The App Route (works signed in or out) */}
        <Route
          path="/get-app"
          element={<GetAppView />}
        />

        {/* Public Activation Route (works whether or not someone is signed in) */}
        <Route
          path="/activate/:token"
          element={<ActivateView />}
        />

        {/* Public Forgot & Reset Routes */}
        <Route
          path="/forgot"
          element={<ForgotView />}
        />
        <Route
          path="/reset/:token"
          element={<ResetPasswordView />}
        />

        {/* Authenticated Workspace Routes */}
        <Route
          path="/channels"
          element={
            isAuthenticated ? (
              <AppLayout>
                <WorkspaceLayout />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/channels/:id"
          element={
            isAuthenticated ? (
              <AppLayout>
                <WorkspaceLayout />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Alias route for /channel/:id */}
        <Route
          path="/channel/:id"
          element={<ChannelRedirect />}
        />

        {/* Legacy alias for /deals */}
        <Route
          path="/deals"
          element={<Navigate to="/channels" replace />}
        />

        <Route
          path="/admin"
          element={
            isAuthenticated ? (
              <AppLayout>
                <AdminView />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-all route */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/channels' : '/login'} replace />}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return <AppContent />;
}
