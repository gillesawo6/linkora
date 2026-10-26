/**
 * Linkora Image Upload & Optimization Service
 * Provides client-side compression, format normalization, Supabase storage upload,
 * and reliable Data URL fallback for all avatars, covers, and product images.
 */

import { supabase } from '@/lib/supabase/client';

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

/**
 * Resizes and compresses an image File using an HTML5 Canvas.
 * Returns a clean, lightweight data URL that can be directly displayed and stored.
 */
export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
    mimeType = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    // Check if valid image type
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // Fill background with white to handle transparent PNGs converting to JPEG
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        // Use high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image either to Supabase Storage (if configured) or falls back
 * directly to a compressed, optimized Data URL.
 */
export async function uploadImage(
  file: File,
  context: {
    folder: 'avatars' | 'covers' | 'products';
    shopId?: string;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<{ url: string; source: 'supabase' | 'local_optimized' }> {
  // 1. First compress the image for speed and lightweight storage
  const compressedDataUrl = await compressImageFile(file, {
    maxWidth: context.maxWidth || (context.folder === 'covers' ? 1400 : 800),
    maxHeight: context.maxHeight || (context.folder === 'covers' ? 600 : 800),
    quality: context.quality || 0.88,
  });

  // 2. If Supabase is connected, attempt uploading to the 'store-assets' bucket
  if (supabase) {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${context.folder}/${context.shopId || 'default'}-${Date.now()}-${sanitizedName}`;

      // Convert compressed dataUrl to Blob
      const res = await fetch(compressedDataUrl);
      const blob = await res.blob();

      const { data, error } = await supabase.storage
        .from('store-assets')
        .upload(path, blob, {
          contentType: blob.type,
          upsert: true,
        });

      if (!error && data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('store-assets').getPublicUrl(data.path);

        if (publicUrl) {
          return { url: publicUrl, source: 'supabase' };
        }
      }
    } catch {
      // Supabase storage bucket may not be created yet; fall through cleanly to compressed data URL
    }
  }

  // 3. Fallback: Return the high-quality compressed data URL
  return { url: compressedDataUrl, source: 'local_optimized' };
}
