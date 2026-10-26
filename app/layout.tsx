import type { Metadata } from 'next';
import { Bricolage_Grotesque, Figtree } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/context/store-context';
import { ToastContainer } from '@/components/ui/toast-container';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
});

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-figtree',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Linkora — Discover great shops beyond your WhatsApp groups',
  description:
    'Find products, explore local businesses, and browse organized catalogues beyond WhatsApp groups. Direct contact on WhatsApp, zero checkout, zero commission.',
  openGraph: {
    title: 'Linkora — Discover great shops beyond your WhatsApp groups',
    description:
      'Find products, explore local businesses, and browse organized catalogues beyond WhatsApp groups. Direct contact on WhatsApp.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linkora — Discover great shops beyond your WhatsApp groups',
    description:
      'Find products, explore local businesses, and browse organized catalogues beyond WhatsApp groups.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bricolage.variable} ${figtree.variable}`}>
      <body
        className="min-h-screen bg-[#F7F9F7] text-[#17211B] antialiased"
        suppressHydrationWarning
      >
        <StoreProvider>
          {children}
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  );
}
