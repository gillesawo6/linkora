import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const metaAppId = process.env.META_APP_ID;
  const redirectUri =
    process.env.META_OAUTH_REDIRECT_URI ||
    `${process.env.APP_URL || 'http://localhost:3000'}/api/whatsapp/auth/callback`;

  if (!metaAppId) {
    return NextResponse.json(
      {
        error: 'Meta WhatsApp Business integration is not yet configured.',
        code: 'MISSING_META_CREDENTIALS',
        requiredEnv: ['META_APP_ID', 'META_APP_SECRET'],
        message:
          'To connect real WhatsApp Business catalogues, please provide META_APP_ID and META_APP_SECRET in the server environment.',
      },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get('shopId') || 'default-shop';
  const state = Buffer.from(JSON.stringify({ shopId, timestamp: Date.now() })).toString('base64');

  const scopes = [
    'whatsapp_business_management',
    'whatsapp_business_messaging',
    'catalog_management',
  ].join(',');

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${metaAppId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${encodeURIComponent(state)}`;

  return NextResponse.json({
    authUrl,
    state,
    redirectUri,
  });
}
