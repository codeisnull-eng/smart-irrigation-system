import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${image}`,
      {
        folder: 'verdirra',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      }
    );

    return NextResponse.json({ url: result.secure_url, public_id: result.public_id });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}