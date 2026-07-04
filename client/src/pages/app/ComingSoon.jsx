import { motion } from 'framer-motion';
import { FiTool } from 'react-icons/fi';

/**
 * Honest placeholder for sections shipping in later phases. Keeps the app
 * fully navigable without pretending a feature exists yet.
 */
export default function ComingSoon({ title = 'Coming soon', description }) {
  return (
    <div className="container-app py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid min-h-[60vh] place-items-center rounded-3xl border border-dashed border-line bg-surface"
      >
        <div className="max-w-md px-6 text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-brand-600/10 text-brand-600">
            <FiTool size={28} />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-content">{title}</h1>
          <p className="mt-2 text-muted">
            {description ||
              'This section is part of the next build phase. The foundation, auth, theming, and landing experience are live — this feature is next in line.'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
