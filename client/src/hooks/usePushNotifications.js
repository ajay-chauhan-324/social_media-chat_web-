import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import pushService from '@/services/pushService';

const supported =
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

/** VAPID public key (base64url) → Uint8Array for pushManager.subscribe. */
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) arr[i] = raw.charCodeAt(i);
  return arr;
};

/**
 * Manages this device's web-push subscription. `enable()` must be called from a
 * user gesture (permission prompt requirement). Reflects the current
 * subscription state so a toggle can render correctly.
 */
export default function usePushNotifications() {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEnabled(Boolean(sub)))
      .catch(() => {});
  }, []);

  const enable = useCallback(async () => {
    if (!supported) {
      toast.error('Notifications are not supported on this device/browser');
      return;
    }
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission was blocked');
        return;
      }
      const publicKey = await pushService.publicKey();
      if (!publicKey) {
        toast.error('Push notifications are not configured on the server yet');
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await pushService.subscribe(sub);
      setEnabled(true);
      toast.success('Device notifications enabled');
    } catch (err) {
      toast.error('Could not enable device notifications');
    } finally {
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await pushService.unsubscribe(sub.endpoint).catch(() => {});
        await sub.unsubscribe();
      }
      setEnabled(false);
      toast.success('Device notifications turned off');
    } catch (err) {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }, []);

  return { supported, enabled, busy, enable, disable };
}
