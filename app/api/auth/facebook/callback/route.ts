import { NextRequest, NextResponse } from 'next/server';
import { createDbClient } from '@/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const returnTo = searchParams.get('state') || '/';

  console.log('Callback hit with code:', code, 'returnTo:', returnTo);

  if (!code) {
    console.log('No code provided');
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    console.log('Fetching tokens...');
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID!}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET!}&redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI!)}&code=${code}`
    );
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.log('Token error:', tokenData.error);
      return NextResponse.json({ error: 'Failed to get token' }, { status: 400 });
    }
    const accessToken = tokenData.access_token;
    console.log('Tokens received:', !!accessToken);

    const userResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,email,name&access_token=${accessToken}`
    );
    const userData = await userResponse.json();

    if (userData.error) {
      console.log('User data error:', userData.error);
      return NextResponse.json({ error: 'Failed to get user data' }, { status: 400 });
    }
    const email = userData.email;
    const name = userData.name;

    if (!email) {
      console.log('No email in user data');
      return NextResponse.json({ error: 'No email from Facebook' }, { status: 400 });
    }

    const db = createDbClient();
    await db.connect();
    console.log('DB connected');
    const existingUser = await db.query('SELECT * FROM "User" WHERE email = $1', [email]);
    let userId: string;
    if (!existingUser.rows.length) {
      const result = await db.query(
        'INSERT INTO "User" (email, name) VALUES ($1, $2) RETURNING id',
        [email, name]
      );
      userId = result.rows[0].id.toString();
      console.log('New user added:', email);
    } else {
      userId = existingUser.rows[0].id.toString();
      console.log('Existing user found:', email);
    }
    await db.end();

    console.log('Setting cookie and redirecting to:', returnTo);
    const response = NextResponse.redirect(new URL(returnTo, req.url));
    response.cookies.set('userId', userId, { httpOnly: true, path: '/', sameSite: 'lax' });
    return response;
  } catch (error) {
    console.error('Facebook auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}