-- ============================================================================
-- LINKORA DATABASE SCHEMA FOR SUPABASE
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SHOPS TABLE
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'General',
    city TEXT NOT NULL DEFAULT 'Douala',
    area TEXT,
    description TEXT,
    story TEXT,
    whatsapp_number TEXT NOT NULL,
    display_phone TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'published' CHECK (visibility IN ('published', 'hidden')),
    product_count INTEGER NOT NULL DEFAULT 0,
    cover_image TEXT,
    avatar_image TEXT,
    last_synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for searching and filtering shops
CREATE INDEX IF NOT EXISTS idx_shops_city ON public.shops(city);
CREATE INDEX IF NOT EXISTS idx_shops_category ON public.shops(category);
CREATE INDEX IF NOT EXISTS idx_shops_slug ON public.shops(slug);
CREATE INDEX IF NOT EXISTS idx_shops_visibility ON public.shops(visibility);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC, -- NULL represents "Ask for price"
    currency TEXT NOT NULL DEFAULT 'FCFA',
    category TEXT NOT NULL,
    sub_category TEXT,
    color TEXT,
    sizes TEXT[] DEFAULT '{}',
    image_url TEXT,
    illustration_type TEXT DEFAULT 'sneaker',
    illustration_color TEXT,
    bg_tint TEXT DEFAULT '#E8F7EE',
    source TEXT NOT NULL DEFAULT 'linkora' CHECK (source IN ('whatsapp', 'linkora')),
    sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('synced', 'importing', 'needs_attention', 'failed', 'unavailable', 'added_here', 'published', 'draft')),
    sync_issue TEXT,
    is_live BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for product search & filters
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_is_live ON public.products(is_live);
CREATE INDEX IF NOT EXISTS idx_products_sync_status ON public.products(sync_status);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Shops RLS
CREATE POLICY "Public read published shops"
    ON public.shops FOR SELECT
    USING (visibility = 'published' OR (auth.uid() IS NOT NULL AND auth.uid() = owner_id));

CREATE POLICY "Authenticated users can create a shop"
    ON public.shops FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Shop owners can update their own shop"
    ON public.shops FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Shop owners can delete their own shop"
    ON public.shops FOR DELETE
    USING (auth.uid() = owner_id);

-- Products RLS
CREATE POLICY "Public read live products"
    ON public.products FOR SELECT
    USING (
        is_live = true
        OR (
            auth.uid() IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.shops
                WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Shop owners can insert products"
    ON public.products FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.shops
            WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid()
        )
    );

CREATE POLICY "Shop owners can update products"
    ON public.products FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.shops
            WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.shops
            WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid()
        )
    );

CREATE POLICY "Shop owners can delete products"
    ON public.products FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.shops
            WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid()
        )
    );

-- 4. FUNCTION TO UPDATE PRODUCT COUNT ON SHOPS
CREATE OR REPLACE FUNCTION public.handle_product_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.shops
        SET product_count = (SELECT COUNT(*) FROM public.products WHERE shop_id = NEW.shop_id AND is_live = true)
        WHERE id = NEW.shop_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.shops
        SET product_count = (SELECT COUNT(*) FROM public.products WHERE shop_id = OLD.shop_id AND is_live = true)
        WHERE id = OLD.shop_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.shops
        SET product_count = (SELECT COUNT(*) FROM public.products WHERE shop_id = NEW.shop_id AND is_live = true)
        WHERE id = NEW.shop_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_product_change ON public.products;
CREATE TRIGGER on_product_change
AFTER INSERT OR UPDATE OR DELETE ON public.products
FOR EACH ROW EXECUTE PROCEDURE public.handle_product_count();

-- 5. SEED DATA (Maison Ndolo and sample products for initial showcase)
INSERT INTO public.shops (
    id, name, slug, category, city, area, description, story, whatsapp_number, display_phone, visibility, product_count
) VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Maison Ndolo',
    'maison-ndolo',
    'Fashion & clothing',
    'Douala',
    'Akwa',
    'Curated contemporary ready-to-wear, ankara co-ords, and handcrafted accessories produced in Douala.',
    'Founded in 2021 by Joy Ndolo. We blend heritage Cameroonian textiles with modern tailoring.',
    '+237677123456',
    '+237 677 12 34 56',
    'published',
    8
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (
    shop_id, name, description, price, category, sub_category, color, illustration_type, illustration_color, bg_tint, is_live, sync_status
) VALUES
(
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Everyday Minimalist Sneaker',
    'Clean, versatile low-top sneakers in crisp white leather. Cushioned footbed for all-day comfort around town.',
    32000,
    'Shoes',
    'Footwear',
    'Bone White',
    'sneaker',
    '#17211B',
    '#E8F7EE',
    true,
    'synced'
),
(
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Terracotta Linen Wrap Dress',
    'Breathable washed linen wrap dress with tie waist detail. Sourced and stitched in Akwa, Douala.',
    28500,
    'Fashion & clothing',
    'Dresses',
    'Terracotta',
    'dress',
    '#94442B',
    '#F9EDE8',
    true,
    'synced'
),
(
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Ultraslim 14" Work Laptop',
    'M2 quad-core performance notebook. 512GB SSD, 16GB unified memory, all-day 18-hour battery.',
    520000,
    'Computers & electronics',
    'Laptops',
    'Space Gray',
    'laptop',
    '#2B4254',
    '#EEF3F8',
    true,
    'synced'
),
(
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Canvas Weekend Backpack',
    'Heavy-duty wax-treated cotton canvas with full-grain leather straps and padded laptop compartment.',
    24000,
    'Fashion & clothing',
    'Bags',
    'Olive Green',
    'backpack',
    '#3B503D',
    '#EDF3EE',
    true,
    'synced'
)
ON CONFLICT DO NOTHING;
