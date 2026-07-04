import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const experienceSchema = new Schema(
  {
    title: { type: String, trim: true, maxlength: 120 },
    company: { type: String, trim: true, maxlength: 120 },
    startYear: Number,
    endYear: Number,
    current: { type: Boolean, default: false },
  },
  { _id: true }
);

const educationSchema = new Schema(
  {
    school: { type: String, trim: true, maxlength: 160 },
    degree: { type: String, trim: true, maxlength: 120 },
    field: { type: String, trim: true, maxlength: 120 },
    startYear: Number,
    endYear: Number,
  },
  { _id: true }
);

const userSchema = new Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-z0-9_.]+$/, 'Username may only contain letters, numbers, "_" and "."'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // Profile
    avatar: { type: String, default: '' },
    cover: { type: String, default: '' },
    bio: { type: String, trim: true, maxlength: 280, default: '' },
    headline: { type: String, trim: true, maxlength: 120, default: '' },
    location: { type: String, trim: true, maxlength: 120, default: '' },
    website: { type: String, trim: true, maxlength: 200, default: '' },
    skills: { type: [String], default: [] },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },

    // Social graph (counts are denormalized for fast reads; source of truth
    // lives in the Follow collection added in the social phase).
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },

    // Gamification
    aiScore: { type: Number, default: 0 },

    // Status
    isVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    lastActiveAt: { type: Date, default: Date.now },

    // Preferences
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ── Virtuals ──────────────────────────────────────────────────────────────
userSchema.virtual('profileCompletion').get(function computeCompletion() {
  const fields = [this.avatar, this.bio, this.headline, this.location, this.website];
  const filled = fields.filter(Boolean).length;
  const bonus = (this.skills?.length ? 1 : 0) + (this.experience?.length ? 1 : 0);
  return Math.min(100, Math.round(((filled + bonus) / (fields.length + 2)) * 100));
});

// ── Hooks ─────────────────────────────────────────────────────────────────
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

// ── Methods ───────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ── Indexes ───────────────────────────────────────────────────────────────
userSchema.index({ name: 'text', username: 'text', headline: 'text', skills: 'text' });

const User = mongoose.model('User', userSchema);

export default User;
