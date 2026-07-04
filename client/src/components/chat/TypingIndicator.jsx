import { motion } from 'framer-motion';

export default function TypingIndicator({ label = 'typing' }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted"
            animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <span>{label}…</span>
    </div>
  );
}
