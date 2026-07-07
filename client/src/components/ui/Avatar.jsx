import { cn } from '@/lib/cn';

const SIZES = { xs: 'h-7 w-7 text-xs', sm: 'h-9 w-9 text-sm', md: 'h-11 w-11', lg: 'h-16 w-16 text-lg', xl: 'h-24 w-24 text-2xl' };

const initials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

export default function Avatar({ src, name = 'User', size = 'md', ring = false, className }) {
  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-gradient font-semibold text-white',
        SIZES[size],
        ring && 'ring-2 ring-brand-500/60 ring-offset-2 ring-offset-surface',
        className
      )}
      title={name}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
