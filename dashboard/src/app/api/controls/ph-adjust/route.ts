import { NextRequest, NextResponse } from 'next/server';

let phCommands: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.action || !['add_acid', 'add_base'].includes(data.action)) {
      return NextResponse.json({ error: 'Invalid action: must be add_acid or add_base' }, { status: 400 });
    }
    if (!data.amount || typeof data.amount !== 'number') {
      return NextResponse.json({ error: 'Invalid amount: must be a number' }, { status: 400 });
    }
    const command = { ...data, timestamp: new Date().toISOString() };
    phCommands.push(command);
    if (phCommands.length > 10) phCommands.shift();
    return NextResponse.json({ message: 'Command received', command });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(phCommands.slice(-1));
}