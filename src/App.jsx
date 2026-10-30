import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { safeLocalStorage } from './utils/storage';
import { useApp } from './context/AppContext';
import { ToastProvider } from './components/common/Toast.jsx';
import { AppToastBridge } from './components/common/AppToastBridge.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';
import DealDashboardView from './features/dashboard/DealDashboardView';
import DealRoomView from './features/deal-room/DealRoomView';
import NotFoundView from './features/deal-room/NotFoundView';

function AppContent() {
  const location = useLocation();
  const { pendingToast, clearPendingToast } = useApp();

  // Track current route for refresh persistence
  useEffect(() => {
    safeLocalStorage.set('last_route', location.pathname);
  }, [location.pathname]);

  return (
    <AppLayout>
      <AppToastBridge pendingToast={pendingToast} clearPendingToast={clearPendingToast} />
      <Routes>
        <Route path="/" element={<Navigate to="/deals" replace />} />
        <Route path="/deals" element={<DealDashboardView />} />
        <Route path="/deals/:id" element={<DealRoomView />} />
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
