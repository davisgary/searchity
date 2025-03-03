import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createDbClient } from '@/db';

export async function DELETE() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  console.log('Delete-account - userId from cookie:', userId);

  if (!userId) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const db = createDbClient();
    await db.connect();

    const result = await db.query(
      'DELETE FROM "User" WHERE id = $1 RETURNING id',
      [userId]
    );

    await db.end();

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    cookieStore.delete('userId');

    console.log('Delete-account - account deleted for userId:', userId);

    return NextResponse.json({
      message: 'Account successfully deleted'
    });
  } catch (error) {
    console.error('Delete-account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}