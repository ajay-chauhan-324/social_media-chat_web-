import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinary.js';
import env from '../config/env.js';
import { randomToken } from '../utils/crypto.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

const extFromMime = (mime) =>
  ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' })[mime] ||
  'jpg';

/** Upload a single in-memory file buffer. Returns { url, publicId }. */
export const uploadImage = async (file, folder = 'posts') => {
  if (env.cloudinary.enabled) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `artroot/${folder}`,
          resource_type: 'image',
          transformation: [{ width: 1600, height: 1600, crop: 'limit' }, { quality: 'auto' }],
        },
        (err, result) => {
          if (err) return reject(err);
          return resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          });
        }
      );
      stream.end(file.buffer);
    });
  }

  // ── Local fallback (mock mode) ──
  const dir = path.join(UPLOAD_DIR, folder);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${randomToken(6)}.${extFromMime(file.mimetype)}`;
  await fs.writeFile(path.join(dir, filename), file.buffer);
  const url = `${env.clientUrl.replace(/:\d+$/, `:${env.port}`)}/uploads/${folder}/${filename}`;
  // Note: served via express static; VITE proxy also forwards /uploads in dev.
  return { url: `/uploads/${folder}/${filename}`, publicId: '' };
};

export const uploadImages = (files = [], folder = 'posts') =>
  Promise.all(files.map((f) => uploadImage(f, folder)));

/** Best-effort delete (no-op for local files that may be shared). */
export const destroyImage = async (publicId) => {
  if (!publicId || !env.cloudinary.enabled) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    logger.warn(`Failed to delete Cloudinary asset ${publicId}: ${err.message}`);
  }
};
