'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  AlertTriangle,
  X,
  ExternalLink,
  RotateCw,
  Info,
  HelpCircle,
  Shield,
  Layers,
  Terminal,
  Settings,
  PlusCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/context/store-context';
import { WhatsAppConnectionState } from '@/lib/types';

export default function WhatsAppConnectionPage() {
  const router = useRouter();
  const {
    currentShop,
    connectionState,
    setConnectionState,
    triggerSync,
    isSyncing,
    showToast,
  } = useStore();

  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [importProgress, setImportProgress] = useState(33);
  const [metaServerStatus, setMetaServerStatus] = useState<any>(null);
  const [isCheckingServer, setIsCheckingServer] = useState(false);
  const [isMetaConfigModalOpen, setIsMetaConfigModalOpen] = useState(false);
  const [activeAuthUrl, setActiveAuthUrl] = useState<string>('');

  // Handle URL callback parameters from Meta OAuth
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const error = params.get('error');
    const message = params.get('message');

    if (status === 'connected') {
      setConnectionState('connected');
      showToast('WhatsApp Business successfully connected!', { type: 'success' });
      window.history.replaceState({}, '', '/seller/connection');
    } else if (error) {
      showToast(message || `Connection failed: ${error}`, { type: 'error' });
      window.history.replaceState({}, '', '/seller/connection');
    }
  }, [setConnectionState, showToast]);

  useEffect(() => {
    let isMounted = true;
    async function checkServer() {
      setIsCheckingServer(true);
      try {
        const res = await fetch('/api/whatsapp/status');
        const data = await res.json();
        if (isMounted) {
          setMetaServerStatus(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setIsCheckingServer(false);
      }
    }
    checkServer();
    return () => {
      isMounted = false;
    };
  }, []);

  const startConnectFlow = async () => {
    try {
      const res = await fetch(`/api/whatsapp/auth/start?shopId=${encodeURIComponent(currentShop.id)}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setIsMetaConfigModalOpen(true);
        return;
      }
      if (data.authUrl) {
        setActiveAuthUrl(data.authUrl);
        setConnectionState('awaiting_auth');
        window.open(data.authUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      setIsMetaConfigModalOpen(true);
    }
  };

  const handleApproveMeta = () => {
    setConnectionState('connecting');
    setTimeout(() => {
      setConnectionState('importing');
      setTimeout(() => {
        setConnectionState('connected');
        showToast('WhatsApp Business successfully connected!', {
          type: 'success',
        });
      }, 2500);
    }, 1500);
  };

  const handleDisconnect = async () => {
    setIsDisconnectModalOpen(false);
    try {
      await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: currentShop.id }),
      });
    } catch (e) {
      console.error(e);
    }
    setConnectionState('not_connected');
    showToast('WhatsApp Business disconnected', { type: 'info' });
  };

  const statesList: { id: WhatsAppConnectionState; label: string }[] = [
    { id: 'not_connected', label: '1. Not connected' },
    { id: 'awaiting_auth', label: '2. Awaiting auth' },
    { id: 'connecting', label: '3. Connecting' },
    { id: 'importing', label: '4. Importing' },
    { id: 'connected', label: '5. Connected' },
    { id: 'syncing', label: '6. Sync in progress' },
    { id: 'needs_attention', label: '7. Needs attention' },
    { id: 'expired', label: '8. Connection expired' },
    { id: 'unsupported', label: '9. Unsupported' },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <nav className="flex items-center gap-2 text-[13px] text-[#5B6861] mb-2">
          <Link href="/seller/overview" className="hover:text-[#17211B]">
            Overview
          </Link>
          <span>/</span>
          <span className="text-[#17211B] font-medium">WhatsApp connection</span>
        </nav>
        <h1 className="font-display font-bold text-3xl text-[#17211B]">
          WhatsApp connection
        </h1>
        <p className="text-[14.5px] text-[#5B6861] mt-1">
          Link your WhatsApp Business catalogue so your products appear in your
          storefront and in search.
        </p>
      </div>

      {/* Real Meta Cloud API Server Status & Manual Fallback */}
      <div className="p-4 sm:p-5 rounded-[20px] bg-white border border-[#E3E9E4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#5B6861]">
              Meta Cloud API Status
            </span>
            <span
              className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                metaServerStatus?.configured
                  ? 'bg-[#E8F7EE] text-[#075E36]'
                  : 'bg-[#FEF7E6] text-[#8C5800]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  metaServerStatus?.configured ? 'bg-[#0F7D41]' : 'bg-[#E69B00]'
                }`}
              />
              <span>
                {metaServerStatus?.configured
                  ? 'Ready for Meta OAuth'
                  : 'API Setup Required for Auto-Sync'}
              </span>
            </span>
          </div>
          <p className="text-[13px] text-[#5B6861] leading-relaxed">
            {metaServerStatus?.configured
              ? 'Server has Meta App ID configured. Sellers can authorize catalogue reading.'
              : 'Automatic sync requires Meta App credentials on the server. You can manage and publish products manually without waiting.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Link href="/seller/products?action=new">
            <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
              <PlusCircle className="w-3.5 h-3.5 text-[#0F7D41]" />
              <span>Add products manually</span>
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMetaConfigModalOpen(true)}
            className="text-xs text-[#5B6861] hover:text-[#17211B]"
          >
            Setup Guide
          </Button>
        </div>
      </div>

      {/* Prototype Notice & Quick State Switcher (as specified in PDF page 17 & 21) */}
      <div className="p-4 rounded-[16px] bg-white border border-[#E3E9E4] space-y-3">
        <div className="flex items-start gap-3 text-[13.5px] text-[#5B6861]">
          <Info className="w-4 h-4 text-[#0F7D41] shrink-0 mt-0.5" />
          <span>
            <strong>Design prototype:</strong> These states are simulated with
            sample data. You can switch between any of the 9 states defined in the
            design document:
          </span>
        </div>

        {/* State tabs switcher */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {statesList.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setConnectionState(st.id)}
              className={`px-3 py-1.5 rounded-[8px] text-[12.5px] font-medium transition-colors ${
                connectionState === st.id
                  ? 'bg-[#0F7D41] text-white shadow-xs'
                  : 'bg-[#F3F6F4] text-[#17211B] hover:bg-[#E8F7EE]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: THE STATE MACHINE PANEL */}
        <div className="lg:col-span-8 bg-white rounded-[24px] border border-[#E3E9E4] p-6 sm:p-8 space-y-6">
          {/* Step Pill Indicators (1 Authorise, 2 Import, 3 Review & publish) */}
          <div className="flex items-center gap-2 sm:gap-4 pb-4 border-b border-[#E3E9E4] text-[13px] font-medium text-[#5B6861] overflow-x-auto">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                connectionState === 'not_connected' ||
                connectionState === 'awaiting_auth' ||
                connectionState === 'connecting'
                  ? 'bg-[#E8F7EE] text-[#075E36] font-semibold'
                  : 'bg-[#F3F6F4]'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white text-[#075E36] font-bold text-xs flex items-center justify-center">
                1
              </span>
              <span>Authorise</span>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                connectionState === 'importing' || connectionState === 'syncing'
                  ? 'bg-[#E8F7EE] text-[#075E36] font-semibold'
                  : 'bg-[#F3F6F4]'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white text-[#075E36] font-bold text-xs flex items-center justify-center">
                2
              </span>
              <span>Import</span>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                connectionState === 'connected' ||
                connectionState === 'needs_attention'
                  ? 'bg-[#E8F7EE] text-[#075E36] font-semibold'
                  : 'bg-[#F3F6F4]'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white text-[#075E36] font-bold text-xs flex items-center justify-center">
                3
              </span>
              <span>Review & publish</span>
            </div>
          </div>

          {/* STATE 1: NOT CONNECTED (PDF Page 21) */}
          {connectionState === 'not_connected' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#5B6861]">
                <span className="w-2 h-2 rounded-full bg-[#8E9B93]" />
                <span>Not connected</span>
              </div>

              <div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#17211B]">
                  Connect your WhatsApp Business catalogue
                </h2>
                <p className="mt-2 text-[15px] text-[#5B6861] leading-relaxed">
                  Import the products you already sell on WhatsApp and get a
                  storefront customers can search. You stay in control of what is
                  shared.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-[13px] font-semibold tracking-wider uppercase text-[#17211B]">
                  WHAT YOU GET
                </h3>
                <div className="space-y-3 text-[14.5px]">
                  <div className="flex items-start gap-3 p-3.5 rounded-[12px] bg-[#F7F9F7] border border-[#E3E9E4]">
                    <Check className="w-4 h-4 text-[#0F7D41] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-[#17211B]">
                        Products imported automatically:
                      </span>{' '}
                      <span className="text-[#5B6861]">
                        Names, prices, photos and descriptions, where Meta’s APIs
                        allow it.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-[12px] bg-[#F7F9F7] border border-[#E3E9E4]">
                    <Check className="w-4 h-4 text-[#0F7D41] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-[#17211B]">
                        A shareable storefront:
                      </span>{' '}
                      <span className="text-[#5B6861]">
                        Search, categories and filters on your own page.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-[12px] bg-[#F7F9F7] border border-[#E3E9E4]">
                    <Check className="w-4 h-4 text-[#0F7D41] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-[#17211B]">
                        Customers still message you on WhatsApp:
                      </span>{' '}
                      <span className="text-[#5B6861]">
                        No checkout and no commission.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-[13px] font-semibold tracking-wider uppercase text-[#17211B]">
                  PERMISSIONS WE&apos;LL ASK META FOR
                </h3>
                <div className="space-y-2 text-[14px]">
                  <div className="flex items-start gap-2.5 p-3 rounded-[10px] bg-[#F7F9F7]">
                    <Info className="w-4 h-4 text-[#0F7D41] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-[#17211B]">
                        Read your business catalogue
                      </p>
                      <p className="text-[13px] text-[#5B6861]">
                        Product names, prices, images and availability. Read-only.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-[10px] bg-[#F7F9F7]">
                    <Info className="w-4 h-4 text-[#0F7D41] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-[#17211B]">
                        Read your business profile
                      </p>
                      <p className="text-[13px] text-[#5B6861]">
                        Business name and category, to pre-fill your store.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[13px] text-[#5B6861] pt-1">
                  We never read your chats, groups or contacts. Nothing from
                  private conversations becomes public.
                </p>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Button onClick={startConnectFlow} size="lg">
                  Connect WhatsApp Business
                </Button>
                <button
                  type="button"
                  onClick={() => setConnectionState('unsupported')}
                  className="text-[14px] text-[#5B6861] hover:text-[#17211B] font-medium"
                >
                  What&apos;s supported?
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: AWAITING AUTHORISATION (PDF Page 21) */}
          {connectionState === 'awaiting_auth' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1E568B]">
                <span className="w-2 h-2 rounded-full bg-[#1E568B] animate-pulse" />
                <span>Waiting for authorisation</span>
              </div>

              <div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#17211B]">
                  Approve access in the Meta window
                </h2>
                <p className="mt-2 text-[15px] text-[#5B6861]">
                  We opened Meta’s authorisation screen in a new window. Choose
                  your business account and catalogue, then approve read-only
                  access.
                </p>
              </div>

              <div className="p-5 rounded-[16px] bg-[#F7F9F7] border border-[#E3E9E4] space-y-3">
                <h3 className="text-[13px] font-semibold tracking-wider uppercase text-[#17211B]">
                  IN THE META WINDOW
                </h3>
                <ol className="space-y-2 text-[14px] text-[#17211B]">
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white border border-[#E3E9E4] text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <span>Choose your business account</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white border border-[#E3E9E4] text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <span>Select the catalogue to share</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white border border-[#E3E9E4] text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <span>Approve read-only access</span>
                  </li>
                </ol>
                <p className="text-[12.5px] text-[#5B6861] pt-2">
                  Nothing is connected until you approve. You can cancel at any
                  time.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button onClick={handleApproveMeta}>
                  I&apos;ve approved access
                </Button>
                {activeAuthUrl ? (
                  <a
                    href={activeAuthUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-10 px-4 rounded-[12px] bg-[#F3F6F4] text-[#17211B] hover:bg-[#E3E9E4] font-medium text-[14px]"
                  >
                    Open the window again
                  </a>
                ) : (
                  <Button variant="secondary" onClick={startConnectFlow}>
                    Open the window again
                  </Button>
                )}
                <button
                  onClick={() => setConnectionState('not_connected')}
                  className="px-4 py-2 text-[14px] text-[#5B6861] hover:text-[#17211B]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: CONNECTING (PDF Page 21) */}
          {connectionState === 'connecting' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1E568B]">
                <span className="w-2 h-2 rounded-full bg-[#1E568B] animate-pulse" />
                <span>Connecting</span>
              </div>

              <div>
                <h2 className="font-display font-bold text-2xl text-[#17211B]">
                  Checking your account…
                </h2>
                <p className="mt-2 text-[15px] text-[#5B6861]">
                  Meta approved the request. We’re confirming which business
                  account and catalogue we can read.
                </p>
              </div>

              <div className="p-5 rounded-[16px] bg-[#F7F9F7] border border-[#E3E9E4] space-y-4">
                <div className="flex items-center justify-between text-[13.5px]">
                  <span className="font-medium text-[#17211B]">
                    Verifying access with Meta
                  </span>
                  <span className="text-[#5B6861]">Usually a few seconds</span>
                </div>
                <div className="flex items-center gap-2 text-[14px] text-[#075E36]">
                  <Check className="w-4 h-4 text-[#0F7D41]" />
                  <span>Authorisation received</span>
                </div>
                <div className="flex items-center gap-2 text-[14px] text-[#1E568B]">
                  <RotateCw className="w-4 h-4 animate-spin text-[#1E568B]" />
                  <span>Checking catalogue access...</span>
                </div>
              </div>
            </div>
          )}

          {/* STATE 4: IMPORTING CATALOGUE (PDF Page 21 & 22) */}
          {connectionState === 'importing' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1E568B]">
                <span className="w-2 h-2 rounded-full bg-[#1E568B] animate-pulse" />
                <span>Importing catalogue</span>
              </div>

              <div>
                <h2 className="font-display font-bold text-2xl text-[#17211B]">
                  Importing your catalogue
                </h2>
                <p className="mt-2 text-[15px] text-[#5B6861]">
                  Products are being copied from WhatsApp Business. You can
                  leave this page; the import keeps running.
                </p>
              </div>

              {/* Progress bar container */}
              <div className="space-y-2">
                <div className="flex justify-between text-[14px] font-medium text-[#17211B]">
                  <span>Importing products</span>
                  <span className="tabular-nums font-mono">
                    {importProgress} of 52
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#E3E9E4] overflow-hidden">
                  <div
                    className="h-full bg-[#0F7D41] transition-all duration-300"
                    style={{ width: `${(importProgress / 52) * 100}%` }}
                  />
                </div>
              </div>

              {/* Counts */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-[14px] bg-[#F7F9F7] border border-[#E3E9E4]">
                  <p className="font-display font-bold text-2xl text-[#17211B] tabular-nums">
                    {importProgress}
                  </p>
                  <p className="text-[12px] text-[#5B6861] mt-0.5">Imported</p>
                </div>
                <div className="p-4 rounded-[14px] bg-[#FEF7E6] border border-[#F5D899]">
                  <p className="font-display font-bold text-2xl text-[#8C5800] tabular-nums">
                    2
                  </p>
                  <p className="text-[12px] text-[#8C5800] mt-0.5">
                    Need attention
                  </p>
                </div>
                <div className="p-4 rounded-[14px] bg-[#F7F9F7] border border-[#E3E9E4]">
                  <p className="font-display font-bold text-2xl text-[#5B6861] tabular-nums">
                    {52 - importProgress}
                  </p>
                  <p className="text-[12px] text-[#5B6861] mt-0.5">Remaining</p>
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={() => setConnectionState('connected')}>
                  Finish import simulation
                </Button>
              </div>
            </div>
          )}

          {/* STATE 5: SUCCESSFULLY CONNECTED (PDF Page 22) */}
          {connectionState === 'connected' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#075E36]">
                <span className="w-2 h-2 rounded-full bg-[#0F7D41]" />
                <span>Connected</span>
              </div>

              <div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#17211B]">
                  WhatsApp Business is connected
                </h2>
                <p className="mt-2 text-[15px] text-[#5B6861]">
                  Your catalogue is synchronised. Changes you make in WhatsApp
                  Business are picked up automatically.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-[14px] bg-[#F7F9F7] border border-[#E3E9E4]">
                  <p className="font-display font-bold text-2xl text-[#17211B]">
                    52
                  </p>
                  <p className="text-[12px] text-[#5B6861]">Imported</p>
                </div>
                <div className="p-4 rounded-[14px] bg-[#E8F7EE] border border-[#8AD3A8]/40">
                  <p className="font-display font-bold text-2xl text-[#075E36]">
                    52
                  </p>
                  <p className="text-[12px] text-[#075E36]">
                    Live in your store
                  </p>
                </div>
                <div className="p-4 rounded-[14px] bg-[#F7F9F7] border border-[#E3E9E4]">
                  <p className="font-display font-bold text-2xl text-[#17211B]">
                    0
                  </p>
                  <p className="text-[12px] text-[#5B6861]">Need attention</p>
                </div>
              </div>

              {/* Connection Details */}
              <div className="p-5 rounded-[16px] bg-[#F7F9F7] border border-[#E3E9E4] space-y-3 text-[14px]">
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[#17211B]">
                  CONNECTION DETAILS
                </h3>
                <dl className="divide-y divide-[#E3E9E4]">
                  <div className="py-2 flex justify-between">
                    <dt className="text-[#5B6861]">Business account</dt>
                    <dd className="font-medium text-[#17211B]">
                      {currentShop.name}
                    </dd>
                  </div>
                  <div className="py-2 flex justify-between">
                    <dt className="text-[#5B6861]">WhatsApp number</dt>
                    <dd className="font-medium text-[#17211B] font-mono">
                      {currentShop.displayPhone}
                    </dd>
                  </div>
                  <div className="py-2 flex justify-between">
                    <dt className="text-[#5B6861]">Catalogue</dt>
                    <dd className="font-medium text-[#17211B]">
                      {currentShop.name} Catalogue
                    </dd>
                  </div>
                  <div className="py-2 flex justify-between">
                    <dt className="text-[#5B6861]">Last synchronised</dt>
                    <dd className="font-medium text-[#17211B]">Today, 11:42</dd>
                  </div>
                  <div className="py-2 flex justify-between">
                    <dt className="text-[#5B6861]">Automatic sync</dt>
                    <dd className="font-semibold text-[#0F7D41]">On</dd>
                  </div>
                </dl>
              </div>

              <p className="text-[13.5px] text-[#5B6861]">
                Your store is ready to review and publish.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href={`/shops/${currentShop.slug}`}
                  target="_blank"
                  className="h-11 px-5 rounded-[12px] bg-[#0F7D41] hover:bg-[#0B6636] text-white text-[14px] font-semibold flex items-center gap-2"
                >
                  <span>Review your store</span>
                </Link>
                <Button
                  variant="secondary"
                  onClick={triggerSync}
                  disabled={isSyncing}
                >
                  Sync now
                </Button>
                <button
                  type="button"
                  onClick={() => setIsDisconnectModalOpen(true)}
                  className="text-[14px] font-medium text-[#C62828] hover:underline px-3 py-2"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {/* STATE 6: SYNCHRONISATION IN PROGRESS (PDF Page 22) */}
          {connectionState === 'syncing' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1E568B]">
                <span className="w-2 h-2 rounded-full bg-[#1E568B] animate-pulse" />
                <span>Synchronising</span>
              </div>

              <div>
                <h2 className="font-display font-bold text-2xl text-[#17211B]">
                  Synchronising changes
                </h2>
                <p className="mt-2 text-[15px] text-[#5B6861]">
                  Checking your catalogue for new, changed and removed products.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[14px] font-medium text-[#17211B]">
                  <span>Checking products</span>
                  <span className="font-mono">21 of 52</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#E3E9E4] overflow-hidden">
                  <div className="h-full bg-[#1E568B] w-2/5 animate-pulse" />
                </div>
              </div>

              <p className="text-[13px] text-[#5B6861]">
                Your public store stays available while this runs.
              </p>
            </div>
          )}

          {/* STATE 7: SYNCHRONISATION NEEDS ATTENTION (PDF Page 22 & 23) */}
          {connectionState === 'needs_attention' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#8C5800]">
                <span className="w-2 h-2 rounded-full bg-[#E5A000]" />
                <span>Needs attention</span>
              </div>

              <div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#17211B]">
                  Connected, but some products need attention
                </h2>
                <p className="mt-2 text-[15px] text-[#5B6861]">
                  The last sync finished with 3 problems. Everything else is up
                  to date and live in your store.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-[14px] bg-[#F7F9F7] border border-[#E3E9E4]">
                  <p className="font-display font-bold text-2xl text-[#17211B]">
                    52
                  </p>
                  <p className="text-[12px] text-[#5B6861]">Imported</p>
                </div>
                <div className="p-4 rounded-[14px] bg-[#E8F7EE] border border-[#8AD3A8]/40">
                  <p className="font-display font-bold text-2xl text-[#075E36]">
                    49
                  </p>
                  <p className="text-[12px] text-[#075E36]">
                    Live in your store
                  </p>
                </div>
                <div className="p-4 rounded-[14px] bg-[#FEF7E6] border border-[#F5D899]">
                  <p className="font-display font-bold text-2xl text-[#8C5800]">
                    3
                  </p>
                  <p className="text-[12px] text-[#8C5800]">Need attention</p>
                </div>
              </div>

              {/* What went wrong (PDF Page 23) */}
              <div className="p-5 rounded-[16px] bg-[#FEF7E6] border border-[#F5D899] space-y-3 text-[14px]">
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[#8C5800]">
                  WHAT WENT WRONG
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#8C5800] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                      !
                    </span>
                    <div>
                      <p className="font-semibold text-[#17211B]">
                        2 product images couldn&apos;t be downloaded
                      </p>
                      <p className="text-[13px] text-[#5B6861]">
                        Canvas Backpack, navy · Woven Clutch, black. Meta
                        returned a temporary error.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#C62828] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                      ×
                    </span>
                    <div>
                      <p className="font-semibold text-[#17211B]">
                        1 product failed to import
                      </p>
                      <p className="text-[13px] text-[#5B6861]">
                        Weekend Duffel, stone. Required details are missing in
                        WhatsApp.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[12.5px] text-[#5B6861] pt-1">
                  These products are hidden from your public store until they
                  sync. Retrying fixes temporary errors. Missing details must be
                  updated in WhatsApp Business.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => {
                    showToast('Retrying failed items...', { type: 'info' });
                    setTimeout(() => {
                      showToast('Synced 2 items successfully', {
                        type: 'success',
                      });
                    }, 1200);
                  }}
                >
                  Retry failed items
                </Button>
                <Link
                  href="/seller/products"
                  className="h-11 px-4 rounded-[12px] bg-white border border-[#E3E9E4] hover:bg-[#F3F6F4] text-[#17211B] text-[14px] font-medium flex items-center"
                >
                  View affected products
                </Link>
                <button
                  type="button"
                  onClick={() => setIsDisconnectModalOpen(true)}
                  className="text-[14px] font-medium text-[#C62828] hover:underline px-3"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {/* STATE 8: CONNECTION EXPIRED OR REVOKED (PDF Page 22 & 23) */}
          {connectionState === 'expired' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#8C5800]">
                <span className="w-2 h-2 rounded-full bg-[#E5A000]" />
                <span>Connection expired</span>
              </div>

              <div>
                <h2 className="font-display font-bold text-2xl text-[#17211B]">
                  Your connection has expired
                </h2>
                <p className="mt-2 text-[15px] text-[#5B6861]">
                  Meta no longer lets us read your catalogue, so new changes
                  aren’t coming through.
                </p>
              </div>

              <div className="p-5 rounded-[16px] bg-[#F7F9F7] border border-[#E3E9E4] space-y-3 text-[14px]">
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[#17211B]">
                  RIGHT NOW
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#075E36]">
                    <Check className="w-4 h-4 text-[#0F7D41]" />
                    <span>Your store is still online (52 products)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#C62828]">
                    <X className="w-4 h-4 text-[#C62828]" />
                    <span>
                      Nothing is updating until you reconnect WhatsApp Business
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button onClick={() => setConnectionState('connected')}>
                  Reconnect WhatsApp Business
                </Button>
                <button
                  type="button"
                  onClick={() => setIsDisconnectModalOpen(true)}
                  className="text-[14px] font-medium text-[#C62828] hover:underline px-3"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {/* STATE 9: UNSUPPORTED CATALOGUE OR ACCOUNT (PDF Page 23) */}
          {connectionState === 'unsupported' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#C62828]">
                <span className="w-2 h-2 rounded-full bg-[#C62828]" />
                <span>Unsupported account</span>
              </div>

              <div>
                <h2 className="font-display font-bold text-2xl text-[#17211B]">
                  We can’t import this catalogue yet
                </h2>
                <p className="mt-2 text-[15px] text-[#5B6861]">
                  The account you selected can’t be read through Meta’s catalogue
                  access. Nothing was imported or published.
                </p>
              </div>

              <div className="p-5 rounded-[16px] bg-[#FDEAEA] border border-[#F5BABA] space-y-2 text-[14px]">
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[#C62828]">
                  WHAT WE FOUND
                </h3>
                <p className="font-medium text-[#17211B]">
                  × No catalogue on this account
                </p>
                <p className="text-[13px] text-[#5B6861]">
                  We could see a business profile but no products to import.
                  Personal WhatsApp accounts require WhatsApp Business.
                </p>
              </div>

              <div className="p-5 rounded-[16px] bg-[#F7F9F7] border border-[#E3E9E4] space-y-3 text-[14px]">
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[#17211B]">
                  HOW TO FIX IT
                </h3>
                <ol className="space-y-2 text-[13.5px] text-[#17211B]">
                  <li>
                    1. <strong>Use a WhatsApp Business account:</strong> Switch
                    your number in the WhatsApp Business app.
                  </li>
                  <li>
                    2. <strong>Add your products to a catalogue:</strong> In
                    WhatsApp Business, open Settings, then Catalogue.
                  </li>
                  <li>
                    3. <strong>Try connecting again:</strong> We will re-read
                    your catalogue.
                  </li>
                </ol>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button onClick={() => setConnectionState('awaiting_auth')}>
                  Try again
                </Button>
                <Link
                  href="/seller/products"
                  className="h-11 px-4 rounded-[12px] bg-white border border-[#E3E9E4] hover:bg-[#F3F6F4] text-[#17211B] text-[14px] font-medium flex items-center"
                >
                  Add products manually
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: HELPER PANELS (PDF Page 17 & 21) */}
        <div className="lg:col-span-4 space-y-6">
          {/* What we can and can't see */}
          <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-6 space-y-4 text-[13.5px]">
            <div className="flex items-center gap-2 text-[#17211B] font-semibold">
              <Shield className="w-4 h-4 text-[#0F7D41]" />
              <span>What we can and can&apos;t see</span>
            </div>

            <div className="space-y-3 leading-relaxed">
              <div>
                <p className="font-semibold text-[#075E36]">Can read:</p>
                <p className="text-[#5B6861]">
                  Catalogue products, prices, images, business name.
                </p>
              </div>

              <div>
                <p className="font-semibold text-[#C62828]">Can&apos;t read:</p>
                <p className="text-[#5B6861]">
                  Chats, groups, contacts or message history.
                </p>
              </div>

              <div>
                <p className="font-semibold text-[#C62828]">Can&apos;t do:</p>
                <p className="text-[#5B6861]">
                  Send messages for you, or change anything in your WhatsApp
                  account.
                </p>
              </div>
            </div>

            <p className="text-[12.5px] text-[#8E9B93] pt-2 border-t border-[#E3E9E4]">
              You can revoke access at any time, here or in your Meta settings.
            </p>
          </div>

          {/* Need a hand? */}
          <div className="bg-white rounded-[20px] border border-[#E3E9E4] p-6 space-y-3 text-[13.5px]">
            <h3 className="font-display font-bold text-base text-[#17211B]">
              Need a hand?
            </h3>
            <p className="text-[#5B6861] leading-relaxed">
              If your account isn&apos;t supported or the connection keeps
              failing, our help centre explains each error and what to do next.
            </p>
            <button
              type="button"
              onClick={() =>
                showToast('Connecting to WhatsApp Business setup guide...', {
                  type: 'info',
                })
              }
              className="text-[#0F7D41] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Read the connection guide</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* DISCONNECT CONFIRMATION MODAL WITH ANIMATION (PDF Page 6) */}
      <AnimatePresence>
        {isDisconnectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setIsDisconnectModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white rounded-[20px] max-w-md w-full p-6 space-y-4 shadow-2xl z-10"
            >
              <h3 className="font-display font-bold text-xl text-[#17211B]">
                Disconnect WhatsApp Business?
              </h3>
              <p className="text-[14.5px] text-[#5B6861] leading-relaxed">
                Syncing will stop. Your products stay in your store unless you
                choose to remove them.
              </p>
              <div className="pt-3 flex items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setIsDisconnectModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* META CLOUD API CONFIGURATION MODAL */}
      <AnimatePresence>
        {isMetaConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setIsMetaConfigModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-xl text-[#17211B] flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#0F7D41]" />
                    <span>Meta Cloud API Setup</span>
                  </h3>
                  <p className="text-[13.5px] text-[#5B6861] mt-1">
                    To authenticate sellers and fetch official WhatsApp Business catalogues automatically:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMetaConfigModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B6861] hover:bg-[#F3F6F4]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-[13.5px]">
                <div className="p-3.5 rounded-[12px] bg-[#F7F9F7] border border-[#E3E9E4] space-y-2 font-mono text-[12.5px]">
                  <p className="text-[#17211B] font-semibold font-sans">Required Server Variables:</p>
                  <div className="space-y-1 text-[#075E36]">
                    <div>META_APP_ID=&quot;...&quot;</div>
                    <div>META_APP_SECRET=&quot;...&quot;</div>
                    <div>WHATSAPP_BUSINESS_ACCOUNT_ID=&quot;...&quot;</div>
                    <div>META_OAUTH_REDIRECT_URI=&quot;...&quot;</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-[#17211B]">Official Meta Requirements:</p>
                  <ul className="space-y-1.5 text-[#5B6861] list-disc list-inside">
                    <li>Meta Developer App with <strong>WhatsApp Business Platform</strong> added</li>
                    <li>Permissions: <code>whatsapp_business_management</code> &amp; <code>catalog_management</code></li>
                    <li>Standard Meta Login for Business OAuth redirect flow</li>
                  </ul>
                </div>

                <div className="p-3 rounded-[12px] bg-[#E8F7EE] border border-[#BDE3CC] text-[13px] text-[#075E36]">
                  <strong>Manual catalogue entry:</strong> You can create and publish your products directly in Linkora right now without waiting for Meta review!
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Link href="/seller/products?action=new" onClick={() => setIsMetaConfigModalOpen(false)}>
                  <Button variant="secondary">Add product manually</Button>
                </Link>
                <Button onClick={() => setIsMetaConfigModalOpen(false)}>
                  Got it
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
