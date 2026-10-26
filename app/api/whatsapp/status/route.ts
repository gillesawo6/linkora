import { NextResponse } from 'next/server';

export async function GET() {
  const metaAppId = process.env.META_APP_ID;
  const metaAppSecret = process.env.META_APP_SECRET;
  const metaWabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  const metaRedirectUri = process.env.META_OAUTH_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/api/whatsapp/auth/callback`;

  const missingVariables: string[] = [];
  if (!metaAppId) missingVariables.push('META_APP_ID');
  if (!metaAppSecret) missingVariables.push('META_APP_SECRET');
  if (!metaWabaId) missingVariables.push('WHATSAPP_BUSINESS_ACCOUNT_ID');

  const isConfigured = Boolean(metaAppId && metaAppSecret);

  return NextResponse.json({
    configured: isConfigured,
    status: isConfigured ? 'ready_for_auth' : 'not_configured',
    missingCredentials: missingVariables,
    metaAppId: metaAppId ? `${metaAppId.slice(0, 4)}••••` : null,
    hasAppSecret: Boolean(metaAppSecret),
    wabaId: metaWabaId ? `${metaWabaId.slice(0, 4)}••••` : null,
    redirectUri: metaRedirectUri,
    apiHost: 'https://graph.facebook.com/v19.0',
    requiredScopes: [
      'whatsapp_business_management',
      'whatsapp_business_messaging',
      'catalog_management',
    ],
    supportedApiVersions: ['v18.0', 'v19.0', 'v20.0'],
    setupInstructions: {
      step1: 'Register a Meta Developer account at developers.facebook.com',
      step2: 'Create a Business App and add the WhatsApp Business Platform product',
      step3: 'Configure Meta App ID and App Secret in the server environment variables',
      step4: 'Add the OAuth redirect URI in Facebook Login for Business settings',
      step5: 'Submit for App Review with catalog_management and whatsapp_business_management permissions',
    },
  });
}
