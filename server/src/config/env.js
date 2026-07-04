import dotenv from 'dotenv';

dotenv.config();

const bool = (v) => Boolean(v && String(v).trim().length);

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/artroot_chat',
  // Optional DB-name override. When empty, the database in the connection
  // string wins (e.g. ".../artrootchat"); only set MONGO_DB_NAME to force a
  // different DB or when the URI omits one (Atlas SRV would default to "test").
  mongoDbName: process.env.MONGO_DB_NAME || '',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '30d',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    enabled: bool(process.env.GEMINI_API_KEY),
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    enabled:
      bool(process.env.CLOUDINARY_CLOUD_NAME) &&
      bool(process.env.CLOUDINARY_API_KEY) &&
      bool(process.env.CLOUDINARY_API_SECRET),
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'ArtROOT Chat <no-reply@artroot.chat>',
    enabled: bool(process.env.SMTP_HOST) && bool(process.env.SMTP_USER),
  },
};

export default env;
