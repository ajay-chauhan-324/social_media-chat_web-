import { motion } from 'framer-motion';
import {
  FiEdit3,
  FiMessageSquare,
  FiCpu,
  FiUsers,
  FiBell,
  FiShield,
  FiTrendingUp,
  FiImage,
} from 'react-icons/fi';

const FEATURES = [
  {
    icon: FiEdit3,
    title: 'Rich Posts & Threads',
    desc: 'Share text, images, and multi-photo carousels with hashtags, mentions, and nested comments.',
  },
  {
    icon: FiMessageSquare,
    title: 'Real-time Chat',
    desc: 'Private & group messaging with typing indicators, read receipts, and online presence.',
  },
  {
    icon: FiCpu,
    title: 'AI Assistant',
    desc: 'A floating assistant that writes captions, fixes grammar, generates bios, and more.',
  },
  {
    icon: FiUsers,
    title: 'Communities & Follows',
    desc: 'Build your network with follows, suggestions, mutuals, and topic-based communities.',
  },
  {
    icon: FiBell,
    title: 'Live Notifications',
    desc: 'Instant alerts for likes, comments, replies, mentions, follows, and messages.',
  },
  {
    icon: FiTrendingUp,
    title: 'Explore & Trending',
    desc: 'A personalized feed plus trending hashtags and posts to discover what matters.',
  },
  {
    icon: FiImage,
    title: 'Media, Optimized',
    desc: 'Cloudinary-backed uploads with previews, compression, and lightning-fast delivery.',
  },
  {
    icon: FiShield,
    title: 'Secure by Design',
    desc: 'JWT auth with refresh rotation, rate limiting, input validation, and sanitization.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24">
      <div className="container-app">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Features</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-content sm:text-4xl">
            Everything you need, in one place
          </h2>
          <p className="mt-4 text-muted">
            Stop juggling five apps. ArtROOT Chat brings feeds, chat, communities, and AI together
            in a single premium experience.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              className="card group p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft"
            >
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand-600/10 text-brand-600 transition group-hover:bg-brand-gradient group-hover:text-white">
                <f.icon size={22} />
              </div>
              <h3 className="font-semibold text-content">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
