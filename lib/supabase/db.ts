import { supabase } from './client';
import { Product, Shop } from '../types';

// Helper to convert DB snake_case shop row to TypeScript Shop interface
export function mapDbShopToShop(row: any): Shop {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    initial: row.name ? row.name.charAt(0).toUpperCase() : 'S',
    category: row.category || 'General',
    city: row.city || 'Douala',
    area: row.area || '',
    description: row.description || '',
    story: row.story || '',
    whatsappNumber: row.whatsapp_number || '',
    displayPhone: row.display_phone || row.whatsapp_number || '',
    productCount: Number(row.product_count || 0),
    visibility: row.visibility || 'published',
    lastSyncedText: row.last_synced_at ? 'Recently' : 'Today',
    coverImage: row.cover_image,
    avatarImage: row.avatar_image,
    storefrontImage: row.storefront_image,
  };
}

// Helper to convert DB snake_case product row to TypeScript Product interface
export function mapDbProductToProduct(row: any, shop?: Shop): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price !== null && row.price !== undefined ? Number(row.price) : null,
    currency: 'FCFA',
    shopId: row.shop_id,
    shopName: shop?.name || row.shop_name || 'Verified Shop',
    shopCity: shop?.city || row.shop_city || 'Douala',
    shopSlug: shop?.slug || row.shop_slug || 'shop',
    category: row.category || 'General',
    subCategory: row.sub_category,
    color: row.color,
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    description: row.description || '',
    illustrationType: (row.illustration_type as any) || 'sneaker',
    illustrationColor: row.illustration_color || '#17211B',
    bgTint: row.bg_tint || '#E8F7EE',
    imageUrl: row.image_url || row.image,
    galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : undefined,
    imageAlt: row.image_alt || row.name,
    source: row.source || 'linkora',
    syncStatus: (row.sync_status as any) || 'synced',
    syncIssue: row.sync_issue,
    lastSyncedText: 'Recently',
    isLive: row.is_live ?? true,
  };
}

/**
 * Fetch shops from Supabase
 */
export async function fetchShopsFromDb(): Promise<{ shops: Shop[]; error: string | null }> {
  if (!supabase) {
    return { shops: [], error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { shops: [], error: error.message };
    }

    if (!data || data.length === 0) {
      return { shops: [], error: null };
    }

    return { shops: data.map(mapDbShopToShop), error: null };
  } catch (err: any) {
    return { shops: [], error: err.message };
  }
}

/**
 * Fetch products from Supabase
 */
export async function fetchProductsFromDb(shops: Shop[]): Promise<{ products: Product[]; error: string | null }> {
  if (!supabase) {
    return { products: [], error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { products: [], error: error.message };
    }

    if (!data || data.length === 0) {
      return { products: [], error: null };
    }

    const shopMap = new Map(shops.map((s) => [s.id, s]));
    return {
      products: data.map((row) => mapDbProductToProduct(row, shopMap.get(row.shop_id))),
      error: null,
    };
  } catch (err: any) {
    return { products: [], error: err.message };
  }
}

/**
 * Insert product to Supabase
 */
export async function insertProductToDb(
  product: Omit<Product, 'id'>,
  shopId: string
): Promise<{ product: Product | null; error: string | null }> {
  if (!supabase) {
    return { product: null, error: 'Supabase client not initialized' };
  }

  try {
    const payload = {
      shop_id: shopId,
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      category: product.category,
      sub_category: product.subCategory,
      color: product.color,
      sizes: product.sizes || [],
      illustration_type: product.illustrationType,
      illustration_color: product.illustrationColor,
      bg_tint: product.bgTint,
      image_url: product.imageUrl,
      source: product.source || 'linkora',
      sync_status: product.syncStatus || 'synced',
      is_live: product.isLive ?? true,
    };

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select()
      .single();

    if (error) {
      return { product: null, error: error.message };
    }

    return { product: mapDbProductToProduct(data), error: null };
  } catch (err: any) {
    return { product: null, error: err.message };
  }
}

/**
 * Update product in Supabase
 */
export async function updateProductInDb(
  id: string,
  updates: Partial<Product>
): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.subCategory !== undefined) payload.sub_category = updates.subCategory;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.sizes !== undefined) payload.sizes = updates.sizes;
    if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
    if (updates.isLive !== undefined) payload.is_live = updates.isLive;
    if (updates.syncStatus !== undefined) payload.sync_status = updates.syncStatus;

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete product from Supabase
 */
export async function deleteProductFromDb(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Update shop in Supabase
 */
export async function updateShopInDb(
  id: string,
  updates: Partial<Shop>
): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.city !== undefined) payload.city = updates.city;
    if (updates.area !== undefined) payload.area = updates.area;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.visibility !== undefined) payload.visibility = updates.visibility;
    if (updates.whatsappNumber !== undefined) payload.whatsapp_number = updates.whatsappNumber;
    if (updates.displayPhone !== undefined) payload.display_phone = updates.displayPhone;
    if (updates.avatarImage !== undefined) payload.avatar_image = updates.avatarImage;
    if (updates.coverImage !== undefined) payload.cover_image = updates.coverImage;

    const { error } = await supabase.from('shops').update(payload).eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
