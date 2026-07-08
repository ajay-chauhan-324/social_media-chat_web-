import webpush from '../config/webpush.js';
import env from '../config/env.js';
import PushSubscription from '../models/PushSubscription.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/** Store (or refresh) a device's push subscription for a user. */
export const saveSubscription = async (userId, sub, userAgent = '') => {
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    throw ApiError.badRequest('Invalid push subscription');
  }
  await PushSubscription.findOneAndUpdate(
    { endpoint: sub.endpoint },
    { user: userId, endpoint: sub.endpoint, keys: sub.keys, userAgent },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return { subscribed: true };
};

export const removeSubscription = async (endpoint) => {
  if (endpoint) await PushSubscription.deleteOne({ endpoint });
  return { subscribed: false };
};

/**
 * Send a push notification to every device a user has registered.
 * Best-effort: prunes dead subscriptions (404/410) and never throws.
 */
export const sendPush = async (userId, payload) => {
  if (!env.webpush.enabled) return;
  const subs = await PushSubscription.find({ user: userId });
  if (!subs.length) return;

  const body = JSON.stringify(payload);
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, body);
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: s._id }); // gone — clean up
        } else {
          logger.warn(`Push send failed (${err.statusCode || '?'}): ${err.message}`);
        }
      }
    })
  );
};
