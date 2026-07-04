import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-surface-2 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Logo withText={false} className="mb-6 justify-center [&>span]:h-14 [&>span]:w-14" />
        <p className="font-display text-8xl font-extrabold gradient-text">404</p>
        <h1 className="mt-2 text-2xl font-bold text-content">Page not found</h1>
        <p className="mt-2 max-w-sm text-muted">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button as={Link} to="/" variant="gradient">
            Go home
          </Button>
          <Button as={Link} to="/app" variant="secondary">
            Open app
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
