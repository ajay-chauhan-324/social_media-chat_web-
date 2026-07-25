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

const aiHistorySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, trim: true, maxlength: 120, default: 'New conversation' },
    tool: { type: String, default: 'assistant' }, // assistant | caption | hashtags | bio | grammar | ...
    messages: { type: [aiMessageSchema], default: [] },
    model: { type: String, default: 'gemini-2.5-flash' },
    tokens: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (_d, ret) => (delete ret.__v, ret) },
  }
);

aiHistorySchema.index({ user: 1, updatedAt: -1 });

const AIHistory = mongoose.model('AIHistory', aiHistorySchema);

export default AIHistory;
