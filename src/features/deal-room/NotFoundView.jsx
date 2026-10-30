import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFoundView() {
  return (
    <div className="p-6 flex flex-col items-center justify-center text-center min-h-[50dvh]">
      <div className="w-12 h-12 rounded-full bg-status-danger-bg flex items-center justify-center text-status-danger mb-4 border border-status-danger-line">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-lg font-semibold text-ink">Deal Not Found or No Access</h2>
      <p className="text-sm text-ink-muted mt-1 max-w-xs">
        This deal room does not exist, or your currently active role does not have permission to view it.
      </p>
      <Link
        to="/deals"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-surface bg-brand hover:opacity-90 rounded-lg transition-opacity"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Deal Rooms
      </Link>
    </div>
  );
}
