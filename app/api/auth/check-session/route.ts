import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createDbClient } from '@/db';

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return NextResponse.json({ isAuthenticated: false });
  }

  try {
    const db = createDbClient();
    await db.connect();
    const result = await db.query('SELECT image FROM "User" WHERE id = $1', [userId]);
    const userImage = result.rows[0]?.image;
    await db.end();

    return NextResponse.json({
      isAuthenticated: true,
      userImage: userImage || undefined,
    });
  } catch (error) {
    return NextResponse.json({ isAuthenticated: false });
  }
}