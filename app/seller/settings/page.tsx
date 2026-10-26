'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Upload,
  Image as ImageIcon,
  Lock,
  ExternalLink,
  Check,
  CheckCircle2,
  Shield,
  Bell,
  User,
  Store,
  Database,
  Copy,
  Terminal,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/ui/image-uploader';
import { useStore } from '@/lib/context/store-context';
import { CITIES } from '@/lib/data/sample-data';

export default function StoreSettingsPage() {
  const router = useRouter();
  const {
    currentShop,
    updateShop,
    showToast,
    user,
    isDbConnected,
    dbError,
    refreshData,
    signOut,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'connected' | 'personal' | 'database' | 'notifications' | 'security'
  >('profile');

  // Backend & DB status state
  const [dbTestResult, setDbTestResult] = useState<any | null>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isCopyingSchema, setIsCopyingSchema] = useState(false);

  // Form states
  const [businessName, setBusinessName] = useState(currentShop.name);
  const [description, setDescription] = useState(currentShop.description);
  const [city, setCity] = useState(currentShop.city);
  const [area, setArea] = useState(currentShop.area);
  const [slug, setSlug] = useState(currentShop.slug);
  const [visibility, setVisibility] = useState<'published' | 'hidden'>(
    currentShop.visibility
  );
  const [avatarImage, setAvatarImage] = useState<string | null>(
    currentShop.avatarImage || null
  );
  const [coverImage, setCoverImage] = useState<string | null>(
    currentShop.coverImage || null
  );

  const charLimit = 280;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateShop({
      name: businessName,
      description,
      city,
      area,
      slug,
      visibility,
      avatarImage: avatarImage || undefined,
      coverImage: coverImage || undefined,
    });
  };

  const handleTestBackend = async () => {
    setIsTestingDb(true);
    try {
      const res = await fetch('/api/backend/status');
      const data = await res.json();
      setDbTestResult(data);
      await refreshData();
      if (data.configured) {
        showToast('Supabase endpoint reachable and verified', { type: 'success' });
      } else {
        showToast(data.error || 'Connection failed', { type: 'error' });
      }
    } catch (err: any) {
      showToast(err.message || 'Diagnostic failed', { type: 'error' });
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleCopySchema = async () => {
    setIsCopyingSchema(true);
    try {
      const res = await fetch('/api/backend/schema');
      const data = await res.json();
      if (data.sql && navigator.clipboard) {
        await navigator.clipboard.writeText(data.sql);
        showToast('SQL Schema (supabase/schema.sql) copied to clipboard!', {
          type: 'success',
        });
      } else {
        showToast('Failed to load SQL schema', { type: 'error' });
      }
    } catch {
      showToast('Error copying schema', { type: 'error' });
    } finally {
      setIsCopyingSchema(false);
    }
  };

  const handleSignOutUser = async () => {
    await signOut();
    router.push('/signin');
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <nav className="flex items-center gap-2 text-[13px] text-[#5B6861] mb-1">
          <Link href="/seller/overview" className="hover:text-[#17211B]">
            Overview
          </Link>
          <span>/</span>
          <span className="text-[#17211B] font-medium">Store & account</span>
        </nav>
        <h1 className="font-display font-bold text-3xl text-[#17211B]">
          Store & account
        </h1>
        <p className="text-[14.5px] text-[#5B6861] mt-0.5">
          Everything customers see on your store, and everything that belongs to
          you.
        </p>
      </div>

      {/* 3-Column Layout: Sub-nav tabs, Main form, Live preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* TABS SUB-NAVIGATION */}
        <div className="lg:col-span-3 flex lg:flex-col overflow-x-auto no-scrollbar gap-1.5 bg-white p-2 sm:p-3 rounded-[16px] border border-[#E3E9E4]">
          {[
            { id: 'profile', label: 'Store profile', icon: Store },
            { id: 'connected', label: 'Connected account', icon: Lock },
            { id: 'personal', label: 'Personal account', icon: User },
            { id: 'database', label: 'Backend & Database', icon: Database },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] text-[13.5px] font-medium transition-colors text-left shrink-0 whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#E8F7EE] text-[#075E36] font-semibold'
                    : 'text-[#5B6861] hover:bg-[#F3F6F4] hover:text-[#17211B]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN FORM */}
        <div className="lg:col-span-5 space-y-8">
          {activeTab === 'profile' ? (
            <form onSubmit={handleSave} className="space-y-8">
              {/* STORE PROFILE SECTION */}
              <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-6 space-y-6">
                <h2 className="font-display font-bold text-lg text-[#17211B]">
                  Store profile
                </h2>

                {/* Profile picture (Store Avatar) */}
                <ImageUploader
                  variant="avatar"
                  label="Profile picture"
                  currentImageUrl={avatarImage}
                  onImageChange={(url) => {
                    setAvatarImage(url);
                    showToast(url ? 'Store profile picture updated' : 'Profile picture removed', {
                      type: 'success',
                    });
                  }}
                  fallbackText={businessName || 'M'}
                  shopId={currentShop.id}
                  hint="Square photo or brand logo. Recommended 400 × 400 px."
                />

                {/* Cover image (Store Banner) */}
                <ImageUploader
                  variant="cover"
                  label="Cover image"
                  currentImageUrl={coverImage}
                  onImageChange={(url) => {
                    setCoverImage(url);
                    showToast(url ? 'Store cover banner updated' : 'Cover image removed', {
                      type: 'success',
                    });
                  }}
                  shopId={currentShop.id}
                  hint="Wide banner image, at least 1600 × 400 px. Keep important logo and details in the centre."
                />

                {/* Business name */}
                <div>
                  <label className="block text-[13.5px] font-medium text-[#17211B] mb-1.5">
                    Business name
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-[10px] bg-white border border-[#E3E9E4] text-[14px] text-[#17211B] focus:outline-none focus:border-[#0F7D41]"
                  />
                </div>

                {/* Short description with counter */}
                <div>
                  <label className="block text-[13.5px] font-medium text-[#17211B] mb-1.5">
                    Short description
                  </label>
                  <textarea
                    rows={4}
                    maxLength={charLimit}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3.5 rounded-[10px] bg-white border border-[#E3E9E4] text-[14px] text-[#17211B] focus:outline-none focus:border-[#0F7D41] leading-relaxed"
                  />
                  <div className="flex justify-end pt-1">
                    <span className="text-[12px] text-[#8E9B93] tabular-nums font-mono">
                      {description.length}/{charLimit}
                    </span>
                  </div>
                </div>
              </div>

              {/* CONTACT & LOCATION SECTION */}
              <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-6 space-y-5">
                <h2 className="font-display font-bold text-lg text-[#17211B]">
                  Contact & location
                </h2>

                {/* WhatsApp number (read-only from WhatsApp) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13.5px] font-medium text-[#17211B]">
                      WhatsApp number
                    </label>
                    <span className="text-[11px] font-semibold text-[#5B6861] uppercase tracking-wider flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#8E9B93]" />
                      <span>Read-only (from WhatsApp)</span>
                    </span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={currentShop.displayPhone}
                    className="w-full h-11 px-3.5 rounded-[10px] bg-[#F7F9F7] border border-[#E3E9E4] text-[14px] text-[#5B6861] font-mono cursor-not-allowed"
                  />
                  <p className="text-[12px] text-[#8E9B93] mt-1.5">
                    Taken from your connected WhatsApp Business account.
                    Customers use it to message you. To change it, update your
                    WhatsApp Business account.
                  </p>
                </div>

                {/* City dropdown */}
                <div>
                  <label className="block text-[13.5px] font-medium text-[#17211B] mb-1.5">
                    City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-[10px] bg-white border border-[#E3E9E4] text-[14px] text-[#17211B] focus:outline-none focus:border-[#0F7D41]"
                  >
                    {CITIES.filter((c) => c.name !== 'All cities').map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Area / neighbourhood */}
                <div>
                  <label className="block text-[13.5px] font-medium text-[#17211B] mb-1.5">
                    Area or neighbourhood
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Akwa"
                    className="w-full h-11 px-3.5 rounded-[10px] bg-white border border-[#E3E9E4] text-[14px] text-[#17211B] focus:outline-none focus:border-[#0F7D41]"
                  />
                  <p className="text-[12px] text-[#8E9B93] mt-1.5">
                    Shown on your storefront and used for the city filter. We
                    never publish a street address unless you add one in your
                    description.
                  </p>
                </div>
              </div>

              {/* STOREFRONT LINK & VISIBILITY SECTION */}
              <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-6 space-y-5">
                <h2 className="font-display font-bold text-lg text-[#17211B]">
                  Storefront link & visibility
                </h2>

                {/* Public link */}
                <div>
                  <label className="block text-[13.5px] font-medium text-[#17211B] mb-1.5">
                    Public link
                  </label>
                  <div className="flex rounded-[10px] border border-[#E3E9E4] overflow-hidden focus-within:border-[#0F7D41]">
                    <span className="px-3.5 py-2.5 bg-[#F7F9F7] text-[14px] text-[#5B6861] border-r border-[#E3E9E4] select-none">
                      linkora.com/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3 py-2 text-[14px] text-[#17211B] focus:outline-none font-mono"
                    />
                  </div>
                  <p className="text-[12px] text-[#075E36] mt-1.5 flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>This is your current link.</span>
                  </p>
                </div>

                {/* Store visibility radio */}
                <div className="space-y-3 pt-2">
                  <label className="block text-[13.5px] font-medium text-[#17211B]">
                    Store visibility
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-[12px] bg-[#F7F9F7] border border-[#E3E9E4] cursor-pointer hover:bg-[#E8F7EE]/40 transition-colors">
                    <input
                      type="radio"
                      name="visibility"
                      value="published"
                      checked={visibility === 'published'}
                      onChange={() => setVisibility('published')}
                      className="w-4 h-4 mt-0.5 accent-[#0F7D41]"
                    />
                    <div>
                      <p className="font-semibold text-[14px] text-[#17211B]">
                        Published
                      </p>
                      <p className="text-[13px] text-[#5B6861] leading-relaxed">
                        Your store appears in search, categories and shop
                        listings, and anyone with the link can open it.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-[12px] bg-[#F7F9F7] border border-[#E3E9E4] cursor-pointer hover:bg-[#E8F7EE]/40 transition-colors">
                    <input
                      type="radio"
                      name="visibility"
                      value="hidden"
                      checked={visibility === 'hidden'}
                      onChange={() => setVisibility('hidden')}
                      className="w-4 h-4 mt-0.5 accent-[#0F7D41]"
                    />
                    <div>
                      <p className="font-semibold text-[14px] text-[#17211B]">
                        Hidden
                      </p>
                      <p className="text-[13px] text-[#5B6861] leading-relaxed">
                        Only you can see your store. Use this while you review
                        products.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-3">
                <Button type="submit" size="lg">
                  Save changes
                </Button>
              </div>
            </form>
          ) : activeTab === 'database' ? (
            /* BACKEND & DATABASE TAB */
            <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-6 sm:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display font-bold text-xl text-[#17211B] flex items-center gap-2">
                    <Database className="w-5 h-5 text-[#0F7D41]" />
                    <span>Supabase Backend & Storage</span>
                  </h2>
                  <p className="text-[13.5px] text-[#5B6861] mt-1">
                    Direct integration with your configured Supabase PostgreSQL database, Authentication, and Storage.
                  </p>
                </div>
                <span
                  className={`text-[12px] font-semibold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1.5 ${
                    isDbConnected
                      ? 'bg-[#E8F7EE] text-[#075E36]'
                      : 'bg-[#FEF7E6] text-[#8C5800]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isDbConnected ? 'bg-[#0F7D41]' : 'bg-[#E69B00]'
                    }`}
                  />
                  <span>{isDbConnected ? 'Live & Connected' : 'Schema Pending'}</span>
                </span>
              </div>

              {/* Endpoint Details */}
              <div className="space-y-3 p-4 rounded-[14px] bg-[#F7F9F7] border border-[#E3E9E4] text-[13px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#E3E9E4]">
                  <span className="text-[#5B6861] font-medium">Project URL</span>
                  <span className="font-mono text-[#17211B] select-all font-semibold">
                    https://lpimodrjtrdngnzgikgk.supabase.co
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#E3E9E4]">
                  <span className="text-[#5B6861] font-medium">Publishable Key</span>
                  <span className="font-mono text-[#075E36] font-semibold">
                    sb_publishable_scrxwvt...
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[#5B6861] font-medium">Auth System</span>
                  <span className="text-[#075E36] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Supabase GoTrue (Email + Password + Sessions)</span>
                  </span>
                </div>
              </div>

              {/* Real Diagnostic Tool */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-[15px] text-[#17211B]">
                    Live Table Diagnostics
                  </h3>
                  <button
                    type="button"
                    onClick={handleTestBackend}
                    disabled={isTestingDb}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#E8F7EE] text-[#075E36] hover:bg-[#D5EFE0] transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-spin' : ''}`} />
                    <span>{isTestingDb ? 'Checking...' : 'Run Diagnostics'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-[12px] border border-[#E3E9E4] bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-semibold text-[#17211B]">public.shops</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E8F7EE] text-[#075E36]">
                        {dbTestResult?.tables?.shops?.exists ? 'Table Ready' : 'Schema Pending'}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#5B6861]">
                      Stores seller profiles, slugs, categories, and WhatsApp Business numbers.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[12px] border border-[#E3E9E4] bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-semibold text-[#17211B]">public.products</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E8F7EE] text-[#075E36]">
                        {dbTestResult?.tables?.products?.exists ? 'Table Ready' : 'Schema Pending'}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#5B6861]">
                      Stores product catalogues, prices, sync status, and availability.
                    </p>
                  </div>
                </div>
              </div>

              {/* One-Click Migration Instructions */}
              <div className="p-4 sm:p-5 rounded-[16px] bg-[#E8F7EE]/60 border border-[#BDE3CC] space-y-3">
                <div className="flex items-start gap-3">
                  <Terminal className="w-5 h-5 text-[#075E36] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-[14px] font-semibold text-[#075E36]">
                      Ready-to-Run SQL Migration
                    </h4>
                    <p className="text-[12.5px] text-[#17211B]/80 leading-relaxed">
                      Linkora includes the complete schema with UUID generation, foreign keys, row-level security (RLS), and search indexes in <code className="px-1 py-0.5 bg-white/70 rounded text-[11px] font-mono">supabase/schema.sql</code>.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <Button
                    size="sm"
                    onClick={handleCopySchema}
                    disabled={isCopyingSchema}
                    className="gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Complete SQL Schema</span>
                  </Button>
                  <a
                    href="https://supabase.com/dashboard/project/lpimodrjtrdngnzgikgk/sql"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] bg-white border border-[#BDE3CC] text-[13px] font-medium text-[#075E36] hover:bg-white/80 transition-colors"
                  >
                    <span>Open Supabase SQL Editor</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ) : activeTab === 'personal' ? (
            /* PERSONAL ACCOUNT TAB */
            <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-display font-bold text-xl text-[#17211B] flex items-center gap-2">
                  <User className="w-5 h-5 text-[#0F7D41]" />
                  <span>Personal Account</span>
                </h2>
                <p className="text-[13.5px] text-[#5B6861] mt-1">
                  Manage your seller profile credentials and Supabase authentication session.
                </p>
              </div>

              <div className="space-y-4 p-4 rounded-[14px] bg-[#F7F9F7] border border-[#E3E9E4] text-[13.5px]">
                <div className="flex justify-between items-center pb-3 border-b border-[#E3E9E4]">
                  <span className="text-[#5B6861]">Authentication Status</span>
                  <span className="font-semibold text-[#075E36] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{user ? 'Authenticated Session' : 'Demo Mode (Guest)'}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-[#E3E9E4]">
                  <span className="text-[#5B6861]">Email Address</span>
                  <span className="font-medium text-[#17211B] font-mono">
                    {user?.email || 'joy.ndolo@maison-ndolo.com'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-[#E3E9E4]">
                  <span className="text-[#5B6861]">User ID</span>
                  <span className="font-mono text-xs text-[#5B6861]">
                    {user?.id || 'usr-ndolo-douala-001'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5B6861]">Store Access Role</span>
                  <span className="font-semibold text-[#17211B]">Owner & Store Admin</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                {user ? (
                  <Button variant="secondary" onClick={handleSignOutUser}>
                    Sign out of account
                  </Button>
                ) : (
                  <Link href="/signin">
                    <Button>Sign in with Supabase</Button>
                  </Link>
                )}
              </div>
            </div>
          ) : activeTab === 'connected' ? (
            /* CONNECTED WHATSAPP ACCOUNT TAB */
            <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-display font-bold text-xl text-[#17211B] flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#0F7D41]" />
                  <span>Connected WhatsApp Business</span>
                </h2>
                <p className="text-[13.5px] text-[#5B6861] mt-1">
                  Linkora syncs your catalogue from WhatsApp Business. Shoppers message this number directly.
                </p>
              </div>

              <div className="p-4 rounded-[14px] bg-[#F7F9F7] border border-[#E3E9E4] space-y-3 text-[13.5px]">
                <div className="flex justify-between items-center pb-2 border-b border-[#E3E9E4]">
                  <span className="text-[#5B6861]">Connected Number</span>
                  <span className="font-mono font-semibold text-[#17211B]">
                    {currentShop.displayPhone}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[#E3E9E4]">
                  <span className="text-[#5B6861]">WhatsApp Status</span>
                  <span className="font-semibold text-[#075E36] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Synchronised</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5B6861]">Catalog Sync Mode</span>
                  <span className="text-[#17211B] font-medium">Automatic hourly import</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/seller/connection">
                  <Button variant="secondary">Manage connection settings</Button>
                </Link>
              </div>
            </div>
          ) : (
            /* NOTIFICATIONS & SECURITY TABS */
            <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-6 sm:p-8 space-y-5">
              <h2 className="font-display font-bold text-xl text-[#17211B]">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} preferences
              </h2>
              <p className="text-[14px] text-[#5B6861]">
                Configure alerts and security parameters for your Linkora storefront.
              </p>
              <div className="p-4 rounded-[14px] bg-[#F7F9F7] text-[13.5px] text-[#17211B] space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Notify on WhatsApp customer inquiries</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0F7D41]" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Weekly catalogue performance summary</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0F7D41]" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Alert on sync errors or price discrepancies</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0F7D41]" />
                </label>
              </div>
              <Button
                variant="secondary"
                onClick={() => showToast('Preferences updated', { type: 'success' })}
              >
                Save preferences
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW (PDF Page 20) */}
        <div className="lg:col-span-4 space-y-3 sticky top-24">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#5B6861]">
              LIVE PREVIEW
            </span>
            <span
              className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${
                visibility === 'published'
                  ? 'bg-[#E8F7EE] text-[#075E36]'
                  : 'bg-[#F0F2F1] text-[#5B6861]'
              }`}
            >
              {visibility === 'published' ? 'Published' : 'Hidden'}
            </span>
          </div>

          <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-5 space-y-4 shadow-sm">
            <div className="w-full h-16 rounded-[12px] bg-gradient-to-r from-[#E8F7EE] via-[#F3F6F4] to-[#FAF3EA] border border-[#E3E9E4] relative overflow-hidden">
              {coverImage && (
                <Image
                  src={coverImage}
                  alt={businessName}
                  fill
                  sizes="320px"
                  unoptimized={coverImage.startsWith('data:') || coverImage.startsWith('blob:')}
                  referrerPolicy="no-referrer"
                  className="object-cover object-center"
                />
              )}
            </div>

            <div className="flex items-center gap-3 -mt-9 pl-2">
              <div className="w-12 h-12 rounded-full bg-white text-[#075E36] font-display font-bold text-lg flex items-center justify-center border-2 border-white shadow-xs overflow-hidden relative">
                {avatarImage ? (
                  <Image
                    src={avatarImage}
                    alt={businessName}
                    fill
                    sizes="48px"
                    unoptimized={avatarImage.startsWith('data:') || avatarImage.startsWith('blob:')}
                    referrerPolicy="no-referrer"
                    className="object-cover object-center"
                  />
                ) : (
                  <span>{businessName.charAt(0) || 'M'}</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-lg text-[#17211B] leading-tight">
                {businessName || 'Your Business Name'}
              </h3>
              <p className="text-[12.5px] text-[#5B6861] mt-0.5">
                {area ? `${area}, ` : ''}{city}
              </p>
            </div>

            <p className="text-[13px] text-[#17211B]/80 leading-relaxed line-clamp-3">
              {description || 'No description provided yet.'}
            </p>

            <Button variant="whatsapp" fullWidth size="sm">
              Message on WhatsApp
            </Button>

            <div className="pt-2 border-t border-[#E3E9E4]">
              <Link
                href={`/shops/${slug}`}
                target="_blank"
                className="w-full h-9 rounded-[8px] bg-[#F7F9F7] hover:bg-[#EAEFEA] text-[13px] font-medium text-[#17211B] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Open full preview</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#5B6861]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
