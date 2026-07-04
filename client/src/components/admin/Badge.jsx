import { cn } from '@/lib/cn';

const TONES = {
  neutral: 'bg-surface-2 text-muted',
  brand: 'bg-brand-600/10 text-brand-600',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  violet: 'bg-violet-600/10 text-violet-600',
  accent: 'bg-accent-500/10 text-accent-500',
};

export default function Badge({ tone = 'neutral', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
