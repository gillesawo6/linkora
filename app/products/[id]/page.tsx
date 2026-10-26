'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock,
  Copy,
  Info,
  ChevronRight,
  ArrowRight,
  Share2,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MarketplaceHeader } from '@/components/marketplace/header';
import { MarketplaceFooter } from '@/components/marketplace/footer';
import { ProductImage } from '@/components/ui/product-image';
import { ProductCard } from '@/components/marketplace/product-card';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/context/store-context';
import { buildWhatsAppContactUrl, openWhatsAppLink } from '@/lib/whatsapp';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { products, shops, showToast } = useStore();

  const productId = params.id as string;
  const product = useMemo(
    () => products.find((p) => p.id === productId) || products[0],
    [products, productId]
  );

  const shop = useMemo(
    () => shops.find((s) => s.id === product.shopId) || shops[0],
    [shops, product]
  );

  // Real catalogue photo gallery
  const gallery = useMemo(() => {
    if (product.galleryImages && product.galleryImages.length > 0) {
      return product.galleryImages;
    }
    if (product.imageUrl) {
      return [product.imageUrl];
    }
    return [];
  }, [product]);

  const [selectedImageMap, setSelectedImageMap] = useState<Record<string, number>>({});
  const activeImageIdx = selectedImageMap[product.id] ?? 0;
  const setActiveImageIdx = (idx: number) => {
    setSelectedImageMap((prev) => ({ ...prev, [product.id]: idx }));
  };

  // Color variants simulation
  const colorVariants = useMemo(() => {
    return [
      { name: product.color || 'Primary', hex: product.illustrationColor || '#17211B', tint: product.bgTint },
      { name: 'Midnight', hex: '#1E2C4A', tint: '#ECF0F6' },
      { name: 'Olive Green', hex: '#1C4A28', tint: '#EAF4EE' },
      { name: 'Warm Terracotta', hex: '#94442B', tint: '#F9EDE8' },
    ];
  }, [product]);

  const [activeVariant, setActiveVariant] = useState(0);

  const formattedPrice =
    product.price !== null
      ? `${product.price.toLocaleString()} ${product.currency}`
      : 'Ask for price';

  // Robust, validated WhatsApp contact link
  const waLinkResult = useMemo(
    () =>
      buildWhatsAppContactUrl({
        phone: shop.whatsappNumber,
        sellerName: shop.name,
        productName: product.name,
        productPrice: product.price,
        currency: product.currency,
      }),
    [shop.whatsappNumber, shop.name, product.name, product.price, product.currency]
  );

  const prefilledMessage = decodeURIComponent(waLinkResult.encodedMessage);
  const waUrl = waLinkResult.url || '#';

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Link copied to clipboard', {
        type: 'success',
        position: 'bottom-center',
      });
    }
  };

  // More from this shop
  const moreFromShop = useMemo(
    () => products.filter((p) => p.shopId === shop.id && p.id !== product.id).slice(0, 4),
    [products, shop, product]
  );

  // Similar in category
  const similarProducts = useMemo(
    () =>
      products
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 4),
    [products, product]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F7]">
      <MarketplaceHeader currentPath="/explore" />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 pb-28 sm:pb-16">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-[13px] text-[#5B6861] mb-6 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#17211B] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/explore?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#17211B] transition-colors"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#17211B] font-medium truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* 2-Column Split: Gallery left, Details right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: GALLERY & COLOR VARIANTS */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main 1:1 Showcase Frame */}
            <div className="w-full aspect-square rounded-[24px] bg-white border border-[#E3E9E4] overflow-hidden p-3 sm:p-5 shadow-xs flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImageIdx}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full rounded-[18px] overflow-hidden relative"
                >
                  <ProductImage
                    src={gallery[activeImageIdx] || product.imageUrl}
                    alt={product.imageAlt || product.name}
                    productName={product.name}
                    bgTint={product.bgTint}
                    priority={true}
                    sizes="(max-width: 1024px) 100vw, 700px"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Catalogue Photo Angles / Gallery Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    aria-label={`View photo angle ${idx + 1}`}
                    className={`w-20 h-20 rounded-[14px] overflow-hidden border-2 transition-all shrink-0 p-0.5 bg-white ${
                      activeImageIdx === idx
                        ? 'border-[#0F7D41] shadow-xs ring-2 ring-[#0F7D41]/20'
                        : 'border-[#E3E9E4] hover:border-[#8AD3A8] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="w-full h-full rounded-[10px] overflow-hidden">
                      <ProductImage
                        src={imgUrl}
                        alt={`${product.name} angle ${idx + 1}`}
                        productName={product.name}
                        bgTint={product.bgTint}
                        sizes="80px"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS, SELLER INFO, WHATSAPP CTA */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[13px] font-semibold text-[#0F7D41] uppercase tracking-wider">
                {product.category}
              </span>
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#17211B] mt-1 leading-tight">
                {product.name}
              </h1>

              <div className="mt-3">
                <p className="font-display font-bold text-3xl text-[#17211B] tabular-nums tracking-tight">
                  {formattedPrice}
                </p>
                <p className="text-[13.5px] text-[#5B6861] mt-0.5">
                  Price as listed by the seller. Confirm it in the chat.
                </p>
              </div>
            </div>

            {/* Seller Identity Card */}
            <div className="p-4 rounded-[16px] bg-white border border-[#E3E9E4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#E8F7EE] text-[#075E36] font-display font-bold text-lg flex items-center justify-center shrink-0 overflow-hidden relative border border-[#E3E9E4]">
                  {shop.avatarImage ? (
                    <Image
                      src={shop.avatarImage}
                      alt={shop.name}
                      fill
                      sizes="44px"
                      referrerPolicy="no-referrer"
                      className="object-cover object-center"
                    />
                  ) : (
                    <span>{shop.initial}</span>
                  )}
                </div>
                <div>
                  <span className="text-[11.5px] uppercase font-semibold text-[#5B6861] tracking-wider block">
                    Sold by
                  </span>
                  <p className="font-display font-bold text-[16px] text-[#17211B] leading-tight">
                    {shop.name}
                  </p>
                  <p className="text-[13px] text-[#5B6861]">{shop.city}</p>
                </div>
              </div>

              <Link
                href={`/shops/${shop.slug}`}
                className="text-[13.5px] font-semibold text-[#0F7D41] hover:text-[#0B6636] flex items-center gap-1 group"
              >
                <span>View shop</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Primary Action Button: "Ask on WhatsApp" */}
            <div className="space-y-3">
              {waLinkResult.isValid ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full focus:outline-none"
                >
                  <Button
                    variant="whatsapp"
                    fullWidth
                    size="lg"
                    className="text-base shadow-sm"
                  >
                    Ask on WhatsApp
                  </Button>
                </a>
              ) : (
                <div className="p-3.5 rounded-[12px] bg-[#FEF7E6] border border-[#F2C94C] text-[13px] text-[#8C5800] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#E69B00]" />
                  <span>Seller contact number not yet verified for WhatsApp direct chat.</span>
                </div>
              )}

              {/* Message Preview Container */}
              {waLinkResult.isValid && (
                <div className="p-4 rounded-[16px] bg-white border border-[#E3E9E4] space-y-2.5 text-[13.5px]">
                  <div className="flex items-start gap-2 text-[#5B6861]">
                    <Info className="w-4 h-4 mt-0.5 text-[#0F7D41] shrink-0" />
                    <span>Opens WhatsApp with this message ready to send:</span>
                  </div>
                  <div className="p-3 rounded-[10px] bg-[#F7F9F7] border border-[#E3E9E4] text-[#17211B] font-mono text-[13px] leading-relaxed italic">
                    &ldquo;{prefilledMessage}&rdquo;
                  </div>
                  <p className="text-[12px] text-[#5B6861] leading-relaxed">
                    Payment and delivery are arranged directly with the seller.
                    Linkora doesn&apos;t process payments.
                  </p>
                </div>
              )}

              {/* Share / Copy link button */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-[12px] bg-white border border-[#E3E9E4] hover:bg-[#F3F6F4] text-[#17211B] text-[14px] font-medium transition-colors"
              >
                <Copy className="w-4 h-4 text-[#5B6861]" />
                <span>Copy link</span>
              </button>
            </div>

            {/* About this product */}
            <div className="pt-4 border-t border-[#E3E9E4]">
              <h2 className="font-display font-bold text-lg text-[#17211B] mb-2">
                About this product
              </h2>
              <p className="text-[15px] text-[#5B6861] leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Details Table */}
            <div className="pt-4 border-t border-[#E3E9E4] space-y-2">
              <h2 className="font-display font-bold text-lg text-[#17211B] mb-3">
                Details
              </h2>

              <dl className="divide-y divide-[#E3E9E4] text-[14px]">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-[#5B6861]">Category</dt>
                  <dd className="font-medium text-[#17211B]">{product.category}</dd>
                </div>
                {product.color && (
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-[#5B6861]">Colour</dt>
                    <dd className="font-medium text-[#17211B]">{product.color}</dd>
                  </div>
                )}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-[#5B6861]">Sizes listed</dt>
                    <dd className="font-medium text-[#17211B]">
                      {product.sizes.join(', ')}
                    </dd>
                  </div>
                )}
                <div className="py-2.5 flex justify-between">
                  <dt className="text-[#5B6861]">Availability</dt>
                  <dd className="font-medium text-[#17211B]">
                    Ask the seller to confirm
                  </dd>
                </div>
              </dl>

              <div className="flex items-center gap-2 text-[12.5px] text-[#5B6861] pt-3">
                <Clock className="w-3.5 h-3.5 text-[#8E9B93]" />
                <span>
                  Imported from the seller&apos;s WhatsApp catalogue · last synced{' '}
                  {product.lastSyncedText}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MORE FROM THIS SHOP */}
        {moreFromShop.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#E3E9E4]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl text-[#17211B]">
                More from {shop.name}
              </h2>
              <Link
                href={`/shops/${shop.slug}`}
                className="text-[14px] font-semibold text-[#0F7D41] hover:text-[#0B6636] flex items-center gap-1 group"
              >
                <span>Visit shop</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {moreFromShop.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}

        {/* SIMILAR IN CATEGORY */}
        {similarProducts.length > 0 && (
          <section className="mt-14 pt-12 border-t border-[#E3E9E4]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl text-[#17211B]">
                Similar in {product.category}
              </h2>
              <Link
                href={`/explore?category=${encodeURIComponent(product.category)}`}
                className="text-[14px] font-semibold text-[#0F7D41] hover:text-[#0B6636] flex items-center gap-1 group"
              >
                <span>View all</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {similarProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* MOBILE STICKY BOTTOM BAR (PDF page 61) */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-[#E3E9E4] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-[#5B6861] truncate">{shop.name}</p>
          <p className="font-display font-bold text-[17px] text-[#17211B] truncate tabular-nums">
            {formattedPrice}
          </p>
        </div>
        {waLinkResult.isValid ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 focus:outline-none"
          >
            <Button variant="whatsapp" size="sm" className="shrink-0">
              Ask on WhatsApp
            </Button>
          </a>
        ) : (
          <Button variant="secondary" size="sm" disabled className="shrink-0 text-xs">
            Number Unavailable
          </Button>
        )}
      </motion.div>

      <MarketplaceFooter />
    </div>
  );
}
