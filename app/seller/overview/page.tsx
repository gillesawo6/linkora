'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  Copy,
  ExternalLink,
  ChevronRight,
  RotateCw,
} from 'lucide-react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProductImage } from '@/components/ui/product-image';
import { useStore } from '@/lib/context/store-context';

export default function SellerOverviewPage() {
  const router = useRouter();
  const {
    currentShop,
    products,
    syncIssues,
    lastSyncTime,
    showToast,
  } = useStore();

  const attentionProducts = products.filter(
    (p) => p.syncStatus === 'needs_attention' || p.syncStatus === 'failed'
  );
  const syncedCount = products.filter((p) => p.syncStatus === 'synced').length;
  const recentlySynced = products.slice(0, 5);
  const previewProducts = products.slice(0, 3);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(
        `${window.location.origin}/shops/${currentShop.slug}`
      );
      showToast('Store link copied to clipboard', {
        type: 'success',
        position: 'bottom-right',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-display font-bold text-3xl text-[#17211B]">
          Overview
        </h1>
        <p className="text-[14.5px] text-[#5B6861] mt-1">
          {currentShop.name} · Store {currentShop.visibility}
        </p>
      </div>

      {/* ATTENTION BANNER (PDF Page 16) */}
      {attentionProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="p-4 sm:p-5 rounded-[16px] bg-[#FEF7E6] border border-[#F5D899] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-[#8C5800] shrink-0 mt-0.5" />
            <div className="text-[14px] text-[#17211B] leading-relaxed">
              <span className="font-semibold text-[#8C5800]">
                {attentionProducts.length} products need your attention.{' '}
              </span>
              <span>
                One image couldn&apos;t be downloaded and one product failed to
                import. They&apos;re hidden from your public store until fixed.
              </span>
            </div>
          </div>
          <Link
            href="/seller/products"
            className="h-9 px-4 rounded-[10px] bg-white border border-[#E3E9E4] hover:bg-[#F3F6F4] text-[13px] font-semibold text-[#17211B] shrink-0 transition-colors self-end sm:self-auto active:scale-95"
          >
            Review products
          </Link>
        </motion.div>
      )}

      {/* 4 STAT METRICS CARDS WITH SUBTLE STAGGER (PDF Page 16) */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06 },
          },
        }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
            },
          }}
          whileHover={{ y: -2 }}
          className="p-5 rounded-[20px] bg-white border border-[#E3E9E4] space-y-1 shadow-xs transition-colors"
        >
          <span className="text-[13px] text-[#5B6861] font-medium">
            Synchronised products
          </span>
          <p className="font-display font-bold text-3xl text-[#17211B] tabular-nums">
            {currentShop.productCount}
          </p>
          <p className="text-[12px] text-[#5B6861] pt-1">
            Imported from your WhatsApp catalogue
          </p>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
            },
          }}
          whileHover={{ y: -2 }}
          className="p-5 rounded-[20px] bg-white border border-[#E3E9E4] space-y-1 shadow-xs transition-colors"
        >
          <span className="text-[13px] text-[#5B6861] font-medium">
            Catalogue connection
          </span>
          <p className="font-display font-bold text-2xl text-[#0F7D41]">
            Connected
          </p>
          <p className="text-[12px] text-[#8C5800] pt-1">
            Attention needed on {attentionProducts.length} products
          </p>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
            },
          }}
          whileHover={{ y: -2 }}
          className="p-5 rounded-[20px] bg-white border border-[#E3E9E4] space-y-1 shadow-xs transition-colors"
        >
          <span className="text-[13px] text-[#5B6861] font-medium">
            Last successful sync
          </span>
          <p className="font-display font-bold text-2xl text-[#17211B] tabular-nums">
            {lastSyncTime}
          </p>
          <p className="text-[12px] text-[#5B6861] pt-1">
            Automatic syncs run through the day
          </p>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
            },
          }}
          whileHover={{ y: -2 }}
          className="p-5 rounded-[20px] bg-white border border-[#E3E9E4] space-y-1 shadow-xs transition-colors"
        >
          <span className="text-[13px] text-[#5B6861] font-medium">
            Needs attention
          </span>
          <p className="font-display font-bold text-3xl text-[#8C5800] tabular-nums">
            {attentionProducts.length}
          </p>
          <p className="text-[12px] text-[#5B6861] pt-1">
            Hidden from your public store
          </p>
        </motion.div>
      </motion.div>

      {/* 2-COLUMN SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: RECENTLY SYNCHRONISED + SUGGESTED STEPS */}
        <div className="lg:col-span-8 space-y-8">
          {/* Recently synchronised table */}
          <div className="bg-white rounded-[20px] border border-[#E3E9E4] overflow-hidden">
            <div className="p-5 pb-3 flex items-center justify-between border-b border-[#E3E9E4]">
              <h2 className="font-display font-bold text-lg text-[#17211B]">
                Recently synchronised
              </h2>
              <Link
                href="/seller/products"
                className="text-[13.5px] font-semibold text-[#0F7D41] hover:underline"
              >
                All products
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-[#F7F9F7] text-[12px] uppercase font-semibold text-[#5B6861] border-b border-[#E3E9E4]">
                  <tr>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E9E4]">
                  {recentlySynced.map((p) => {
                    const priceText =
                      p.price !== null
                        ? `${p.price.toLocaleString()} FCFA`
                        : 'No price';
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-[#F7F9F7] transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[10px] overflow-hidden shrink-0">
                              <ProductImage
                                src={p.imageUrl}
                                alt={p.name}
                                productName={p.name}
                                bgTint={p.bgTint}
                                sizes="40px"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[#17211B] truncate max-w-[200px]">
                                {p.name}
                              </p>
                              <p className="text-[12px] text-[#5B6861]">
                                {p.subCategory || p.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-[#17211B] tabular-nums whitespace-nowrap">
                          {priceText}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <StatusBadge status={p.syncStatus} />
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-[#5B6861] tabular-nums whitespace-nowrap">
                          {p.lastSyncedText}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Suggested next steps (PDF Page 16) */}
          <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-[#17211B]">
              Suggested next steps
            </h2>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-center justify-between p-4 rounded-[14px] bg-[#F7F9F7] border border-[#E3E9E4] gap-4">
                <div className="flex items-start gap-3.5">
                  <span className="w-6 h-6 rounded-full bg-white border border-[#E3E9E4] text-[12px] font-bold text-[#17211B] flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <h3 className="font-semibold text-[14.5px] text-[#17211B]">
                      Fix the 3 products that need attention
                    </h3>
                    <p className="text-[13px] text-[#5B6861] mt-0.5">
                      Retry the import or update the product in WhatsApp Business.
                    </p>
                  </div>
                </div>
                <Link
                  href="/seller/products"
                  className="h-9 px-4 rounded-[10px] bg-[#0F7D41] hover:bg-[#0B6636] text-white text-[13px] font-semibold flex items-center shrink-0 transition-colors"
                >
                  Review
                </Link>
              </div>

              {/* Step 2 */}
              <div className="flex items-center justify-between p-4 rounded-[14px] bg-[#F7F9F7] border border-[#E3E9E4] gap-4">
                <div className="flex items-start gap-3.5">
                  <span className="w-6 h-6 rounded-full bg-white border border-[#E3E9E4] text-[12px] font-bold text-[#17211B] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <h3 className="font-semibold text-[14.5px] text-[#17211B]">
                      Add a cover image to your store
                    </h3>
                    <p className="text-[13px] text-[#5B6861] mt-0.5">
                      A cover photo makes your storefront feel finished.
                    </p>
                  </div>
                </div>
                <Link
                  href="/seller/settings"
                  className="h-9 px-4 rounded-[10px] bg-white border border-[#E3E9E4] hover:bg-[#F3F6F4] text-[#17211B] text-[13px] font-medium flex items-center shrink-0 transition-colors"
                >
                  Open settings
                </Link>
              </div>

              {/* Step 3 */}
              <div className="flex items-center justify-between p-4 rounded-[14px] bg-[#F7F9F7] border border-[#E3E9E4] gap-4">
                <div className="flex items-start gap-3.5">
                  <span className="w-6 h-6 rounded-full bg-white border border-[#E3E9E4] text-[12px] font-bold text-[#17211B] flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <h3 className="font-semibold text-[14.5px] text-[#17211B]">
                      Share your store link
                    </h3>
                    <p className="text-[13px] text-[#5B6861] mt-0.5">
                      Post it in your WhatsApp status or groups so customers can
                      browse the whole catalogue.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="h-9 px-4 rounded-[10px] bg-white border border-[#E3E9E4] hover:bg-[#F3F6F4] text-[#17211B] text-[13px] font-medium flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STOREFRONT PREVIEW + WHATSAPP STATUS */}
        <div className="lg:col-span-4 space-y-6">
          {/* Storefront Card (PDF Page 16) */}
          <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-base text-[#17211B]">
                Storefront
              </h2>
              <StatusBadge status="published" />
            </div>

            {/* Mini preview */}
            <div className="rounded-[16px] bg-[#F7F9F7] border border-[#E3E9E4] p-4">
              <div className="w-full h-16 rounded-[10px] bg-gradient-to-r from-[#E8F7EE] to-[#FAF3EA] mb-3 flex items-center justify-center relative overflow-hidden">
                {currentShop.coverImage ? (
                  <Image
                    src={currentShop.coverImage}
                    alt={currentShop.name}
                    fill
                    sizes="300px"
                    unoptimized={currentShop.coverImage.startsWith('data:') || currentShop.coverImage.startsWith('blob:')}
                    className="object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                ) : null}
                <div className="w-9 h-9 rounded-full bg-white text-[#075E36] font-display font-bold text-sm flex items-center justify-center shadow-xs z-10 overflow-hidden relative border border-[#E3E9E4]">
                  {currentShop.avatarImage ? (
                    <Image
                      src={currentShop.avatarImage}
                      alt={currentShop.name}
                      fill
                      sizes="36px"
                      unoptimized={currentShop.avatarImage.startsWith('data:') || currentShop.avatarImage.startsWith('blob:')}
                      className="object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{currentShop.initial}</span>
                  )}
                </div>
              </div>

              <h3 className="font-display font-bold text-[15px] text-[#17211B]">
                {currentShop.name}
              </h3>

              <div className="grid grid-cols-3 gap-1.5 mt-3">
                {previewProducts.map((p) => (
                  <div
                    key={p.id}
                    className="aspect-square rounded-[8px] overflow-hidden"
                  >
                    <ProductImage
                      src={p.imageUrl}
                      alt={p.name}
                      productName={p.name}
                      bgTint={p.bgTint}
                      sizes="60px"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Link box */}
            <div className="flex items-center justify-between p-2.5 rounded-[10px] bg-[#F7F9F7] border border-[#E3E9E4] text-[13px]">
              <span className="font-mono text-[#5B6861] truncate">
                linkora.com/{currentShop.slug}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                aria-label="Copy store link"
                className="text-[#5B6861] hover:text-[#0F7D41] p-1.5 rounded-[6px] hover:bg-white"
                title="Copy link"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/seller/settings"
              className="w-full h-10 rounded-[10px] bg-white border border-[#E3E9E4] hover:bg-[#F3F6F4] text-[#17211B] text-[13.5px] font-medium flex items-center justify-center transition-colors"
            >
              Edit store details
            </Link>
          </div>

          {/* WhatsApp Connection Card */}
          <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-5 space-y-3">
            <h2 className="font-display font-bold text-base text-[#17211B]">
              WhatsApp connection
            </h2>

            <div className="flex items-start gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5A000] mt-1 shrink-0" />
              <div>
                <p className="text-[13.5px] font-semibold text-[#17211B]">
                  Connected · {attentionProducts.length} items need attention
                </p>
                <p className="text-[12.5px] text-[#5B6861] mt-0.5 leading-relaxed">
                  Catalogue access is working. Last successful sync {lastSyncTime}.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E3E9E4]">
              <Link
                href="/seller/connection"
                className="text-[13.5px] font-semibold text-[#0F7D41] hover:underline flex items-center gap-1 group"
              >
                <span>Manage connection</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
