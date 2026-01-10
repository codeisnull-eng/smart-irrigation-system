import { NextRequest, NextResponse } from 'next/server';

let controlCommands: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.action || !['start', 'stop'].includes(data.action)) {
      return NextResponse.json({ error: 'Invalid action: must be start or stop' }, { status: 400 });
    }
    const command = { ...data, timestamp: new Date().toISOString() };
    controlCommands.push(command);
    if (controlCommands.length > 10) controlCommands.shift();
    return NextResponse.json({ message: 'Command received', command });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(controlCommands.slice(-1));
}