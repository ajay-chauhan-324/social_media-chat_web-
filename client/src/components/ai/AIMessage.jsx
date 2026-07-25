import { FiCpu } from 'react-icons/fi';
import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

export default function AIMessage({ role, content }) {
  const { user } = useAuth();
  const isUser = role === 'user';
  return (
    <div className={cn('flex items-start gap-2.5', isUser && 'flex-row-reverse')}>
      {isUser ? (
        <Avatar src={user?.avatar} name={user?.name} size="xs" />
      ) : (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-gradient text-white">
          <FiCpu size={14} />
        </span>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed',
          isUser ? 'rounded-br-md bg-brand-600 text-white' : 'rounded-bl-md bg-surface-2 text-content'
        )}
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {content}
      </div>
    </div>
  );
}
