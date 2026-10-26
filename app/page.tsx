'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Search,
  ArrowRight,
  Shirt,
  Laptop,
  Smartphone,
  Footprints,
  Sparkles,
  Home as HomeIcon,
  ShoppingBag,
  MoreHorizontal,
  Compass,
} from 'lucide-react';
import { MarketplaceHeader } from '@/components/marketplace/header';
import { MarketplaceFooter } from '@/components/marketplace/footer';
import { MobileBottomNav } from '@/components/marketplace/mobile-bottom-nav';
import { ProductCard } from '@/components/marketplace/product-card';
import { StoreCard } from '@/components/marketplace/store-card';
import { SearchAutocomplete } from '@/components/marketplace/search-autocomplete';
import { PRODUCTS, SHOPS, CATEGORIES, CITIES } from '@/lib/data/sample-data';
import type { Variants } from 'motion/react';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// Motion variants
const heroContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: EASE_OUT,
    },
  },
};

const heroGridContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.16,
    },
  },
};

const heroCardItem: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.26,
      ease: EASE_OUT,
    },
  },
};

const sectionFade: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: EASE_OUT,
    },
  },
};

export default function HomePage() {
  const router = useRouter();
  const [searchTab, setSearchTab] = useState<'products' | 'shops'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All cities');

  const heroProducts = PRODUCTS.slice(0, 4);
  const recentlyAddedProducts = PRODUCTS.slice(4, 12);
  const exploreShops = SHOPS.slice(0, 3);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCity !== 'All cities') params.set('city', selectedCity);
    if (searchTab === 'shops') {
      const qs = params.toString();
      router.push(qs ? `/shops?${qs}` : '/shops');
    } else {
      const qs = params.toString();
      router.push(qs ? `/explore?${qs}` : '/explore');
    }
  };

  const handleQuickFilter = (term: string) => {
    const params = new URLSearchParams();
    params.set('q', term);
    if (selectedCity !== 'All cities') params.set('city', selectedCity);
    if (searchTab === 'shops') {
      router.push(`/shops?${params.toString()}`);
    } else {
      router.push(`/explore?${params.toString()}`);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shirt':
        return <Shirt className="w-5 h-5 text-[#0F7D41]" strokeWidth={1.8} />;
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-[#0F7D41]" strokeWidth={1.8} />;
      case 'Smartphone':
        return (
          <Smartphone className="w-5 h-5 text-[#0F7D41]" strokeWidth={1.8} />
        );
      case 'Footprints':
        return (
          <Footprints className="w-5 h-5 text-[#0F7D41]" strokeWidth={1.8} />
        );
      case 'Sparkles':
        return (
          <Sparkles className="w-5 h-5 text-[#0F7D41]" strokeWidth={1.8} />
        );
      case 'Home':
        return (
          <HomeIcon className="w-5 h-5 text-[#0F7D41]" strokeWidth={1.8} />
        );
      case 'ShoppingBag':
        return (
          <ShoppingBag className="w-5 h-5 text-[#0F7D41]" strokeWidth={1.8} />
        );
      default:
        return (
          <MoreHorizontal
            className="w-5 h-5 text-[#0F7D41]"
            strokeWidth={1.8}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F7]">
      <MarketplaceHeader currentPath="/" />

      <main className="flex-1 pb-16">
        {/* HERO SECTION WITH CHOREOGRAPHED ENTRANCE */}
        <section className="pt-8 sm:pt-14 pb-12 sm:pb-20 border-b border-[#E3E9E4]/60 bg-gradient-to-b from-white to-[#F7F9F7]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Sequenced Value Proposition & Search */}
              <motion.div
                variants={heroContainer}
                initial="hidden"
                animate="visible"
                className="lg:col-span-7 space-y-6"
              >
                <motion.div
                  variants={heroItem}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F7EE] text-[#075E36] text-[13px] font-medium"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Discovery for WhatsApp-connected shops</span>
                </motion.div>

                <motion.h1
                  variants={heroItem}
                  className="font-display font-bold text-4xl sm:text-5xl lg:text-[54px] tracking-tight text-[#17211B] leading-[1.08] text-balance"
                >
                  Discover great shops{' '}
                  <span className="text-[#0F7D41]">beyond your</span> WhatsApp
                  groups.
                </motion.h1>

                <motion.p
                  variants={heroItem}
                  className="text-[17px] sm:text-[19px] text-[#5B6861] leading-relaxed max-w-xl"
                >
                  Find products, explore local businesses, and browse organised
                  catalogues — all in one place.
                </motion.p>

                {/* Search Box Widget */}
                <motion.div
                  variants={heroItem}
                  className="bg-white p-3 sm:p-4 rounded-[20px] border border-[#E3E9E4] shadow-sm max-w-xl"
                >
                  {/* Tabs: Products vs Shops with animated indicator */}
                  <div className="flex items-center gap-1 mb-3 relative">
                    <button
                      type="button"
                      onClick={() => setSearchTab('products')}
                      className={`relative px-3 py-1 rounded-[8px] text-[13px] font-medium transition-colors ${
                        searchTab === 'products'
                          ? 'text-[#075E36] font-semibold'
                          : 'text-[#5B6861] hover:text-[#17211B]'
                      }`}
                    >
                      {searchTab === 'products' && (
                        <motion.div
                          layoutId="searchTabPill"
                          className="absolute inset-0 bg-[#E8F7EE] rounded-[8px] -z-10"
                          transition={{ duration: 0.18, ease: EASE_OUT }}
                        />
                      )}
                      Products
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchTab('shops')}
                      className={`relative px-3 py-1 rounded-[8px] text-[13px] font-medium transition-colors ${
                        searchTab === 'shops'
                          ? 'text-[#075E36] font-semibold'
                          : 'text-[#5B6861] hover:text-[#17211B]'
                      }`}
                    >
                      {searchTab === 'shops' && (
                        <motion.div
                          layoutId="searchTabPill"
                          className="absolute inset-0 bg-[#E8F7EE] rounded-[8px] -z-10"
                          transition={{ duration: 0.18, ease: EASE_OUT }}
                        />
                      )}
                      Shops
                    </button>
                  </div>

                  {/* Search Input and City Selector */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <SearchAutocomplete
                        initialValue={searchQuery}
                        placeholder={
                          searchTab === 'shops'
                            ? 'Search shops by name, category, or city...'
                            : 'Search sneakers, laptops, ankara dresses...'
                        }
                        inputClassName="h-11 rounded-[10px]"
                        targetTab={searchTab}
                        selectedCity={selectedCity}
                        onValueChange={(val) => setSearchQuery(val)}
                        onSearchSubmit={(val) => {
                          setSearchQuery(val);
                          const params = new URLSearchParams();
                          if (val.trim()) params.set('q', val.trim());
                          if (selectedCity !== 'All cities') params.set('city', selectedCity);
                          if (searchTab === 'shops') {
                            const qs = params.toString();
                            router.push(qs ? `/shops?${qs}` : '/shops');
                          } else {
                            const qs = params.toString();
                            router.push(qs ? `/explore?${qs}` : '/explore');
                          }
                        }}
                      />
                    </div>

                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      aria-label="Filter search by city"
                      className="h-11 px-3 rounded-[10px] bg-[#F7F9F7] text-[14px] text-[#17211B] border border-[#E3E9E4] focus:outline-none focus:border-[#0F7D41] transition-colors cursor-pointer"
                    >
                      {CITIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleSearchSubmit()}
                      className="h-11 px-5 rounded-[10px] bg-[#0F7D41] hover:bg-[#0B6636] active:bg-[#075E36] text-white text-[14px] font-semibold transition-colors active:scale-[0.98] shrink-0"
                    >
                      Search
                    </button>
                  </div>

                  {/* Popular tags */}
                  <div className="mt-3 pt-3 border-t border-[#F0F4F2] flex items-center flex-wrap gap-2 text-[13px]">
                    <span className="text-[#5B6861] font-medium">Popular</span>
                    {[
                      'Sneakers',
                      'Laptops',
                      'Ankara dresses',
                      'Phones',
                      'Skincare',
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleQuickFilter(tag)}
                        className="px-2.5 py-1 rounded-[8px] bg-[#F3F6F4] hover:bg-[#E8F7EE] text-[#17211B] hover:text-[#075E36] text-[12.5px] transition-colors active:scale-95"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Primary Actions */}
                <motion.div
                  variants={heroItem}
                  className="flex items-center flex-wrap gap-3 pt-2"
                >
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 h-[46px] px-6 rounded-[12px] bg-[#0F7D41] hover:bg-[#0B6636] active:bg-[#075E36] text-white font-medium text-[15px] shadow-xs transition-all active:scale-[0.98]"
                  >
                    <span>Explore products</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/seller/onboarding"
                    className="inline-flex items-center justify-center h-[46px] px-6 rounded-[12px] bg-white border border-[#E3E9E4] hover:bg-[#F3F6F4] text-[#17211B] font-medium text-[15px] transition-colors active:scale-[0.98]"
                  >
                    Open your store
                  </Link>
                </motion.div>

                <motion.div
                  variants={heroItem}
                  className="flex items-start gap-2 text-[13.5px] text-[#5B6861] pt-1"
                >
                  <span className="w-2 h-2 rounded-full bg-[#0F7D41] mt-1.5 shrink-0" />
                  <span>
                    No groups to join. When you find something you like, message
                    the seller directly on WhatsApp.
                  </span>
                </motion.div>
              </motion.div>

              {/* Right Column: Staggered Hero 4-Product Grid */}
              <motion.div
                variants={heroGridContainer}
                initial="hidden"
                animate="visible"
                className="lg:col-span-5 grid grid-cols-2 gap-3.5 sm:gap-4"
              >
                {heroProducts.map((product) => (
                  <motion.div key={product.id} variants={heroCardItem}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* BROWSE BY CATEGORY WITH VIEWPORT REVEAL */}
        <section className="py-12 sm:py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={sectionFade}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#17211B]">
                  Browse by category
                </h2>
              </div>
              <Link
                href="/explore"
                className="text-[14px] font-semibold text-[#0F7D41] hover:text-[#0B6636] flex items-center gap-1 group"
              >
                <span>All categories</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
            >
              {CATEGORIES.map((cat) => (
                <motion.div
                  key={cat.id}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.2, ease: EASE_OUT },
                    },
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={`/explore?category=${encodeURIComponent(cat.name)}`}
                    className="group bg-white p-4 rounded-[16px] border border-[#E3E9E4] hover:border-[#0F7D41]/40 hover:shadow-xs transition-colors flex flex-col justify-between h-28"
                  >
                    <div className="w-9 h-9 rounded-[10px] bg-[#E8F7EE] flex items-center justify-center group-hover:bg-[#D5EEDD] transition-colors">
                      {getCategoryIcon(cat.iconName)}
                    </div>
                    <div>
                      <h3 className="font-sans font-semibold text-[14.5px] text-[#17211B] group-hover:text-[#0F7D41] transition-colors leading-tight">
                        {cat.name}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* RECENTLY ADDED */}
        <section className="py-12 border-t border-[#E3E9E4]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={sectionFade}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#17211B]">
                  Recently added
                </h2>
                <p className="mt-1 text-[14px] text-[#5B6861]">
                  Fresh from connected catalogues. Prices are set by each seller.
                </p>
              </div>
              <Link
                href="/explore"
                className="text-[14px] font-semibold text-[#0F7D41] hover:text-[#0B6636] flex items-center gap-1 group"
              >
                <span>View all</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {recentlyAddedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.22, ease: EASE_OUT },
                    },
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* SHOPS TO EXPLORE */}
        <section className="py-12 border-t border-[#E3E9E4]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={sectionFade}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#17211B]">
                  Shops to explore
                </h2>
              </div>
              <Link
                href="/shops"
                className="text-[14px] font-semibold text-[#0F7D41] hover:text-[#0B6636] flex items-center gap-1 group"
              >
                <span>Discover shops</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 },
                },
              }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {exploreShops.map((shop) => (
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
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <StoreCard shop={shop} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS FOR SHOPPERS */}
        <section className="py-16 border-t border-[#E3E9E4] bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={sectionFade}
              className="font-display font-bold text-2xl sm:text-3xl text-[#17211B] mb-10"
            >
              How it works for shoppers
            </motion.h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 },
                },
              }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.22, ease: EASE_OUT },
                  },
                }}
                className="p-6 rounded-[20px] bg-[#F7F9F7] border border-[#E3E9E4]"
              >
                <div className="w-10 h-10 rounded-[12px] bg-white border border-[#E3E9E4] flex items-center justify-center text-[#0F7D41] mb-5">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-[#17211B] mb-2">
                  Search or browse
                </h3>
                <p className="text-[15px] text-[#5B6861] leading-relaxed">
                  Look up a product, a category or a city. No group invitation
                  needed.
                </p>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.22, ease: EASE_OUT },
                  },
                }}
                className="p-6 rounded-[20px] bg-[#F7F9F7] border border-[#E3E9E4]"
              >
                <div className="w-10 h-10 rounded-[12px] bg-white border border-[#E3E9E4] flex items-center justify-center text-[#0F7D41] mb-5">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-[#17211B] mb-2">
                  Open the storefront
                </h3>
                <p className="text-[15px] text-[#5B6861] leading-relaxed">
                  See the seller’s full catalogue, organised and searchable, in
                  one tidy place.
                </p>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className="p-6 rounded-[20px] bg-[#F7F9F7] border border-[#E3E9E4]"
              >
                <div className="w-10 h-10 rounded-[12px] bg-white border border-[#E3E9E4] flex items-center justify-center text-[#0F7D41] mb-5">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-[#17211B] mb-2">
                  Ask on WhatsApp
                </h3>
                <p className="text-[15px] text-[#5B6861] leading-relaxed">
                  Message the seller directly about availability, delivery and
                  payment.
                </p>
              </motion.div>
            </motion.div>

            <p className="mt-8 text-[14px] text-[#5B6861] text-center">
              Prices are shown for information. Payment and delivery are
              arranged directly between you and the seller.
            </p>
          </div>
        </section>

        {/* FOR SELLERS BANNER */}
        <section className="py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={sectionFade}
              className="rounded-[24px] bg-[#075E36] text-white p-8 sm:p-12 lg:p-16"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <span className="text-[13px] tracking-wider uppercase font-semibold text-[#8AD3A8]">
                    FOR SELLERS
                  </span>

                  <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-[42px] leading-tight text-white">
                    Already selling on WhatsApp? Give your catalogue a
                    storefront.
                  </h2>

                  <p className="text-[16px] text-[#E8F7EE] leading-relaxed max-w-xl">
                    Connect your WhatsApp Business catalogue, get a clean
                    shareable store page, and manage it all from one dashboard.
                    Customers still message you on WhatsApp.
                  </p>

                  <ul className="space-y-3 text-[15px] text-[#E8F7EE] pt-2">
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#0F7D41] text-white flex items-center justify-center text-[12px] font-bold">
                        ✓
                      </span>
                      <span>
                        Import the catalogue you already keep on WhatsApp
                        Business, where Meta’s APIs allow it
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#0F7D41] text-white flex items-center justify-center text-[12px] font-bold">
                        ✓
                      </span>
                      <span>
                        A professional storefront with its own shareable link
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#0F7D41] text-white flex items-center justify-center text-[12px] font-bold">
                        ✓
                      </span>
                      <span>
                        Categories, search and filters your customers can
                        actually use
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#0F7D41] text-white flex items-center justify-center text-[12px] font-bold">
                        ✓
                      </span>
                      <span>
                        No checkout and no commission — customers contact you on
                        WhatsApp
                      </span>
                    </li>
                  </ul>

                  <div className="pt-4">
                    <Link
                      href="/seller/onboarding"
                      className="inline-flex items-center gap-2 h-[46px] px-6 rounded-[12px] bg-white text-[#075E36] font-semibold text-[15px] hover:bg-[#E8F7EE] transition-colors active:scale-[0.98]"
                    >
                      <span>Open your store</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Right side: 5 Steps Card */}
                <div className="lg:col-span-5 bg-white rounded-[20px] p-6 sm:p-8 text-[#17211B] shadow-lg">
                  <h3 className="font-display font-bold text-xl text-[#17211B]">
                    Set up in five steps
                  </h3>
                  <p className="text-[13px] text-[#5B6861] mb-6">
                    Illustration of the seller flow
                  </p>

                  <ol className="space-y-4">
                    <li className="flex items-center gap-3.5 p-3 rounded-[12px] bg-[#F7F9F7] border border-[#E3E9E4]">
                      <span className="w-7 h-7 rounded-full bg-white border border-[#E3E9E4] text-[#17211B] font-bold text-[13px] flex items-center justify-center shrink-0">
                        1
                      </span>
                      <span className="font-medium text-[14.5px]">
                        Create your account
                      </span>
                    </li>

                    <li className="flex items-center gap-3.5 p-3 rounded-[12px] bg-[#F7F9F7] border border-[#E3E9E4]">
                      <span className="w-7 h-7 rounded-full bg-white border border-[#E3E9E4] text-[#17211B] font-bold text-[13px] flex items-center justify-center shrink-0">
                        2
                      </span>
                      <span className="font-medium text-[14.5px]">
                        Connect WhatsApp Business
                      </span>
                    </li>

                    <li className="flex items-center gap-3.5 p-3 rounded-[12px] bg-[#F7F9F7] border border-[#E3E9E4]">
                      <span className="w-7 h-7 rounded-full bg-white border border-[#E3E9E4] text-[#17211B] font-bold text-[13px] flex items-center justify-center shrink-0">
                        3
                      </span>
                      <span className="font-medium text-[14.5px]">
                        Import the accessible catalogue
                      </span>
                    </li>

                    <li className="flex items-center gap-3.5 p-3 rounded-[12px] bg-[#F7F9F7] border border-[#E3E9E4]">
                      <span className="w-7 h-7 rounded-full bg-white border border-[#E3E9E4] text-[#17211B] font-bold text-[13px] flex items-center justify-center shrink-0">
                        4
                      </span>
                      <span className="font-medium text-[14.5px]">
                        Review your storefront
                      </span>
                    </li>

                    <li className="flex items-center gap-3.5 p-3 rounded-[12px] bg-[#F7F9F7] border border-[#E3E9E4]">
                      <span className="w-7 h-7 rounded-full bg-white border border-[#E3E9E4] text-[#17211B] font-bold text-[13px] flex items-center justify-center shrink-0">
                        5
                      </span>
                      <span className="font-medium text-[14.5px]">
                        Publish for discovery
                      </span>
                    </li>
                  </ol>

                  <p className="mt-6 text-[12.5px] text-[#5B6861] leading-relaxed">
                    Catalogue access depends on your WhatsApp Business account
                    and what Meta makes available. We&apos;ll tell you plainly
                    what can and can&apos;t be imported.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <MarketplaceFooter />
      <MobileBottomNav activeTab="home" />
    </div>
  );
}
