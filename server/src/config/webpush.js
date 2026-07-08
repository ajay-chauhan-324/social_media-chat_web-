import webpush from 'web-push';
import env from './env.js';
import logger from '../utils/logger.js';

if (env.webpush.enabled) {
  webpush.setVapidDetails(env.webpush.subject, env.webpush.publicKey, env.webpush.privateKey);
  logger.success('Web Push configured');
} else {
  logger.warn(
    'Web Push not configured — set VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY to enable device notifications'
  );
}

export default webpush;
