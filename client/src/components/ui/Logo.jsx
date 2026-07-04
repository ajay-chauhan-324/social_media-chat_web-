import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

export default function Logo({ to = '/', withText = true, className }) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient shadow-glow">
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            d="M9 22 L16 9 L23 22 M11.5 17.5 H20.5"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {withText && (
        <span className="font-display text-lg font-extrabold tracking-tight text-content">
          ArtROOT<span className="gradient-text"> Chat</span>
        </span>
      )}
    </Link>
  );
}
