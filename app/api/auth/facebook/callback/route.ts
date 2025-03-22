import { NextRequest, NextResponse } from 'next/server';
import { createDbClient } from '@/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const returnTo = searchParams.get('state') || '/';

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID!}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET!}&redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI!)}&code=${code}`
    );
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.json({ error: 'Failed to get token' }, { status: 400 });
    }
    const accessToken = tokenData.access_token;

    const userResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,email,name,picture.type(large)&access_token=${accessToken}`
    );
    const userData = await userResponse.json();

    if (userData.error) {
      return NextResponse.json({ error: 'Failed to get user data' }, { status: 400 });
    }
    const email = userData.email;
    const name = userData.name;
    const image = userData.picture?.data?.url;

    if (!email) {
      return NextResponse.json({ error: 'No email from Facebook' }, { status: 400 });
    }

    const db = createDbClient();
    await db.connect();
    const existingUser = await db.query('SELECT * FROM "User" WHERE email = $1', [email]);
    let userId: string;
    if (!existingUser.rows.length) {
      const result = await db.query(
        'INSERT INTO "User" (email, name, image) VALUES ($1, $2, $3) RETURNING id',
        [email, name, image]
      );
      userId = result.rows[0].id.toString();
    } else {
      userId = existingUser.rows[0].id.toString();
      await db.query('UPDATE "User" SET image = $1 WHERE email = $2', [image, email]);
    }
    await db.end();

    const response = NextResponse.redirect(new URL(returnTo, req.url));
    response.cookies.set('userId', userId, { httpOnly: true, path: '/', sameSite: 'lax' });
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}