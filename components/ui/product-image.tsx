'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  bgTint?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  fill?: boolean;
  productName?: string;
}

export function ProductImage({
  src,
  alt,
  bgTint = '#F3F6F4',
  className = '',
  priority = false,
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px',
  aspectRatio = 'square',
  productName,
}: ProductImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-[16/9]'
      : aspectRatio === 'portrait'
      ? 'aspect-[3/4]'
      : '';

  const [prevSrc, setPrevSrc] = useState(src);
  if (prevSrc !== src) {
    setPrevSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }

  // If no source is provided or the image failed to load, render the Linkora-branded fallback
  const showFallback = !src || hasError;

  return (
    <div
      className={`relative w-full ${aspectClass} overflow-hidden rounded-[16px] flex items-center justify-center transition-colors duration-200 select-none`}
      style={{ backgroundColor: bgTint }}
    >
      {/* Subtle skeleton shimmer while image is loading */}
      {!isLoaded && !showFallback && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-pulse"
          aria-hidden="true"
        />
      )}

      {!showFallback ? (
        <Image
          key={src || 'empty'}
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          unoptimized={src.startsWith('data:') || src.startsWith('blob:')}
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`object-cover object-center transition-all duration-300 ease-out ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } ${className}`}
        />
      ) : (
        /* Tasteful Linkora-branded product fallback surface */
        <div
          className="w-full h-full flex flex-col items-center justify-center p-4 text-center"
          style={{ backgroundColor: bgTint }}
        >
          {/* Subtle brand monogram badge */}
          <div className="w-12 h-12 rounded-full bg-white/80 border border-[#E3E9E4] flex items-center justify-center shadow-2xs mb-2">
            <span className="font-display font-bold text-base text-[#0F7D41]">
              {productName ? productName.charAt(0).toUpperCase() : 'L'}
            </span>
          </div>
          <span className="text-[12px] font-medium text-[#5B6861] line-clamp-1 max-w-[85%]">
            {productName || alt}
          </span>
          <span className="text-[10px] text-[#8E9B93] mt-0.5">Catalogue item</span>
        </div>
      )}
    </div>
  );
}
