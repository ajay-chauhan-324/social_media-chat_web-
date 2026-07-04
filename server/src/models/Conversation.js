import mongoose from 'mongoose';

const { Schema } = mongoose;

const memberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['member', 'admin'], default: 'member' },
    lastReadAt: { type: Date, default: null },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new Schema(
  {
    type: { type: String, enum: ['private', 'group'], required: true },
    members: { type: [memberSchema], validate: (v) => v.length >= 2 },

    // Group-only metadata
    name: { type: String, trim: true, maxlength: 80, default: '' },
    avatar: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },

    // Denormalized for fast conversation-list rendering & sorting
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
    lastMessageAt: { type: Date, default: Date.now, index: true },

    // Stable key for private chats: sorted "idA:idB" — enforces one 1:1 convo.
    // Left unset for groups so the partial unique index ignores them.
    pairKey: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (_d, ret) => (delete ret.__v, ret) },
    toObject: { virtuals: true },
  }
);

conversationSchema.index({ 'members.user': 1, lastMessageAt: -1 });
conversationSchema.index(
  { pairKey: 1 },
  { unique: true, partialFilterExpression: { pairKey: { $type: 'string' } } }
);

conversationSchema.statics.pairKeyFor = (a, b) => [String(a), String(b)].sort().join(':');

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
