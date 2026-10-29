import { useParams, Link } from 'react-router-dom'

export default function DealRoomView() {
  const { id } = useParams()

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">Active Deal Room</h2>
          <Link
            to="/deals"
            className="text-xs font-medium text-neutral-600 hover:text-neutral-900 underline"
          >
            Back to Deals
          </Link>
        </div>
        <p className="text-sm text-neutral-500 mt-1">Route: /deals/{id}</p>
        <div className="mt-4 p-3 rounded-lg bg-neutral-50 border border-neutral-100 text-xs text-neutral-600">
          Placeholder view for Phase 1. Pinned header, chat feed, document vault drawer, and action composer will be populated in Phase 2.
        </div>
      </div>
    </div>
  )
}
