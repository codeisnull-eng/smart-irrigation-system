import { NextRequest, NextResponse } from 'next/server';

let sensorData: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.moisture || !data.temperature) {
      return NextResponse.json({ error: 'Missing required fields: moisture, temperature' }, { status: 400 });
    }
    data.timestamp = new Date().toISOString();
    sensorData.push(data);
    if (sensorData.length > 100) sensorData.shift();
    return NextResponse.json({ message: 'Data received', data });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(sensorData);
}