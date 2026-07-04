import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiPlay, FiStar } from 'react-icons/fi';
import Button from '@/components/ui/Button';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-brand-radial blur-3xl" />
        <motion.div
          animate={{ y: [0, -24, 0], x: [0, 16, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-[8%] top-32 h-56 w-56 rounded-full bg-brand-500/20 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 28, 0], x: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-[10%] top-52 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(rgb(148,163,184,0.12)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container-app flex flex-col items-center text-center"
      >
        <motion.div variants={item}>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium text-muted shadow-soft">
            <FiStar className="text-warning" />
            The all-in-one social platform, reimagined with AI
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-6 max-w-4xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-content sm:text-6xl lg:text-7xl"
        >
          Connect. Create. Collaborate.
          <span className="gradient-text"> Powered by AI.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-2xl text-lg text-muted sm:text-xl"
        >
          ArtROOT Chat blends the best of your favorite networks — feeds, threads, real-time chat,
          and communities — with an AI assistant that helps you write, create, and grow.
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button as={Link} to="/register" variant="gradient" size="lg" rightIcon={<FiArrowRight />}>
            Start for free
          </Button>
          <Button as="a" href="#features" variant="secondary" size="lg" leftIcon={<FiPlay />}>
            See how it works
          </Button>
        </motion.div>

        <motion.p variants={item} className="mt-4 text-sm text-muted">
          No credit card required • Free forever plan • Join 50,000+ creators
        </motion.p>

        {/* Hero app mockup */}
        <motion.div
          variants={item}
          className="relative mt-16 w-full max-w-5xl"
        >
          <div className="glass overflow-hidden rounded-3xl border border-line p-2 shadow-soft">
            <div className="rounded-2xl bg-surface-2 p-4 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { t: 'Personalized Feed', d: 'Posts tuned to you' },
                  { t: 'Real-time Chat', d: 'Instant messaging' },
                  { t: 'AI Studio', d: 'Captions & more' },
                ].map((c, i) => (
                  <motion.div
                    key={c.t}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.15 }}
                    className="card p-5 text-left"
                  >
                    <div className="mb-3 h-10 w-10 rounded-xl bg-brand-gradient" />
                    <p className="font-semibold text-content">{c.t}</p>
                    <p className="text-sm text-muted">{c.d}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
