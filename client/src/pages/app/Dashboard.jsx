import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiEdit3,
  FiUsers,
  FiHeart,
  FiFileText,
  FiCpu,
  FiArrowRight,
  FiTrendingUp,
} from 'react-icons/fi';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } }),
};

export default function Dashboard() {
  const { user } = useAuth();
  const completion = user?.profileCompletion ?? 0;

  const stats = [
    { label: 'Posts', value: user?.postsCount ?? 0, icon: FiFileText, color: 'text-brand-600' },
    { label: 'Followers', value: user?.followersCount ?? 0, icon: FiUsers, color: 'text-violet-600' },
    { label: 'Following', value: user?.followingCount ?? 0, icon: FiHeart, color: 'text-accent-500' },
    { label: 'AI Score', value: user?.aiScore ?? 0, icon: FiCpu, color: 'text-success' },
  ];

  const quickActions = [
    { label: 'Create a post', to: '/app/explore', icon: FiEdit3 },
    { label: 'Open AI Studio', to: '/app/ai', icon: FiCpu },
    { label: 'Find people', to: '/app/explore', icon: FiUsers },
  ];

  return (
    <div className="container-app py-8">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-white"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative flex flex-wrap items-center gap-5">
          <Avatar src={user?.avatar} name={user?.name} size="xl" className="ring-2 ring-white/40" />
          <div>
            <p className="text-white/80">Welcome back,</p>
            <h1 className="font-display text-3xl font-extrabold">{user?.name} 👋</h1>
            <p className="mt-1 text-white/80">@{user?.username}</p>
          </div>
          <Button
            as={Link}
            to="/app/profile"
            variant="secondary"
            className="ml-auto bg-white text-brand-700 hover:bg-white/90"
            rightIcon={<FiArrowRight />}
          >
            View profile
          </Button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} custom={i} variants={fadeUp} initial="hidden" animate="show">
            <Card hover className="flex items-center gap-4">
              <div className={`grid h-12 w-12 place-items-center rounded-xl bg-surface-2 ${s.color}`}>
                <s.icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-content">{s.value.toLocaleString()}</p>
                <p className="text-sm text-muted">{s.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Profile completion */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-content">Complete your profile</h2>
            <span className="text-sm font-semibold text-brand-600">{completion}%</span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="h-full rounded-full bg-brand-gradient"
            />
          </div>
          <p className="mt-3 text-sm text-muted">
            Add a bio, headline, and skills to boost your visibility and AI Score.
          </p>
          <Button as={Link} to="/app/profile" variant="secondary" size="sm" className="mt-4">
            Finish setup
          </Button>
        </Card>

        {/* Quick actions */}
        <Card>
          <h2 className="flex items-center gap-2 font-semibold text-content">
            <FiTrendingUp className="text-brand-600" /> Quick actions
          </h2>
          <div className="mt-4 space-y-2">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-medium text-content transition hover:border-brand-500 hover:bg-surface-2"
              >
                <a.icon className="text-brand-600" />
                {a.label}
                <FiArrowRight className="ml-auto text-muted" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
