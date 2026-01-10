import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for control commands
let controlCommands: any[] = [];

// POST /api/controls/irrigate - Send irrigation command
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Validate action
    if (!data.action || !['start', 'stop'].includes(data.action)) {
      return NextResponse.json({ error: 'Invalid action: must be start or stop' }, { status: 400 });
    }
    const command = { ...data, timestamp: new Date().toISOString() };
    controlCommands.push(command);
    // Keep only last 10 commands
    if (controlCommands.length > 10) controlCommands.shift();
    return NextResponse.json({ message: 'Command received', command });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

// GET /api/controls/irrigate - Retrieve latest commands for ESP32 polling
export async function GET() {
  return NextResponse.json(controlCommands.slice(-1)); // Return latest command
}