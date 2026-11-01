import { NextRequest, NextResponse } from 'next/server';
import { getMetaConfig } from '@/lib/meta-config';
import { createOAuthState } from '@/lib/whatsapp-connection-store';

export async function GET(request: NextRequest) {
  const { metaAppId, redirectUri } = getMetaConfig();

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
  const shopId = searchParams.get('shopId') || 'shop-maison-ndolo';

  // Generate cryptographically secure CSRF state token tied to shopId and store with TTL
  const { state, expiresAt } = createOAuthState(shopId);

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
    shopId,
    expiresAt,
  });
}
