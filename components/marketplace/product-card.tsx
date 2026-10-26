'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Product } from '@/lib/types';
import { ProductImage } from '../ui/product-image';
import { SpeechBubbleIcon } from '../ui/linkora-icons';
import { buildWhatsAppContactUrl, openWhatsAppLink } from '@/lib/whatsapp';
import { SHOPS } from '@/lib/data/sample-data';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formattedPrice =
    product.price !== null
      ? `${product.price.toLocaleString()} ${product.currency}`
      : 'Ask for price';

  const handleQuickAsk = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shop = SHOPS.find((s) => s.id === product.shopId);
    const phone = shop?.whatsappNumber || '+237671234542';
    const currentOrigin =
      typeof window !== 'undefined' ? window.location.origin : '';
    const res = buildWhatsAppContactUrl({
      phone,
      sellerName: product.shopName,
      productName: product.name,
      productPrice: product.price,
      currency: product.currency,
      productUrl: `${currentOrigin}/products/${product.id}`,
    });
    if (res.isValid && res.url) {
      openWhatsAppLink(res.url);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="h-full"
    >
      <Link
        href={`/products/${product.id}`}
        className="group flex flex-col h-full bg-white rounded-[20px] p-3 border border-[#E3E9E4] hover:border-[#0F7D41]/35 hover:shadow-sm transition-colors duration-180"
      >
        {/* 1:1 Square Image */}
        <div className="w-full aspect-square rounded-[16px] overflow-hidden">
          <ProductImage
            src={product.imageUrl}
            alt={product.imageAlt || product.name}
            productName={product.name}
            bgTint={product.bgTint}
            className="group-hover:scale-[1.03] transition-transform duration-300 ease-out"
          />
        </div>

        {/* Info Container */}
        <div className="pt-3 pb-1 flex flex-col flex-1 justify-between">
          <div>
            {/* Two-line title clamp */}
            <h3 className="font-sans font-medium text-[15px] leading-snug text-[#17211B] line-clamp-2 min-h-[2.5rem] group-hover:text-[#0F7D41] transition-colors duration-150">
              {product.name}
            </h3>

            {/* Price */}
            <p className="mt-1 font-display font-bold text-[17px] text-[#17211B] tracking-tight tabular-nums">
              {formattedPrice}
            </p>
          </div>

          {/* Seller identity & Quick Ask on WhatsApp */}
          <div className="mt-2.5 pt-2 border-t border-[#F0F4F2] flex items-center justify-between gap-1 text-[13px] text-[#5B6861]">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span
                className="w-5 h-5 rounded-full bg-[#E8F7EE] text-[#075E36] font-semibold text-[11px] flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                {product.shopName.charAt(0)}
              </span>
              <span className="truncate">
                <span className="font-medium text-[#17211B]">
                  {product.shopName}
                </span>
                <span className="mx-1 text-[#8E9B93]">·</span>
                <span>{product.shopCity}</span>
              </span>
            </div>

            {/* Public "Ask on WhatsApp" action */}
            <button
              type="button"
              onClick={handleQuickAsk}
              title={`Ask ${product.shopName} on WhatsApp`}
              aria-label={`Ask ${product.shopName} about ${product.name} on WhatsApp`}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[#0F7D41] hover:bg-[#E8F7EE] active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F7D41]"
            >
              <SpeechBubbleIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
