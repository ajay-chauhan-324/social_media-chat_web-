import mongoose from 'mongoose';

const { Schema } = mongoose;

const imageSchema = new Schema(
  { url: { type: String, required: true }, publicId: { type: String, default: '' } },
  { _id: false }
);

const messageSchema = new Schema(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['text', 'image', 'system'], default: 'text' },
    content: { type: String, trim: true, maxlength: 4000, default: '' },
    images: { type: [imageSchema], default: [] },

    replyTo: { type: Schema.Types.ObjectId, ref: 'Message', default: null },

    // Who has read this message (used for group seen-by; private uses lastReadAt).
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    isPinned: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (_d, ret) => (delete ret.__v, ret) },
    toObject: { virtuals: true },
  }
);

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, content: 'text' });

const Message = mongoose.model('Message', messageSchema);

export default Message;
