import { AppThemeId, BrandTheme } from '../types';

export const BRAND_THEMES: Record<AppThemeId, BrandTheme> = {
  'emerald-bharat': {
    id: 'emerald-bharat',
    name: 'Emerald Bharat',
    subtitle: 'Institutional Indian Green & Teal',
    tagline: 'Growth, Prosperity & Dalal Street Alpha',
    primaryColor: '#059669', // emerald-600
    primaryDark: '#047857',
    primaryLight: '#ecfdf5',
    primaryBorder: '#a7f3d0',
    accentColor: '#f59e0b', // amber-500
    gradient: 'from-emerald-600 to-teal-700',
    bgClass: 'bg-slate-50',
    cardBgClass: 'bg-white',
    textClass: 'text-slate-900',
    mode: 'light',
    description: 'Inspired by the National Stock Exchange green, wealth compounding, and quantitative discipline.',
  },
  'dalal-navy': {
    id: 'dalal-navy',
    name: 'Dalal Street Navy',
    subtitle: 'Institutional Sapphire & Cyan',
    tagline: 'Blue-Chip Stability & Institutional Grade',
    primaryColor: '#2563eb', // blue-600
    primaryDark: '#1d4ed8',
    primaryLight: '#eff6ff',
    primaryBorder: '#bfdbfe',
    accentColor: '#06b6d4', // cyan-500
    gradient: 'from-blue-600 to-indigo-700',
    bgClass: 'bg-slate-50',
    cardBgClass: 'bg-white',
    textClass: 'text-slate-900',
    mode: 'light',
    description: 'Corporate and sovereign financial banking aesthetic designed for institutional asset allocators.',
  },
  'vedic-gold': {
    id: 'vedic-gold',
    name: 'Vedic Ochre & Gold',
    subtitle: 'Sovereign Gold, Amber & Terracotta',
    tagline: 'Preservation of Wealth & Precious Assets',
    primaryColor: '#d97706', // amber-600
    primaryDark: '#b45309',
    primaryLight: '#fffbeb',
    primaryBorder: '#fde68a',
    accentColor: '#ea580c', // orange-600
    gradient: 'from-amber-600 to-orange-700',
    bgClass: 'bg-[#faf8f5]',
    cardBgClass: 'bg-white',
    textClass: 'text-slate-900',
    mode: 'light',
    description: 'Warm heritage palette reflecting Sovereign Gold Bond backing, commodity balance, and endurance.',
  },
  'cyber-terminal': {
    id: 'cyber-terminal',
    name: 'Midnight Pro Terminal',
    subtitle: 'High-Contrast Obsidian Dark Mode',
    tagline: 'Ultra Low-Light Quantitative Trading Desk',
    primaryColor: '#10b981', // emerald-500
    primaryDark: '#059669',
    primaryLight: '#0f172a',
    primaryBorder: '#334155',
    accentColor: '#38bdf8', // sky-400
    gradient: 'from-emerald-500 to-teal-400',
    bgClass: 'bg-[#090d16]',
    cardBgClass: 'bg-[#111827]',
    textClass: 'text-slate-100',
    mode: 'dark',
    description: 'Low-strain dark palette built for night analysis, multi-screen trading desks, and pro scanners.',
  },
  'royal-amethyst': {
    id: 'royal-amethyst',
    name: 'FinTech Amethyst',
    subtitle: 'Modern Violet, Purple & Fuchsia',
    tagline: 'Modern Wealth Tech & Dynamic Intelligence',
    primaryColor: '#7c3aed', // violet-600
    primaryDark: '#6d28d9',
    primaryLight: '#f5f3ff',
    primaryBorder: '#ddd6fe',
    accentColor: '#ec4899', // pink-500
    gradient: 'from-violet-600 to-purple-700',
    bgClass: 'bg-slate-50',
    cardBgClass: 'bg-white',
    textClass: 'text-slate-900',
    mode: 'light',
    description: 'Distinctive neo-banking aesthetic delivering high visual polish and crisp contrast.',
  },
};

export const DEFAULT_THEME_ID: AppThemeId = 'emerald-bharat';
