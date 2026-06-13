import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import crypto from 'crypto';

// GET /api/items - Retrieve all items with search, filters, and sorting
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || '';
    const sort = searchParams.get('sort') || 'latest';

    // Build filter query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    // Determine sorting
    const sortOrder = sort === 'oldest' ? 1 : -1;

    // Do NOT return editToken in list responses to keep it private!
    const items = await Item.find(filter).select('-editToken').sort({ createdAt: sortOrder });
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database error' },
      { status: 500 }
    );
  }
}

// POST /api/items - Create a new item
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { title, category, type, description, location, date, personName, phone, imageUrl } = body;

    // Validation
    if (!title || !category || !type || !description || !location || !date || !personName || !phone || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Default status:
    // lost -> searching, found -> waiting
    const status = type === 'lost' ? 'searching' : 'waiting';

    // Generate secure editToken using crypto
    const editToken = crypto.randomUUID();

    const newItem = await Item.create({
      title,
      category,
      type,
      description,
      location,
      date: new Date(date),
      personName,
      phone,
      imageUrl,
      status,
      editToken,
    });

    // Return editToken only in this creation response so the user can save it
    return NextResponse.json({ success: true, item: newItem, editToken }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database error' },
      { status: 500 }
    );
  }
}
