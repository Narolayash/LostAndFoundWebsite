import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import Message from '@/models/Message';
import mongoose from 'mongoose';

// Utility to verify token or admin override
function isAuthorized(itemToken: string, requestToken?: string | null): boolean {
  // Allow full testing access in local development environment
  if (process.env.NODE_ENV === 'development') return true;

  if (!itemToken) return false;
  if (requestToken === itemToken) return true;
  
  // Optional admin master password bypass
  const adminSecret = process.env.ADMIN_SECRET;
  if (adminSecret && requestToken === adminSecret) return true;
  
  return false;
}

// GET /api/items/[id] - Get single item details (hiding private editToken)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Item ID format' },
        { status: 400 }
      );
    }

    // Explicitly exclude editToken to keep it hidden
    const item = await Item.findById(id).select('-editToken');
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('Error fetching item by id:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database error' },
      { status: 500 }
    );
  }
}

// PUT /api/items/[id] - Update status or details (authorized)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Item ID format' },
        { status: 400 }
      );
    }

    // Retrieve item including the editToken for verification
    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    // Extract authorization token from header or body
    const headerToken = request.headers.get('x-edit-token');
    const requestToken = headerToken || body.editToken;

    if (!isAuthorized(item.editToken, requestToken)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid edit token' },
        { status: 403 }
      );
    }

    // Only allow updating allowed fields
    const allowedUpdates = ['status', 'title', 'category', 'description', 'location', 'date', 'personName', 'phone', 'imageUrl'];
    
    // Apply updates
    Object.keys(body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item as any)[key] = body[key];
      }
    });

    await item.save();

    // Hide editToken in return payload
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { editToken, ...safeItem } = item.toObject();

    return NextResponse.json({ success: true, item: safeItem });
  } catch (error: any) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database error' },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id] - Delete an item and its associated messages (authorized)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Item ID format' },
        { status: 400 }
      );
    }

    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    // Extract authorization token from headers
    const headerToken = request.headers.get('x-edit-token');
    
    // Parse body if it contains JSON to fallback on body.editToken
    let requestToken = headerToken;
    try {
      const clonedReq = request.clone();
      const body = await clonedReq.json();
      if (body && body.editToken) {
        requestToken = headerToken || body.editToken;
      }
    } catch (e) {
      // Body is not JSON or empty
    }

    if (!isAuthorized(item.editToken, requestToken)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid edit token' },
        { status: 403 }
      );
    }

    // Authorized deletion
    await Item.findByIdAndDelete(id);

    // Delete all linked messages in the chat section
    await Message.deleteMany({ itemId: id });

    return NextResponse.json({ success: true, message: 'Item and linked chat deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database error' },
      { status: 500 }
    );
  }
}
