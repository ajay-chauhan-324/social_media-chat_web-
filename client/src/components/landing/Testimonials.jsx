import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import Avatar from '@/components/ui/Avatar';

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Content Creator',
    text: 'The AI caption generator alone saves me hours every week. ArtROOT Chat feels like it was built for creators.',
    seed: 'Priya',
  },
  {
    name: 'Rahul Patel',
    role: 'Startup Founder',
    text: 'We moved our entire community here. Real-time chat plus a proper feed in one place is a game-changer.',
    seed: 'Rahul',
  },
  {
    name: 'Sneha Verma',
    role: 'Product Designer',
    text: 'Easily the most beautiful social app I have used. The dark mode and micro-interactions are chef’s kiss.',
    seed: 'Sneha',
  },
  {
    name: 'Arjun Singh',
    role: 'Software Engineer',
    text: 'Fast, secure, and the AI assistant actually helps me write better posts. Impressive engineering.',
    seed: 'Arjun',
  },
  {
    name: 'Aditi Desai',
    role: 'Marketing Lead',
    text: 'Trending hashtags and analytics give us insights we never had before. Our engagement doubled.',
    seed: 'Aditi',
  },
  {
    name: 'Karan Shah',
    role: 'Community Manager',
    text: 'Group chats, notifications, communities — everything just works. Onboarding my team was effortless.',
    seed: 'Karan',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24">
      <div className="container-app">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Loved by creators
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-content sm:text-4xl">
            Don’t just take our word for it
          </h2>
        </div>

        <div className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="card mb-5 break-inside-avoid p-6"
            >
              <div className="flex gap-1 text-warning">
                {Array.from({ length: 5 }).map((_, s) => (
                  <FiStar key={s} fill="currentColor" size={16} />
                ))}
              </div>
              <blockquote className="mt-3 text-content">“{t.text}”</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <Avatar
                  name={t.name}
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.seed}`}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-semibold text-content">{t.name}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
