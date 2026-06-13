import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('verdirra-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    return NextResponse.json({ user: decoded });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}