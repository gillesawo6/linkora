'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LinkoraLogo } from '../ui/linkora-icons';

export function MarketplaceFooter() {
  return (
    <footer className="bg-[#101A15] text-white pt-16 pb-24 sm:pb-16 mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Top Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          <div className="lg:col-span-5 max-w-md">
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-white leading-tight">
              Discover shops.
              <br />
              <span className="text-[#8AD3A8]">Connect directly.</span>
            </h2>
            <p className="mt-4 text-[15px] text-[#A3B2A9] leading-relaxed">
              Linkora is a discovery platform for WhatsApp-connected shops. We
              don&apos;t process payments, and we&apos;re not affiliated with WhatsApp or
              Meta.
            </p>
            <div className="mt-6">
              <Link
                href="/seller/onboarding"
                className="inline-flex items-center gap-2 h-[46px] px-6 rounded-[12px] bg-white text-[#101A15] font-medium text-[15px] hover:bg-[#E8F7EE] transition-colors"
              >
                <span>Open your store</span>
                <ArrowRight className="w-4 h-4 text-[#0F7D41]" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="font-sans font-semibold text-[14px] text-white tracking-wider mb-4">
                Shop
              </h3>
              <ul className="space-y-3 text-[14px] text-[#A3B2A9]">
                <li>
                  <Link href="/explore" className="hover:text-white transition-colors">
                    Explore products
                  </Link>
                </li>
                <li>
                  <Link href="/shops" className="hover:text-white transition-colors">
                    Discover shops
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="hover:text-white transition-colors">
                    Categories
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-sans font-semibold text-[14px] text-white tracking-wider mb-4">
                Sell
              </h3>
              <ul className="space-y-3 text-[14px] text-[#A3B2A9]">
                <li>
                  <Link
                    href="/seller/onboarding"
                    className="hover:text-white transition-colors"
                  >
                    Open your store
                  </Link>
                </li>
                <li>
                  <Link
                    href="/seller/connection"
                    className="hover:text-white transition-colors"
                  >
                    Connect your catalogue
                  </Link>
                </li>
                <li>
                  <Link
                    href="/seller/overview"
                    className="hover:text-white transition-colors"
                  >
                    Seller dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-sans font-semibold text-[14px] text-white tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3 text-[14px] text-[#A3B2A9]">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help centre
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Privacy & terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#A3B2A9]">
          <div className="flex items-center gap-2">
            <LinkoraLogo className="w-5 h-5 opacity-80" />
            <span>© Linkora</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">
              A discovery platform. No payments are processed here.
            </span>
          </div>
          <div>
            Prices are set by sellers and shown for information only.
          </div>
        </div>
      </div>
    </footer>
  );
}
