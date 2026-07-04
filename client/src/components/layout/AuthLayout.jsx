import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import Logo from '@/components/ui/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';

const HIGHLIGHTS = [
  'AI-powered content tools built in',
  'Real-time chat & communities',
  'Beautiful on every device',
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-brand-gradient p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:22px_22px]" />
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -right-16 top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl"
        />
        <Logo to="/" className="relative [&_span]:text-white" />
        <div className="relative mt-auto">
          <h2 className="font-display text-4xl font-extrabold leading-tight">
            Connect. Create. Collaborate.
          </h2>
          <p className="mt-4 max-w-md text-white/80">
            The all-in-one social platform, reimagined with AI. Join a community built for creators.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-3 text-white/90">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20">✓</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-col bg-surface-2 px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-content">
            <FiArrowLeft /> Back home
          </Link>
          <div className="flex items-center gap-3">
            <span className="lg:hidden">
              <Logo />
            </span>
            <ThemeToggle />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto my-auto w-full max-w-md py-10"
        >
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-content">{title}</h1>
          {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
        </motion.div>
      </div>
    </div>
  );
}
