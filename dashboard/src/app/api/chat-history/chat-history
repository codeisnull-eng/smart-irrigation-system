import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';

export async function GET() {
  try {
    await connectDB();
    const messages = await ChatMessage.find().sort({ createdAt: 1 }).limit(100);
    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { role, text, image } = await request.json();
    const message = await ChatMessage.create({ role, text, image });
    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await connectDB();
    await ChatMessage.deleteMany({});
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}