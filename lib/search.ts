import { Product, Shop } from './types';
import { PRODUCTS, SHOPS, CATEGORIES } from './data/sample-data';

export interface SearchOptions {
  category?: string;
  subCategory?: string;
  city?: string;
  shopId?: string;
  minPrice?: number;
  maxPrice?: number;
  priceBucket?: 'all' | 'under20k' | '20k-100k' | 'over100k';
  sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'name-asc' | 'name-desc';
  limit?: number;
}

export interface SearchSuggestionItem {
  type: 'product' | 'shop' | 'category' | 'recent';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  imageUrl?: string;
  category?: string;
  price?: number | null;
  currency?: string;
  city?: string;
}

export interface SearchResult {
  query: string;
  totalProducts: number;
  totalShops: number;
  products: Product[];
  shops: Shop[];
  matchingCategories: { id: string; name: string; count: number }[];
  suggestions: SearchSuggestionItem[];
}

/**
 * Normalizes text for tolerant search:
 * - strips accents / diacritics (e.g., Yaoundé -> yaounde)
 * - lowercases
 * - removes extra punctuation
 */
export function normalizeSearchTerm(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/['"″“”’]/g, '') // remove various quotes/primes
    .replace(/[^\w\s-]/g, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates match relevance score for a product given normalized search tokens.
 * Higher score = higher relevance.
 */
function calculateProductScore(
  product: Product,
  queryNorm: string,
  tokens: string[]
): number {
  let score = 0;
  const nameNorm = normalizeSearchTerm(product.name);
  const descNorm = normalizeSearchTerm(product.description || '');
  const catNorm = normalizeSearchTerm(product.category);
  const subCatNorm = normalizeSearchTerm(product.subCategory || '');
  const shopNorm = normalizeSearchTerm(product.shopName);
  const cityNorm = normalizeSearchTerm(product.shopCity);
  const colorNorm = normalizeSearchTerm(product.color || '');

  // Exact full query match on name
  if (nameNorm === queryNorm) {
    score += 150;
  } else if (nameNorm.startsWith(queryNorm)) {
    score += 100;
  } else if (nameNorm.includes(queryNorm)) {
    score += 70;
  }

  // Token matches
  for (const token of tokens) {
    if (token.length < 2) continue;

    if (nameNorm.includes(token)) {
      score += 40;
    }
    if (catNorm.includes(token) || subCatNorm.includes(token)) {
      score += 35;
    }
    if (shopNorm.includes(token)) {
      score += 25;
    }
    if (colorNorm.includes(token)) {
      score += 20;
    }
    if (cityNorm.includes(token)) {
      score += 15;
    }
    if (descNorm.includes(token)) {
      score += 10;
    }
  }

  // Common synonym / intent mappings
  if (queryNorm.includes('shoe') || queryNorm.includes('sneaker') || queryNorm.includes('footwear')) {
    if (product.category === 'Shoes') score += 50;
  }
  if (queryNorm.includes('laptop') || queryNorm.includes('computer') || queryNorm.includes('pc') || queryNorm.includes('mac')) {
    if (product.category === 'Computers & electronics') score += 50;
  }
  if (queryNorm.includes('phone') || queryNorm.includes('iphone') || queryNorm.includes('smartphone') || queryNorm.includes('samsung')) {
    if (product.category === 'Phones & accessories') score += 50;
  }
  if (queryNorm.includes('dress') || queryNorm.includes('cloth') || queryNorm.includes('wear') || queryNorm.includes('ankara') || queryNorm.includes('fashion')) {
    if (product.category === 'Fashion & clothing') score += 50;
  }
  if (queryNorm.includes('beauty') || queryNorm.includes('skin') || queryNorm.includes('serum') || queryNorm.includes('cream')) {
    if (product.category === 'Beauty & personal care') score += 50;
  }
  if (queryNorm.includes('home') || queryNorm.includes('lamp') || queryNorm.includes('decor') || queryNorm.includes('furniture')) {
    if (product.category === 'Home & living') score += 50;
  }

  return score;
}

/**
 * Calculates match score for a shop.
 */
function calculateShopScore(shop: Shop, queryNorm: string, tokens: string[]): number {
  let score = 0;
  const nameNorm = normalizeSearchTerm(shop.name);
  const descNorm = normalizeSearchTerm(shop.description || '');
  const catNorm = normalizeSearchTerm(shop.category);
  const cityNorm = normalizeSearchTerm(shop.city);
  const areaNorm = normalizeSearchTerm(shop.area || '');

  if (nameNorm === queryNorm) {
    score += 150;
  } else if (nameNorm.startsWith(queryNorm)) {
    score += 100;
  } else if (nameNorm.includes(queryNorm)) {
    score += 70;
  }

  for (const token of tokens) {
    if (token.length < 2) continue;
    if (nameNorm.includes(token)) score += 40;
    if (catNorm.includes(token)) score += 30;
    if (cityNorm.includes(token) || areaNorm.includes(token)) score += 20;
    if (descNorm.includes(token)) score += 10;
  }

  return score;
}

/**
 * Searches the available Linkora catalogue (products and shops)
 * using flexible multi-token matching, relevance scoring, and facet filters.
 */
export function executeSearch(
  query: string,
  allProducts: Product[] = PRODUCTS,
  allShops: Shop[] = SHOPS,
  options: SearchOptions = {}
): SearchResult {
  const queryTrim = query.trim();
  const queryNorm = normalizeSearchTerm(queryTrim);
  const tokens = queryNorm.split(' ').filter(Boolean);

  const {
    category = 'All categories',
    city = 'All cities',
    minPrice,
    maxPrice,
    priceBucket = 'all',
    sortBy = 'relevance',
    limit,
  } = options;

  // 1. FILTER & SCORE PRODUCTS
  const scoredProducts: { product: Product; score: number }[] = [];

  for (const product of allProducts) {
    // Shop ID constraint (when searching within a specific storefront)
    if (options.shopId && product.shopId !== options.shopId) {
      continue;
    }

    // Category constraint
    if (category !== 'All categories' && product.category !== category) {
      continue;
    }

    // Subcategory constraint (e.g. Dresses, Sets, Sneakers)
    if (options.subCategory && options.subCategory !== 'All') {
      const pCat = product.subCategory || product.category;
      if (pCat !== options.subCategory && product.category !== options.subCategory) {
        continue;
      }
    }

    // City constraint
    if (city !== 'All cities' && product.shopCity !== city) {
      continue;
    }

    // Quick price bucket constraint
    if (priceBucket === 'under20k') {
      if (product.price === null || product.price >= 20000) continue;
    } else if (priceBucket === '20k-100k') {
      if (product.price === null || product.price < 20000 || product.price > 100000) continue;
    } else if (priceBucket === 'over100k') {
      if (product.price === null || product.price <= 100000) continue;
    }

    // Numeric min/max price constraint
    if (minPrice !== undefined && minPrice !== null && product.price !== null && product.price < minPrice) {
      continue;
    }
    if (maxPrice !== undefined && maxPrice !== null && product.price !== null && product.price > maxPrice) {
      continue;
    }

    // Search query relevance
    let score = 1;
    if (tokens.length > 0) {
      score = calculateProductScore(product, queryNorm, tokens);
      if (score <= 0) {
        continue; // No match
      }
    }

    scoredProducts.push({ product, score });
  }

  // 2. SORT PRODUCTS
  if (sortBy === 'price-asc') {
    scoredProducts.sort((a, b) => (a.product.price ?? 9999999) - (b.product.price ?? 9999999));
  } else if (sortBy === 'price-desc') {
    scoredProducts.sort((a, b) => (b.product.price ?? 0) - (a.product.price ?? 0));
  } else if (sortBy === 'newest') {
    scoredProducts.reverse();
  } else if (sortBy === 'name-asc') {
    scoredProducts.sort((a, b) => a.product.name.localeCompare(b.product.name));
  } else if (sortBy === 'name-desc') {
    scoredProducts.sort((a, b) => b.product.name.localeCompare(a.product.name));
  } else {
    // Relevance sort
    scoredProducts.sort((a, b) => b.score - a.score);
  }

  const finalProducts = limit
    ? scoredProducts.slice(0, limit).map((s) => s.product)
    : scoredProducts.map((s) => s.product);

  // 3. FILTER & SCORE SHOPS
  const scoredShops: { shop: Shop; score: number }[] = [];
  for (const shop of allShops) {
    if (city !== 'All cities' && shop.city !== city) {
      continue;
    }
    if (category !== 'All categories' && shop.category !== category) {
      continue;
    }

    if (tokens.length > 0) {
      const score = calculateShopScore(shop, queryNorm, tokens);
      if (score > 0) {
        scoredShops.push({ shop, score });
      }
    } else {
      scoredShops.push({ shop, score: 1 });
    }
  }

  if (tokens.length > 0) {
    scoredShops.sort((a, b) => b.score - a.score);
  }

  const finalShops = scoredShops.map((s) => s.shop);

  // 4. MATCHING CATEGORIES
  const matchingCategories: { id: string; name: string; count: number }[] = [];
  if (tokens.length > 0) {
    for (const cat of CATEGORIES) {
      const catNorm = normalizeSearchTerm(cat.name);
      if (tokens.some((t) => catNorm.includes(t)) || queryNorm.includes(catNorm)) {
        const count = allProducts.filter((p) => p.category === cat.name).length;
        matchingCategories.push({ id: cat.id, name: cat.name, count });
      }
    }
  }

  // 5. BUILD TYPEAHEAD AUTOCOMPLETE SUGGESTIONS
  const suggestions: SearchSuggestionItem[] = [];

  // Add matching categories first
  for (const cat of matchingCategories.slice(0, 2)) {
    suggestions.push({
      type: 'category',
      id: `cat-${cat.id}`,
      title: cat.name,
      subtitle: `${cat.count} items in category`,
      url: `/explore?category=${encodeURIComponent(cat.name)}`,
      category: cat.name,
    });
  }

  // Add top matching shops
  for (const shop of finalShops.slice(0, 2)) {
    suggestions.push({
      type: 'shop',
      id: shop.id,
      title: shop.name,
      subtitle: `${shop.category} · ${shop.city} (${shop.productCount} items)`,
      url: `/shops/${shop.slug}`,
      imageUrl: shop.avatarImage,
      city: shop.city,
      category: shop.category,
    });
  }

  // Add top matching products
  for (const product of finalProducts.slice(0, 5)) {
    suggestions.push({
      type: 'product',
      id: product.id,
      title: product.name,
      subtitle: `${product.price !== null ? `${product.price.toLocaleString()} ${product.currency}` : 'Ask for price'} · ${product.shopName}`,
      url: `/products/${product.id}`,
      imageUrl: product.imageUrl,
      category: product.category,
      price: product.price,
      currency: product.currency,
      city: product.shopCity,
    });
  }

  return {
    query: queryTrim,
    totalProducts: scoredProducts.length,
    totalShops: scoredShops.length,
    products: finalProducts,
    shops: finalShops,
    matchingCategories,
    suggestions,
  };
}

/**
 * Local storage management for recent search history.
 */
const RECENT_SEARCHES_KEY = 'linkora_recent_searches_v1';
const MAX_RECENT_SEARCHES = 6;

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_SEARCHES) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(term: string): void {
  if (typeof window === 'undefined') return;
  const clean = term.trim();
  if (!clean || clean.length < 2) return;

  try {
    const current = getRecentSearches();
    const updated = [clean, ...current.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(
      0,
      MAX_RECENT_SEARCHES
    );
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore
  }
}

export function removeRecentSearch(term: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getRecentSearches();
    const updated = current.filter((item) => item.toLowerCase() !== term.toLowerCase());
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export const POPULAR_SEARCH_TERMS = [
  'Court Classic Sneakers',
  '14″ Ultrabook',
  'Ankara Wrap Dress',
  'Vitamin C Serum',
  'Smartphone',
  'Rattan Lamp',
  'Leather Tote',
  'Running Trainers',
];
