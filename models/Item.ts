import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IItem extends Document {
  title: string;
  category: string;
  type: 'lost' | 'found';
  description: string;
  location: string;
  date: Date;
  personName: string;
  phone: string;
  imageUrl: string;
  status: string; // "searching" | "recovered" | "waiting" | "returned"
  editToken: string; // Token generated on creation to authorize updates/deletes without login
  createdAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    type: { type: String, enum: ['lost', 'found'], required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    personName: { type: String, required: true },
    phone: { type: String, required: true },
    imageUrl: { type: String, required: true },
    status: { type: String, required: true },
    editToken: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Item: Model<IItem> = mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);

export default Item;
