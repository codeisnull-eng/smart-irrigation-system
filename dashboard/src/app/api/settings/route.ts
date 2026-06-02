import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import PlantSettings from '@/models/PlantSettings';

export async function GET() {
  try {
    await connectDB();
    const settings = await PlantSettings.findOne().sort({ updatedAt: -1 });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();

    await PlantSettings.deleteMany({});
    const settings = await PlantSettings.create(data);
    return NextResponse.json({ message: 'Settings saved', settings });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}