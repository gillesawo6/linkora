'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Shop } from '@/lib/types';
import { PRODUCTS } from '@/lib/data/sample-data';
import { ProductImage } from '../ui/product-image';
import { SpeechBubbleIcon } from '../ui/linkora-icons';
import { buildWhatsAppContactUrl, openWhatsAppLink } from '@/lib/whatsapp';

interface StoreCardProps {
  shop: Shop;
}

export function StoreCard({ shop }: StoreCardProps) {
  const shopProducts = PRODUCTS.filter((p) => p.shopId === shop.id).slice(0, 3);

  const handleWhatsAppContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = buildWhatsAppContactUrl({
      phone: shop.whatsappNumber,
      sellerName: shop.name,
      shopName: shop.name,
      shopSlug: shop.slug,
    });
    if (res.isValid && res.url) {
      openWhatsAppLink(res.url);
    }
  };

  return (
    <Link
      href={`/shops/${shop.slug}`}
      className="group block bg-white rounded-[20px] p-4 border border-[#E3E9E4] hover:border-[#0F7D41]/30 hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* 3 Preview Squares */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {shopProducts.map((prod) => (
          <div key={prod.id} className="aspect-square rounded-[12px] overflow-hidden">
            <ProductImage
              src={prod.imageUrl}
              alt={prod.imageAlt || prod.name}
              productName={prod.name}
              bgTint={prod.bgTint}
              sizes="100px"
              className="group-hover:scale-105 transition-transform duration-300 ease-out"
            />
          </div>
        ))}
        {shopProducts.length < 3 &&
          Array.from({ length: 3 - shopProducts.length }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-[12px] bg-[#F7F9F7] border border-dashed border-[#E3E9E4]"
            />
          ))}
      </div>

      {/* Seller Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-[#E8F7EE] text-[#075E36] font-display font-bold text-base flex items-center justify-center shrink-0 overflow-hidden relative border border-[#E3E9E4]">
            {shop.avatarImage ? (
              <Image
                src={shop.avatarImage}
                alt={shop.name}
                fill
                sizes="40px"
                unoptimized={shop.avatarImage.startsWith('data:') || shop.avatarImage.startsWith('blob:')}
                referrerPolicy="no-referrer"
                className="object-cover object-center"
              />
            ) : (
              <span>{shop.initial}</span>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-display font-bold text-[16px] text-[#17211B] truncate group-hover:text-[#0F7D41] transition-colors">
              {shop.name}
            </h4>
            <p className="text-[13px] text-[#5B6861] truncate">
              {shop.category} · {shop.city} · {shop.productCount} products
            </p>
          </div>
        </div>

        {/* Actions: Direct WhatsApp & View Shop */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleWhatsAppContact}
            title={`Ask ${shop.name} on WhatsApp`}
            aria-label={`Ask ${shop.name} on WhatsApp`}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#0F7D41] hover:bg-[#E8F7EE] active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F7D41]"
          >
            <SpeechBubbleIcon className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B6861] group-hover:text-[#0F7D41] group-hover:translate-x-0.5 transition-all">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
