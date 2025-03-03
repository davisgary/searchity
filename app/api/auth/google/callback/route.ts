import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { createDbClient } from '@/db';

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI!,
});

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
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Tokens received:', !!tokens.id_token);
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name;
    const image = payload?.picture;

    if (!email) {
      console.log('No email in payload');
      return NextResponse.json({ error: 'No email from Google' }, { status: 400 });
    }

    const db = createDbClient();
    await db.connect();
    console.log('DB connected');
    const existingUser = await db.query('SELECT * FROM "User" WHERE email = $1', [email]);
    let userId: string;
    if (!existingUser.rows.length) {
      const result = await db.query(
        'INSERT INTO "User" (email, name, image) VALUES ($1, $2, $3) RETURNING id',
        [email, name, image]
      );
      userId = result.rows[0].id.toString();
      console.log('New user added:', email);
    } else {
      userId = existingUser.rows[0].id.toString();
      await db.query('UPDATE "User" SET image = $1 WHERE email = $2', [image, email]);
      console.log('Existing user found:', email);
    }
    await db.end();

    console.log('Setting cookies and redirecting to:', returnTo);
    const response = NextResponse.redirect(new URL(returnTo, req.url));
    response.cookies.set('userId', userId, { httpOnly: true, path: '/', sameSite: 'lax' });
    response.cookies.set('userImage', image || '', { path: '/', sameSite: 'lax' });
    return response;
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}