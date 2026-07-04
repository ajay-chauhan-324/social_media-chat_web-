import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Stores hashed refresh / email-verification / password-reset tokens.
 * Refresh tokens support session revocation; verify/reset tokens auto-expire
 * via a TTL index.
 */
const tokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['refresh', 'verify', 'reset'],
      required: true,
    },
    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index — MongoDB removes the document once expiresAt passes.
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model('Token', tokenSchema);

export default Token;
