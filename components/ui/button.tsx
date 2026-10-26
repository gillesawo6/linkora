import React from 'react';
import { SpeechBubbleIcon } from './linkora-icons';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'whatsapp';
  size?: 'default' | 'sm' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'default',
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-3 focus-visible:ring-[#8AD3A8] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none select-none';

    // PDF spec: "BUTTONS · 46 PX TALL, 12 PX RADIUS"
    const sizeStyles = {
      default: 'h-[46px] px-5 rounded-[12px] text-[15px]',
      sm: 'h-[38px] px-3.5 rounded-[10px] text-[14px]',
      lg: 'h-[50px] px-6 rounded-[14px] text-[16px]',
    }[size];

    let variantStyles = '';

    switch (variant) {
      case 'primary':
        variantStyles =
          'bg-[#0F7D41] hover:bg-[#0B6636] active:bg-[#075E36] text-white shadow-xs';
        break;
      case 'secondary':
        variantStyles =
          'bg-white hover:bg-[#F3F6F4] text-[#17211B] border border-[#E3E9E4] active:bg-[#EAEFEA]';
        break;
      case 'ghost':
        variantStyles =
          'bg-transparent hover:bg-[#E8F7EE] text-[#17211B] hover:text-[#075E36] active:bg-[#D5EEDD]';
        break;
      case 'destructive':
        variantStyles =
          'bg-[#C62828] hover:bg-[#A81F1F] active:bg-[#8A1818] text-white shadow-xs';
        break;
      case 'whatsapp':
        // PDF: "The only place the speech-bubble icon and a full-width green button appear together."
        variantStyles =
          'bg-[#0F7D41] hover:bg-[#0B6636] active:bg-[#075E36] text-white shadow-xs gap-2.5 font-semibold';
        break;
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        {...props}
      >
        {variant === 'whatsapp' && <SpeechBubbleIcon className="w-5 h-5" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
