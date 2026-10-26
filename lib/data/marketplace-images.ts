/**
 * Centralised realistic placeholder imagery for Linkora Marketplace.
 * Professional commercial catalogue photography with high natural lighting,
 * clean backgrounds, realistic textures, and reliable CDN endpoints.
 */

export interface ProductImageData {
  main: string;
  gallery: string[];
  alt: string;
  bgTint: string;
}

export interface ShopImageData {
  cover: string;
  avatar: string;
  storefront: string;
}

export interface CategoryImageData {
  image: string;
  description: string;
}

// 1. PRODUCT CATALOGUE PHOTOGRAPHY (1:1 aspect ratio ready)
export const PRODUCT_IMAGES: Record<string, ProductImageData> = {
  // Shoes: Court Classic Sneakers, white
  'prod-court-classic-white': {
    main: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Court Classic white leather low-top sneakers on neutral studio surface',
    bgTint: '#F4F7F4',
  },

  // Computers: 14" Ultrabook
  'prod-ultrabook-14': {
    main: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Slim 14-inch metallic ultrabook laptop open on bright minimal desk',
    bgTint: '#F0F4F8',
  },

  // Fashion: Ankara Wrap Dress
  'prod-ankara-dress': {
    main: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Handcrafted tailored wrap dress in warm terracotta and geometric African motifs',
    bgTint: '#FAF0ED',
  },

  // Beauty: Vitamin C Serum, 30 ml
  'prod-vit-c-serum': {
    main: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1608248597359-2c70d4263660?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Amber glass dropper bottle of pure brightening Vitamin C facial serum with botanical extracts',
    bgTint: '#FAF4EB',
  },

  // Phones: Smartphone 128 GB, dual SIM
  'prod-smartphone-128': {
    main: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Bezel-less dual-SIM smartphone with vibrant AMOLED display and triple rear camera',
    bgTint: '#F2F0F7',
  },

  // Home: Rattan Table Lamp
  'prod-rattan-lamp': {
    main: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Hand-woven artisan rattan table lamp on natural light oak furniture surface',
    bgTint: '#F9F4EB',
  },

  // Audio: Wireless Over-ear Headphones
  'prod-wireless-headphones': {
    main: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Matte charcoal premium wireless over-ear noise-cancelling headphones',
    bgTint: '#ECEFEF',
  },

  // Bags: Leather Tote Bag, tan
  'prod-leather-tote': {
    main: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Handcrafted full-grain rich warm tan leather shoulder tote bag with brass hardware',
    bgTint: '#F9F1EB',
  },

  // Shoes: Running Trainers, midnight
  'prod-running-trainers-midnight': {
    main: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Midnight performance running trainers with engineered mesh and cushioned sole',
    bgTint: '#EEF2F7',
  },

  // Computers: Business Laptop 15.6″
  'prod-business-laptop': {
    main: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Matte dark business workstation laptop 15.6 inch with ergonomic keyboard',
    bgTint: '#EEF4F4',
  },

  // Fashion: Linen Two-piece Set
  'prod-linen-set': {
    main: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Breathable olive forest green resort linen two-piece shirt and trousers set',
    bgTint: '#ECF6F0',
  },

  // Beauty: Shea Body Butter, 250 ml
  'prod-shea-body-butter': {
    main: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1608248545890-076cbdb7e972?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Frosted cosmetic jar filled with whipped unrefined botanical shea butter',
    bgTint: '#FAF6ED',
  },

  // Phones: Smartphone 64 GB, refurbished
  'prod-phone-64gb': {
    main: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Refurbished black smartphone with dual rear camera and flawless glass back',
    bgTint: '#EFF1F5',
  },

  // Audio: In-ear Earbuds, 3-pack
  'prod-earbuds-3pack': {
    main: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Compact high-fidelity in-ear earbuds with silicone tips and protective charging case',
    bgTint: '#F6F0EC',
  },

  // Bags: Canvas Backpack, navy
  'prod-canvas-backpack': {
    main: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Durable navy blue cotton canvas everyday commuter backpack with brown leather accents',
    bgTint: '#EFF1F9',
  },

  // Home: Ceramic Desk Lamp
  'prod-ceramic-lamp': {
    main: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Minimalist sage green ceramic table lamp with clean architectural silhouette',
    bgTint: '#ECF6F1',
  },

  // Bags: Weekend Duffel, stone
  'prod-weekend-duffel': {
    main: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Stone grey waxed canvas weekend travel duffel bag with leather handles',
    bgTint: '#F0F2EF',
  },

  // Fashion: Floral Maxi Dress
  'prod-floral-maxi': {
    main: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Goldenrod floral tiered maxi dress in airy summer fabric',
    bgTint: '#FAF4EC',
  },

  // Bags: Woven Clutch, black
  'prod-woven-clutch': {
    main: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Hand-braided raffia and black leather evening clutch with brass chain',
    bgTint: '#EAECEB',
  },

  // Fashion: Satin Slip Dress, emerald
  'prod-satin-slip-dress': {
    main: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Liquid emerald green silk satin cowl neck slip dress',
    bgTint: '#EBF7F0',
  },

  // Fashion: Kente Print Skirt
  'prod-kente-skirt': {
    main: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'A-line high-waisted skirt featuring vibrant authentic woven African Kente motifs',
    bgTint: '#FAF1EC',
  },

  // Fashion: Custom Order Tailoring
  'prod-custom-tailoring': {
    main: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Bespoke tailoring atelier workspace with measuring tape, linen fabrics and shears',
    bgTint: '#F1F4F2',
  },
};

