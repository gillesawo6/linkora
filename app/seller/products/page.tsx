'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  RotateCw,
  X,
  ExternalLink,
  AlertTriangle,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProductImage } from '@/components/ui/product-image';
import { ImageUploader } from '@/components/ui/image-uploader';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/context/store-context';
import { Product, SyncStatus } from '@/lib/types';
import { normalizeSearchTerm } from '@/lib/search';

export default function SellerProductsPage() {
  const {
    products,
    updateProduct,
    addProduct,
    deleteProduct,
    retryProductSync,
    triggerSync,
    isSyncing,
    lastSyncTime,
    showToast,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All categories');
  const [statusFilter, setStatusFilter] = useState<'all' | SyncStatus>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    products[3] // Default to Canvas Backpack to showcase slide-over panel
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Fashion & clothing');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState<string | null>(null);

  // Status counts
  const statusCounts = useMemo(() => {
    return {
      all: products.length,
      synced: products.filter((p) => p.syncStatus === 'synced').length,
      needs_attention: products.filter((p) => p.syncStatus === 'needs_attention')
        .length,
      failed: products.filter((p) => p.syncStatus === 'failed').length,
      unavailable: products.filter((p) => p.syncStatus === 'unavailable').length,
      added_here: products.filter((p) => p.syncStatus === 'added_here').length,
    };
  }, [products]);

  // Filtered list with tolerant multi-token matching
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery.trim()) {
        const qNorm = normalizeSearchTerm(searchQuery.trim());
        const tokens = qNorm.split(' ').filter(Boolean);
        const nameNorm = normalizeSearchTerm(p.name);
        const descNorm = normalizeSearchTerm(p.description || '');
        const catNorm = normalizeSearchTerm(p.category);
        const subCatNorm = normalizeSearchTerm(p.subCategory || '');

        const matches = tokens.every(
          (t) =>
            nameNorm.includes(t) ||
            descNorm.includes(t) ||
            catNorm.includes(t) ||
            subCatNorm.includes(t)
        );
        if (!matches) return false;
      }

      if (
        selectedCategory !== 'All categories' &&
        p.category !== selectedCategory
      ) {
        return false;
      }

      if (statusFilter !== 'all' && p.syncStatus !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory, statusFilter]);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const parsedPrice = newProdPrice ? Number(newProdPrice) : null;
    addProduct({
      name: newProdName.trim(),
      price: parsedPrice,
      currency: 'FCFA',
      shopId: 'shop-maison-ndolo',
      shopName: 'Maison Ndolo',
      shopCity: 'Douala',
      shopSlug: 'maison-ndolo',
      category: newProdCategory,
      description: newProdDesc.trim() || 'Custom item added on Linkora.',
      imageUrl: newProdImage || undefined,
      illustrationType: 'dress',
      illustrationColor: '#075E36',
      bgTint: '#E8F7EE',
      source: 'linkora',
      syncStatus: 'added_here',
      lastSyncedText: 'Just now',
      isLive: true,
    });

    setIsAddModalOpen(false);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdDesc('');
    setNewProdImage(null);
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-[13px] text-[#5B6861] mb-1">
            <Link href="/seller/overview" className="hover:text-[#17211B]">
              Overview
            </Link>
            <span>/</span>
            <span className="text-[#17211B] font-medium">Products</span>
          </nav>
          <h1 className="font-display font-bold text-3xl text-[#17211B]">
            Products
          </h1>
          <p className="text-[13.5px] text-[#5B6861] mt-0.5">
            52 imported from WhatsApp ·{' '}
            {products.filter((p) => p.source === 'linkora').length} added here ·
            last synchronised {lastSyncTime}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Add product manually</span>
          </Button>

          <button
            type="button"
            onClick={triggerSync}
            disabled={isSyncing}
            className="h-[46px] px-4 rounded-[12px] bg-white border border-[#E3E9E4] hover:bg-[#F3F6F4] text-[#17211B] text-[14px] font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RotateCw
              className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#0F7D41]' : ''}`}
            />
            <span>{isSyncing ? 'Syncing...' : 'Sync now'}</span>
          </button>
        </div>
      </div>

      {/* SEARCH, CATEGORY, STATUS PILLS */}
      <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6861] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your products"
              aria-label="Search your products"
              className="w-full h-10 pl-10 pr-9 rounded-[10px] bg-[#F7F9F7] text-[14px] text-[#17211B] border border-[#E3E9E4] focus:outline-none focus:border-[#0F7D41]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="w-6 h-6 absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#5B6861] hover:text-[#17211B] rounded-full hover:bg-[#E3E9E4]/60"
                aria-label="Clear product search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative sm:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 pl-3 pr-8 rounded-[10px] bg-[#F7F9F7] text-[14px] text-[#17211B] border border-[#E3E9E4] focus:outline-none focus:border-[#0F7D41] appearance-none"
            >
              <option value="All categories">All categories</option>
              <option value="Fashion & clothing">Fashion & clothing</option>
              <option value="Computers & electronics">
                Computers & electronics
              </option>
              <option value="Phones & accessories">Phones & accessories</option>
              <option value="Shoes">Shoes</option>
              <option value="Beauty & personal care">
                Beauty & personal care
              </option>
              <option value="Home & living">Home & living</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#5B6861] pointer-events-none" />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#F0F4F2]">
          {[
            { id: 'all', label: 'All', count: statusCounts.all },
            { id: 'synced', label: 'Synced', count: statusCounts.synced },
            {
              id: 'needs_attention',
              label: 'Needs attention',
              count: statusCounts.needs_attention,
            },
            { id: 'failed', label: 'Failed', count: statusCounts.failed },
            {
              id: 'unavailable',
              label: 'Unavailable',
              count: statusCounts.unavailable,
            },
            {
              id: 'added_here',
              label: 'Added here',
              count: statusCounts.added_here,
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatusFilter(item.id as any)}
              className={`px-3 py-1 rounded-[8px] text-[13px] font-medium transition-colors flex items-center gap-1.5 ${
                statusFilter === item.id
                  ? 'bg-[#E8F7EE] text-[#075E36] font-semibold'
                  : 'text-[#5B6861] hover:bg-[#F3F6F4] hover:text-[#17211B]'
              }`}
            >
              <span>{item.label}</span>
              <span className="text-[11.5px] tabular-nums opacity-75">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS TABLE & SLIDE-OVER DETAIL PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table view */}
        <div
          className={`${
            selectedProduct ? 'lg:col-span-7' : 'lg:col-span-12'
          } bg-white rounded-[20px] border border-[#E3E9E4] overflow-hidden transition-all`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F7F9F7] text-[12px] uppercase font-semibold text-[#5B6861] border-b border-[#E3E9E4]">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Source & Status</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E9E4]">
                {filteredProducts.map((p) => {
                  const isSelected = selectedProduct?.id === p.id;
                  const priceText =
                    p.price !== null
                      ? `${p.price.toLocaleString()} FCFA`
                      : 'Ask for price';

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#E8F7EE]/60'
                          : 'hover:bg-[#F7F9F7]'
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[10px] overflow-hidden shrink-0">
                            <ProductImage
                              src={p.imageUrl}
                              alt={p.name}
                              productName={p.name}
                              bgTint={p.bgTint}
                              sizes="40px"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#17211B] truncate max-w-[180px]">
                              {p.name}
                            </p>
                            <p className="text-[12px] text-[#5B6861]">
                              {p.subCategory || p.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-[#17211B] tabular-nums whitespace-nowrap">
                        {priceText}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge status={p.syncStatus} />
                          <span className="text-[11px] text-[#8E9B93]">
                            {p.source === 'whatsapp'
                              ? 'WhatsApp catalogue'
                              : 'Added on Linkora'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[12.5px] text-[#5B6861] tabular-nums whitespace-nowrap">
                        {p.lastSyncedText}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SLIDE-OVER DETAIL PANEL WITH ANIMATION (PDF Page 19) */}
        <AnimatePresence mode="wait">
          {selectedProduct && (
            <motion.div
              key={selectedProduct.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 bg-white rounded-[20px] border border-[#E3E9E4] p-5 sm:p-6 space-y-5 shadow-xs sticky top-24"
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E3E9E4]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[12px] overflow-hidden shrink-0">
                    <ProductImage
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      productName={selectedProduct.name}
                      bgTint={selectedProduct.bgTint}
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[16px] text-[#17211B]">
                      {selectedProduct.name}
                    </h3>
                    <StatusBadge status={selectedProduct.syncStatus} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="text-[#5B6861] hover:text-[#17211B] p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product photo upload / replacement */}
              <div className="space-y-2 p-3.5 rounded-[14px] bg-[#F7F9F7] border border-[#E3E9E4]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[#17211B]">
                    Product Photo
                  </span>
                  <span className="text-[11px] text-[#5B6861]">
                    {selectedProduct.imageUrl ? 'Photo active' : 'Default illustration'}
                  </span>
                </div>
                <ImageUploader
                  variant="product"
                  currentImageUrl={selectedProduct.imageUrl}
                  onImageChange={(url) => {
                    updateProduct(selectedProduct.id, {
                      imageUrl: url || undefined,
                      syncStatus:
                        selectedProduct.syncStatus === 'failed' ||
                        selectedProduct.syncStatus === 'needs_attention'
                          ? 'synced'
                          : selectedProduct.syncStatus,
                      syncIssue: undefined,
                      isLive: true,
                    });
                    setSelectedProduct((prev) =>
                      prev
                        ? {
                            ...prev,
                            imageUrl: url || undefined,
                            syncStatus:
                              prev.syncStatus === 'failed' ||
                              prev.syncStatus === 'needs_attention'
                                ? 'synced'
                                : prev.syncStatus,
                            syncIssue: undefined,
                            isLive: true,
                          }
                        : null
                    );
                    showToast(url ? 'Product photo updated successfully' : 'Product photo removed', {
                      type: 'success',
                    });
                  }}
                  shopId={selectedProduct.shopId}
                />
              </div>

              {/* Error / Attention Box */}
              {selectedProduct.syncIssue && (
                <div className="p-4 rounded-[14px] bg-[#FEF7E6] border border-[#F5D899] space-y-3 text-[13.5px]">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-[#8C5800] mt-0.5 shrink-0" />
                    <p className="text-[#17211B] leading-relaxed">
                      {selectedProduct.syncIssue}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => retryProductSync(selectedProduct.id)}
                    className="text-xs"
                  >
                    Retry import
                  </Button>
                </div>
              )}

              {/* Section: From WhatsApp catalogue */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-wider text-[#5B6861]">
                  <Lock className="w-3.5 h-3.5 text-[#8E9B93]" />
                  <span>From WhatsApp catalogue</span>
                </div>
                <p className="text-[12px] text-[#5B6861]">
                  These fields update automatically. To change them, edit the
                  product in WhatsApp Business and sync again.
                </p>

                <div className="space-y-2.5 text-[13.5px] p-3.5 rounded-[12px] bg-[#F7F9F7] border border-[#E3E9E4]">
                  <div className="flex justify-between">
                    <span className="text-[#5B6861]">Name</span>
                    <span className="font-medium text-[#17211B]">
                      {selectedProduct.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B6861]">Price</span>
                    <span className="font-medium text-[#17211B] tabular-nums">
                      {selectedProduct.price !== null
                        ? `${selectedProduct.price.toLocaleString()} FCFA`
                        : 'Ask for price'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#5B6861] block mb-1">Description</span>
                    <p className="text-[13px] text-[#17211B] leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B6861]">Availability</span>
                    <span className="font-medium text-[#075E36]">In stock</span>
                  </div>
                </div>
              </div>

              {/* Section: Managed on Linkora */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[12.5px] font-semibold uppercase tracking-wider text-[#17211B]">
                  Managed on Linkora
                </h4>

                <div>
                  <label className="block text-[13px] font-medium text-[#5B6861] mb-1">
                    Category
                  </label>
                  <select
                    value={selectedProduct.category}
                    onChange={(e) =>
                      updateProduct(selectedProduct.id, {
                        category: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 rounded-[10px] bg-white border border-[#E3E9E4] text-[14px] text-[#17211B] focus:outline-none focus:border-[#0F7D41]"
                  >
                    <option value="Fashion & clothing">Fashion & clothing</option>
                    <option value="Computers & electronics">
                      Computers & electronics
                    </option>
                    <option value="Phones & accessories">
                      Phones & accessories
                    </option>
                    <option value="Shoes">Shoes</option>
                    <option value="Beauty & personal care">
                      Beauty & personal care
                    </option>
                    <option value="Home & living">Home & living</option>
                  </select>
                </div>

                {/* Show in my store toggle */}
                <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F7F9F7] border border-[#E3E9E4]">
                  <div>
                    <span className="text-[13.5px] font-medium text-[#17211B] block">
                      Show in my store
                    </span>
                    <span className="text-[12px] text-[#5B6861]">
                      {selectedProduct.isLive
                        ? 'Visible to public shoppers'
                        : 'Hidden until this product syncs successfully.'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedProduct.isLive}
                    onChange={(e) =>
                      updateProduct(selectedProduct.id, {
                        isLive: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-[#0F7D41] rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Bottom panel actions */}
              <div className="pt-3 border-t border-[#E3E9E4] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() =>
                      showToast('Changes saved to Linkora', { type: 'success' })
                    }
                  >
                    Save changes
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to remove "${selectedProduct.name}" from your catalogue?`
                        )
                      ) {
                        deleteProduct(selectedProduct.id);
                        setSelectedProduct(null);
                      }
                    }}
                    className="h-10 px-3 rounded-[10px] text-[13px] font-semibold text-[#C62828] hover:bg-[#FDEDEC] transition-colors"
                  >
                    Delete
                  </button>
                </div>
                <Link
                  href={`/products/${selectedProduct.id}`}
                  target="_blank"
                  className="text-[13.5px] font-medium text-[#0F7D41] hover:underline flex items-center gap-1"
                >
                  <span>View public page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ADD PRODUCT MANUALLY MODAL WITH ANIMATION */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white rounded-[20px] max-w-lg w-full p-5 sm:p-8 space-y-5 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E3E9E4]">
                <h3 className="font-display font-bold text-xl text-[#17211B]">
                  Add product manually
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-[#5B6861] hover:text-[#17211B]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <ImageUploader
                    variant="product"
                    label="Product photo"
                    currentImageUrl={newProdImage}
                    onImageChange={setNewProdImage}
                    shopId="shop-maison-ndolo"
                  />
                </div>

                <div>
                  <label className="block text-[13.5px] font-medium text-[#17211B] mb-1">
                    Product name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. Custom Tailored Blazer"
                    className="w-full h-10 px-3.5 rounded-[10px] bg-white border border-[#E3E9E4] text-[14px] text-[#17211B] focus:outline-none focus:border-[#0F7D41]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13.5px] font-medium text-[#17211B] mb-1">
                      Price (FCFA)
                    </label>
                    <input
                      type="number"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      placeholder="Leave blank for 'Ask for price'"
                      className="w-full h-10 px-3.5 rounded-[10px] bg-white border border-[#E3E9E4] text-[14px] text-[#17211B] focus:outline-none focus:border-[#0F7D41]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13.5px] font-medium text-[#17211B] mb-1">
                      Category
                    </label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-[10px] bg-white border border-[#E3E9E4] text-[14px] text-[#17211B] focus:outline-none focus:border-[#0F7D41]"
                    >
                      <option value="Fashion & clothing">Fashion & clothing</option>
                      <option value="Shoes">Shoes</option>
                      <option value="Computers & electronics">
                        Computers & electronics
                      </option>
                      <option value="Phones & accessories">
                        Phones & accessories
                      </option>
                      <option value="Beauty & personal care">
                        Beauty & personal care
                      </option>
                      <option value="Home & living">Home & living</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[13.5px] font-medium text-[#17211B] mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="Product description and details..."
                    className="w-full p-3 rounded-[10px] bg-white border border-[#E3E9E4] text-[14px] text-[#17211B] focus:outline-none focus:border-[#0F7D41]"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E3E9E4]">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create product</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
