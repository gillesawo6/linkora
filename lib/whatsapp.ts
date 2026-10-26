/**
 * Linkora WhatsApp Integration Utilities
 *
 * Handles:
 * 1. Phone number validation and international formatting (E.164).
 * 2. Properly encoded contextual "Ask on WhatsApp" contact links for products and storefronts.
 * 3. Graceful handling of missing or invalid contact numbers.
 * 4. Transparent buyer-to-seller communication notices (no fake in-app checkout/payments).
 */

export interface PhoneValidationResult {
  isValid: boolean;
  cleanDigits: string;
  internationalNumber: string;
  displayNumber: string;
  error?: string;
}

/**
 * Validates and normalizes phone numbers for WhatsApp.
 * Supports international formats with country codes (e.g., +237 6 70 00 00 00)
 * and auto-prefixes local 9-digit numbers for Cameroon (+237) when needed.
 */
export function validateWhatsAppPhone(
  phone: string | null | undefined,
  defaultCountryCode = '237'
): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      cleanDigits: '',
      internationalNumber: '',
      displayNumber: '',
      error: 'Phone number is missing or empty.',
    };
  }

  // Strip non-digits
  let digits = phone.replace(/\D/g, '');

  if (!digits) {
    return {
      isValid: false,
      cleanDigits: '',
      internationalNumber: '',
      displayNumber: phone,
      error: 'Phone number contains no numeric digits.',
    };
  }

  // Handle local 9-digit format (common in Cameroon e.g. 6XXXXXXXX or 2XXXXXXXX)
  if (digits.length === 9 && !digits.startsWith(defaultCountryCode)) {
    digits = `${defaultCountryCode}${digits}`;
  }

  // Handle numbers that might start with 00 (international call prefix)
  if (digits.startsWith('00')) {
    digits = digits.substring(2);
  }

  // Standard E.164 phone length is between 8 and 15 digits
  if (digits.length < 8 || digits.length > 15) {
    return {
      isValid: false,
      cleanDigits: digits,
      internationalNumber: `+${digits}`,
      displayNumber: phone,
      error: `Invalid phone length (${digits.length} digits). Standard WhatsApp numbers must be between 8 and 15 digits.`,
    };
  }

  return {
    isValid: true,
    cleanDigits: digits,
    internationalNumber: `+${digits}`,
    displayNumber: `+${digits}`,
  };
}

export interface BuildWhatsAppLinkOptions {
  phone: string | null | undefined;
  sellerName?: string;
  productName?: string;
  productPrice?: number | null;
  currency?: string;
  productUrl?: string;
  shopName?: string;
  shopSlug?: string;
  customMessage?: string;
}

export interface WhatsAppLinkResult {
  url: string | null;
  isValid: boolean;
  error?: string;
  cleanPhone: string;
  encodedMessage: string;
}

/**
 * Builds a properly encoded WhatsApp direct contact link.
 * Returns null url if phone is missing or invalid.
 */
export function buildWhatsAppContactUrl(
  options: BuildWhatsAppLinkOptions
): WhatsAppLinkResult {
  const { phone, sellerName, productName, productPrice, currency = 'XAF', productUrl, shopName, customMessage } = options;

  const validation = validateWhatsAppPhone(phone);
  if (!validation.isValid) {
    return {
      url: null,
      isValid: false,
      error: validation.error || 'Invalid phone number for WhatsApp.',
      cleanPhone: '',
      encodedMessage: '',
    };
  }

  let text = '';
  if (customMessage) {
    text = customMessage;
  } else if (productName) {
    const greeting = sellerName ? `Hi ${sellerName}` : 'Hello';
    const priceText = productPrice !== undefined && productPrice !== null
      ? ` listed at ${productPrice.toLocaleString()} ${currency}`
      : '';
    const ref = productUrl ? ` (Ref: ${productUrl})` : '';
    text = `${greeting}, I found "${productName}"${priceText} on Linkora${ref}. Is it still available?`;
  } else if (shopName) {
    const greeting = sellerName ? `Hi ${sellerName}` : 'Hello';
    text = `${greeting}, I'm browsing your "${shopName}" storefront on Linkora and would like to ask a few questions.`;
  } else {
    text = 'Hello, I found your store on Linkora and would like to ask about your products.';
  }

  const encodedMessage = encodeURIComponent(text);
  const url = `https://wa.me/${validation.cleanDigits}?text=${encodedMessage}`;

  return {
    url,
    isValid: true,
    cleanPhone: validation.cleanDigits,
    encodedMessage,
  };
}

/**
 * Safe link opener that works smoothly inside iframes and standard browsers
 */
export function openWhatsAppLink(url: string | null | undefined): boolean {
  if (!url || typeof window === 'undefined') return false;

  try {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = url;
    }
    return true;
  } catch {
    window.location.href = url;
    return true;
  }
}
