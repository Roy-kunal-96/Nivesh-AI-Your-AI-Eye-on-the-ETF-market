import React from 'react';
import { BrandTheme } from '../types';

interface NiveshLogoProps {
  variant?: 'full' | 'icon' | 'compact' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'dark' | 'light';
  brandTheme?: BrandTheme;
  deskName?: string;
}

export const NiveshLogo: React.FC<NiveshLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  theme = 'light',
  brandTheme,
  deskName,
}) => {
  // Dimensions
  const iconSizeMap = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
  };

  const px = iconSizeMap[size] || 36;
  const primaryColor = brandTheme?.primaryColor || '#059669';
  const accentColor = brandTheme?.accentColor || '#F59E0B';

  // Bull Icon with upward trajectory candlestick chart & geometric "N" contour
  const BullIcon = (
    <svg
      width={px}
      height={px}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 hover:scale-105"
      id="nivesh-bull-svg"
    >
      <defs>
        {/* Dynamic Growth Gradient */}
        <linearGradient id="bullEmerald" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={brandTheme?.primaryDark || '#059669'} />
          <stop offset="60%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={brandTheme?.primaryBorder ? primaryColor : '#34D399'} />
        </linearGradient>

        {/* Dynamic Momentum Accent */}
        <linearGradient id="bullGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="100%" stopColor={primaryColor} />
        </linearGradient>

        {/* Shield / Background glow */}
        <linearGradient id="shieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
        </linearGradient>

        {/* Glow */}
        <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={primaryColor} floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Hexagonal / Shield Geometric Base */}
      <path
        d="M50 4 L88 24 V72 L50 96 L12 72 V24 Z"
        fill="url(#shieldBg)"
        stroke="url(#bullEmerald)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Candlestick & Upward Momentum Vectors */}
      <path
        d="M26 34 L18 16 C25 18 36 24 40 32 Z"
        fill="url(#bullGold)"
      />
      <path
        d="M74 34 L88 14 C78 18 64 24 60 32 Z"
        fill="url(#bullEmerald)"
      />

      {/* Geometric Stylized Bull Forehead with dynamic 'N' / Candlestick shape */}
      <path
        d="M32 36 L50 28 L68 36 L62 58 L50 78 L38 58 Z"
        fill="url(#bullEmerald)"
        filter="url(#emeraldGlow)"
      />

      {/* Integrated Candlestick Central Body */}
      <rect x="47" y="38" width="6" height="26" rx="2" fill="#FFFFFF" />
      <line x1="50" y1="32" x2="50" y2="38" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="50" y1="64" x2="50" y2="70" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

      {/* The Intelligent Market Eye (AI Sensory Dot) */}
      <circle cx="42" cy="46" r="3" fill={accentColor} />
      <circle cx="58" cy="46" r="3" fill={primaryColor} />

      {/* Upward Growth Arrow Surge */}
      <path
        d="M35 68 L50 56 L65 68 L50 86 Z"
        fill="#0F172A"
        stroke="url(#bullEmerald)"
        strokeWidth="2"
      />
      <path
        d="M44 76 L50 70 L56 76"
        stroke={primaryColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} id="nivesh-icon-container">
        {BullIcon}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border font-medium text-xs ${className}`}
        style={{
          backgroundColor: brandTheme?.primaryLight || 'rgba(16, 185, 129, 0.1)',
          borderColor: brandTheme?.primaryBorder || 'rgba(16, 185, 129, 0.3)',
          color: brandTheme?.primaryDark || '#059669',
        }}
        id="nivesh-badge-container"
      >
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: primaryColor }}
        />
        {BullIcon}
        <span className="font-bold tracking-wider">NIVESH AI</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
      id="nivesh-full-logo"
    >
      <div className="relative flex items-center justify-center drop-shadow-md">
        {BullIcon}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight text-xl sm:text-2xl ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            Nivesh
          </span>
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-extrabold tracking-wider text-white uppercase shadow-xs"
            style={{
              background: brandTheme
                ? `linear-gradient(to right, ${brandTheme.primaryColor}, ${brandTheme.primaryDark})`
                : 'linear-gradient(to right, #059669, #0d9488)',
            }}
          >
            AI
          </span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-slate-400 mt-1 flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
          {deskName || 'Your AI Eye on the Market'}
        </span>
      </div>
    </div>
  );
};
