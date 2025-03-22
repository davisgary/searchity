import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const returnTo = searchParams.get('returnTo') || '/';

  const clientId = process.env.FACEBOOK_CLIENT_ID!;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI!;
  const scope = 'email';
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(returnTo)}`;

  return new NextResponse(null, { status: 302, headers: { Location: authUrl } });
}