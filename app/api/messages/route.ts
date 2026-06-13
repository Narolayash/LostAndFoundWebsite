import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import Item from '@/models/Item';
import mongoose from 'mongoose';

// POST /api/messages - Post a new message
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { itemId, senderName, message } = body;

    // Validation
    if (!itemId || !senderName || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Item ID' },
        { status: 400 }
      );
    }

    // Check if item exists
    const itemExists = await Item.findById(itemId);
    if (!itemExists) {
      return NextResponse.json(
        { success: false, error: 'Target Item not found' },
        { status: 404 }
      );
    }

    const newMessage = await Message.create({
      itemId: new mongoose.Types.ObjectId(itemId),
      senderName,
      message,
    });

    return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
  } catch (error: any) {
    console.error('Error posting message:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database error' },
      { status: 500 }
    );
  }
}