// 2. REALISTIC SELLER & STOREFRONT IMAGERY
export const SHOP_IMAGES: Record<string, ShopImageData> = {
  // Maison Ndolo (Douala, Fashion Boutique & Atelier)
  'shop-maison-ndolo': {
    cover:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
    avatar:
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=400&q=80',
    storefront:
      'https://images.unsplash.com/photo-1537832817056-821e25e86d26?auto=format&fit=crop&w=600&q=80',
  },

  // Kribi Kicks (Douala, Curated Sneakers & Streetwear)
  'shop-kribi-kicks': {
    cover:
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1400&q=80',
    avatar:
      'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=400&q=80',
    storefront:
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80',
  },

  // Byte & Co (Yaoundé, Tested Computing & Tech Hardware)
  'shop-byte-co': {
    cover:
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1400&q=80',
    avatar:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80',
    storefront:
      'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80',
  },

  // Glow Atelier (Limbe, Coastal Botanical Skincare)
  'shop-glow-atelier': {
    cover:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=80',
    avatar:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    storefront:
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80',
  },

  // Mobile Hub (Bamenda, Smartphones & Accessories)
  'shop-mobile-hub': {
    cover:
      'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1400&q=80',
    avatar:
      'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=400&q=80',
    storefront:
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80',
  },

  // Casa Bafut Home (Bafoussam, Artisanal Home Decor & Woven Living)
  'shop-casa-bafut': {
    cover:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80',
    avatar:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80',
    storefront:
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
  },
};

// 3. EDITORIAL CATEGORY PHOTOGRAPHY
export const CATEGORY_IMAGES: Record<string, CategoryImageData> = {
  fashion: {
    image:
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
    description: 'Ankara, linen, bespoke dresses, and curated streetwear',
  },
  computers: {
    image:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    description: 'Tested ultrabooks, developer machines, and accessories',
  },
  phones: {
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    description: 'Smartphones, fast chargers, earbuds, and audio gear',
  },
  shoes: {
    image:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    description: 'White court classics, running trainers, and loafers',
  },
  beauty: {
    image:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    description: 'Botanical Vitamin C serums, whipped shea butter & oils',
  },
  home: {
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    description: 'Artisanal rattan lamps, ceramic decor & woven crafts',
  },
  food: {
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    description: 'Fresh local pantry goods, spices, and artisan treats',
  },
  other: {
    image:
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80',
    description: 'Specialty gifts, leather stationery, and seasonal items',
  },
};

/**
 * Fallback helper to resolve high-fidelity product photography
 */
export function getProductImageData(productId: string): ProductImageData {
  if (PRODUCT_IMAGES[productId]) {
    return PRODUCT_IMAGES[productId];
  }
  // Safe default high-resolution photography
  return {
    main: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85',
    ],
    alt: 'Product catalogue item',
    bgTint: '#F3F6F4',
  };
}

/**
 * Fallback helper to resolve shop imagery
 */
export function getShopImageData(shopId: string): ShopImageData {
  if (SHOP_IMAGES[shopId]) {
    return SHOP_IMAGES[shopId];
  }
  return {
    cover:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
    avatar:
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=400&q=80',
    storefront:
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80',
  };
}
