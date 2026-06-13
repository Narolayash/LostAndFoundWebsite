import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import mongoose from 'mongoose';

// GET /api/messages/[itemId] - Retrieve all messages for an item, sorted oldest to newest
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    await dbConnect();
    const { itemId } = await params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Item ID' },
        { status: 400 }
      );
    }

    const messages = await Message.find({ itemId }).sort({ createdAt: 1 });
    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database error' },
      { status: 500 }
    );
  }
}
