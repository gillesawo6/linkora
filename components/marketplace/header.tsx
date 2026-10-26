'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, LayoutDashboard, Store } from 'lucide-react';
import { LinkoraLogo } from '../ui/linkora-icons';
import { SearchAutocomplete } from './search-autocomplete';
import { useStore } from '@/lib/context/store-context';

interface MarketplaceHeaderProps {
  currentPath?: string;
  onSearchSubmit?: (query: string) => void;
  searchValue?: string;
}

export function MarketplaceHeader({
  currentPath = '/',
  onSearchSubmit,
  searchValue = '',
}: MarketplaceHeaderProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { user, currentShop } = useStore();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xs border-b border-[#E3E9E4] transition-colors">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-10 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 sm:gap-6 lg:gap-8 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F7D41] rounded-[8px]"
            aria-label="Linkora home"
          >
            <LinkoraLogo className="w-6 h-6 sm:w-7 sm:h-7" />
            <span className="font-display font-bold text-xl sm:text-2xl tracking-tight text-[#17211B] group-hover:text-[#0F7D41] transition-colors">
              Linkora
            </span>
          </Link>

          {/* Desktop Search Bar in Header with autocomplete suggestions */}
          <div className="hidden md:block w-72 lg:w-96 transition-all duration-200">
            <SearchAutocomplete
              initialValue={searchValue}
              onSearchSubmit={onSearchSubmit}
              placeholder="Search products and shops"
            />
          </div>
        </div>

        {/* Navigation links & Actions */}
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-1.5 sm:gap-6"
        >
          {/* Mobile search toggle button */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            aria-label={isMobileSearchOpen ? 'Close search' : 'Open search'}
            aria-expanded={isMobileSearchOpen}
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#5B6861] hover:text-[#17211B] hover:bg-[#F3F6F4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F7D41]"
          >
            {isMobileSearchOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>

          <div className="hidden sm:flex items-center gap-6 text-[15px] font-medium text-[#5B6861]">
            <Link
              href="/explore"
              className={`hover:text-[#17211B] transition-colors ${
                currentPath === '/explore' ? 'text-[#0F7D41] font-semibold' : ''
              }`}
            >
              Explore
            </Link>
            <Link
              href="/categories"
              className={`hover:text-[#17211B] transition-colors ${
                currentPath === '/categories' ? 'text-[#0F7D41] font-semibold' : ''
              }`}
            >
              Categories
            </Link>
            <Link
              href="/shops"
              className={`hover:text-[#17211B] transition-colors ${
                currentPath === '/shops' ? 'text-[#0F7D41] font-semibold' : ''
              }`}
            >
              Discover shops
            </Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/seller/overview"
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[10px] hover:bg-[#F3F6F4] transition-colors group"
                  title="Go to Seller Dashboard"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E8F7EE] text-[#075E36] font-display font-bold text-xs flex items-center justify-center shrink-0 border border-[#E3E9E4] overflow-hidden relative shadow-2xs">
                    {currentShop.avatarImage ? (
                      <Image
                        src={currentShop.avatarImage}
                        alt={currentShop.name}
                        fill
                        sizes="32px"
                        unoptimized={
                          currentShop.avatarImage.startsWith('data:') ||
                          currentShop.avatarImage.startsWith('blob:')
                        }
                        className="object-cover object-center"
                      />
                    ) : (
                      <span>{currentShop.name.charAt(0) || 'S'}</span>
                    )}
                  </div>
                  <div className="hidden md:flex flex-col text-left leading-tight">
                    <span className="text-[13px] font-semibold text-[#17211B] group-hover:text-[#0F7D41] transition-colors truncate max-w-[130px]">
                      {currentShop.name}
                    </span>
                    <span className="text-[11px] text-[#0F7D41] font-medium">Dashboard</span>
                  </div>
                </Link>

                <Link
                  href="/seller/overview"
                  className="inline-flex items-center justify-center h-8 sm:h-9 px-3 rounded-[8px] sm:rounded-[10px] text-[12px] sm:text-[13px] font-semibold bg-[#0F7D41] hover:bg-[#0B6636] active:bg-[#075E36] text-white shadow-xs transition-colors shrink-0"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
                  <span>My Store</span>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-[13px] sm:text-[14px] font-medium text-[#17211B] hover:text-[#0F7D41] px-2 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F7D41] rounded-[6px]"
                >
                  Sign in
                </Link>
                <Link
                  href="/seller/onboarding"
                  className="inline-flex items-center justify-center h-8 sm:h-10 px-2.5 sm:px-4 rounded-[8px] sm:rounded-[10px] text-[12px] sm:text-[14px] font-medium bg-[#0F7D41] hover:bg-[#0B6636] active:bg-[#075E36] text-white shadow-xs transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0F7D41]"
                >
                  <span className="hidden min-[350px]:inline">Open your store</span>
                  <span className="inline min-[350px]:hidden">Sell</span>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Search Expandable Bar */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-3 py-2.5 bg-[#F7F9F7] border-t border-[#E3E9E4] animate-in slide-in-from-top-2 duration-150">
          <SearchAutocomplete
            isMobile={true}
            autoFocus={true}
            initialValue={searchValue}
            onSearchSubmit={onSearchSubmit}
            onCloseMobile={() => setIsMobileSearchOpen(false)}
            placeholder="Search products and shops..."
          />
        </div>
      )}
    </header>
  );
}
