import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import env from './config/env.js';
import routes from './routes/index.js';
import { apiLimiter } from './middlewares/rateLimit.middleware.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.set('trust proxy', 1);

// Security & parsing
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());
app.use(mongoSanitize());

if (!env.isProd) app.use(morgan('dev'));

// Serve locally-stored uploads when Cloudinary is disabled (mock mode).
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API
app.use('/api', apiLimiter, routes);

// In production, serve the built React client if it was bundled alongside the
// server (single-service deploy). When the client is hosted separately (e.g.
// Vercel), client/dist won't exist and we run API-only.
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (env.isProd && fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist));
  // SPA fallback: any non-API GET returns index.html so client-side routing works.
  app.get(/^\/(?!api\/|uploads\/).*/, (_req, res) =>
    res.sendFile(path.join(clientDist, 'index.html'))
  );
} else {
  app.get('/', (_req, res) =>
    res.json({ name: 'ArtROOT Chat API', version: '1.0.0', docs: '/api/health' })
  );
}

// Errors
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
