'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ExternalLink,
  RotateCw,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { LinkoraLogo } from '@/components/ui/linkora-icons';
import { useStore } from '@/lib/context/store-context';
import { motion, AnimatePresence } from 'motion/react';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { currentShop, isSyncing, triggerSync, syncIssues } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const hasIssues = syncIssues.length > 0;

  const navItems = [
    {
      name: 'Overview',
      href: '/seller/overview',
      icon: LayoutDashboard,
    },
    {
      name: 'WhatsApp connection',
      href: '/seller/connection',
      icon: MessageSquare,
      hasDot: hasIssues,
    },
    {
      name: 'Products',
      href: '/seller/products',
      icon: Package,
    },
    {
      name: 'Store & account',
      href: '/seller/settings',
      icon: Settings,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#101A15] text-white">
      {/* Workspace Brand / Shop Header */}
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-2.5">
          <LinkoraLogo className="w-6 h-6" />
          <span className="font-display font-bold text-xl text-white tracking-tight">
            Linkora
          </span>
        </Link>

        <div className="mt-6 pt-4 border-t border-white/10">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A3B2A9]">
            YOUR STORE
          </span>
          <p className="font-display font-bold text-[16px] text-white truncate mt-0.5">
            {currentShop.name}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-[14px] font-medium transition-colors ${
                isActive
                  ? 'bg-white/12 text-white font-semibold'
                  : 'text-[#A3B2A9] hover:bg-white/6 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.hasDot && (
                <span
                  className="w-2.5 h-2.5 rounded-full bg-[#E5A000]"
                  title="Needs attention"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User & Public Store */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <Link
          href={`/shops/${currentShop.slug}`}
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-[13px] text-[#A3B2A9] hover:text-white hover:bg-white/5 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View public store</span>
        </Link>

        {/* Joy Ndolo Profile Card */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-[12px] hover:bg-white/6 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8F7EE] text-[#075E36] font-display font-bold text-xs flex items-center justify-center shrink-0">
                J
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-white truncate leading-tight">
                  Joy Ndolo
                </p>
                <p className="text-[11.5px] text-[#A3B2A9] truncate">Owner</p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#A3B2A9]" />
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 6 }}
                transition={{ duration: 0.16, ease: EASE_OUT }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-[#17211B] border border-white/15 rounded-[12px] p-1.5 shadow-2xl text-[13px] z-50"
              >
                <Link
                  href="/seller/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block px-3 py-2 rounded-[8px] text-[#A3B2A9] hover:text-white hover:bg-white/10 transition-colors"
                >
                  Account settings
                </Link>
                <Link
                  href={`/shops/${currentShop.slug}`}
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block px-3 py-2 rounded-[8px] text-[#A3B2A9] hover:text-white hover:bg-white/10 transition-colors"
                >
                  View public store
                </Link>
                <div className="border-t border-white/10 my-1" />
                <Link
                  href="/signin"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block px-3 py-2 rounded-[8px] text-[#E57373] hover:text-[#FF8A80] hover:bg-white/10 transition-colors"
                >
                  Sign out
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F3F6F4]">
      {/* DESKTOP FIXED SIDEBAR (248px) */}
      <aside className="hidden lg:block w-[248px] shrink-0 fixed inset-y-0 left-0 z-40">
        {sidebarContent}
      </aside>

      {/* MOBILE DRAWER WITH SMOOTH SLIDE-OVER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/55 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="relative w-[280px] max-w-full h-full shadow-2xl z-10"
            >
              <div className="absolute top-4 right-4 z-20">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white p-1 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN WORKSPACE CONTENT AREA */}
      <div className="flex-1 lg:pl-[248px] flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 bg-[#F3F6F4]/90 backdrop-blur-xs border-b border-[#E3E9E4] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-[8px] hover:bg-[#E8F0EA] text-[#17211B]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[12px] font-medium text-[#5B6861] hidden sm:block">
                Seller workspace
              </span>
              <p className="font-display font-bold text-lg text-[#17211B] leading-tight">
                {currentShop.name} ·{' '}
                <span className="text-[#0F7D41] font-semibold text-sm">
                  Store {currentShop.visibility}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/shops/${currentShop.slug}`}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-white border border-[#E3E9E4] hover:bg-[#F7F9F7] text-[13.5px] font-medium text-[#17211B] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#5B6861]" />
              <span>Preview store</span>
            </Link>

            <button
              type="button"
              onClick={triggerSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-[#0F7D41] hover:bg-[#0B6636] active:bg-[#075E36] text-white text-[13.5px] font-semibold shadow-xs disabled:opacity-50 transition-colors"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}
              />
              <span>{isSyncing ? 'Syncing...' : 'Sync now'}</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT CONTAINER (Max 1100px as per PDF page 5) */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1100px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
