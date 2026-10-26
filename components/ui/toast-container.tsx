'use client';

import React from 'react';
import { useStore } from '@/lib/context/store-context';
import { Check, AlertTriangle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ToastContainer() {
  const { toasts, dismissToast } = useStore();

  const publicToasts = toasts.filter((t) => t.position === 'bottom-center');
  const workspaceToasts = toasts.filter((t) => t.position !== 'bottom-center');

  return (
    <>
      {/* Bottom Center for Public Pages */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none items-center"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {publicToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] bg-[#17211B] text-white text-[14px] shadow-xl border border-white/10"
            >
              {toast.type === 'error' || toast.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-[#F5A623] shrink-0" />
              ) : (
                <Check className="w-4 h-4 text-[#8AD3A8] shrink-0" />
              )}
              <span>{toast.message}</span>
              {toast.actionLabel && toast.onAction && (
                <button
                  type="button"
                  onClick={toast.onAction}
                  className="ml-2 font-semibold text-[#8AD3A8] hover:underline"
                >
                  {toast.actionLabel}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="ml-1 text-white/60 hover:text-white transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Right for Workspace */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none items-end"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {workspaceToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-[12px] bg-[#17211B] text-white text-[14px] shadow-2xl border border-white/10"
            >
              {toast.type === 'warning' || toast.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-[#F5A623] shrink-0" />
              ) : toast.type === 'info' ? (
                <Info className="w-4 h-4 text-[#8AD3A8] shrink-0" />
              ) : (
                <Check className="w-4 h-4 text-[#8AD3A8] shrink-0" />
              )}
              <span>{toast.message}</span>
              {toast.actionLabel && toast.onAction && (
                <button
                  type="button"
                  onClick={toast.onAction}
                  className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  {toast.actionLabel}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="ml-1 text-white/60 hover:text-white transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
