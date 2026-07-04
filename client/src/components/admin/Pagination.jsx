import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { cn } from '@/lib/cn';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex items-center justify-between gap-2 pt-4">
      <p className="text-sm text-muted">
        Page <span className="font-semibold text-content">{page}</span> of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => canPrev && onChange(page - 1)}
          disabled={!canPrev}
          className={cn(
            'flex h-9 items-center gap-1 rounded-lg border border-line px-3 text-sm font-medium transition',
            canPrev ? 'text-content hover:bg-surface-2' : 'cursor-not-allowed text-muted opacity-50'
          )}
        >
          <FiChevronLeft size={16} /> Prev
        </button>
        <button
          onClick={() => canNext && onChange(page + 1)}
          disabled={!canNext}
          className={cn(
            'flex h-9 items-center gap-1 rounded-lg border border-line px-3 text-sm font-medium transition',
            canNext ? 'text-content hover:bg-surface-2' : 'cursor-not-allowed text-muted opacity-50'
          )}
        >
          Next <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
