import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/cn';

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    desc: 'Everything you need to get started.',
    features: ['Unlimited posts & chat', 'Join communities', '20 AI generations / day', 'Basic profile'],
    cta: 'Get started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/month',
    desc: 'For creators who want to grow faster.',
    features: [
      'Everything in Free',
      'Unlimited AI generations',
      'Advanced analytics',
      'Priority support',
      'Verified badge',
    ],
    cta: 'Start Pro trial',
    highlight: true,
  },
  {
    name: 'Teams',
    price: '₹1,999',
    period: '/month',
    desc: 'Collaboration for communities & brands.',
    features: ['Everything in Pro', 'Team workspaces', 'Admin & moderation tools', 'API access'],
    cta: 'Contact sales',
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="container-app">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Pricing</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-content sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted">Start free. Upgrade when you’re ready. Cancel anytime.</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                'relative flex flex-col rounded-3xl border p-8',
                plan.highlight
                  ? 'border-brand-600 bg-surface shadow-glow lg:-translate-y-4'
                  : 'border-line bg-surface'
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-content">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted">{plan.desc}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold text-content">{plan.price}</span>
                <span className="text-muted">{plan.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-content">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-success/15 text-success">
                      <FiCheck size={12} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                as={Link}
                to="/register"
                variant={plan.highlight ? 'gradient' : 'secondary'}
                fullWidth
                className="mt-8"
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
