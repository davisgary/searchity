import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createDbClient } from '@/db';

interface AuthResponse {
  isAuthenticated: boolean;
  userImage?: string;
  timestamp?: number;
}

const cache = new Map<string, AuthResponse>();
const CACHE_TTL = 30 * 60 * 1000;

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return NextResponse.json({ isAuthenticated: false }, { status: 200 });
  }

  const cached = cache.get(userId);
  if (cached && Date.now() - (cached.timestamp || 0) < CACHE_TTL) {
    return NextResponse.json(cached);
  }

  const db = createDbClient();
  try {
    await db.connect();
    const result = await db.query('SELECT image FROM "User" WHERE id = $1', [userId]);
    const userImage = result.rows[0]?.image;

    const response: AuthResponse = {
      isAuthenticated: true,
      userImage: userImage || undefined,
      timestamp: Date.now(),
    };

    cache.set(userId, response);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ isAuthenticated: false }, { status: 500 });
  } finally {
    await db.end();
  }
}