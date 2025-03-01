import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('userId')?.value;
  
  if (userId) {
    return NextResponse.json({ isAuthenticated: true });
  }
  return NextResponse.json({ isAuthenticated: false });
}