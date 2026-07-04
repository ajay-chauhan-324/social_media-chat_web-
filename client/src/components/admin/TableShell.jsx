import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';

/**
 * Card wrapper for admin tables with an overflow-x scroll region,
 * loading state, and empty state.
 */
export default function TableShell({ title, actions, isLoading, isEmpty, emptyTitle, children }) {
  return (
    <div className="card overflow-hidden p-0">
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          {title && <h2 className="font-semibold text-content">{title}</h2>}
          {actions}
        </div>
      )}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={26} className="text-brand-600" />
        </div>
      ) : isEmpty ? (
        <EmptyState title={emptyTitle || 'Nothing here'} />
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}
    </div>
  );
}
