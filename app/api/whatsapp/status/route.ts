import { NextRequest, NextResponse } from 'next/server';
import { getMetaConfig } from '@/lib/meta-config';
import { getShopConnection } from '@/lib/whatsapp-connection-store';

export async function GET(request: NextRequest) {
  const { metaAppId, metaAppSecret, wabaId: metaWabaId, redirectUri: metaRedirectUri, isConfigured } = getMetaConfig();

  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get('shopId') || 'shop-maison-ndolo';

  const connectionRecord = getShopConnection(shopId);

  const missingVariables: string[] = [];
  if (!metaAppId) missingVariables.push('META_APP_ID');
  if (!metaAppSecret) missingVariables.push('META_APP_SECRET');

  return NextResponse.json({
    configured: isConfigured,
    shopId,
    // Real server-side verified connection status
    connection: {
      status: connectionRecord.status,
      verified: connectionRecord.verified,
      connectedAt: connectionRecord.connectedAt || null,
      lastSyncAt: connectionRecord.lastSyncAt || null,
      wabaId: connectionRecord.wabaId || metaWabaId || null,
      wabaName: connectionRecord.wabaName || null,
      catalogId: connectionRecord.catalogId || null,
      catalogName: connectionRecord.catalogName || null,
      productCount: connectionRecord.productCount || 0,
      error: connectionRecord.error || null,
      errorMessage: connectionRecord.errorMessage || null,
    },
    metaAppId: metaAppId,
    metaAppIdMasked: metaAppId ? `${metaAppId.slice(0, 4)}••••${metaAppId.slice(-4)}` : null,
    hasAppSecret: Boolean(metaAppSecret),
    metaAppSecretMasked: metaAppSecret ? `••••••••${metaAppSecret.slice(-4)}` : null,
    redirectUri: metaRedirectUri,
    apiHost: 'https://graph.facebook.com/v19.0',
    requiredScopes: [
      'whatsapp_business_management',
      'whatsapp_business_messaging',
      'catalog_management',
    ],
    supportedApiVersions: ['v18.0', 'v19.0', 'v20.0'],
  });
}
