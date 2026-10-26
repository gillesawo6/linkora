import React from 'react';

interface ProductIllustrationProps {
  type:
    | 'sneaker'
    | 'laptop'
    | 'dress'
    | 'serum'
    | 'phone'
    | 'lamp'
    | 'headphones'
    | 'tote'
    | 'backpack';
  color?: string;
  bgTint?: string;
  className?: string;
}

export function ProductIllustration({
  type,
  color = '#17211B',
  bgTint = '#F3F6F4',
  className = 'w-full h-full',
}: ProductIllustrationProps) {
  return (
    <div
      className={`relative w-full aspect-square rounded-[16px] flex items-center justify-center overflow-hidden transition-transform duration-200 ${className}`}
      style={{ backgroundColor: bgTint }}
    >
      {/* Ground soft shadow */}
      <div
        className="absolute bottom-6 w-3/5 h-2.5 rounded-full bg-black/5 blur-[2px]"
        aria-hidden="true"
      />

      {type === 'sneaker' && (
        <svg
          viewBox="0 0 200 120"
          className="w-[72%] h-[72%] drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sneaker upper */}
          <path
            d="M20 90C30 90 40 70 55 45C65 30 75 40 85 55C95 62 110 58 130 65C150 72 170 85 180 90H20Z"
            fill={color}
          />
          {/* Tongue/collar back */}
          <path
            d="M50 48C45 35 48 25 55 25C62 25 65 35 60 48Z"
            fill={color}
          />
          {/* White sole */}
          <rect x="16" y="90" width="168" height="10" rx="3" fill="#FFFFFF" />
          {/* Lace details / stripe */}
          <path
            d="M85 68L125 84"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M95 56L115 64"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      )}

      {type === 'laptop' && (
        <svg
          viewBox="0 0 200 140"
          className="w-[70%] h-[70%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Laptop display frame */}
          <rect
            x="32"
            y="24"
            width="136"
            height="86"
            rx="6"
            fill={color}
            stroke={color}
            strokeWidth="2"
          />
          {/* Screen inner */}
          <rect x="38" y="30" width="124" height="74" rx="4" fill="#FFFFFF" />
          {/* Screen mock wireframe */}
          <rect x="46" y="38" width="40" height="4" rx="2" fill="#D2DBD5" />
          <rect x="46" y="48" width="60" height="3" rx="1.5" fill="#E4EBE6" />
          <rect x="130" y="55" width="22" height="22" rx="3" fill="#E4EBE6" />
          {/* Laptop base */}
          <path
            d="M16 112C16 110 18 110 24 110H176C182 110 184 110 184 112L172 118H28L16 112Z"
            fill="#CAD3CD"
          />
          {/* Notch */}
          <rect x="90" y="110" width="20" height="2" rx="1" fill="#8E9B93" />
        </svg>
      )}

      {type === 'dress' && (
        <svg
          viewBox="0 0 160 180"
          className="w-[68%] h-[68%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dress body */}
          <path
            d="M60 22C64 32 76 36 80 36C84 36 96 32 100 22L112 36C104 46 102 62 100 75C118 105 132 140 136 158H24C28 140 42 105 60 75C58 62 56 46 48 36L60 22Z"
            fill={color}
          />
          {/* Subtle dots pattern */}
          <circle cx="80" cy="95" r="2.5" fill="#FFFFFF" fillOpacity="0.4" />
          <circle cx="65" cy="115" r="2.5" fill="#FFFFFF" fillOpacity="0.4" />
          <circle cx="95" cy="115" r="2.5" fill="#FFFFFF" fillOpacity="0.4" />
          <circle cx="50" cy="140" r="2.5" fill="#FFFFFF" fillOpacity="0.4" />
          <circle cx="80" cy="140" r="2.5" fill="#FFFFFF" fillOpacity="0.4" />
          <circle cx="110" cy="140" r="2.5" fill="#FFFFFF" fillOpacity="0.4" />
          {/* Waist seam line */}
          <path
            d="M60 75C70 78 90 78 100 75"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
        </svg>
      )}

      {type === 'serum' && (
        <svg
          viewBox="0 0 120 180"
          className="w-[62%] h-[62%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dropper pipette top */}
          <rect x="54" y="16" width="12" height="28" rx="6" fill={color} />
          {/* Dropper collar */}
          <rect x="48" y="44" width="24" height="12" rx="3" fill="#D3DDD5" />
          {/* Bottle body */}
          <rect
            x="36"
            y="56"
            width="48"
            height="90"
            rx="12"
            fill="#FFFFFF"
            stroke={color}
            strokeWidth="3.5"
          />
          {/* Minimalist label */}
          <rect
            x="44"
            y="76"
            width="32"
            height="44"
            rx="4"
            fill="#F3F6F4"
            stroke="#DCE4DF"
            strokeWidth="1"
          />
          <circle cx="60" cy="98" r="4.5" fill={color} />
        </svg>
      )}

      {type === 'phone' && (
        <svg
          viewBox="0 0 120 180"
          className="w-[60%] h-[60%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Smartphone outer */}
          <rect
            x="26"
            y="18"
            width="68"
            height="144"
            rx="16"
            fill={color}
            stroke={color}
            strokeWidth="2"
          />
          {/* Screen area */}
          <rect x="30" y="24" width="60" height="132" rx="12" fill="#FFFFFF" />
          {/* Camera speaker notch */}
          <circle cx="60" cy="34" r="2.5" fill={color} />
          {/* App grid icons on screen */}
          <rect x="42" y="56" width="14" height="14" rx="4" fill="#D6DFD9" />
          <rect x="64" y="56" width="14" height="14" rx="4" fill="#D6DFD9" />
          <rect x="42" y="78" width="14" height="14" rx="4" fill="#D6DFD9" />
          <rect x="64" y="78" width="14" height="14" rx="4" fill="#D6DFD9" />
          {/* Bottom dock */}
          <rect x="40" y="130" width="40" height="4" rx="2" fill={color} />
        </svg>
      )}

      {type === 'lamp' && (
        <svg
          viewBox="0 0 180 180"
          className="w-[66%] h-[66%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Lamp shade */}
          <path d="M50 82L66 40H114L130 82H50Z" fill={color} />
          {/* Shade texture lines */}
          <line x1="72" y1="40" x2="62" y2="82" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="2" />
          <line x1="90" y1="40" x2="90" y2="82" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="2" />
          <line x1="108" y1="40" x2="118" y2="82" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="2" />
          {/* Lamp neck */}
          <rect x="87" y="82" width="6" height="52" fill="#CAD3CD" />
          {/* Lamp base */}
          <ellipse cx="90" cy="138" rx="32" ry="7" fill="#8E9B93" />
        </svg>
      )}

      {type === 'headphones' && (
        <svg
          viewBox="0 0 180 180"
          className="w-[66%] h-[66%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Headband arch */}
          <path
            d="M48 98V80C48 54 67 34 90 34C113 34 132 54 132 80V98"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Left earpad */}
          <rect x="38" y="84" width="20" height="42" rx="10" fill={color} />
          {/* Right earpad */}
          <rect x="122" y="84" width="20" height="42" rx="10" fill={color} />
        </svg>
      )}

      {type === 'tote' && (
        <svg
          viewBox="0 0 180 180"
          className="w-[68%] h-[68%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Tote handles */}
          <path
            d="M72 80V48C72 38 78 30 90 30C102 30 108 38 108 48V80"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Tote body */}
          <path
            d="M44 80L54 146H126L136 80H44Z"
            fill={color}
          />
          {/* Metal latch */}
          <rect x="85" y="88" width="10" height="5" rx="2" fill="#E8D7B8" />
        </svg>
      )}

      {type === 'backpack' && (
        <svg
          viewBox="0 0 180 180"
          className="w-[68%] h-[68%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top handle */}
          <path
            d="M76 50V36C76 30 82 26 90 26C98 26 104 30 104 36V50"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Backpack body */}
          <path
            d="M48 60C48 50 56 46 68 46H112C124 46 132 50 132 60L126 146H54L48 60Z"
            fill={color}
          />
          {/* Front pouch flap */}
          <path
            d="M58 84H122V124H58V84Z"
            fill="#FFFFFF"
            fillOpacity="0.12"
          />
          {/* Buckle strap */}
          <rect x="87" y="98" width="6" height="12" rx="2" fill="#E2E7E4" />
        </svg>
      )}
    </div>
  );
}
