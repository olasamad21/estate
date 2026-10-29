import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function NotFoundView() {
  return (
    <div className="p-6 flex flex-col items-center justify-center text-center min-h-[50vh]">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4 border border-red-100">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-lg font-semibold text-neutral-900">Deal Not Found or No Access</h2>
      <p className="text-sm text-neutral-500 mt-1 max-w-xs">
        This deal room does not exist, or your currently active role does not have permission to view it.
      </p>
      <Link
        to="/deals"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Deal Rooms
      </Link>
    </div>
  )
}
