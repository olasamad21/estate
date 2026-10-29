import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { safeLocalStorage } from './utils/storage'
import DealDashboardView from './features/dashboard/DealDashboardView'
import DealRoomView from './features/deal-room/DealRoomView'
import NotFoundView from './features/deal-room/NotFoundView'

export default function App() {
  const location = useLocation()

  // Track current route for refresh persistence
  useEffect(() => {
    safeLocalStorage.set('last_route', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center py-0 sm:py-6">
      {/* Mobile-first centered frame (390px - 430px base, responsive) */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[844px] bg-white sm:rounded-2xl sm:shadow-xl sm:border sm:border-neutral-200 flex flex-col overflow-hidden">
        {/* Prototype Banner Placeholder */}
        <header className="bg-neutral-900 text-white px-4 py-2 text-xs flex items-center justify-between font-mono">
          <span>PROTOTYPE // PHASE 1</span>
          <span className="text-neutral-400">v0.1.0</span>
        </header>

        {/* Top App Bar Placeholder */}
        <div className="border-b border-neutral-100 px-4 py-3 flex items-center justify-between">
          <div className="font-semibold text-neutral-900 text-sm tracking-tight">
            DealRoom
          </div>
          <div className="text-xs text-neutral-500 font-mono">
            {location.pathname}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/deals" replace />} />
            <Route path="/deals" element={<DealDashboardView />} />
            <Route path="/deals/:id" element={<DealRoomView />} />
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
