import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import env from '../config/env.js';

/** 404 handler for unmatched routes. */
export const notFoundHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/** Central error translator → consistent JSON error body. */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  let error = err;

  // Mongoose: bad ObjectId
  if (error instanceof mongoose.Error.CastError) {
    error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
  }

  // Mongoose: validation
  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.badRequest('Validation failed', details);
  }

  // Mongo: duplicate key
  if (error?.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || 'field';
    error = ApiError.conflict(`An account with that ${field} already exists`);
  }

  // JWT
  if (error?.name === 'JsonWebTokenError') error = ApiError.unauthorized('Invalid token');
  if (error?.name === 'TokenExpiredError') error = ApiError.unauthorized('Token expired');

  if (!(error instanceof ApiError)) {
    logger.error('Unhandled error:', error.stack || error.message);
    error = ApiError.internal(env.isProd ? 'Something went wrong' : error.message);
  }

  const body = {
    success: false,
    message: error.message,
  };
  if (error.details) body.details = error.details;
  if (!env.isProd && error.statusCode >= 500) body.stack = err.stack;

  res.status(error.statusCode || 500).json(body);
};
