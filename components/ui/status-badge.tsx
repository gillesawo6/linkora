import React from 'react';
import { SyncStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: SyncStatus | string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  let label = '';
  let colorClasses = '';

  switch (status) {
    case 'synced':
      label = 'Synced';
      colorClasses = 'bg-[#E8F7EE] text-[#075E36]'; // green = healthy
      break;
    case 'importing':
      label = 'Importing';
      colorClasses = 'bg-[#EBF3FB] text-[#1E568B]'; // blue = in progress
      break;
    case 'needs_attention':
      label = 'Needs attention';
      colorClasses = 'bg-[#FEF7E6] text-[#8C5800]'; // amber = look at this
      break;
    case 'failed':
      label = 'Failed to sync';
      colorClasses = 'bg-[#FDEAEA] text-[#C62828]'; // red = failed
      break;
    case 'unavailable':
      label = 'Unavailable';
      colorClasses = 'bg-[#F0F2F1] text-[#5B6861]'; // grey = inactive
      break;
    case 'added_here':
      label = 'Added here';
      colorClasses = 'bg-[#E8F7EE] text-[#075E36]';
      break;
    case 'published':
      label = 'Published';
      colorClasses = 'bg-[#E8F7EE] text-[#075E36]';
      break;
    case 'draft':
      label = 'Draft';
      colorClasses = 'bg-[#F0F2F1] text-[#5B6861]';
      break;
    default:
      label = String(status);
      colorClasses = 'bg-[#F0F2F1] text-[#5B6861]';
  }

  // Strictly icon-free as mandated in PDF: "ALWAYS ICON-FREE TEXT + COLOUR"
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12.5px] leading-[1.4] font-semibold tracking-normal ${colorClasses} ${className}`}
    >
      {label}
    </span>
  );
}
