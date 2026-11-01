import { WhatsAppConnectionState } from './types';
import crypto from 'crypto';

export interface WhatsAppConnectionRecord {
  shopId: string;
  status: WhatsAppConnectionState;
  wabaId?: string;
  wabaName?: string;
  catalogId?: string;
  catalogName?: string;
  connectedAt?: string;
  lastSyncAt?: string;
  productCount?: number;
  verified: boolean;
  scopes?: string[];
  error?: string | null;
  errorMessage?: string | null;
}

export interface OAuthStateRecord {
  state: string;
  shopId: string;
  nonce: string;
  createdAt: number;
  expiresAt: number;
}

// Global server-side stores (cached across API route invocations in Node runtime)
const globalForWhatsApp = globalThis as unknown as {
  _linkoraOAuthStates?: Map<string, OAuthStateRecord>;
  _linkoraConnections?: Map<string, WhatsAppConnectionRecord>;
};

const oauthStates = globalForWhatsApp._linkoraOAuthStates || new Map<string, OAuthStateRecord>();
globalForWhatsApp._linkoraOAuthStates = oauthStates;

const shopConnections = globalForWhatsApp._linkoraConnections || new Map<string, WhatsAppConnectionRecord>();
globalForWhatsApp._linkoraConnections = shopConnections;

/**
 * Clean up expired OAuth states (older than 15 minutes)
 */
function cleanupExpiredStates() {
  const now = Date.now();
  for (const [key, item] of oauthStates.entries()) {
    if (item.expiresAt < now) {
      oauthStates.delete(key);
    }
  }
}

/**
 * Generate a cryptographically secure OAuth CSRF state token tied to a shopId
 */
export function createOAuthState(shopId: string): { state: string; expiresAt: number } {
  cleanupExpiredStates();

  const nonce = crypto.randomBytes(24).toString('hex');
  const createdAt = Date.now();
  const expiresAt = createdAt + 15 * 60 * 1000; // 15 minutes

  // Structure: base64(shopId:nonce:timestamp)
  const rawPayload = `${shopId}:${nonce}:${createdAt}`;
  const state = Buffer.from(rawPayload).toString('base64url');

  oauthStates.set(state, {
    state,
    shopId,
    nonce,
    createdAt,
    expiresAt,
  });

  // Track that this shop has an active authorization attempt
  const existing = shopConnections.get(shopId);
  shopConnections.set(shopId, {
    shopId,
    status: 'awaiting_auth',
    verified: false,
    connectedAt: existing?.connectedAt,
    lastSyncAt: existing?.lastSyncAt,
    catalogId: existing?.catalogId,
    wabaId: existing?.wabaId,
  });

  return { state, expiresAt };
}

/**
 * Validate an incoming OAuth state parameter against stored state records.
 * Ensures CSRF protection and single-use state consumption.
 */
export function validateOAuthState(
  state: string | null | undefined,
  expectedShopId?: string
): { valid: boolean; shopId: string; error?: string } {
  cleanupExpiredStates();

  if (!state || typeof state !== 'string') {
    return {
      valid: false,
      shopId: expectedShopId || 'unknown',
      error: 'Missing OAuth security state parameter.',
    };
  }

  const record = oauthStates.get(state);

  if (!record) {
    // Attempt fallback decode for graceful error reporting
    try {
      const decoded = Buffer.from(state, 'base64url').toString('utf-8');
      const parts = decoded.split(':');
      const shop = parts[0] || 'unknown';
      return {
        valid: false,
        shopId: shop,
        error: 'OAuth state has expired or was already consumed. Please restart connection.',
      };
    } catch {
      return {
        valid: false,
        shopId: expectedShopId || 'unknown',
        error: 'Invalid or malformed OAuth security state.',
      };
    }
  }

  if (Date.now() > record.expiresAt) {
    oauthStates.delete(state);
    return {
      valid: false,
      shopId: record.shopId,
      error: 'OAuth session timed out (exceeded 15 minutes). Please try again.',
    };
  }

  if (expectedShopId && record.shopId !== expectedShopId) {
    oauthStates.delete(state);
    return {
      valid: false,
      shopId: record.shopId,
      error: 'OAuth state does not match the active store.',
    };
  }

  const verifiedShopId = record.shopId;
  // State consumed successfully (prevent replay attacks)
  oauthStates.delete(state);

  return {
    valid: true,
    shopId: verifiedShopId,
  };
}

/**
 * Get verified connection record for a given shop
 */
export function getShopConnection(shopId: string): WhatsAppConnectionRecord {
  const existing = shopConnections.get(shopId);
  if (existing) {
    return existing;
  }

  return {
    shopId,
    status: 'not_connected',
    verified: false,
    error: null,
    errorMessage: null,
  };
}

/**
 * Mark a connection as fully verified with genuine Meta account details
 */
export function saveVerifiedConnection(
  shopId: string,
  details: {
    wabaId: string;
    wabaName?: string;
    catalogId?: string;
    catalogName?: string;
    productCount?: number;
    scopes?: string[];
  }
): WhatsAppConnectionRecord {
  const now = new Date().toISOString();
  const record: WhatsAppConnectionRecord = {
    shopId,
    status: 'connected',
    verified: true,
    wabaId: details.wabaId,
    wabaName: details.wabaName || 'WhatsApp Business Account',
    catalogId: details.catalogId || 'default-catalog',
    catalogName: details.catalogName || 'WhatsApp Catalogue',
    productCount: details.productCount || 0,
    scopes: details.scopes || [
      'whatsapp_business_management',
      'whatsapp_business_messaging',
      'catalog_management',
    ],
    connectedAt: now,
    lastSyncAt: now,
    error: null,
    errorMessage: null,
  };

  shopConnections.set(shopId, record);
  return record;
}

/**
 * Disconnect a shop's WhatsApp integration
 */
export function disconnectShopConnection(shopId: string): WhatsAppConnectionRecord {
  const record: WhatsAppConnectionRecord = {
    shopId,
    status: 'not_connected',
    verified: false,
    connectedAt: undefined,
    lastSyncAt: undefined,
    wabaId: undefined,
    catalogId: undefined,
    catalogName: undefined,
    wabaName: undefined,
    productCount: 0,
    scopes: [],
    error: null,
    errorMessage: null,
  };

  shopConnections.set(shopId, record);
  return record;
}

/**
 * Record an explicit cancellation or failure for a shop
 */
export function recordConnectionFailure(
  shopId: string,
  status: WhatsAppConnectionState,
  error: string,
  errorMessage: string
): WhatsAppConnectionRecord {
  const existing = shopConnections.get(shopId);
  const record: WhatsAppConnectionRecord = {
    shopId,
    status,
    verified: false,
    connectedAt: existing?.connectedAt,
    lastSyncAt: existing?.lastSyncAt,
    wabaId: existing?.wabaId,
    catalogId: existing?.catalogId,
    error,
    errorMessage,
  };

  shopConnections.set(shopId, record);
  return record;
}
