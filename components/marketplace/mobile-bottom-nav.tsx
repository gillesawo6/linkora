'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Compass, Store, User, LayoutDashboard } from 'lucide-react';
import { useStore } from '@/lib/context/store-context';

interface MobileBottomNavProps {
  activeTab?: 'home' | 'explore' | 'shops' | 'account';
}

export function MobileBottomNav({ activeTab = 'home' }: MobileBottomNavProps) {
  const { user } = useStore();
  return (
    <nav
      aria-label="Mobile navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-t border-[#E3E9E4] h-16 pb-[env(safe-area-inset-bottom,0px)] flex items-center justify-around px-2 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]"
    >
      <Link
        href="/"
        aria-current={activeTab === 'home' ? 'page' : undefined}
        className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-colors rounded-[8px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F7D41] ${
          activeTab === 'home'
            ? 'text-[#0F7D41] font-semibold'
            : 'text-[#5B6861] hover:text-[#17211B]'
        }`}
      >
        <Home
          className="w-5 h-5 mb-0.5"
          strokeWidth={activeTab === 'home' ? 2.2 : 1.8}
          aria-hidden="true"
        />
        <span className="text-[11px] leading-tight">Home</span>
      </Link>

      <Link
        href="/explore"
        aria-current={activeTab === 'explore' ? 'page' : undefined}
        className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-colors rounded-[8px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F7D41] ${
          activeTab === 'explore'
            ? 'text-[#0F7D41] font-semibold'
            : 'text-[#5B6861] hover:text-[#17211B]'
        }`}
      >
        <Compass
          className="w-5 h-5 mb-0.5"
          strokeWidth={activeTab === 'explore' ? 2.2 : 1.8}
          aria-hidden="true"
        />
        <span className="text-[11px] leading-tight">Explore</span>
      </Link>

      <Link
        href="/shops"
        aria-current={activeTab === 'shops' ? 'page' : undefined}
        className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-colors rounded-[8px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F7D41] ${
          activeTab === 'shops'
            ? 'text-[#0F7D41] font-semibold'
            : 'text-[#5B6861] hover:text-[#17211B]'
        }`}
      >
        <Store
          className="w-5 h-5 mb-0.5"
          strokeWidth={activeTab === 'shops' ? 2.2 : 1.8}
          aria-hidden="true"
        />
        <span className="text-[11px] leading-tight">Shops</span>
      </Link>

      <Link
        href={user ? '/seller/overview' : '/signin'}
        aria-current={activeTab === 'account' ? 'page' : undefined}
        className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-colors rounded-[8px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F7D41] ${
          activeTab === 'account'
            ? 'text-[#0F7D41] font-semibold'
            : 'text-[#5B6861] hover:text-[#17211B]'
        }`}
      >
        {user ? (
          <LayoutDashboard
            className="w-5 h-5 mb-0.5"
            strokeWidth={activeTab === 'account' ? 2.2 : 1.8}
            aria-hidden="true"
          />
        ) : (
          <User
            className="w-5 h-5 mb-0.5"
            strokeWidth={activeTab === 'account' ? 2.2 : 1.8}
            aria-hidden="true"
          />
        )}
        <span className="text-[11px] leading-tight">{user ? 'My Store' : 'Sign in'}</span>
      </Link>
    </nav>
  );
}
