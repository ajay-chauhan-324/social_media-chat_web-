import mongoose from 'mongoose';

const { Schema } = mongoose;

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' }, // Cloudinary id (empty in local mode)
    width: Number,
    height: Number,
  },
  { _id: false }
);

const postSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, trim: true, maxlength: 3000, default: '' },
    images: { type: [imageSchema], default: [] },
    hashtags: { type: [String], default: [], index: true },
    mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    // Denormalized engagement counters (kept in sync via $inc).
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },

    isPinned: { type: Boolean, default: false },
    visibility: { type: String, enum: ['public', 'followers'], default: 'public' },
    status: { type: String, enum: ['published', 'draft'], default: 'published' },

    editedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (_d, ret) => (delete ret.__v, ret) },
    toObject: { virtuals: true },
  }
);

// A post must have text or at least one image.
postSchema.pre('validate', function requireContent(next) {
  if (!this.content?.trim() && (!this.images || this.images.length === 0)) {
    return next(new Error('A post needs text or an image'));
  }
  return next();
});

// Common access patterns.
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ status: 1, visibility: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
