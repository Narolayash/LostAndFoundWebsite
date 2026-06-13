import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IMessage extends Document {
  itemId: Types.ObjectId;
  senderName: string;
  message: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    senderName: { type: String, required: true },
    message: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
