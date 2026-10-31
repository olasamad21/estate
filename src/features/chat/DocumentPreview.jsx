import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/market.js';

// Bar layouts for the 3 sample pages
const PAGE_LAYOUTS = [
  // Page 1
  {
    para1: ['w-full', 'w-[92%]', 'w-[85%]', 'w-[68%]'],
    para2: ['w-full', 'w-[88%]', 'w-[75%]', 'w-[45%]'],
  },
  // Page 2
  {
    para1: ['w-[96%]', 'w-full', 'w-[90%]', 'w-[82%]', 'w-[58%]'],
    para2: ['w-full', 'w-[94%]', 'w-[78%]', 'w-[52%]'],
  },
  // Page 3 (final page with signature)
  {
    para1: ['w-full', 'w-[90%]', 'w-[72%]'],
    para2: ['w-[95%]', 'w-[60%]'],
  },
];

/**
 * DocumentPreview renders a page-shaped representation (aspect ratio 1 to 1.414)
 * with sample skeleton paragraphs and a 3-page navigation pager.
 */
export function DocumentPreview({ fileName = 'Document.pdf' }) {
  const [currentPage, setCurrentPage] = useState(1);

  const documentTitle = useMemo(() => {
    return (fileName || 'Document')
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]+/g, ' ')
      .trim();
  }, [fileName]);

  const currentLayout = PAGE_LAYOUTS[currentPage - 1] || PAGE_LAYOUTS[0];

  return (
    <div className="w-full flex flex-col items-center justify-center p-3 sm:p-4 bg-surface-raised border border-line rounded-2xl max-h-[60dvh] overflow-y-auto">
      {/* Page-shaped box with 1:1.414 aspect ratio */}
      <div className="w-full max-w-[260px] sm:max-w-[280px] aspect-[1/1.414] bg-surface border border-line rounded-lg p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line pb-2 mb-3">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              {COMPANY_CONFIG.companyName}
            </span>
            <span className="text-xs text-ink-muted tabular-nums">
              P. {currentPage}
            </span>
          </div>

          {/* Heading */}
          <h4 className="text-xs font-bold text-ink mb-3 break-words capitalize">
            {documentTitle}
          </h4>

          {/* Paragraph 1 */}
          <div className="space-y-1.5 mb-3">
            {currentLayout.para1.map((widthClass, idx) => (
              <div key={idx} className={`h-2 rounded bg-line ${widthClass}`} />
            ))}
          </div>

          {/* Paragraph 2 */}
          <div className="space-y-1.5">
            {currentLayout.para2.map((widthClass, idx) => (
              <div key={idx} className={`h-2 rounded bg-line ${widthClass}`} />
            ))}
          </div>
        </div>

        {/* Signature line on last page (Page 3) */}
        {currentPage === 3 && (
          <div className="pt-3 border-t border-line flex flex-col items-start gap-1">
            <div className="w-24 h-px bg-line-strong" />
            <div className="w-16 h-2 rounded bg-line" />
          </div>
        )}
      </div>

      {/* Pager below page */}
      <div className="flex items-center justify-between w-full max-w-[260px] sm:max-w-[280px] mt-3">
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="w-11 h-11 flex items-center justify-center text-xs font-semibold rounded-lg border border-line bg-surface text-ink hover:bg-surface-raised disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>

        <span className="text-xs font-semibold text-ink tabular-nums">
          Page {currentPage} of 3
        </span>

        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
          disabled={currentPage === 3}
          aria-label="Next page"
          className="w-11 h-11 flex items-center justify-center text-xs font-semibold rounded-lg border border-line bg-surface text-ink hover:bg-surface-raised disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Caption under pager */}
      <p className="text-xs text-ink-muted text-center mt-2">
        Sample preview. The real document would open here.
      </p>
    </div>
  );
}

export default DocumentPreview;
