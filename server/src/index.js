import http from 'http';
import app from './app.js';
import env from './config/env.js';
import logger from './utils/logger.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initSocket } from './socket/index.js';
import User from './models/User.js';

const server = http.createServer(app);

const maybeAutoSeed = async () => {
  if (process.env.SEED_ON_EMPTY === 'false') return;
  const count = await User.estimatedDocumentCount();
  if (count > 0) return;
  logger.warn('Database is empty — auto-seeding demo data (set SEED_ON_EMPTY=false to disable)…');
  const { default: runSeed } = await import('./seed/index.js');
  await runSeed();
};

const start = async () => {
  try {
    await connectDB();
    await maybeAutoSeed();
    initSocket(server);

    server.listen(env.port, () => {
      logger.success(`✓ Server Running on http://localhost:${env.port} [${env.nodeEnv}]`);
      if (!env.gemini.enabled) logger.warn('GEMINI_API_KEY not set — AI features run in mock mode');
    });
  } catch (err) {
    logger.error('Fatal boot error:', err.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  logger.warn(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));

process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection:', reason));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
  process.exit(1);
});

start();
