import { v2 as cloudinary } from 'cloudinary';
import env from './env.js';
import logger from '../utils/logger.js';

if (env.cloudinary.enabled) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
  logger.success('Cloudinary configured');
} else {
  logger.warn('Cloudinary not configured — uploads will use local ./uploads storage (mock mode)');
}

export { cloudinary };
export default cloudinary;
