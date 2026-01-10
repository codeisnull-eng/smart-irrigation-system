import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for sensor data (for demo purposes)
let sensorData: any[] = [];

// POST /api/sensors - Receive sensor data from ESP32
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Validate basic fields
    if (!data.moisture || !data.ph) {
      return NextResponse.json({ error: 'Missing required fields: moisture, ph' }, { status: 400 });
    }
    data.timestamp = new Date().toISOString();
    sensorData.push(data);
    // Keep only last 100 readings
    if (sensorData.length > 100) sensorData.shift();
    return NextResponse.json({ message: 'Data received', data });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

// GET /api/sensors - Retrieve sensor data for dashboard
export async function GET() {
  return NextResponse.json(sensorData);
}