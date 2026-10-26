export type SyncStatus =
  | 'synced'
  | 'importing'
  | 'needs_attention'
  | 'failed'
  | 'unavailable'
  | 'added_here'
  | 'published'
  | 'draft';

export type WhatsAppConnectionState =
  | 'not_connected'
  | 'awaiting_auth'
  | 'connecting'
  | 'importing'
  | 'connected'
  | 'syncing'
  | 'needs_attention'
  | 'expired'
  | 'unsupported';

export interface Product {
  id: string;
  name: string;
  price: number | null; // null represents "Ask for price"
  currency: 'FCFA';
  shopId: string;
  shopName: string;
  shopCity: string;
  shopSlug: string;
  category: string;
  subCategory?: string;
  color?: string;
  sizes?: string[];
  description: string;
  illustrationType:
    | 'sneaker'
    | 'laptop'
    | 'dress'
    | 'serum'
    | 'phone'
    | 'lamp'
    | 'headphones'
    | 'tote'
    | 'backpack';
  illustrationColor?: string;
  bgTint: string;
  imageUrl?: string;
  galleryImages?: string[];
  imageAlt?: string;
  source: 'whatsapp' | 'linkora';
  syncStatus: SyncStatus;
  syncIssue?: string;
  lastSyncedText: string;
  isLive: boolean;
}

export interface Shop {
  id: string;
  slug: string;
  name: string;
  initial: string;
  category: string;
  city: string;
  area: string;
  description: string;
  story: string;
  whatsappNumber: string;
  displayPhone: string;
  productCount: number;
  visibility: 'published' | 'hidden';
  lastSyncedText: string;
  coverImage?: string;
  avatarImage?: string;
  storefrontImage?: string;
}

export interface SyncIssue {
  id: string;
  productId: string;
  productName: string;
  type: 'image_failed' | 'product_failed' | 'missing_fields';
  message: string;
  severity: 'warning' | 'error';
  retryable: boolean;
}
