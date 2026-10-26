'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  X,
  ArrowRight,
  Info,
  Shield,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import { LinkoraLogo } from '@/components/ui/linkora-icons';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/ui/image-uploader';
import { useStore } from '@/lib/context/store-context';

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { showToast, setConnectionState, currentShop, updateShop } = useStore();

  const [currentStep, setCurrentStep] = useState<number>(2); // Default to Step 2 as in PDF page 27
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const steps = [
    { num: 1, title: 'Create your account', status: 'done' },
    {
      num: 2,
      title: 'Connect WhatsApp Business',
      status: currentStep === 2 ? 'in_progress' : currentStep > 2 ? 'done' : 'not_started',
    },
    {
      num: 3,
      title: 'Import the accessible catalogue',
      status: currentStep === 3 ? 'in_progress' : currentStep > 3 ? 'done' : 'not_started',
    },
    {
      num: 4,
      title: 'Review your storefront',
      status: currentStep === 4 ? 'in_progress' : currentStep > 4 ? 'done' : 'not_started',
    },
    {
      num: 5,
      title: 'Publish for discovery',
      status: currentStep === 5 ? 'in_progress' : currentStep > 5 ? 'done' : 'not_started',
    },
  ];

  const handleConnectWhatsApp = () => {
    setIsConnected(true);
    setConnectionState('connected');
    showToast('WhatsApp Business connected! Ready to import.', {
      type: 'success',
    });
  };

  const handleContinue = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      showToast('Store published to Linkora discovery!', {
        type: 'success',
      });
      router.push('/seller/overview');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] flex flex-col">
      {/* Top Header */}
      <header className="h-18 bg-white border-b border-[#E3E9E4] px-6 sm:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <LinkoraLogo className="w-7 h-7" />
          <span className="font-display font-bold text-2xl text-[#17211B]">
            Linkora
          </span>
        </Link>

        <Link
          href="/seller/overview"
          className="text-[14px] font-medium text-[#5B6861] hover:text-[#17211B] transition-colors"
        >
          Save and exit
        </Link>
      </header>

      {/* Main Wizard Area */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT COLUMN: 5-STEP RESUMABLE WIZARD (PDF Page 27) */}
          <aside className="lg:col-span-4 space-y-6">
            <h2 className="font-display font-bold text-2xl text-[#17211B]">
              Set up your store
            </h2>

            <ol className="space-y-4">
              {steps.map((st) => {
                const isDone = st.status === 'done';
                const isInProgress = st.status === 'in_progress';

                return (
                  <li
                    key={st.num}
                    className={`flex items-start gap-3.5 p-3.5 rounded-[14px] border transition-colors ${
                      isInProgress
                        ? 'bg-white border-[#0F7D41] shadow-xs'
                        : isDone
                        ? 'bg-white/80 border-[#E3E9E4]'
                        : 'bg-transparent border-transparent opacity-60'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        isDone
                          ? 'bg-[#0F7D41] text-white'
                          : isInProgress
                          ? 'border-2 border-[#0F7D41] text-[#0F7D41]'
                          : 'border border-[#CAD3CD] text-[#5B6861]'
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4" /> : st.num}
                    </span>

                    <div className="min-w-0">
                      <p
                        className={`text-[14.5px] leading-tight ${
                          isInProgress
                            ? 'font-bold text-[#17211B]'
                            : isDone
                            ? 'font-medium text-[#17211B]'
                            : 'text-[#5B6861]'
                        }`}
                      >
                        {st.title}
                      </p>
                      <span className="text-[12px] text-[#5B6861] capitalize">
                        {isDone
                          ? 'Done'
                          : isInProgress
                          ? 'In progress'
                          : 'Not started'}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </aside>

          {/* RIGHT COLUMN: STEP INTERFACE & ACTIONS */}
          <div className="lg:col-span-8 space-y-6">
            {/* Welcome back Joy dismissible notification */}
            {showBanner && (
              <div className="p-4 rounded-[14px] bg-[#E8F7EE] border border-[#8AD3A8]/40 flex items-center justify-between text-[14px] text-[#075E36]">
                <div className="flex items-center gap-2.5">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Welcome back, Joy.</strong> Your progress is saved.
                    You left off at &ldquo;Connect WhatsApp Business&rdquo;.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBanner(false)}
                  className="text-[#075E36] hover:text-[#043D23] font-semibold text-xs ml-3"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* STEP 2 CONTENT (PDF Page 27) */}
            {currentStep === 2 && (
              <div className="bg-white rounded-[24px] border border-[#E3E9E4] p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#5B6861]">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-[#0F7D41]' : 'bg-[#8E9B93]'
                    }`}
                  />
                  <span>
                    {isConnected ? 'Connected' : 'Not connected'}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#17211B]">
                    Connect your WhatsApp Business catalogue
                  </h3>
                  <p className="mt-2 text-[15px] text-[#5B6861] leading-relaxed">
                    Import the products you already sell on WhatsApp and get a
                    storefront customers can search. You stay in control of what
                    is shared.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-[12.5px] font-semibold uppercase tracking-wider text-[#17211B]">
                    WHAT YOU GET
                  </h4>
                  <div className="space-y-2.5 text-[14px]">
                    <div className="flex items-start gap-2.5 p-3 rounded-[10px] bg-[#F7F9F7] border border-[#E3E9E4]">
                      <Check className="w-4 h-4 text-[#0F7D41] mt-0.5 shrink-0" />
                      <span>
                        <strong>Products imported automatically:</strong> Names,
                        prices, photos and descriptions.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-[10px] bg-[#F7F9F7] border border-[#E3E9E4]">
                      <Check className="w-4 h-4 text-[#0F7D41] mt-0.5 shrink-0" />
                      <span>
                        <strong>A shareable storefront:</strong> Search,
                        categories and filters on your own page.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-[10px] bg-[#F7F9F7] border border-[#E3E9E4]">
                      <Check className="w-4 h-4 text-[#0F7D41] mt-0.5 shrink-0" />
                      <span>
                        <strong>Customers still message you on WhatsApp:</strong>{' '}
                        No checkout and no commission.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-[12.5px] font-semibold uppercase tracking-wider text-[#17211B]">
                    PERMISSIONS WE&apos;LL ASK META FOR
                  </h4>
                  <div className="space-y-2 text-[13.5px]">
                    <div className="p-3 rounded-[10px] bg-[#F7F9F7]">
                      <p className="font-medium text-[#17211B]">
                        Read your business catalogue (Read-only)
                      </p>
                    </div>
                    <div className="p-3 rounded-[10px] bg-[#F7F9F7]">
                      <p className="font-medium text-[#17211B]">
                        Read your business profile (Read-only)
                      </p>
                    </div>
                  </div>
                  <p className="text-[12.5px] text-[#5B6861]">
                    We never read your chats, groups or contacts. Nothing from
                    private conversations becomes public.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Button
                    onClick={handleConnectWhatsApp}
                    size="lg"
                    className="gap-2"
                  >
                    {isConnected ? '✓ WhatsApp Connected' : 'Connect WhatsApp Business'}
                  </Button>
                  <Link
                    href="/seller/products"
                    className="text-[14px] text-[#5B6861] hover:text-[#0F7D41] font-medium"
                  >
                    Prefer to add products by hand?
                  </Link>
                </div>

                <div className="pt-6 border-t border-[#E3E9E4] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-[14px] text-[#5B6861] hover:text-[#17211B]"
                  >
                    Back
                  </button>

                  <div className="flex items-center gap-3">
                    {!isConnected && (
                      <span className="text-[13px] text-[#5B6861]">
                        Connect to continue
                      </span>
                    )}
                    <Button
                      onClick={handleContinue}
                      disabled={!isConnected}
                      size="default"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & BRAND YOUR STOREFRONT */}
            {currentStep === 4 && (
              <div className="bg-white rounded-[24px] border border-[#E3E9E4] p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#17211B]">
                    Review &amp; brand your storefront
                  </h3>
                  <p className="mt-1 text-[15px] text-[#5B6861]">
                    Add your store logo and banner so shoppers recognize your brand when visiting from WhatsApp or search.
                  </p>
                </div>

                <div className="space-y-6 pt-2">
                  <ImageUploader
                    variant="avatar"
                    label="Store profile picture / logo"
                    currentImageUrl={currentShop.avatarImage}
                    onImageChange={(url) => {
                      updateShop({ avatarImage: url || undefined });
                      showToast(url ? 'Store profile picture uploaded' : 'Profile picture removed', {
                        type: 'success',
                      });
                    }}
                    fallbackText={currentShop.name}
                    shopId={currentShop.id}
                    hint="Square photo or logo. Recommended 400 × 400 px."
                  />

                  <ImageUploader
                    variant="cover"
                    label="Store cover banner"
                    currentImageUrl={currentShop.coverImage}
                    onImageChange={(url) => {
                      updateShop({ coverImage: url || undefined });
                      showToast(url ? 'Store cover banner updated' : 'Cover image removed', {
                        type: 'success',
                      });
                    }}
                    shopId={currentShop.id}
                    hint="Wide banner image, at least 1600 × 400 px."
                  />
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-[#E3E9E4]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-[14px] text-[#5B6861] hover:text-[#17211B]"
                  >
                    Back
                  </button>
                  <Button onClick={handleContinue}>
                    Continue to publish
                  </Button>
                </div>
              </div>
            )}

            {/* OTHER STEPS (STEP 3 & STEP 5) */}
            {currentStep !== 2 && currentStep !== 4 && (
              <div className="bg-white rounded-[24px] border border-[#E3E9E4] p-6 sm:p-8 space-y-6">
                <h3 className="font-display font-bold text-2xl text-[#17211B]">
                  {steps[currentStep - 1].title}
                </h3>
                <p className="text-[15px] text-[#5B6861]">
                  Step {currentStep} of 5: Your store is being prepared for public
                  discovery.
                </p>

                <div className="p-6 rounded-[16px] bg-[#F7F9F7] text-center space-y-3">
                  <Check className="w-10 h-10 text-[#0F7D41] mx-auto" />
                  <p className="font-semibold text-lg text-[#17211B]">
                    Everything is configured properly.
                  </p>
                  <p className="text-sm text-[#5B6861]">
                    52 items imported from WhatsApp Business catalogue.
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-[#E3E9E4]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="text-[14px] text-[#5B6861] hover:text-[#17211B]"
                  >
                    Back
                  </button>
                  <Button onClick={handleContinue}>
                    {currentStep === 5 ? 'Publish and view store' : 'Continue'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
