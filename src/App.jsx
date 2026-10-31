import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { safeLocalStorage } from './utils/storage.js';
import { useApp } from './context/AppContext.jsx';
import { useChat } from './context/ChatContext.jsx';
import { ToastProvider } from './components/common/Toast.jsx';
import { AppToastBridge } from './components/common/AppToastBridge.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { LoginView } from './features/auth/LoginView.jsx';
import { ChannelListView } from './features/chat/ChannelListView.jsx';
import { ChatAreaView } from './features/chat/ChatAreaView.jsx';

function WorkspaceLayout() {
  const { id: channelId } = useParams();

  return (
    <div className="h-full w-full flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile view (< 1024px): single column */}
      <div className="lg:hidden h-full w-full overflow-hidden">
        {channelId ? <ChatAreaView /> : <ChannelListView />}
      </div>

      {/* Desktop view (>= 1024px): 320px sidebar + chat pane */}
      <div className="hidden lg:flex h-full w-full overflow-hidden">
        <aside className="w-80 shrink-0 border-r border-line h-full overflow-hidden">
          <ChannelListView />
        </aside>
        <main className="flex-1 min-w-0 h-full overflow-hidden">
          <ChatAreaView defaultChannelId="general" />
        </main>
      </div>
    </div>
  );
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
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
