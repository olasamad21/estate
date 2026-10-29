import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { safeLocalStorage } from './utils/storage';
import { useApp } from './context/AppContext';
import { ToastProvider, AppToastBridge } from './components/common/Toast.jsx';
import DealDashboardView from './features/dashboard/DealDashboardView';
import DealRoomView from './features/deal-room/DealRoomView';
import NotFoundView from './features/deal-room/NotFoundView';
import UiKitView from './features/dev/UiKitView';

function AppContent() {
  const location = useLocation();
  const { pendingToast, clearPendingToast } = useApp();

  // Track current route for refresh persistence
  useEffect(() => {
    safeLocalStorage.set('last_route', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-canvas flex justify-center py-0 sm:py-6">
      <AppToastBridge pendingToast={pendingToast} clearPendingToast={clearPendingToast} />

      {/* Mobile-first centered phone frame (390px - 430px base, max-w-md at all screen sizes) */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[844px] bg-surface sm:rounded-2xl sm:shadow-xl sm:border sm:border-line flex flex-col overflow-hidden">
        {/* Prototype Banner Placeholder (monospaced per rule F) */}
        <header className="bg-brand text-surface px-4 py-2 text-xs flex items-center justify-between font-mono">
          <span>PROTOTYPE // SAMPLE DATA ONLY</span>
          <span className="text-line-strong">v0.3.0</span>
        </header>

        {/* Temporary Top Bar Placeholder */}
        <div className="border-b border-line px-4 py-3 flex items-center justify-between bg-surface">
          <div className="font-semibold text-ink text-sm tracking-tight">
            DealRoom
          </div>
          <div className="text-xs text-ink-muted font-sans tabular-nums">
            {location.pathname}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/deals" replace />} />
            <Route path="/deals" element={<DealDashboardView />} />
            <Route path="/deals/:id" element={<DealRoomView />} />
            <Route path="/__kit" element={<UiKitView />} />
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
