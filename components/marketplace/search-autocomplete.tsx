'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Store,
  Tag,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  executeSearch,
  getRecentSearches,
  saveRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  POPULAR_SEARCH_TERMS,
  SearchSuggestionItem,
} from '@/lib/search';
import { useStore } from '@/lib/context/store-context';
import { ProductImage } from '@/components/ui/product-image';

interface SearchAutocompleteProps {
  initialValue?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  isMobile?: boolean;
  onSearchSubmit?: (query: string) => void;
  onValueChange?: (value: string) => void;
  onCloseMobile?: () => void;
  autoFocus?: boolean;
  targetTab?: 'products' | 'shops';
  selectedCity?: string;
}

export function SearchAutocomplete({
  initialValue = '',
  placeholder = 'Search products and shops...',
  className = '',
  inputClassName = '',
  isMobile = false,
  onSearchSubmit,
  onValueChange,
  onCloseMobile,
  autoFocus = false,
  targetTab = 'products',
  selectedCity,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const { products, shops } = useStore();

  const [query, setQuery] = useState(initialValue);
  const [prevInitial, setPrevInitial] = useState(initialValue);
  if (initialValue !== prevInitial) {
    setPrevInitial(initialValue);
    setQuery(initialValue);
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    return typeof window !== 'undefined' ? getRecentSearches() : [];
  });
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute live suggestions from active store dataset
  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    return executeSearch(query, products, shops, { limit: 6 });
  }, [query, products, shops]);

  const suggestions: SearchSuggestionItem[] = useMemo(() => {
    return searchResults?.suggestions || [];
  }, [searchResults]);

  // Click outside listener to dismiss
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Input Change with visual loading feedback
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onValueChange?.(val);
    setIsOpen(true);
    setHighlightedIndex(-1);

    if (val.trim()) {
      setIsLoading(true);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 180);
    } else {
      setIsLoading(false);
    }
  };

  // Submit search and update recent searches
  const triggerSearch = useCallback(
    (searchQuery: string) => {
      const clean = searchQuery.trim();
      if (clean) {
        saveRecentSearch(clean);
        setRecentSearches(getRecentSearches());
      }
      setIsOpen(false);

      if (onSearchSubmit) {
        onSearchSubmit(clean);
      } else {
        const params = new URLSearchParams();
        if (clean) params.set('q', clean);
        if (selectedCity && selectedCity !== 'All cities') {
          params.set('city', selectedCity);
        }
        const targetPath = targetTab === 'shops' ? '/shops' : '/explore';
        const qs = params.toString();
        router.push(qs ? `${targetPath}?${qs}` : targetPath);
      }

      if (onCloseMobile) {
        onCloseMobile();
      }
    },
    [onSearchSubmit, onCloseMobile, router, targetTab, selectedCity]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      const selected = suggestions[highlightedIndex];
      router.push(selected.url);
      setIsOpen(false);
      if (onCloseMobile) onCloseMobile();
      return;
    }
    triggerSearch(query);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleClear = () => {
    setQuery('');
    onValueChange?.('');
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleRemoveRecent = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = removeRecentSearch(term);
    setRecentSearches(updated);
  };

  const handleClearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} role="search" className="relative w-full">
        <label htmlFor={`search-input-${isMobile ? 'mobile' : 'desktop'}`} className="sr-only">
          Search products and shops
        </label>
        <Search
          className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6861] pointer-events-none"
          aria-hidden="true"
        />

        <input
          ref={inputRef}
          id={`search-input-${isMobile ? 'mobile' : 'desktop'}`}
          type="search"
          role="combobox"
          autoFocus={autoFocus}
          autoComplete="off"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search products and shops"
          aria-expanded={isOpen}
          aria-controls={`search-listbox-${isMobile ? 'mobile' : 'desktop'}`}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          className={`w-full h-10 pl-10 pr-9 text-[14px] bg-[#F7F9F7] border border-[#E3E9E4] rounded-[10px] text-[#17211B] placeholder-[#5B6861] focus:bg-white focus:outline-none focus:border-[#0F7D41] focus:ring-2 focus:ring-[#8AD3A8] transition-all ${inputClassName}`}
        />

        {/* Right side icon: Loader or Clear Button */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-3.5 h-3.5 text-[#0F7D41] animate-spin" />
          )}
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="w-5 h-5 rounded-full flex items-center justify-center text-[#5B6861] hover:text-[#17211B] hover:bg-[#E3E9E4]/60 transition-colors"
              aria-label="Clear search input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* AUTOCOMPLETE SUGGESTIONS POPOVER */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`search-listbox-${isMobile ? 'mobile' : 'desktop'}`}
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.99 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E3E9E4] rounded-[16px] shadow-lg overflow-hidden z-50 max-h-[420px] overflow-y-auto ${
              isMobile ? 'w-full' : 'min-w-[320px] sm:min-w-[380px] lg:min-w-[420px]'
            }`}
            role="listbox"
          >
            {/* STATE 1: Empty Query - Show Recent Searches & Popular Tags */}
            {!query.trim() && (
              <div className="p-3.5 space-y-4">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between pb-1.5 px-1 border-b border-[#F0F4F2] text-[12px] text-[#5B6861] font-semibold tracking-wider uppercase">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#8E9B93]" />
                        <span>Recent searches</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleClearAllRecent}
                        className="text-[#8E9B93] hover:text-[#C62828] text-[11px] font-normal normal-case hover:underline"
                      >
                        Clear all
                      </button>
                    </div>
                    <ul className="mt-1 space-y-0.5">
                      {recentSearches.map((term) => (
                        <li key={term}>
                          <button
                            type="button"
                            onClick={() => triggerSearch(term)}
                            className="w-full flex items-center justify-between px-2.5 py-2 rounded-[8px] hover:bg-[#F7F9F7] text-[13.5px] text-[#17211B] text-left transition-colors group"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Search className="w-3.5 h-3.5 text-[#8E9B93] group-hover:text-[#0F7D41]" />
                              <span className="truncate">{term}</span>
                            </span>
                            <span
                              onClick={(e) => handleRemoveRecent(e, term)}
                              className="text-[#8E9B93] hover:text-[#C62828] p-1 rounded hover:bg-white"
                              title="Remove search"
                            >
                              <X className="w-3.5 h-3.5" />
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Popular Discovery Searches */}
                <div>
                  <div className="flex items-center gap-1.5 pb-1.5 px-1 border-b border-[#F0F4F2] text-[12px] text-[#5B6861] font-semibold tracking-wider uppercase">
                    <TrendingUp className="w-3.5 h-3.5 text-[#0F7D41]" />
                    <span>Popular on Linkora</span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {POPULAR_SEARCH_TERMS.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => triggerSearch(term)}
                        className="px-2.5 py-1 rounded-[8px] bg-[#F3F6F4] hover:bg-[#E8F7EE] text-[#17211B] hover:text-[#075E36] text-[12.5px] font-medium transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STATE 2: Query Typed with Suggestions */}
            {query.trim() && suggestions.length > 0 && (
              <div className="divide-y divide-[#F0F4F2]">
                {/* Suggestions List */}
                <div className="p-2 space-y-1">
                  {suggestions.map((item, idx) => {
                    const isHighlighted = highlightedIndex === idx;

                    if (item.type === 'category') {
                      return (
                        <Link
                          key={item.id}
                          href={item.url}
                          onClick={() => {
                            saveRecentSearch(item.title);
                            setIsOpen(false);
                            if (onCloseMobile) onCloseMobile();
                          }}
                          className={`flex items-center justify-between p-2 rounded-[10px] text-left transition-colors ${
                            isHighlighted ? 'bg-[#E8F7EE]' : 'hover:bg-[#F7F9F7]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-[8px] bg-[#E8F7EE] text-[#0F7D41] flex items-center justify-center shrink-0">
                              <Tag className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13.5px] font-semibold text-[#17211B] truncate">
                                {item.title}
                              </p>
                              <p className="text-[11.5px] text-[#5B6861]">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-medium text-[#0F7D41] bg-[#E8F7EE] px-2 py-0.5 rounded-full shrink-0">
                            Category
                          </span>
                        </Link>
                      );
                    }

                    if (item.type === 'shop') {
                      return (
                        <Link
                          key={item.id}
                          href={item.url}
                          onClick={() => {
                            saveRecentSearch(item.title);
                            setIsOpen(false);
                            if (onCloseMobile) onCloseMobile();
                          }}
                          className={`flex items-center justify-between p-2 rounded-[10px] text-left transition-colors ${
                            isHighlighted ? 'bg-[#E8F7EE]' : 'hover:bg-[#F7F9F7]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#E8F7EE] text-[#075E36] font-display font-bold text-xs flex items-center justify-center shrink-0 border border-[#E3E9E4]">
                              <Store className="w-4 h-4 text-[#0F7D41]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13.5px] font-bold text-[#17211B] truncate">
                                {item.title}
                              </p>
                              <p className="text-[11.5px] text-[#5B6861] truncate">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-medium text-[#075E36] bg-[#E8F7EE] px-2 py-0.5 rounded-full shrink-0">
                            Shop
                          </span>
                        </Link>
                      );
                    }

                    // Product item
                    return (
                      <Link
                        key={item.id}
                        href={item.url}
                        onClick={() => {
                          saveRecentSearch(item.title);
                          setIsOpen(false);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className={`flex items-center justify-between p-2 rounded-[10px] text-left transition-colors ${
                          isHighlighted ? 'bg-[#E8F7EE]' : 'hover:bg-[#F7F9F7]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-[8px] overflow-hidden shrink-0 border border-[#E3E9E4]">
                            <ProductImage
                              src={item.imageUrl}
                              alt={item.title}
                              productName={item.title}
                              sizes="36px"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-medium text-[#17211B] truncate">
                              {item.title}
                            </p>
                            <p className="text-[11.5px] text-[#5B6861] truncate">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8E9B93] shrink-0 ml-2" />
                      </Link>
                    );
                  })}
                </div>

                {/* View All Matches Footer */}
                <div className="p-2.5 bg-[#F7F9F7] flex items-center justify-between text-[13px]">
                  <span className="text-[#5B6861]">
                    {searchResults ? `${searchResults.totalProducts} products found` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => triggerSearch(query)}
                    className="inline-flex items-center gap-1 font-semibold text-[#0F7D41] hover:text-[#0B6636]"
                  >
                    <span>View all results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STATE 3: Query Typed but No Matches */}
            {query.trim() && suggestions.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-[14px] font-semibold text-[#17211B]">
                  No quick matches for &ldquo;{query}&rdquo;
                </p>
                <p className="text-[12.5px] text-[#5B6861] mt-1">
                  Press Enter to search all connected catalogues and descriptions.
                </p>
                <button
                  type="button"
                  onClick={() => triggerSearch(query)}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[8px] bg-[#0F7D41] text-white text-[13px] font-medium hover:bg-[#0B6636] transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search for &ldquo;{query}&rdquo;</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
