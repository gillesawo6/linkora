import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/lib/context/store-context';
import { ToastContainer } from '@/components/ui/toast-container';

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
    <html lang="en">
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
