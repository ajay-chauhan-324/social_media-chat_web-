import mongoose from 'mongoose';

const { Schema } = mongoose;

const aiMessageSchema = new Schema(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

// A tool call (currently only send_message) awaiting explicit user confirmation
// via the UI before it's actually executed. Cleared once confirmed/cancelled,
// or implicitly replaced/cleared when the user sends a new plain message.
const pendingActionSchema = new Schema(
  {
    tool: { type: String, required: true },
    args: { type: Schema.Types.Mixed, required: true },
    preview: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const aiHistorySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, trim: true, maxlength: 120, default: 'New conversation' },
    tool: { type: String, default: 'assistant' }, // assistant | caption | hashtags | bio | grammar | ...
    messages: { type: [aiMessageSchema], default: [] },
    model: { type: String, default: 'gemini-2.5-flash' },
    tokens: { type: Number, default: 0 },
    pendingAction: { type: pendingActionSchema, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (_d, ret) => (delete ret.__v, ret) },
  }
);

aiHistorySchema.index({ user: 1, updatedAt: -1 });

const AIHistory = mongoose.model('AIHistory', aiHistorySchema);

export default AIHistory;
