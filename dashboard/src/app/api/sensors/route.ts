import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SensorData from '@/models/SensorData';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();

    if (!data.moisture || !data.temperature) {
      return NextResponse.json(
        { error: 'Missing required fields: moisture, temperature' },
        { status: 400 }
      );
    }

    const sensorData = await SensorData.create(data);
    return NextResponse.json({ message: 'Data received', data: sensorData });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const latest = await SensorData.findOne().sort({ timestamp: -1 });
    return NextResponse.json(latest);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}