import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as pushService from '../services/push.service.js';
import env from '../config/env.js';

/** Public: the VAPID key the browser needs to subscribe (null if disabled). */
export const getPublicKey = asyncHandler(async (_req, res) =>
  ApiResponse.ok(
    res,
    { publicKey: env.webpush.enabled ? env.webpush.publicKey : null },
    'VAPID public key'
  )
);

export const subscribe = asyncHandler(async (req, res) => {
  const data = await pushService.saveSubscription(
    req.user.id,
    req.body.subscription,
    req.headers['user-agent'] || ''
  );
  return ApiResponse.ok(res, data, 'Push subscription saved');
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const data = await pushService.removeSubscription(req.body.endpoint);
  return ApiResponse.ok(res, data, 'Push subscription removed');
});
