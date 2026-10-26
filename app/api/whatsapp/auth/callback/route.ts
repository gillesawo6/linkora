import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/seller/connection?error=${encodeURIComponent(error)}&message=${encodeURIComponent(
          errorDescription || 'Meta authorization was cancelled or denied.'
        )}`,
        request.url
      )
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/seller/connection?error=missing_code&message=No+authorization+code+received', request.url)
    );
  }

  const metaAppId = process.env.META_APP_ID;
  const metaAppSecret = process.env.META_APP_SECRET;
  const redirectUri =
    process.env.META_OAUTH_REDIRECT_URI ||
    `${process.env.APP_URL || 'http://localhost:3000'}/api/whatsapp/auth/callback`;

  if (!metaAppId || !metaAppSecret) {
    return NextResponse.redirect(
      new URL(
        '/seller/connection?error=unconfigured_server&message=Meta+credentials+not+configured+on+server',
        request.url
      )
    );
  }

  try {
    // Exchange code for short-lived access token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${metaAppId}&client_secret=${metaAppSecret}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&code=${encodeURIComponent(code)}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return NextResponse.redirect(
        new URL(
          `/seller/connection?error=token_exchange_failed&message=${encodeURIComponent(
            tokenData.error.message || 'Token exchange failed'
          )}`,
          request.url
        )
      );
    }

    // Token retrieved securely server-side; redirect back to connection with success flag
    return NextResponse.redirect(
      new URL('/seller/connection?status=connected&sync=prompt', request.url)
    );
  } catch (err: any) {
    return NextResponse.redirect(
      new URL(
        `/seller/connection?error=internal_error&message=${encodeURIComponent(
          err.message || 'Unexpected error communicating with Meta API'
        )}`,
        request.url
      )
    );
  }
}
