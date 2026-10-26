'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  Store,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MarketplaceHeader } from '@/components/marketplace/header';
import { MarketplaceFooter } from '@/components/marketplace/footer';
import { MobileBottomNav } from '@/components/marketplace/mobile-bottom-nav';
import { ProductCard } from '@/components/marketplace/product-card';
import { StoreCard } from '@/components/marketplace/store-card';
import { useStore } from '@/lib/context/store-context';
import { CITIES } from '@/lib/data/sample-data';
import { executeSearch } from '@/lib/search';

function ExploreContent() {
  const searchParams = useSearchParams();
  const { products, shops } = useStore();

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'All categories';
  const initialCity = searchParams.get('city') || 'All cities';
  const initialPriceBucket = (searchParams.get('priceBucket') as any) || 'all';
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  const initialSortBy = (searchParams.get('sortBy') as any) || 'relevance';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [priceBucket, setPriceBucket] = useState<'all' | 'under20k' | '20k-100k' | 'over100k'>(initialPriceBucket);
  const [minPrice, setMinPrice] = useState<string>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<string>(initialMaxPrice);
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'name-asc' | 'name-desc'>(initialSortBy);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const currentParamsStr = searchParams.toString();
  const [prevParamsStr, setPrevParamsStr] = useState(currentParamsStr);
  if (currentParamsStr !== prevParamsStr) {
    setPrevParamsStr(currentParamsStr);
    setSearchQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'All categories');
    setSelectedCity(searchParams.get('city') || 'All cities');
    setPriceBucket((searchParams.get('priceBucket') as any) || 'all');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSortBy((searchParams.get('sortBy') as any) || 'relevance');
  }

  // Categories list with dynamic product counts
  const categoryOptions = useMemo(() => {
    const list = [
      'All categories',
      'Fashion & clothing',
      'Computers & electronics',
      'Phones & accessories',
      'Shoes',
      'Beauty & personal care',
      'Home & living',
    ];

    return list.map((cat) => {
      const count =
        cat === 'All categories'
          ? products.length
          : products.filter((p) => p.category === cat).length;
      return { name: cat, count };
    });
  }, [products]);

  // City list with dynamic counts
  const cityOptions = useMemo(() => {
    return CITIES.map((c) => {
      if (c.name === 'All cities') return { name: c.name, count: products.length };
      const count = products.filter((p) => p.shopCity === c.name).length;
      return { name: c.name, count };
    });
  }, [products]);

  // Execute search using the comprehensive search engine
  const searchResults = useMemo(() => {
    return executeSearch(searchQuery, products, shops, {
      category: selectedCategory,
      city: selectedCity,
      priceBucket,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
    });
  }, [searchQuery, products, shops, selectedCategory, selectedCity, priceBucket, minPrice, maxPrice, sortBy]);

  const sortedProducts = searchResults.products;
  const matchingShops = searchResults.shops;

  // Sync browser URL search params seamlessly
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory !== 'All categories') params.set('category', selectedCategory);
    if (selectedCity !== 'All cities') params.set('city', selectedCity);
    if (priceBucket !== 'all') params.set('priceBucket', priceBucket);
    if (minPrice.trim()) params.set('minPrice', minPrice.trim());
    if (maxPrice.trim()) params.set('maxPrice', maxPrice.trim());
    if (sortBy !== 'relevance') params.set('sortBy', sortBy);

    const newUrl = params.toString() ? `/explore?${params.toString()}` : '/explore';
    if (typeof window !== 'undefined' && window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [searchQuery, selectedCategory, selectedCity, priceBucket, minPrice, maxPrice, sortBy]);

  const handleHeaderSearch = (newQuery: string) => {
    setSearchQuery(newQuery);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All categories');
    setSelectedCity('All cities');
    setPriceBucket('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('relevance');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All categories' ||
    selectedCity !== 'All cities' ||
    priceBucket !== 'all' ||
    minPrice !== '' ||
    maxPrice !== '';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F7]">
      <MarketplaceHeader
        currentPath="/explore"
        searchValue={searchQuery}
        onSearchSubmit={handleHeaderSearch}
      />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] text-[#5B6861] mb-4">
          <Link href="/" className="hover:text-[#17211B] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#17211B] font-medium">Explore products</span>
        </nav>

        {/* Page Title & Sort Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3E9E4]">
          <div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#17211B]">
              Explore products
            </h1>
            <p className="mt-1 text-[14px] text-[#5B6861] tabular-nums">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} found
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 h-10 px-4 rounded-[10px] bg-white border border-[#E3E9E4] text-[14px] font-medium text-[#17211B]"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#0F7D41]" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#0F7D41]" />
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-[14px] text-[#5B6861]">
              <span className="hidden sm:inline">Sort by</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sort products by"
                  className="h-10 pl-3 pr-8 rounded-[10px] bg-white border border-[#E3E9E4] text-[14px] font-medium text-[#17211B] appearance-none focus:outline-none focus:border-[#0F7D41]"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="newest">Newest</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5B6861] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* In-Page Quick Search Bar */}
        <div className="pt-4 pb-1">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6861] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, descriptions, shops..."
              className="w-full h-10 pl-10 pr-9 rounded-[10px] bg-white border border-[#E3E9E4] text-[14px] text-[#17211B] placeholder-[#8E9B93] focus:outline-none focus:border-[#0F7D41] focus:ring-2 focus:ring-[#8AD3A8] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="w-6 h-6 absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#5B6861] hover:text-[#17211B] rounded-full hover:bg-[#F3F6F4] transition-colors"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="py-3 flex items-center flex-wrap gap-2 text-[13px]">
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

            {priceBucket !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E3E9E4] text-[#17211B]">
                <span>
                  {priceBucket === 'under20k'
                    ? 'Under 20,000 FCFA'
                    : priceBucket === '20k-100k'
                    ? '20,000 – 100,000 FCFA'
                    : '100,000+ FCFA'}
                </span>
                <button
                  type="button"
                  onClick={() => setPriceBucket('all')}
                  className="hover:text-[#C62828]"
                  title="Remove price bucket"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {minPrice && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E3E9E4] text-[#17211B]">
                <span>Min: {Number(minPrice).toLocaleString()} FCFA</span>
                <button
                  type="button"
                  onClick={() => setMinPrice('')}
                  className="hover:text-[#C62828]"
                  title="Remove min price"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {maxPrice && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E3E9E4] text-[#17211B]">
                <span>Max: {Number(maxPrice).toLocaleString()} FCFA</span>
                <button
                  type="button"
                  onClick={() => setMaxPrice('')}
                  className="hover:text-[#C62828]"
                  title="Remove max price"
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

        {/* Content Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8 pr-4">
            {/* Category Filter */}
            <div>
              <h3 className="font-sans font-semibold text-[13px] tracking-wider uppercase text-[#17211B] mb-3">
                Category
              </h3>
              <ul className="space-y-1.5">
                {categoryOptions.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <li key={cat.name}>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-[14px] transition-colors ${
                          isSelected
                            ? 'bg-[#E8F7EE] text-[#075E36] font-semibold'
                            : 'text-[#5B6861] hover:bg-[#F0F4F2] hover:text-[#17211B]'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-[12px] opacity-75 tabular-nums">
                          {cat.count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="font-sans font-semibold text-[13px] tracking-wider uppercase text-[#17211B] mb-3">
                Price (FCFA)
              </h3>

              <div className="flex items-center gap-2 mb-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPriceBucket('all');
                  }}
                  className="w-full h-9 px-3 rounded-[8px] bg-white border border-[#E3E9E4] text-[13px] text-[#17211B] focus:outline-none focus:border-[#0F7D41]"
                />
                <span className="text-[#5B6861]">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPriceBucket('all');
                  }}
                  className="w-full h-9 px-3 rounded-[8px] bg-white border border-[#E3E9E4] text-[13px] text-[#17211B] focus:outline-none focus:border-[#0F7D41]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'under20k', label: 'Under 20,000' },
                  { id: '20k-100k', label: '20,000 – 100,000' },
                  { id: 'over100k', label: '100,000+' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('');
                      setPriceBucket(priceBucket === b.id ? 'all' : (b.id as any));
                    }}
                    className={`text-left px-3 py-1.5 rounded-[8px] text-[13.5px] transition-colors ${
                      priceBucket === b.id
                        ? 'bg-[#E8F7EE] text-[#075E36] font-semibold'
                        : 'text-[#5B6861] hover:bg-[#F0F4F2] hover:text-[#17211B]'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* City Filter */}
            <div>
              <h3 className="font-sans font-semibold text-[13px] tracking-wider uppercase text-[#17211B] mb-3">
                City
              </h3>
              <ul className="space-y-1.5">
                {cityOptions.map((c) => {
                  const isSelected = selectedCity === c.name;
                  return (
                    <li key={c.name}>
                      <button
                        type="button"
                        onClick={() => setSelectedCity(c.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-[14px] transition-colors ${
                          isSelected
                            ? 'bg-[#E8F7EE] text-[#075E36] font-semibold'
                            : 'text-[#5B6861] hover:bg-[#F0F4F2] hover:text-[#17211B]'
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        <span className="text-[12px] opacity-75 tabular-nums">
                          {c.count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-[12px] text-[#5B6861] leading-relaxed">
                Cities come from the location each seller adds to their store.
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="w-full h-10 rounded-[10px] bg-white border border-[#E3E9E4] hover:bg-[#F3F6F4] text-[#17211B] text-[14px] font-medium transition-colors"
              >
                Clear filters
              </button>
            )}
          </aside>

          {/* MAIN PRODUCT GRID */}
          <div className="lg:col-span-9">
            {/* Matching Shops if query matched any shops */}
            {searchQuery.trim() && matchingShops.length > 0 && (
              <div className="mb-8 p-5 rounded-[20px] bg-white border border-[#E3E9E4]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#0F7D41]" />
                    <h2 className="font-display font-bold text-lg text-[#17211B]">
                      Matching {matchingShops.length === 1 ? 'Shop' : 'Shops'} ({matchingShops.length})
                    </h2>
                  </div>
                  <Link
                    href={`/shops?q=${encodeURIComponent(searchQuery)}`}
                    className="text-[13px] font-semibold text-[#0F7D41] hover:underline"
                  >
                    View all shops
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {matchingShops.slice(0, 3).map((shop) => (
                    <StoreCard key={shop.id} shop={shop} />
                  ))}
                </div>
              </div>
            )}

            {sortedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <div className="mt-14 pt-8 border-t border-[#E3E9E4] text-center text-[14px] text-[#5B6861]">
                  <span>
                    That&apos;s everything for these filters. Can&apos;t find it?{' '}
                  </span>
                  <button
                    onClick={clearAllFilters}
                    className="text-[#0F7D41] hover:underline font-semibold"
                  >
                    Try a broader search.
                  </button>
                </div>
              </>
            ) : (
              /* EMPTY STATE */
              <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-12 text-center max-w-md mx-auto my-8">
                <div className="w-14 h-14 rounded-full bg-[#F3F6F4] flex items-center justify-center mx-auto mb-4 text-[#5B6861]">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-[#17211B] mb-2">
                  No products match
                </h3>
                <p className="text-[15px] text-[#5B6861] leading-relaxed mb-6">
                  {matchingShops.length > 0
                    ? 'Check out the matching shops above, or try clearing some filters.'
                    : 'Try another word, select another category, or widen the price range.'}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="w-full sm:w-auto h-11 px-5 rounded-[10px] bg-[#0F7D41] hover:bg-[#0B6636] text-white text-[14px] font-semibold transition-colors"
                  >
                    Clear filters
                  </button>
                  <Link
                    href="/shops"
                    className="w-full sm:w-auto h-11 px-5 rounded-[10px] bg-white border border-[#E3E9E4] hover:bg-[#F3F6F4] text-[#17211B] text-[14px] font-medium flex items-center justify-center transition-colors"
                  >
                    Discover shops
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MOBILE FILTER BOTTOM SHEET */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setIsMobileFilterOpen(false)}
            />

            {/* Bottom Sheet Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 bg-white rounded-t-[24px] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Sheet Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E9E4]">
                <h2 className="font-display font-bold text-lg text-[#17211B]">
                  Filters & Sorting
                </h2>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-full text-[#5B6861] hover:bg-[#F3F6F4]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sheet Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {/* Sort Option */}
                <div>
                  <h3 className="font-semibold text-[13px] tracking-wider uppercase text-[#17211B] mb-2">
                    Sort by
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'relevance', label: 'Relevance' },
                      { id: 'price-asc', label: 'Price: Low → High' },
                      { id: 'price-desc', label: 'Price: High → Low' },
                      { id: 'newest', label: 'Newest' },
                      { id: 'name-asc', label: 'Name: A → Z' },
                      { id: 'name-desc', label: 'Name: Z → A' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSortBy(s.id as any)}
                        className={`py-2 px-3 rounded-[8px] text-[13px] font-medium text-left border ${
                          sortBy === s.id
                            ? 'bg-[#E8F7EE] text-[#075E36] border-[#0F7D41]'
                            : 'bg-white text-[#5B6861] border-[#E3E9E4]'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <h3 className="font-semibold text-[13px] tracking-wider uppercase text-[#17211B] mb-2">
                    Category
                  </h3>
                  <div className="space-y-1">
                    {categoryOptions.map((cat) => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-[10px] text-[14px] ${
                          selectedCategory === cat.name
                            ? 'bg-[#E8F7EE] text-[#075E36] font-semibold'
                            : 'text-[#5B6861]'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs">{cat.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h3 className="font-semibold text-[13px] tracking-wider uppercase text-[#17211B] mb-2">
                    Price (FCFA)
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="number"
                      placeholder="Min FCFA"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setPriceBucket('all');
                      }}
                      className="w-full h-9 px-3 rounded-[8px] bg-white border border-[#E3E9E4] text-[13px] text-[#17211B] focus:outline-none focus:border-[#0F7D41]"
                    />
                    <span className="text-[#5B6861]">–</span>
                    <input
                      type="number"
                      placeholder="Max FCFA"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setPriceBucket('all');
                      }}
                      className="w-full h-9 px-3 rounded-[8px] bg-white border border-[#E3E9E4] text-[13px] text-[#17211B] focus:outline-none focus:border-[#0F7D41]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'under20k', label: '< 20,000' },
                      { id: '20k-100k', label: '20k – 100k' },
                      { id: 'over100k', label: '100k+' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setMinPrice('');
                          setMaxPrice('');
                          setPriceBucket(priceBucket === b.id ? 'all' : (b.id as any));
                        }}
                        className={`py-2 px-2 rounded-[8px] text-[13px] font-medium text-center border ${
                          priceBucket === b.id
                            ? 'bg-[#E8F7EE] text-[#075E36] border-[#0F7D41]'
                            : 'bg-white text-[#5B6861] border-[#E3E9E4]'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* City */}
                <div>
                  <h3 className="font-semibold text-[13px] tracking-wider uppercase text-[#17211B] mb-2">
                    City
                  </h3>
                  <div className="space-y-1">
                    {cityOptions.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedCity(c.name)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-[10px] text-[14px] ${
                          selectedCity === c.name
                            ? 'bg-[#E8F7EE] text-[#075E36] font-semibold'
                            : 'text-[#5B6861]'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-xs">{c.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sheet Footer: "Show N results" */}
              <div className="p-4 border-t border-[#E3E9E4] bg-white flex items-center gap-3">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="h-11 px-4 rounded-[12px] border border-[#E3E9E4] text-[14px] font-medium text-[#17211B]"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 h-11 rounded-[12px] bg-[#0F7D41] text-white text-[15px] font-semibold shadow-xs"
                >
                  Show {sortedProducts.length} results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MarketplaceFooter />
      <MobileBottomNav activeTab="explore" />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#0F7D41] border-t-transparent animate-spin" />
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
