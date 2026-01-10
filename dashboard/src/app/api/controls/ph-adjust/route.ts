import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for pH control commands
let phCommands: any[] = [];

// POST /api/controls/ph-adjust - Send pH adjustment command
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Validate action
    if (!data.action || !['add_acid', 'add_base'].includes(data.action)) {
      return NextResponse.json({ error: 'Invalid action: must be add_acid or add_base' }, { status: 400 });
    }
    if (!data.amount || typeof data.amount !== 'number') {
      return NextResponse.json({ error: 'Invalid amount: must be a number' }, { status: 400 });
    }
    const command = { ...data, timestamp: new Date().toISOString() };
    phCommands.push(command);
    // Keep only last 10 commands
    if (phCommands.length > 10) phCommands.shift();
    return NextResponse.json({ message: 'Command received', command });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

// GET /api/controls/ph-adjust - Retrieve latest commands
export async function GET() {
  return NextResponse.json(phCommands.slice(-1));
}