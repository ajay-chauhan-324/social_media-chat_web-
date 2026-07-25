import { FiSend, FiX } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { useConfirmAction } from '@/features/ai/useAI';

/**
 * Confirmation card for AI-initiated actions that need explicit user sign-off
 * (currently only send_message). Confirmation is a real button click, never
 * inferred from free-text like "yes" — that keeps a prompt-injected or
 * misread instruction from ever sending a message on its own.
 */
export default function AIPendingAction({ conversationId, pendingAction, onResolved }) {
  const confirmAction = useConfirmAction();
  if (!pendingAction) return null;

  const resolve = (confirm) => {
    confirmAction.mutate(
      { conversationId, confirm },
      { onSuccess: (conversation) => onResolved?.(conversation) }
    );
  };

  if (pendingAction.tool !== 'send_message') return null;
  const { username, content } = pendingAction.args;

  return (
    <div className="ml-9 flex flex-col gap-2 rounded-2xl border border-brand-500/30 bg-brand-600/5 p-3">
      <p className="text-sm text-content">
        Send to <span className="font-semibold">@{username}</span>:
      </p>
      <p className="rounded-lg bg-surface px-3 py-2 text-sm text-content" style={{ whiteSpace: 'pre-wrap' }}>
        {content}
      </p>
      <div className="flex gap-2">
        <Button
          variant="gradient"
          size="sm"
          leftIcon={<FiSend size={14} />}
          loading={confirmAction.isPending && confirmAction.variables?.confirm === true}
          disabled={confirmAction.isPending}
          onClick={() => resolve(true)}
        >
          Confirm & send
        </Button>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<FiX size={14} />}
          loading={confirmAction.isPending && confirmAction.variables?.confirm === false}
          disabled={confirmAction.isPending}
          onClick={() => resolve(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
