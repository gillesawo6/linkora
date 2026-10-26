'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Search,
  Copy,
  ChevronDown,
  MapPin,
  Clock,
  MessageCircle,
  AlertTriangle,
  X,
  RotateCcw,
} from 'lucide-react';
import { MarketplaceHeader } from '@/components/marketplace/header';
import { MarketplaceFooter } from '@/components/marketplace/footer';
import { MobileBottomNav } from '@/components/marketplace/mobile-bottom-nav';
import { ProductCard } from '@/components/marketplace/product-card';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/context/store-context';
import { buildWhatsAppContactUrl } from '@/lib/whatsapp';
import { normalizeSearchTerm } from '@/lib/search';
import { motion, AnimatePresence } from 'motion/react';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function ShopStorefrontContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const { shops, products, showToast } = useStore();

  const shop = useMemo(
    () => shops.find((s) => s.slug === slug) || shops[0],
    [shops, slug]
  );

  const shopProducts = useMemo(
    () => products.filter((p) => p.shopId === shop.id && p.isLive),
    [products, shop]
  );

  // Sub-categories / tags in this shop
  const inShopCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    shopProducts.forEach((p) => {
      const cat = p.subCategory || p.category;
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const categories = [
      { name: 'All', count: shopProducts.length },
      ...Object.entries(counts).map(([name, count]) => ({ name, count })),
    ];
    return categories;
  }, [shopProducts]);

  const [activeCategory, setActiveCategory] = useState(
    searchParams.get('category') || 'All'
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name-asc'>(
    (searchParams.get('sortBy') as any) || 'newest'
  );

  const currentParamsStr = searchParams.toString();
  const [prevParamsStr, setPrevParamsStr] = useState(currentParamsStr);
  if (currentParamsStr !== prevParamsStr) {
    setPrevParamsStr(currentParamsStr);
    setActiveCategory(searchParams.get('category') || 'All');
    setSearchQuery(searchParams.get('q') || '');
    setSortBy((searchParams.get('sortBy') as any) || 'newest');
  }

  // Synchronize state with URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams();
    if (searchQuery.trim()) urlParams.set('q', searchQuery.trim());
    if (activeCategory !== 'All') urlParams.set('category', activeCategory);
    if (sortBy !== 'newest') urlParams.set('sortBy', sortBy);

    const qs = urlParams.toString();
    const newUrl = qs ? `/shops/${slug}?${qs}` : `/shops/${slug}`;
    if (typeof window !== 'undefined' && window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [searchQuery, activeCategory, sortBy, slug]);

  // Filter products within store with multi-token tolerant matching
  const filteredProducts = useMemo(() => {
    return shopProducts.filter((p) => {
      if (searchQuery.trim()) {
        const qNorm = normalizeSearchTerm(searchQuery.trim());
        const tokens = qNorm.split(' ').filter(Boolean);
        const nameNorm = normalizeSearchTerm(p.name);
        const descNorm = normalizeSearchTerm(p.description || '');
        const catNorm = normalizeSearchTerm(p.category);
        const subCatNorm = normalizeSearchTerm(p.subCategory || '');
        const colorNorm = normalizeSearchTerm(p.color || '');

        const matches = tokens.every(
          (t) =>
            nameNorm.includes(t) ||
            descNorm.includes(t) ||
            catNorm.includes(t) ||
            subCatNorm.includes(t) ||
            colorNorm.includes(t)
        );
        if (!matches) return false;
      }

      if (activeCategory !== 'All') {
        const cat = p.subCategory || p.category;
        if (cat !== activeCategory && p.category !== activeCategory) return false;
      }

      return true;
    });
  }, [shopProducts, searchQuery, activeCategory]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price-asc') {
      return list.sort((a, b) => (a.price ?? 9999999) - (b.price ?? 9999999));
    }
    if (sortBy === 'price-desc') {
      return list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }
    if (sortBy === 'name-asc') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [filteredProducts, sortBy]);

  const shopWaResult = useMemo(
    () =>
      buildWhatsAppContactUrl({
        phone: shop.whatsappNumber,
        sellerName: shop.name,
        shopName: shop.name,
        shopSlug: shop.slug,
      }),
    [shop.whatsappNumber, shop.name, shop.slug]
  );
  const shopWaUrl = shopWaResult.url || '#';

  const handleCopyShopLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Shop link copied', {
        type: 'success',
        position: 'bottom-center',
      });
    }
  };

  const clearInShopFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setSortBy('newest');
  };

  const hasInShopFilters = searchQuery.trim() !== '' || activeCategory !== 'All';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F7]">
      <MarketplaceHeader currentPath="/shops" />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 pb-24 sm:pb-16">
        {/* Cover banner */}
        <div className="w-full h-36 sm:h-52 rounded-[20px] bg-gradient-to-r from-[#E8F7EE] via-[#F3F6F4] to-[#FAF3EA] border border-[#E3E9E4] relative overflow-hidden mb-6">
          {shop.coverImage ? (
            <>
              <Image
                src={shop.coverImage}
                alt={`${shop.name} storefront cover`}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                unoptimized={shop.coverImage.startsWith('data:') || shop.coverImage.startsWith('blob:')}
                referrerPolicy="no-referrer"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(#0F7D41_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
          )}
        </div>

        {/* Store Profile Header */}
        <div className="bg-white rounded-[24px] border border-[#E3E9E4] p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#E8F7EE] text-[#075E36] font-display font-bold text-3xl sm:text-4xl flex items-center justify-center shrink-0 border-2 border-white shadow-sm overflow-hidden relative">
                {shop.avatarImage ? (
                  <Image
                    src={shop.avatarImage}
                    alt={shop.name}
                    fill
                    sizes="80px"
                    unoptimized={shop.avatarImage.startsWith('data:') || shop.avatarImage.startsWith('blob:')}
                    referrerPolicy="no-referrer"
                    className="object-cover object-center"
                  />
                ) : (
                  <span>{shop.initial}</span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#17211B]">
                    {shop.name}
                  </h1>
                </div>

                <p className="text-[14px] text-[#5B6861] flex items-center gap-2">
                  <span>{shop.category}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#0F7D41]" />
                    {shop.area ? `${shop.area}, ` : ''}{shop.city}
                  </span>
                </p>

                <p className="text-[15px] text-[#17211B]/90 pt-2 max-w-2xl leading-relaxed">
                  {shop.description}
                </p>
              </div>
            </div>

            {/* Actions: Message on WhatsApp & Copy Shop Link */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 pt-2 md:pt-0">
              {shopWaResult.isValid ? (
                <a
                  href={shopWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-[46px] px-5 rounded-[12px] bg-[#0F7D41] hover:bg-[#0B6636] active:bg-[#075E36] text-white text-[14px] font-semibold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Ask on WhatsApp</span>
                </a>
              ) : (
                <div className="px-4 py-2.5 rounded-[12px] bg-[#FEF7E6] border border-[#F5D899] text-[#7A4100] text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Number not formatted</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleCopyShopLink}
                className="h-[46px] px-4 rounded-[12px] bg-white border border-[#E3E9E4] hover:bg-[#F3F6F4] text-[#17211B] text-[14px] font-medium flex items-center gap-2 transition-colors"
              >
                <Copy className="w-4 h-4 text-[#5B6861]" />
                <span className="hidden sm:inline">Copy shop link</span>
              </button>
            </div>
          </div>
        </div>

        {/* IN-SHOP SEARCH & FILTER PILLS */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search within shop */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6861] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${shop.name}...`}
                className="w-full h-10 pl-10 pr-9 rounded-[10px] bg-white text-[14px] text-[#17211B] border border-[#E3E9E4] focus:outline-none focus:border-[#0F7D41] focus:ring-2 focus:ring-[#8AD3A8] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-6 h-6 absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#5B6861] hover:text-[#17211B] rounded-full hover:bg-[#F3F6F4]"
                  aria-label="Clear in-shop search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-[14px] text-[#5B6861] self-end sm:self-auto">
              <span>Sort</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sort products in shop"
                  className="h-10 pl-3 pr-8 rounded-[10px] bg-white border border-[#E3E9E4] text-[14px] font-medium text-[#17211B] appearance-none focus:outline-none focus:border-[#0F7D41]"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5B6861] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {inShopCategories.map((cat) => {
              const isSelected = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveCategory(cat.name)}
                  className={`px-3.5 py-1.5 rounded-full text-[13.5px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#0F7D41] text-white shadow-xs'
                      : 'bg-white border border-[#E3E9E4] text-[#17211B] hover:bg-[#F3F6F4]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[12px] opacity-80 tabular-nums ${
                      isSelected ? 'text-white' : 'text-[#5B6861]'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active filter reminder and reset */}
          {hasInShopFilters && (
            <div className="flex items-center gap-2 text-[13px] text-[#5B6861] pt-1">
              <span>Showing {sortedProducts.length} of {shopProducts.length} products</span>
              <span>·</span>
              <button
                type="button"
                onClick={clearInShopFilters}
                className="text-[#0F7D41] hover:underline font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset search</span>
              </button>
            </div>
          )}
        </div>

        {/* Product Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-12 text-center max-w-md mx-auto my-12">
            <div className="w-12 h-12 rounded-full bg-[#F3F6F4] flex items-center justify-center mx-auto mb-3 text-[#5B6861]">
              <Search className="w-5 h-5" />
            </div>
            <p className="font-display font-bold text-lg text-[#17211B] mb-1">
              No products match this filter
            </p>
            <p className="text-[14px] text-[#5B6861] mb-5">
              Try picking another category or clear your search query.
            </p>
            <button
              type="button"
              onClick={clearInShopFilters}
              className="h-10 px-5 rounded-[10px] bg-[#0F7D41] hover:bg-[#0B6636] text-white text-[14px] font-semibold transition-colors"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* ABOUT THIS SHOP */}
        <section className="bg-white rounded-[24px] border border-[#E3E9E4] p-6 sm:p-8">
          <h2 className="font-display font-bold text-2xl text-[#17211B] mb-6">
            About this shop
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Story */}
            <div className="md:col-span-8 space-y-2">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[#5B6861]">
                Story
              </h3>
              <p className="text-[15px] text-[#17211B] leading-relaxed">
                {shop.story}
              </p>
              <p className="text-[12.5px] text-[#5B6861] pt-1">
                Shop owners write this section themselves in their store settings.
              </p>
            </div>

            {/* Location & Metadata */}
            <div className="md:col-span-4 space-y-4 md:border-l md:border-[#E3E9E4] md:pl-8 text-[14px]">
              <div>
                <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#5B6861]">
                  Location
                </h4>
                <p className="text-[#17211B] font-medium mt-0.5">
                  {shop.area ? `${shop.area}, ` : ''}{shop.city}
                </p>
              </div>

              <div>
                <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#5B6861]">
                  Shop link
                </h4>
                <p className="text-[#0F7D41] font-mono text-[13px] mt-0.5">
                  linkora.com/{shop.slug}
                </p>
              </div>

              <div>
                <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#5B6861]">
                  Connected WhatsApp
                </h4>
                <p className="text-[#17211B] font-medium mt-0.5">
                  {shop.displayPhone}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketplaceFooter />
      <MobileBottomNav activeTab="shops" />
    </div>
  );
}

export default function ShopStorefrontPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#0F7D41] border-t-transparent animate-spin" />
        </div>
      }
    >
      <ShopStorefrontContent />
    </Suspense>
  );
}
