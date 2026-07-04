import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

const FAQS = [
  {
    q: 'Is ArtROOT Chat really free?',
    a: 'Yes. The Free plan includes unlimited posts, chat, and communities forever. Paid plans unlock more AI generations, analytics, and team features.',
  },
  {
    q: 'How does the AI assistant work?',
    a: 'Our floating AI assistant is powered by the OpenAI Chat API. It can generate captions, hashtags, and bios, fix grammar, summarize posts, and answer your questions — right where you work.',
  },
  {
    q: 'Is my data secure?',
    a: 'Security is built in: JWT authentication with refresh-token rotation, rate limiting, input validation, sanitized inputs, and encrypted connections throughout.',
  },
  {
    q: 'Can I use it on mobile?',
    a: 'Absolutely. ArtROOT Chat is fully responsive from 320px phones up to 4K displays, with no layout breaks.',
  },
  {
    q: 'Do I need external accounts to run the demo?',
    a: 'No. The app ships with graceful fallbacks — local image storage and mock AI/email — so it runs out of the box. Add your own keys anytime to enable the real services.',
  },
];

function Item({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-line">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-content">{faq.q}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-muted">
          <FiChevronDown />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-muted">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-24">
      <div className="container-app max-w-3xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">FAQ</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-content sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>
        <div className="mt-10">
          {FAQS.map((faq, i) => (
            <Item key={faq.q} faq={faq} isOpen={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
