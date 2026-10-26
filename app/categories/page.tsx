'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  ChevronRight,
  ArrowRight,
  Shirt,
  Laptop,
  Smartphone,
  Footprints,
  Sparkles,
  Home as HomeIcon,
  ShoppingBag,
  X,
  RotateCcw,
} from 'lucide-react';
import { motion } from 'motion/react';
import { MarketplaceHeader } from '@/components/marketplace/header';
import { MarketplaceFooter } from '@/components/marketplace/footer';
import { MobileBottomNav } from '@/components/marketplace/mobile-bottom-nav';
import { CATEGORIES, PRODUCTS } from '@/lib/data/sample-data';
import { normalizeSearchTerm } from '@/lib/search';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function CategoriesContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [searchFilter, setSearchFilter] = useState(queryParam);
  const [prevQueryParam, setPrevQueryParam] = useState(queryParam);
  if (queryParam !== prevQueryParam) {
    setPrevQueryParam(queryParam);
    setSearchFilter(queryParam);
  }

  // Synchronize URL query parameter
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchFilter.trim()) params.set('q', searchFilter.trim());
    const newUrl = params.toString() ? `/categories?${params.toString()}` : '/categories';
    if (typeof window !== 'undefined' && window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [searchFilter]);

  const getCategoryIcon = (iconName: string) => {
    const iconProps = { className: 'w-6 h-6 text-[#0F7D41]', strokeWidth: 1.8 };
    switch (iconName) {
      case 'Shirt':
        return <Shirt {...iconProps} />;
      case 'Laptop':
        return <Laptop {...iconProps} />;
      case 'Smartphone':
        return <Smartphone {...iconProps} />;
      case 'Footprints':
        return <Footprints {...iconProps} />;
      case 'Sparkles':
        return <Sparkles {...iconProps} />;
      case 'Home':
        return <HomeIcon {...iconProps} />;
      default:
        return <ShoppingBag {...iconProps} />;
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchFilter.trim()) return CATEGORIES;

    const qNorm = normalizeSearchTerm(searchFilter.trim());
    const tokens = qNorm.split(' ').filter(Boolean);

    return CATEGORIES.filter((cat) => {
      const nameNorm = normalizeSearchTerm(cat.name);
      const descNorm = normalizeSearchTerm(cat.description || '');

      // Check category metadata
      const matchesMeta = tokens.every(
        (t) => nameNorm.includes(t) || descNorm.includes(t)
      );
      if (matchesMeta) return true;

      // Check if any sample products in this category match the query
      const categoryProds = PRODUCTS.filter((p) => p.category === cat.name);
      return categoryProds.some((p) => {
        const prodNameNorm = normalizeSearchTerm(p.name);
        const prodDescNorm = normalizeSearchTerm(p.description || '');
        return tokens.some((t) => prodNameNorm.includes(t) || prodDescNorm.includes(t));
      });
    });
  }, [searchFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F7]">
      <MarketplaceHeader currentPath="/categories" />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 pb-24 sm:pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] text-[#5B6861] mb-6">
          <Link href="/" className="hover:text-[#17211B] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#17211B] font-medium">Categories</span>
        </nav>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: EASE_OUT }}
          className="max-w-2xl mb-8"
        >
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#17211B] tracking-tight">
            Browse by Category
          </h1>
          <p className="text-[15px] text-[#5B6861] mt-2 leading-relaxed">
            Discover curated catalogues from verified local WhatsApp shops across Cameroon.
            Find items by category and message sellers directly.
          </p>

          {/* Quick Category Search */}
          <div className="mt-5 relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6861] pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter categories (e.g. fashion, laptops, beauty)..."
              className="w-full h-11 pl-10 pr-9 text-[14px] bg-white border border-[#E3E9E4] rounded-[12px] text-[#17211B] placeholder-[#8E9B93] focus:outline-none focus:border-[#0F7D41] focus:ring-2 focus:ring-[#8AD3A8] transition-all"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="w-6 h-6 absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#5B6861] hover:text-[#17211B] rounded-full hover:bg-[#F3F6F4]"
                aria-label="Clear category filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {filteredCategories.map((category) => {
              const productSample = PRODUCTS.filter(
                (p) => p.category === category.name
              );
              return (
                <motion.div
                  key={category.id}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.22, ease: EASE_OUT },
                    },
                  }}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <Link
                    href={`/explore?category=${encodeURIComponent(category.name)}`}
                    className="group flex flex-col justify-between h-full bg-white rounded-[20px] p-5 border border-[#E3E9E4] hover:border-[#0F7D41]/35 hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      {/* Category Photography Header */}
                      {category.image && (
                        <div className="w-full h-36 rounded-[14px] overflow-hidden relative mb-4 bg-[#F3F6F4]">
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                          <span className="absolute bottom-2.5 right-2.5 text-[11.5px] font-semibold text-[#075E36] bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-2xs tabular-nums">
                            {category.count} items
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-4">
                        <div className="w-11 h-11 rounded-[12px] bg-[#E8F7EE] flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0">
                          {getCategoryIcon(category.iconName)}
                        </div>
                        {!category.image && (
                          <span className="text-[12.5px] font-semibold text-[#0F7D41] bg-[#E8F7EE] px-2.5 py-1 rounded-full tabular-nums">
                            {category.count} items
                          </span>
                        )}
                      </div>

                      <div className="mt-4">
                        <h2 className="font-display font-bold text-lg text-[#17211B] group-hover:text-[#0F7D41] transition-colors flex items-center justify-between">
                          <span>{category.name}</span>
                          <ArrowRight className="w-4 h-4 text-[#8E9B93] group-hover:text-[#0F7D41] group-hover:translate-x-1 transition-all" />
                        </h2>
                        <p className="text-[13.5px] text-[#5B6861] mt-1 line-clamp-2">
                          {productSample.length > 0
                            ? `Includes ${productSample.slice(0, 3).map((p) => p.name).join(', ')} and more`
                            : category.description || 'Explore connected catalogues from local shops'}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-12 text-center max-w-md mx-auto my-12">
            <div className="w-12 h-12 rounded-full bg-[#F3F6F4] flex items-center justify-center mx-auto mb-3 text-[#5B6861]">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#17211B] mb-1">
              No categories match &ldquo;{searchFilter}&rdquo;
            </h3>
            <p className="text-[14px] text-[#5B6861] mb-5 leading-relaxed">
              Try searching for common retail terms like fashion, shoes, electronics, beauty, or phones.
            </p>
            <button
              type="button"
              onClick={() => setSearchFilter('')}
              className="h-10 px-5 rounded-[10px] bg-[#0F7D41] hover:bg-[#0B6636] text-white text-[14px] font-semibold transition-colors"
            >
              Reset filter
            </button>
          </div>
        )}
      </main>

      <MarketplaceFooter />
      <MobileBottomNav activeTab="explore" />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#0F7D41] border-t-transparent animate-spin" />
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}
