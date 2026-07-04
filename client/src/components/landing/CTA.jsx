import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import Button from '@/components/ui/Button';

export default function CTA() {
  return (
    <section className="py-24">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-16 text-center text-white sm:px-16"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:20px_20px]" />
          <h2 className="relative font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
            Ready to build your world?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/85">
            Join thousands of creators, professionals, and communities already growing on ArtROOT
            Chat. Your next chapter starts here.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Button
              as={Link}
              to="/register"
              size="lg"
              variant="secondary"
              className="bg-white text-brand-700 hover:bg-white/90"
              rightIcon={<FiArrowRight />}
            >
              Create your free account
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
