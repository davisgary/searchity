import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('userId');
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Sign out failed' }, { status: 500 });
  }
}