import React from 'react';

// Linkora Brand Icon (4 rounded squares in 2x2 grid with organic aesthetic)
export function LinkoraLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="10.5" height="10.5" rx="3.5" fill="#0F7D41" />
      <rect x="15.5" y="2" width="10.5" height="10.5" rx="3.5" fill="#0F7D41" />
      <rect x="2" y="15.5" width="10.5" height="10.5" rx="3.5" fill="#0F7D41" />
      <rect x="15.5" y="15.5" width="10.5" height="10.5" rx="3.5" fill="#0F7D41" />
    </svg>
  );
}

// In-house Speech Bubble Icon for Linkora "Ask on WhatsApp" button
// "Outline only; drawn in-house so nothing resembles WhatsApp's mark."
export function SpeechBubbleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
