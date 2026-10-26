import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FBFDFB] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#E8EFEA] flex items-center justify-center text-[#1E3A2F] mb-6">
        <ShoppingBag className="w-8 h-8" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-[#3D6B59] mb-2">
        404 — Page Not Found
      </span>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#14231D] tracking-tight mb-3">
        Looking for a shop or product?
      </h1>
      <p className="text-[#52635B] max-w-md text-sm sm:text-base mb-8">
        The page you requested couldn&apos;t be found or may have moved. Browse Linkora&apos;s directory of verified sellers and direct WhatsApp storefronts.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E3A2F] text-white text-sm font-medium hover:bg-[#162B23] transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Homepage
        </Link>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#D5E0D9] text-[#14231D] text-sm font-medium hover:bg-[#F3F7F4] transition-colors"
        >
          <Search className="w-4 h-4" />
          Explore Catalogue
        </Link>
      </div>
    </div>
  );
}
