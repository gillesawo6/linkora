'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Search,
  X,
  Menu,
  ChevronDown,
  Store,
  LayoutDashboard,
  User,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { LinkoraLogo } from '../ui/linkora-icons';
import { useStore } from '@/lib/context/store-context';
import { SearchAutocomplete } from './search-autocomplete';

interface FloatingNavPillProps {
  isVisible: boolean;
  currentPath?: string;
  onSearchSubmit?: (query: string) => void;
  searchValue?: string;
}

export function FloatingNavPill({
  isVisible,
  currentPath = '/',
  onSearchSubmit,
  searchValue = '',
}: FloatingNavPillProps) {
  const router = useRouter();
  const { user, currentShop } = useStore();
  const shouldReduceMotion = useReducedMotion();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchValue);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);


  // Click outside listener to collapse expanded menu or search
  useEffect(() => {
    if (!isMenuOpen && !isSearchOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen, isSearchOpen]);

  // Keyboard accessibility: Escape closes expanded states
  useEffect(() => {
    if (!isMenuOpen && !isSearchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, isSearchOpen]);

  // Auto-focus search input when expanded
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  const handleSearchSubmitInternal = (e: React.FormEvent) => {
    e.preventDefault();
    const query = localSearch.trim();
    if (!query) return;

    setIsSearchOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(query);
    } else {
      router.push(`/explore?q=${encodeURIComponent(query)}`);
    }
  };

  const navItems = [
    { label: 'Explore', href: '/explore' },
    { label: 'Categories', href: '/categories' },
    { label: 'Shops', href: '/shops' },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={containerRef}
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -20, scale: 0.96 }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, scale: 1 }
          }
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -16, scale: 0.96 }
          }
          transition={{
            duration: 0.22,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="fixed top-3 sm:top-4.5 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-24px)] pointer-events-auto"
          role="region"
          aria-label="Floating quick navigation"
        >
          {/* Main Floating Capsule with Apple Liquid Glass material */}
          <div className="relative flex items-center h-12 sm:h-13 px-2 sm:px-3 rounded-full liquid-glass-pill specular-edge-top">
            {/* Inline search expansion inside the pill */}
            {isSearchOpen ? (
              <form
                onSubmit={handleSearchSubmitInternal}
                className="flex items-center gap-2 w-72 sm:w-88 px-2 transition-all duration-200"
              >
                <Search className="w-4 h-4 text-[#0F7D41] shrink-0" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Search products or shops..."
                  className="w-full text-[13.5px] bg-transparent text-[#17211B] placeholder-[#8E9B93] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#5B6861] hover:text-[#17211B] hover:bg-[#F3F6F4] shrink-0"
                  aria-label="Close search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <>
                {/* Brand icon / Home link */}
                <Link
                  href="/"
                  className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full text-[#17211B] hover:text-[#0F7D41] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F7D41] transition-colors shrink-0 group"
                  aria-label="Linkora home"
                  title="Linkora Home"
                >
                  <LinkoraLogo className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform group-hover:scale-105" />
                  <span className="hidden md:inline font-display font-bold text-sm tracking-tight text-[#17211B]">
                    Linkora
                  </span>
                </Link>

                {/* Subtle vertical divider */}
                <span className="h-4 w-px bg-[#E3E9E4] mx-1 sm:mx-1.5 shrink-0" aria-hidden="true" />

                {/* Essential Navigation Links */}
                <nav
                  aria-label="Floating quick links"
                  className="flex items-center gap-0.5 sm:gap-1"
                >
                  {navItems.map((item) => {
                    const isActive = currentPath === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[13px] sm:text-[13.5px] font-medium transition-all ${
                          isActive
                            ? 'bg-[#E8F7EE]/95 text-[#075E36] font-semibold shadow-2xs glow-emerald-dot'
                            : 'text-[#5B6861] hover:text-[#17211B] hover:bg-[#F7F9F7]'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                {/* Subtle vertical divider */}
                <span className="h-4 w-px bg-[#E3E9E4] mx-1 sm:mx-1.5 shrink-0" aria-hidden="true" />

                {/* Quick Search Action Button */}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center text-[#5B6861] hover:text-[#0F7D41] hover:bg-[#E8F7EE]/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F7D41]"
                  aria-label="Open search input"
                  title="Search products and shops"
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* Compact Menu / Expand Action */}
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-expanded={isMenuOpen}
                  aria-haspopup="true"
                  aria-label={isMenuOpen ? 'Close navigation menu' : 'Open more navigation options'}
                  className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F7D41] ${
                    isMenuOpen
                      ? 'bg-[#17211B] text-white'
                      : 'text-[#5B6861] hover:text-[#17211B] hover:bg-[#F3F6F4]'
                  }`}
                  title="More navigation"
                >
                  {isMenuOpen ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Menu className="w-4 h-4" />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Expandable Secondary Navigation Panel */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 8, scale: 0.98 }
                }
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 6, scale: 0.98 }
                }
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-68 sm:w-76 p-2 rounded-[22px] glass-surface-hero specular-edge-top overflow-hidden ring-1 ring-black/[0.04]"
              >
                {/* Secondary navigation items */}
                <div className="space-y-1 text-[13.5px]">
                  {/* Account / Seller Section */}
                  {user ? (
                    <Link
                      href="/seller/overview"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#F7F9F7] hover:bg-[#E8F7EE] text-[#17211B] transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-[#E8F7EE] text-[#075E36] font-bold text-xs flex items-center justify-center shrink-0 border border-[#8AD3A8]/40">
                          {currentShop?.initial || 'S'}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-[13px] text-[#17211B] truncate">
                            {currentShop?.name || 'My Store'}
                          </p>
                          <p className="text-[11px] text-[#0F7D41]">Dashboard</p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#0F7D41] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ) : (
                    <div className="p-1 space-y-1">
                      <Link
                        href="/seller/onboarding"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between p-2 rounded-[10px] bg-[#0F7D41] text-white hover:bg-[#0B6636] font-medium text-[13px] shadow-2xs transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Store className="w-4 h-4" />
                          <span>Open your store</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href="/signin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-[10px] text-[#5B6861] hover:text-[#17211B] hover:bg-[#F3F6F4] text-[13px] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#8E9B93]" />
                        <span>Sign in to store</span>
                      </Link>
                    </div>
                  )}

                  <div className="pt-1.5 pb-1 border-t border-[#F0F4F2]">
                    <span className="px-2.5 text-[11px] font-semibold text-[#8E9B93] uppercase tracking-wider block mb-1">
                      Quick jump
                    </span>

                    <Link
                      href="/explore"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[10px] text-[#17211B] hover:bg-[#F7F9F7] hover:text-[#0F7D41] transition-colors"
                    >
                      <Compass className="w-4 h-4 text-[#0F7D41]" />
                      <span>Browse all products</span>
                    </Link>

                    <Link
                      href="/categories"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[10px] text-[#17211B] hover:bg-[#F7F9F7] hover:text-[#0F7D41] transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#0F7D41]" />
                      <span>Explore categories</span>
                    </Link>

                    <Link
                      href="/shops"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[10px] text-[#17211B] hover:bg-[#F7F9F7] hover:text-[#0F7D41] transition-colors"
                    >
                      <Store className="w-4 h-4 text-[#0F7D41]" />
                      <span>Discover local shops</span>
                    </Link>

                    <Link
                      href="/#how-it-works"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[10px] text-[#5B6861] hover:text-[#17211B] hover:bg-[#F7F9F7] transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-[#8E9B93]" />
                      <span>How Linkora works</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
