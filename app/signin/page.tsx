'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LinkoraLogo } from '@/components/ui/linkora-icons';
import { ProductImage } from '@/components/ui/product-image';
import { PRODUCT_IMAGES } from '@/lib/data/marketplace-images';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/context/store-context';

export default function SignInPage() {
  const router = useRouter();
  const { signIn, signUp, resetPassword, showToast } = useStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setResetSent(false);

    if (!email.trim() || !password) {
      setAuthError('Please fill in both email and password.');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const targetRedirect =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('redirect') || '/seller/overview'
          : '/seller/overview';

      if (mode === 'signin') {
        const res = await signIn(email.trim(), password);
        if (res.success) {
          router.push(targetRedirect);
        } else {
          setAuthError(res.error || 'Failed to sign in. Please verify your credentials.');
        }
      } else {
        const res = await signUp({
          email: email.trim(),
          password,
          fullName: fullName.trim() || undefined,
          businessName: businessName.trim() || undefined,
        });

        if (res.success) {
          router.push(targetRedirect);
        } else {
          setAuthError(res.error || 'Registration failed. Please check your information.');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setAuthError('Please enter your email address to receive password reset instructions.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    const res = await resetPassword(email.trim());
    setIsLoading(false);

    if (res.success) {
      setResetSent(true);
      showToast('Password reset email sent!', { type: 'success' });
    } else {
      setAuthError(res.error || 'Failed to send reset email.');
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('seller.demo@linkora.cm');
    setPassword('Linkora2026!');
    setFullName('Joy Ndolo');
    setBusinessName('Maison Ndolo');
    setAuthError(null);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* LEFT COLUMN: SIGN IN / SIGN UP FORM */}
      <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        {/* Top Wordmark */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <LinkoraLogo className="w-7 h-7" />
            <span className="font-display font-bold text-2xl text-[#17211B]">
              Linkora
            </span>
          </Link>
        </div>

        {/* Center Form */}
        <div className="py-8 sm:py-12">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 mb-6 p-1 bg-[#F3F6F4] rounded-[12px] max-w-xs">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setAuthError(null);
              }}
              className={`flex-1 py-2 text-[14px] font-semibold rounded-[9px] transition-all ${
                mode === 'signin'
                  ? 'bg-white text-[#0F7D41] shadow-xs'
                  : 'text-[#5B6861] hover:text-[#17211B]'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setAuthError(null);
              }}
              className={`flex-1 py-2 text-[14px] font-semibold rounded-[9px] transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#0F7D41] shadow-xs'
                  : 'text-[#5B6861] hover:text-[#17211B]'
              }`}
            >
              Register
            </button>
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#17211B] tracking-tight">
            {mode === 'signin' ? 'Welcome back' : 'Create your store'}
          </h1>
          <p className="mt-2 text-[15px] text-[#5B6861]">
            {mode === 'signin'
              ? 'Sign in to manage your WhatsApp-connected catalogue and storefront.'
              : 'Join Linkora to give your WhatsApp catalogue a beautiful discovery page.'}
          </p>

          {/* Error Banner */}
          <AnimatePresence>
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-5 p-3.5 rounded-[12px] bg-[#FDEDEC] border border-[#F5C2C0] text-[#C62828] text-[13.5px] flex flex-col gap-2 leading-snug"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="flex-1 font-medium">{authError}</span>
                </div>
                {(authError.toLowerCase().includes('already exist') ||
                  authError.toLowerCase().includes('sign in instead')) &&
                  mode === 'signup' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setAuthError(null);
                      }}
                      className="self-start ml-6.5 text-[12.5px] font-semibold text-[#0F7D41] bg-white border border-[#D1E7D8] hover:bg-[#F2FBF6] px-3 py-1 rounded-[8px] transition-colors"
                    >
                      Click here to Sign In with this email →
                    </button>
                  )}
                {authError.toLowerCase().includes('create an account') &&
                  mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setAuthError(null);
                      }}
                      className="self-start ml-6.5 text-[12.5px] font-semibold text-[#0F7D41] bg-white border border-[#D1E7D8] hover:bg-[#F2FBF6] px-3 py-1 rounded-[8px] transition-colors"
                    >
                      Create a free account now →
                    </button>
                  )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reset Sent Success Notice */}
          {resetSent && (
            <div className="mt-5 p-3.5 rounded-[12px] bg-[#E8F7EE] border border-[#8AD3A8] text-[#075E36] text-[13.5px] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Reset link sent to <strong>{email}</strong>. Check your inbox to
                set a new password.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-[13.5px] font-medium text-[#17211B] mb-1.5"
                  >
                    Your full name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Joy Ndolo"
                    className="w-full h-[46px] px-4 rounded-[12px] bg-white border border-[#E3E9E4] text-[15px] text-[#17211B] focus:outline-none focus:border-[#0F7D41] focus:ring-2 focus:ring-[#8AD3A8]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="businessName"
                    className="block text-[13.5px] font-medium text-[#17211B] mb-1.5"
                  >
                    Store / Business name
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Maison Ndolo"
                    className="w-full h-[46px] px-4 rounded-[12px] bg-white border border-[#E3E9E4] text-[15px] text-[#17211B] focus:outline-none focus:border-[#0F7D41] focus:ring-2 focus:ring-[#8AD3A8]"
                  />
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-[13.5px] font-medium text-[#17211B] mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="w-full h-[46px] px-4 rounded-[12px] bg-white border border-[#E3E9E4] text-[15px] text-[#17211B] focus:outline-none focus:border-[#0F7D41] focus:ring-2 focus:ring-[#8AD3A8]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-[13.5px] font-medium text-[#17211B]"
                >
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[13px] text-[#5B6861] hover:text-[#0F7D41] transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full h-[46px] pl-4 pr-16 rounded-[12px] bg-white border border-[#E3E9E4] text-[15px] text-[#17211B] focus:outline-none focus:border-[#0F7D41] focus:ring-2 focus:ring-[#8AD3A8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[#5B6861] hover:text-[#17211B] p-1"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={isLoading}
              className="mt-4 text-[15px]"
            >
              {isLoading
                ? mode === 'signin'
                  ? 'Signing in...'
                  : 'Creating account...'
                : mode === 'signin'
                ? 'Sign in to workspace'
                : 'Create seller account'}
            </Button>
          </form>

          {/* Quick Demo Pre-fill */}
          <div className="mt-5 p-3 rounded-[12px] bg-[#F7F9F7] border border-[#E3E9E4] text-center">
            <span className="text-[12.5px] text-[#5B6861] block mb-1">
              Need sample seller credentials to explore?
            </span>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-[12.5px] font-semibold text-[#0F7D41] hover:underline"
            >
              Fill demo credentials (Joy Ndolo)
            </button>
          </div>
        </div>

        {/* Footer disclaimer */}
        <p className="text-[12.5px] text-[#8E9B93]">
          © Linkora · Direct discovery for WhatsApp commerce · No buyer payment processing.
        </p>
      </div>

      {/* RIGHT COLUMN: BRAND & VALUE PROP (PDF Page 26) */}
      <div className="hidden lg:flex lg:col-span-6 bg-[#F7F9F7] border-l border-[#E3E9E4] flex-col justify-center p-16">
        <div className="max-w-md mx-auto space-y-8">
          {/* Sample Product Photography */}
          <div className="grid grid-cols-3 gap-3">
            <div className="aspect-square rounded-[16px] overflow-hidden shadow-xs">
              <ProductImage
                src={PRODUCT_IMAGES['prod-court-classic-white']?.main}
                alt="Court Classic Sneakers"
                productName="Court Classic Sneakers"
                bgTint="#E8F7EE"
                sizes="150px"
              />
            </div>
            <div className="aspect-square rounded-[16px] overflow-hidden shadow-xs">
              <ProductImage
                src={PRODUCT_IMAGES['prod-ankara-dress']?.main}
                alt="Ankara Wrap Dress"
                productName="Ankara Wrap Dress"
                bgTint="#F9ECE8"
                sizes="150px"
              />
            </div>
            <div className="aspect-square rounded-[16px] overflow-hidden shadow-xs">
              <ProductImage
                src={PRODUCT_IMAGES['prod-ultrabook-14']?.main}
                alt="14″ Ultrabook"
                productName="14″ Ultrabook"
                bgTint="#EEF3F8"
                sizes="150px"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-display font-bold text-3xl xl:text-4xl text-[#17211B] leading-tight text-balance">
              Good products shouldn&apos;t be hidden behind WhatsApp groups.
            </h2>
            <p className="text-[16px] text-[#5B6861] leading-relaxed">
              Give your catalogue a home customers can search. They still message
              you on WhatsApp to buy.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#0F7D41] hover:text-[#0B6636]"
            >
              <span>Explore public marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
