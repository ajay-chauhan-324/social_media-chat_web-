import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

/** Controlled segmented tabs with an animated active indicator. */
export default function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn('flex border-b border-line', className)}>
      {tabs.map((tab) => {
        const key = tab.value ?? tab;
        const label = tab.label ?? tab;
        const active = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              'relative flex-1 px-4 py-3 text-sm font-semibold transition sm:flex-none',
              active ? 'text-brand-600' : 'text-muted hover:text-content'
            )}
          >
            {label}
            {active && (
              <motion.span
                layoutId="tab-underline"
                className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-gradient"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
