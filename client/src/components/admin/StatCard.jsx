import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { formatCount } from '@/lib/format';

const TONES = {
  brand: 'bg-brand-600/10 text-brand-600',
  violet: 'bg-violet-600/10 text-violet-600',
  accent: 'bg-accent-500/10 text-accent-500',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
};

export default function StatCard({ icon: Icon, label, value, sub, tone = 'brand', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card flex items-center gap-4 p-5"
    >
      <div className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-xl', TONES[tone])}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-content">
          {typeof value === 'number' ? formatCount(value) : value}
        </p>
        <p className="truncate text-sm text-muted">{label}</p>
        {sub && <p className="truncate text-xs text-muted">{sub}</p>}
      </div>
    </motion.div>
  );
}
