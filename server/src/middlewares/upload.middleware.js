import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 8 * 1024 * 1024; // 8MB per file

// Keep files in memory; the upload service decides where they land.
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED.includes(file.mimetype)) {
    return cb(ApiError.badRequest('Only JP, PNG, WEBP and GIF images are allowed'));
  }
  return cb(null, true);
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_BYTES, files: 4 },
});

/** Wrap multer so its errors become our ApiError shape. */
const wrap = (handler) => (req, res, next) =>
  handler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return next(ApiError.badRequest('Image exceeds 8MB'));
      if (err.code === 'LIMIT_FILE_COUNT') return next(ApiError.badRequest('Up to 4 images allowed'));
      return next(ApiError.badRequest(err.message));
    }
    if (err) return next(err);
    return next();
  });

export const uploadSingle = (field) => wrap(multerUpload.single(field));
export const uploadArray = (field, max = 4) => wrap(multerUpload.array(field, max));
