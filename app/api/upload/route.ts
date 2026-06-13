import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check if Cloudinary is not configured or using placeholders
    if (!cloudName || cloudName === 'placeholder_name' || cloudName.includes('placeholder')) {
      console.log('Using local Base64 image upload fallback');
      
      // Convert the uploaded File object directly to a Base64 Data URI
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64String = buffer.toString('base64');
      const mimeType = file.type || 'image/jpeg';
      const dataUri = `data:${mimeType};base64,${base64String}`;
      
      return NextResponse.json({ success: true, url: dataUri });
    }

    // Convert File object to Node.js Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary via upload_stream wrapped in a Promise
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'campus_lost_and_found' },
        (error, uploadResult) => {
          if (error) {
            reject(error);
          } else {
            resolve(uploadResult as { secure_url: string });
          }
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ success: true, url: result.secure_url });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}
