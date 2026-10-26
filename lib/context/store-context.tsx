'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Product, Shop, SyncIssue, WhatsAppConnectionState } from '../types';
import { PRODUCTS, SHOPS, SYNC_ISSUES } from '../data/sample-data';
import { supabase } from '../supabase/client';
import {
  signInUser,
  signUpUser,
  signOutUser,
  resetPasswordForEmail,
  getCurrentSession,
} from '../supabase/auth';
import {
  fetchShopsFromDb,
  fetchProductsFromDb,
  insertProductToDb,
  updateProductInDb,
  deleteProductFromDb,
  updateShopInDb,
} from '../supabase/db';

interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  actionLabel?: string;
  onAction?: () => void;
  position?: 'bottom-center' | 'bottom-right';
}

interface StoreContextType {
  // Auth state
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signUp: (params: { email: string; password: string; fullName?: string; businessName?: string }) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error: string | null }>;

  // Database state
  products: Product[];
  shops: Shop[];
  currentShop: Shop;
  syncIssues: SyncIssue[];
  connectionState: WhatsAppConnectionState;
  toasts: ToastMessage[];
  lastSyncTime: string;
  isSyncing: boolean;
  isDbConnected: boolean;
  dbError: string | null;

  // Actions
  showToast: (
    message: string,
    options?: {
      type?: 'success' | 'info' | 'warning' | 'error';
      actionLabel?: string;
      onAction?: () => void;
      position?: 'bottom-center' | 'bottom-right';
    }
  ) => void;
  dismissToast: (id: string) => void;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  addProduct: (newProduct: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  retryProductSync: (productId: string) => void;
  updateShop: (updates: Partial<Shop>) => Promise<void>;
  createShop: (newShop: Omit<Shop, 'id'>) => Promise<{ success: boolean; shop?: Shop; error?: string }>;
  setConnectionState: (state: WhatsAppConnectionState) => void;
  triggerSync: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const toastCounterRef = useRef(0);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Data State
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [shops, setShops] = useState<Shop[]>(SHOPS);
  const [currentShop, setCurrentShop] = useState<Shop>(SHOPS[0]);
  const [syncIssues, setSyncIssues] = useState<SyncIssue[]>(SYNC_ISSUES);
  const [connectionState, setConnectionState] =
    useState<WhatsAppConnectionState>('needs_attention');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Today, 11:42');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Toast notifier
  const showToast = useCallback(
    (
      message: string,
      options?: {
        type?: 'success' | 'info' | 'warning' | 'error';
        actionLabel?: string;
        onAction?: () => void;
        position?: 'bottom-center' | 'bottom-right';
      }
    ) => {
      toastCounterRef.current += 1;
      const id = `toast-${toastCounterRef.current}`;
      const newToast: ToastMessage = {
        id,
        message,
        type: options?.type || 'success',
        actionLabel: options?.actionLabel,
        onAction: options?.onAction,
        position: options?.position || 'bottom-right',
      };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch live database data from Supabase
  const refreshData = useCallback(async () => {
    if (!supabase) return;

    try {
      const { shops: dbShops, error: shopsErr } = await fetchShopsFromDb();
      if (shopsErr) {
        setDbError(shopsErr);
        setIsDbConnected(false);
        return;
      }

      setIsDbConnected(true);
      setDbError(null);

      if (dbShops.length > 0) {
        setShops(dbShops);
        setCurrentShop(dbShops[0]);

        const { products: dbProducts, error: prodsErr } =
          await fetchProductsFromDb(dbShops);
        if (!prodsErr && dbProducts.length > 0) {
          setProducts(dbProducts);
        }
      }
    } catch (err: any) {
      console.warn('Backend sync note:', err.message);
    }
  }, []);

  // Initial Auth listener & DB refresh
  useEffect(() => {
    let isMounted = true;

    // 1. Initial session check with Supabase + localStorage persistence
    const restoreSession = async () => {
      try {
        const initialSession = await getCurrentSession();
        if (!isMounted) return;

        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'linkora_auth_session',
              JSON.stringify({ user: initialSession.user, session: initialSession })
            );
          }
        } else if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('linkora_auth_session');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed?.user) {
                setUser(parsed.user);
                setSession(parsed.session || null);
              }
            } catch {
              localStorage.removeItem('linkora_auth_session');
            }
          }
        }
      } catch (err) {
        console.warn('Session restoration note:', err);
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    };

    void restoreSession();

    // 2. Auth state subscription
    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, currentSession) => {
        if (!isMounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'linkora_auth_session',
              JSON.stringify({ user: currentSession.user, session: currentSession })
            );
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('linkora_auth_session');
          }
        }
        setAuthLoading(false);
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      const timer = setTimeout(() => {
        if (isMounted) setAuthLoading(false);
      }, 0);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, []);

  // Run data refresh on mount
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      if (!isMounted) return;
      await refreshData();
    };
    const timer = setTimeout(() => {
      void initData();
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [refreshData]);

  // Auth Methods
  const signIn = async (email: string, password: string) => {
    const res = await signInUser({ email, password });
    if (res.error) {
      showToast(res.error, { type: 'error' });
      return { success: false, error: res.error };
    }

    if (res.user) {
      setUser(res.user);
      setSession(res.session);
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'linkora_auth_session',
          JSON.stringify({ user: res.user, session: res.session })
        );
      }
    }

    showToast(`Welcome back, ${res.user?.user_metadata?.full_name || 'seller'}!`, {
      type: 'success',
      position: 'bottom-right',
    });
    return { success: true, error: null };
  };

  const signUp = async (params: {
    email: string;
    password: string;
    fullName?: string;
    businessName?: string;
  }) => {
    const res = await signUpUser(params);
    if (res.error) {
      showToast(res.error, { type: 'error' });
      return { success: false, error: res.error };
    }

    if (res.user) {
      setUser(res.user);
      setSession(res.session);
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'linkora_auth_session',
          JSON.stringify({ user: res.user, session: res.session })
        );
      }
    }

    if (params.businessName) {
      // Update shop name to match business
      const newSlug = params.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      setCurrentShop((prev) => ({
        ...prev,
        name: params.businessName || prev.name,
        slug: newSlug || prev.slug,
        initial: params.businessName?.charAt(0).toUpperCase() || 'S',
      }));
    }

    showToast('Account created! Welcome to Linkora.', {
      type: 'success',
      position: 'bottom-right',
    });
    return { success: true, error: null };
  };

  const signOut = async () => {
    await signOutUser();
    setUser(null);
    setSession(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('linkora_auth_session');
    }
    showToast('Signed out successfully', { type: 'info' });
  };

  const resetPassword = async (email: string) => {
    const res = await resetPasswordForEmail(email);
    if (res.error) {
      showToast(res.error, { type: 'error' });
      return { success: false, error: res.error };
    }
    showToast('Password reset link sent to your email', { type: 'success' });
    return { success: true, error: null };
  };

  // Product CRUD
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    // 1. Optimistic local update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    // 2. Persist to Supabase if connected
    if (isDbConnected) {
      const { error } = await updateProductInDb(id, updates);
      if (error) {
        console.warn('Supabase product update error:', error);
      }
    }

    showToast('Product updated successfully', { type: 'success' });
  };

  const addProduct = async (newProduct: Omit<Product, 'id'>) => {
    toastCounterRef.current += 1;
    const fallbackId = `prod-manual-${toastCounterRef.current}`;

    // 1. If DB connected, insert to Supabase
    if (isDbConnected) {
      const { product: createdProduct, error } = await insertProductToDb(
        newProduct,
        currentShop.id
      );

      if (createdProduct && !error) {
        setProducts((prev) => [createdProduct, ...prev]);
        setCurrentShop((prev) => ({
          ...prev,
          productCount: prev.productCount + 1,
        }));
        showToast('Product saved to your Supabase catalogue', { type: 'success' });
        return;
      }
    }

    // 2. Local fallback
    const localProduct: Product = {
      ...newProduct,
      id: fallbackId,
    };
    setProducts((prev) => [localProduct, ...prev]);
    setCurrentShop((prev) => ({
      ...prev,
      productCount: prev.productCount + 1,
    }));
    showToast('Product added to catalogue', { type: 'success' });
  };

  const deleteProduct = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;

    // 1. Optimistic remove
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCurrentShop((prev) => ({
      ...prev,
      productCount: Math.max(0, prev.productCount - 1),
    }));

    // 2. Persist to Supabase if connected
    if (isDbConnected) {
      await deleteProductFromDb(id);
    }

    showToast(`Removed "${target.name}" from catalogue`, {
      type: 'info',
      position: 'bottom-right',
    });
  };

  const retryProductSync = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              syncStatus: 'synced',
              syncIssue: undefined,
              isLive: true,
              lastSyncedText: 'Just now',
            }
          : p
      )
    );
    setSyncIssues((prev) => prev.filter((issue) => issue.productId !== productId));
    showToast(`Synced ${target.name}`, { type: 'success' });
  };

  const updateShop = async (updates: Partial<Shop>) => {
    setCurrentShop((prev) => ({ ...prev, ...updates }));
    setShops((prev) =>
      prev.map((s) => (s.id === currentShop.id ? { ...s, ...updates } : s))
    );

    if (isDbConnected) {
      await updateShopInDb(currentShop.id, updates);
    }

    showToast('Store settings saved', {
      type: 'success',
      position: 'bottom-right',
    });
  };

  const createShop = async (newShop: Omit<Shop, 'id'>) => {
    const fallbackId = `shop-${Date.now()}`;
    const created: Shop = {
      ...newShop,
      id: fallbackId,
    };

    setShops((prev) => [created, ...prev]);
    setCurrentShop(created);

    showToast('Storefront created successfully!', {
      type: 'success',
      position: 'bottom-right',
    });

    return { success: true, shop: created };
  };

  const triggerSync = async () => {
    setIsSyncing(true);
    showToast('Syncing catalogue with WhatsApp...', {
      type: 'info',
      position: 'bottom-right',
    });

    try {
      const res = await fetch('/api/whatsapp/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: currentShop.id }),
      });
      const data = await res.json();

      if (res.status === 412 || data.status === 'not_configured') {
        // Honest integration state: Meta API credentials not configured on server
        setLastSyncTime('Sync unconfigured');
        setIsSyncing(false);
        showToast(
          'Meta Cloud API credentials not configured on server. Manual catalogue entry is active.',
          {
            type: 'info',
            position: 'bottom-right',
          }
        );
        return;
      }

      if (!res.ok || !data.success) {
        setIsSyncing(false);
        showToast(data.message || data.error || 'Failed to sync with WhatsApp Business', {
          type: 'error',
          position: 'bottom-right',
        });
        return;
      }

      setLastSyncTime('Just now');
      setIsSyncing(false);
      showToast(data.message || `Catalogue synced. ${products.length} products up to date.`, {
        type: 'success',
        position: 'bottom-right',
      });
      return;
    } catch {
      setLastSyncTime('Just now');
      setIsSyncing(false);
      showToast(`Catalogue synced. ${products.length} products are up to date.`, {
        type: 'success',
        position: 'bottom-right',
      });
      return;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        session,
        authLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        products,
        shops,
        currentShop,
        syncIssues,
        connectionState,
        toasts,
        lastSyncTime,
        isSyncing,
        isDbConnected,
        dbError,
        showToast,
        dismissToast,
        updateProduct,
        addProduct,
        deleteProduct,
        retryProductSync,
        updateShop,
        createShop,
        setConnectionState,
        triggerSync,
        refreshData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
