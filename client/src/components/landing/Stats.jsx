import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

const STATS = [
  { value: 50000, suffix: '+', label: 'Active creators' },
  { value: 2, suffix: 'M+', label: 'Posts shared' },
  { value: 120, suffix: '+', label: 'Countries' },
  { value: 99, suffix: '.9%', label: 'Uptime' },
];

function Counter({ value, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1600, bounce: 0 });

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  useEffect(() => {
    const el = ref.current;
    return spring.on('change', (latest) => {
      if (el) el.textContent = Math.floor(latest).toLocaleString();
    });
  }, [spring]);

  return (
    <span>
      <span ref={ref}>0</span>
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="py-16">
      <div className="container-app">
        <div className="grid gap-6 rounded-3xl bg-brand-gradient p-10 text-white sm:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-4xl font-extrabold sm:text-5xl">
                <Counter value={s.value} suffix={s.suffix} />
              </div>
              <p className="mt-1 text-sm text-white/80">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
