import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiWifiOff } from 'react-icons/fi';

/** Fixed banner shown whenever the browser loses network connectivity. */
export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          role="status"
          className="fixed inset-x-0 top-0 z-[80] flex items-center justify-center gap-2 bg-warning px-4 py-2 text-sm font-semibold text-black shadow-soft"
        >
          <FiWifiOff size={16} />
          You’re offline — some features may be unavailable until you reconnect.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
