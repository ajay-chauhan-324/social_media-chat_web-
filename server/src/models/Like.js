import mongoose from 'mongoose';

const { Schema } = mongoose;

/** Polymorphic like — targets either a Post or a Comment. */
const likeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['Post', 'Comment'], required: true },
    target: { type: Schema.Types.ObjectId, required: true, refPath: 'targetType' },
  },
  { timestamps: true }
);

// One like per user per target.
likeSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true });
likeSchema.index({ target: 1, targetType: 1 });

const Like = mongoose.model('Like', likeSchema);

export default Like;
