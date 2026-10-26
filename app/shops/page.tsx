'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Store, ArrowRight, X, RotateCcw, ChevronDown } from 'lucide-react';
import { MarketplaceHeader } from '@/components/marketplace/header';
import { MarketplaceFooter } from '@/components/marketplace/footer';
import { MobileBottomNav } from '@/components/marketplace/mobile-bottom-nav';
import { StoreCard } from '@/components/marketplace/store-card';
import { useStore } from '@/lib/context/store-context';
import { CITIES, CATEGORIES } from '@/lib/data/sample-data';
import { normalizeSearchTerm } from '@/lib/search';
import { motion, AnimatePresence } from 'motion/react';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function ShopsContent() {
  const searchParams = useSearchParams();
  const { shops } = useStore();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'All cities');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All categories');
  const [sortBy, setSortBy] = useState<'products-desc' | 'name-asc' | 'city-asc'>(
    (searchParams.get('sortBy') as any) || 'products-desc'
  );

  const currentParamsStr = searchParams.toString();
  const [prevParamsStr, setPrevParamsStr] = useState(currentParamsStr);
  if (currentParamsStr !== prevParamsStr) {
    setPrevParamsStr(currentParamsStr);
    setSearchQuery(searchParams.get('q') || '');
    setSelectedCity(searchParams.get('city') || 'All cities');
    setSelectedCategory(searchParams.get('category') || 'All categories');
    setSortBy((searchParams.get('sortBy') as any) || 'products-desc');
  }

  // Synchronize URL query parameters with active filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCity !== 'All cities') params.set('city', selectedCity);
    if (selectedCategory !== 'All categories') params.set('category', selectedCategory);
    if (sortBy !== 'products-desc') params.set('sortBy', sortBy);

    const newUrl = params.toString() ? `/shops?${params.toString()}` : '/shops';
    if (typeof window !== 'undefined' && window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [searchQuery, selectedCity, selectedCategory, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCity('All cities');
    setSelectedCategory('All categories');
    setSortBy('products-desc');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCity !== 'All cities' ||
    selectedCategory !== 'All categories';

  const categoryOptions = useMemo(() => {
    const all = [{ name: 'All categories', count: shops.length }];
    const counts: Record<string, number> = {};
    for (const s of shops) {
      counts[s.category] = (counts[s.category] || 0) + 1;
    }
    for (const [name, count] of Object.entries(counts)) {
      all.push({ name, count });
    }
    return all;
  }, [shops]);

  const filteredShops = useMemo(() => {
    const list = shops.filter((shop) => {
      if (searchQuery.trim()) {
        const qNorm = normalizeSearchTerm(searchQuery.trim());
        const tokens = qNorm.split(' ').filter(Boolean);
        const nameNorm = normalizeSearchTerm(shop.name);
        const catNorm = normalizeSearchTerm(shop.category);
        const cityNorm = normalizeSearchTerm(shop.city);
        const areaNorm = normalizeSearchTerm(shop.area || '');
        const descNorm = normalizeSearchTerm(shop.description || '');

        const matches = tokens.every(
          (t) =>
            nameNorm.includes(t) ||
            catNorm.includes(t) ||
            cityNorm.includes(t) ||
            areaNorm.includes(t) ||
            descNorm.includes(t)
        );
        if (!matches) return false;
      }

      if (selectedCity !== 'All cities' && shop.city !== selectedCity) {
        return false;
      }

      if (selectedCategory !== 'All categories' && shop.category !== selectedCategory) {
        return false;
      }

      return true;
    });

    if (sortBy === 'name-asc') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === 'city-asc') {
      return [...list].sort((a, b) => a.city.localeCompare(b.city));
    }
    return [...list].sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
  }, [shops, searchQuery, selectedCity, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F7]">
      <MarketplaceHeader currentPath="/shops" />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 pb-24 sm:pb-16">
        <nav className="flex items-center gap-2 text-[13px] text-[#5B6861] mb-4">
          <Link href="/" className="hover:text-[#17211B] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#17211B] font-medium">Discover shops</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E3E9E4]">
          <div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#17211B]">
              Discover shops
            </h1>
            <p className="mt-2 text-[16px] text-[#5B6861] max-w-xl">
              Browse verified local businesses selling directly through WhatsApp.
              Explore their full catalogues and chat directly.
            </p>
            <p className="mt-1 text-[13.5px] text-[#5B6861] tabular-nums">
              {filteredShops.length} {filteredShops.length === 1 ? 'shop' : 'shops'} available
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6861] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shops..."
                className="w-full h-11 pl-10 pr-9 rounded-[10px] bg-white text-[14px] text-[#17211B] border border-[#E3E9E4] focus:outline-none focus:border-[#0F7D41] focus:ring-2 focus:ring-[#8AD3A8] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-6 h-6 absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#5B6861] hover:text-[#17211B] rounded-full hover:bg-[#F3F6F4]"
                  aria-label="Clear shop search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter shops by category"
                className="h-11 pl-3 pr-8 rounded-[10px] bg-white text-[14px] text-[#17211B] border border-[#E3E9E4] focus:outline-none focus:border-[#0F7D41] appearance-none"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5B6861] pointer-events-none" />
            </div>

            {/* City Dropdown */}
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                aria-label="Filter shops by city"
                className="h-11 pl-3 pr-8 rounded-[10px] bg-white text-[14px] text-[#17211B] border border-[#E3E9E4] focus:outline-none focus:border-[#0F7D41] appearance-none"
              >
                {CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5B6861] pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort shops by"
                className="h-11 pl-3 pr-8 rounded-[10px] bg-white text-[14px] text-[#17211B] border border-[#E3E9E4] focus:outline-none focus:border-[#0F7D41] appearance-none font-medium"
              >
                <option value="products-desc">Most products</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="city-asc">City</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5B6861] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="py-3 flex items-center flex-wrap gap-2 text-[13px] border-b border-[#E3E9E4]/60 mb-6">
            <span className="text-[#5B6861] text-xs font-semibold tracking-wider uppercase mr-1">
              Active:
            </span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E3E9E4] text-[#17211B]">
                <span>Query: &ldquo;{searchQuery}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-[#C62828]"
                  title="Remove search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {selectedCategory !== 'All categories' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E3E9E4] text-[#17211B]">
                <span>{selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All categories')}
                  className="hover:text-[#C62828]"
                  title="Remove category filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {selectedCity !== 'All cities' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E3E9E4] text-[#17211B]">
                <span>{selectedCity}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCity('All cities')}
                  className="hover:text-[#C62828]"
                  title="Remove city filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[#0F7D41] hover:underline font-semibold text-xs ml-2 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all</span>
            </button>
          </div>
        )}

        {/* Shops Grid */}
        <div className="pt-4">
          {filteredShops.length > 0 ? (
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredShops.map((shop) => (
                <motion.div
                  key={shop.id}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.22, ease: EASE_OUT },
                    },
                  }}
                >
                  <StoreCard shop={shop} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-12 text-center max-w-md mx-auto my-8">
              <div className="w-14 h-14 rounded-full bg-[#F3F6F4] flex items-center justify-center mx-auto mb-4 text-[#5B6861]">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#17211B] mb-2">
                No shops match your search
              </h3>
              <p className="text-[15px] text-[#5B6861] mb-6">
                Try widening your city selection, selecting a different category, or clearing your query.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="h-11 px-5 rounded-[10px] bg-[#0F7D41] hover:bg-[#0B6636] text-white text-[14px] font-semibold transition-colors"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Sell CTA Banner */}
        <div className="mt-16 p-8 rounded-[20px] bg-[#E8F7EE] border border-[#8AD3A8]/40 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-[#075E36]">
              Are you a shop owner selling on WhatsApp?
            </h2>
            <p className="mt-1 text-[15px] text-[#17211B]/80 max-w-xl">
              Get your own professional shareable storefront URL and appear in
              Linkora discovery. Zero fees, zero checkout friction.
            </p>
          </div>
          <Link
            href="/seller/onboarding"
            className="h-[46px] px-6 rounded-[12px] bg-[#0F7D41] hover:bg-[#0B6636] text-white text-[15px] font-semibold flex items-center gap-2 shrink-0 shadow-xs"
          >
            <span>Open your store</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <MarketplaceFooter />
      <MobileBottomNav activeTab="shops" />
    </div>
  );
}

export default function ShopsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#0F7D41] border-t-transparent animate-spin" />
        </div>
      }
    >
      <ShopsContent />
    </Suspense>
  );
}
