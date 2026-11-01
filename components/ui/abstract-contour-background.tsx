import React from 'react';

interface AbstractContourBackgroundProps {
  className?: string;
  variant?: 'hero' | 'subtle' | 'banner';
}

export function AbstractContourBackground({
  className = '',
  variant = 'hero',
}: AbstractContourBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
    >
      {/* AMBIENT LIGHTING FIELD 1: Primary Emerald Radiance (Upper Right / Center) */}
      <div
        className="absolute -top-32 right-1/4 w-[540px] sm:w-[720px] h-[480px] rounded-full opacity-70 blur-[90px] -z-10"
        style={{
          background:
            'radial-gradient(circle at center, rgba(15, 125, 65, 0.14) 0%, rgba(138, 211, 168, 0.08) 45%, transparent 75%)',
        }}
      />

      {/* AMBIENT LIGHTING FIELD 2: Warm Solar / Sand Depth (Lower Left) */}
      <div
        className="absolute top-1/4 -left-20 w-[420px] sm:w-[600px] h-[450px] rounded-full opacity-65 blur-[100px] -z-10"
        style={{
          background:
            'radial-gradient(circle at center, rgba(235, 185, 120, 0.15) 0%, rgba(250, 243, 234, 0.06) 50%, transparent 75%)',
        }}
      />

      {/* AMBIENT LIGHTING FIELD 3: Equatorial Mint Halo (Right Side Behind Cards) */}
      <div
        className="absolute top-12 right-0 w-[460px] h-[520px] rounded-full opacity-55 blur-[85px] -z-10"
        style={{
          background:
            'radial-gradient(circle at center, rgba(138, 211, 168, 0.16) 0%, rgba(232, 247, 238, 0.06) 60%, transparent 80%)',
        }}
      />

      {/* ORGANIC TOPOGRAPHIC CONTOURS & FLOWING VECTOR ART */}
      <svg
        className="absolute inset-0 w-full h-full object-cover"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 760"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Subtle gradient strokes for contour waves */}
          <linearGradient id="contourStroke1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F7D41" stopOpacity="0.04" />
            <stop offset="50%" stopColor="#0F7D41" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#8AD3A8" stopOpacity="0.03" />
          </linearGradient>

          <linearGradient id="contourStroke2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#075E36" stopOpacity="0.09" />
            <stop offset="60%" stopColor="#0F7D41" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#E69B00" stopOpacity="0.04" />
          </linearGradient>

          <linearGradient id="translucentFill1" x1="0%" y1="20%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#E8F7EE" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#8AD3A8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FAF3EA" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="translucentFill2" x1="90%" y1="10%" x2="10%" y2="90%">
            <stop offset="0%" stopColor="#FAF3EA" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#E8F7EE" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Micro dot pattern for subtle cartographic / tactile presence */}
          <pattern id="cartoGrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.75" fill="#0F7D41" fillOpacity="0.07" />
          </pattern>
        </defs>

        {/* Tactile grid field */}
        <rect width="100%" height="100%" fill="url(#cartoGrid)" opacity="0.8" />

        {/* TRANSLUCENT ORGANIC DEPTH SHAPES */}
        <path
          d="M 680 -60 Q 940 120 1180 40 T 1500 240 L 1500 -60 Z"
          fill="url(#translucentFill1)"
        />
        <path
          d="M -60 220 C 140 320 280 180 480 340 C 620 450 740 380 920 480 L -60 520 Z"
          fill="url(#translucentFill2)"
          opacity="0.6"
        />

        {/* FLOWING TOPOGRAPHIC CONTOUR LINES */}
        {/* Tier 1: Primary sweeping ridge */}
        <path
          d="M -100 180 C 180 80, 420 320, 760 190 C 1040 90, 1260 260, 1540 140"
          stroke="url(#contourStroke1)"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          strokeLinecap="round"
        />

        {/* Tier 2: Secondary undulating contour */}
        <path
          d="M -80 230 C 220 130, 460 370, 800 240 C 1080 140, 1300 310, 1560 190"
          stroke="url(#contourStroke2)"
          strokeWidth="1.25"
          strokeLinecap="round"
        />

        {/* Tier 3: Third harmonic contour line */}
        <path
          d="M -60 280 C 260 180, 500 420, 840 290 C 1120 190, 1340 360, 1580 240"
          stroke="url(#contourStroke1)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Tier 4: Bottom ambient flow */}
        <path
          d="M -40 330 C 300 230, 540 470, 880 340 C 1160 240, 1380 410, 1600 290"
          stroke="url(#contourStroke2)"
          strokeWidth="1"
          strokeOpacity="0.6"
          strokeLinecap="round"
        />

        {/* Tier 5: Ultra-soft deep baseline */}
        <path
          d="M -20 380 C 340 280, 580 520, 920 390 C 1200 290, 1420 460, 1620 340"
          stroke="url(#contourStroke1)"
          strokeWidth="0.8"
          strokeOpacity="0.5"
          strokeLinecap="round"
        />

        {/* High-elevation crest in upper right (behind product showcase) */}
        <path
          d="M 880 40 C 1020 -10, 1240 60, 1460 -15"
          stroke="url(#contourStroke2)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M 920 80 C 1060 30, 1280 100, 1480 30"
          stroke="url(#contourStroke1)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M 960 120 C 1100 70, 1320 140, 1500 75"
          stroke="url(#contourStroke2)"
          strokeWidth="0.9"
          strokeOpacity="0.7"
          strokeLinecap="round"
        />

        {/* Delicate topographic coordinate node marks */}
        <g opacity="0.45">
          <circle cx="340" cy="280" r="2" fill="#0F7D41" />
          <circle cx="340" cy="280" r="5" stroke="#8AD3A8" strokeWidth="0.75" />
          <circle cx="840" cy="290" r="2" fill="#0F7D41" />
          <circle cx="840" cy="290" r="5" stroke="#8AD3A8" strokeWidth="0.75" />
          <circle cx="1180" cy="180" r="2" fill="#0F7D41" />
          <circle cx="1180" cy="180" r="5" stroke="#8AD3A8" strokeWidth="0.75" />
        </g>
      </svg>

      {/* BOTTOM SEAMLESS FADE-OUT: Blends gracefully into the page baseline */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F7F9F7] via-[#F7F9F7]/60 to-transparent" />
    </div>
  );
}
