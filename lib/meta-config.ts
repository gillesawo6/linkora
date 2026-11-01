/**
 * Meta / WhatsApp Business API server configuration helper.
 * Provides configured credentials with automatic fallback to user-provided App ID and secret.
 */

export function getMetaConfig() {
  const metaAppId =
    process.env.META_APP_ID?.trim() || '1892374375064524';

  const rawSecret =
    process.env.META_APP_SECRET?.trim() || 'dfc1b9ddea70858bbb1cc6881c9bca6';

  // Standard Meta App Secrets are 32 hex chars. If prefixed with an accidental '1', normalize it.
  const metaAppSecret =
    rawSecret.length === 33 && rawSecret.startsWith('1')
      ? rawSecret.slice(1)
      : rawSecret;

  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim() || '';

  const redirectUri =
    process.env.META_OAUTH_REDIRECT_URI?.trim() ||
    `${process.env.APP_URL || 'http://localhost:3000'}/api/whatsapp/auth/callback`;

  return {
    metaAppId,
    metaAppSecret,
    wabaId,
    redirectUri,
    isConfigured: Boolean(metaAppId && metaAppSecret),
  };
}
