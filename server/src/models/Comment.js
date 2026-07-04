import mongoose from 'mongoose';

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },

    // null → top-level comment; otherwise a reply to another comment.
    parent: { type: Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },

    likesCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },

    editedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (_d, ret) => (delete ret.__v, ret) },
    toObject: { virtuals: true },
  }
);

commentSchema.index({ post: 1, parent: 1, createdAt: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
