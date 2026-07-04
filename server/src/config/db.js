import mongoose from 'mongoose';
import dns from 'node:dns';
import env from './env.js';
import logger from '../utils/logger.js';

mongoose.set('strictQuery', true);

/**
 * `mongodb+srv://` needs a DNS SRV lookup. If the OS resolver is unusable
 * (e.g. set to 127.0.0.1 by a VPN/Docker/Pi-hole with nothing listening on
 * port 53), those lookups fail with `querySrv ECONNREFUSED`. Fall back to
 * public DNS in-process so Atlas works without changing system settings.
 * Override with DNS_SERVERS="8.8.8.8,1.1.1.1" if you prefer specific servers.
 */
const ensureUsableDnsForSrv = () => {
  if (!/^mongodb\+srv:/i.test(env.mongoUri)) return;

  const override = (process.env.DNS_SERVERS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (override.length) {
    dns.setServers(override);
    logger.info(`DNS servers set from DNS_SERVERS: ${override.join(', ')}`);
    return;
  }

  const current = dns.getServers();
  const loopbackOnly =
    current.length === 0 ||
    current.every((s) => s === '::1' || s.startsWith('127.'));
  if (loopbackOnly) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    logger.warn(
      `System DNS is loopback-only (${current.join(', ') || 'none'}) — using public DNS 8.8.8.8/1.1.1.1 for Atlas SRV lookup`
    );
  }
};

/**
 * Connect to MongoDB. Retries a few times so a slow-starting Atlas/local
 * instance doesn't crash the boot sequence.
 */
export const connectDB = async (retries = 5, delayMs = 3000) => {
  ensureUsableDnsForSrv();
  const options = { serverSelectionTimeoutMS: 8000 };
  if (env.mongoDbName) options.dbName = env.mongoDbName; // only override when set
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const conn = await mongoose.connect(env.mongoUri, options);
      const { host, name } = conn.connection;
      const isAtlas = /mongodb\.net/i.test(host);
      logger.success('✓ MongoDB Connected');
      logger.info(`  Database: ${name}`);
      logger.info(`  Host: ${host}${isAtlas ? '  (Atlas)' : ''}`);
      return conn;
    } catch (err) {
      logger.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return null;
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};
