import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppThemeId, BrandTheme, AppBrandingSettings } from '../types';
import { BRAND_THEMES, DEFAULT_THEME_ID } from './themes';

interface ThemeContextType {
  theme: BrandTheme;
  themeId: AppThemeId;
  branding: AppBrandingSettings;
  setThemeId: (id: AppThemeId) => void;
  updateBranding: (newBranding: Partial<AppBrandingSettings>) => void;
  availableThemes: BrandTheme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'nivesh_app_theme_branding_v1';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<AppBrandingSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.themeId && BRAND_THEMES[parsed.themeId as AppThemeId]) {
          return {
            themeId: parsed.themeId,
            deskName: parsed.deskName || 'Family Office & Pro Desk',
            showLivePulse: parsed.showLivePulse ?? true,
            density: parsed.density || 'comfortable',
          };
        }
      }
    } catch {
      // fallback
    }
    return {
      themeId: DEFAULT_THEME_ID,
      deskName: 'Family Office & Pro Desk',
      showLivePulse: true,
      density: 'comfortable',
    };
  });

  const activeTheme = BRAND_THEMES[branding.themeId] || BRAND_THEMES[DEFAULT_THEME_ID];

  // Apply theme variables & classes to document
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', activeTheme.primaryColor);
    root.style.setProperty('--brand-dark', activeTheme.primaryDark);
    root.style.setProperty('--brand-light', activeTheme.primaryLight);
    root.style.setProperty('--brand-border', activeTheme.primaryBorder);
    root.style.setProperty('--brand-accent', activeTheme.accentColor);

    // Apply dark / light class to root
    if (activeTheme.mode === 'dark') {
      root.classList.add('dark');
      document.body.style.backgroundColor = activeTheme.bgClass.includes('#') ? '#090d16' : '#0f172a';
      document.body.style.color = '#f8fafc';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = activeTheme.id === 'vedic-gold' ? '#faf8f5' : '#f8fafc';
      document.body.style.color = '#0f172a';
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(branding));
    } catch {
      // ignore
    }
  }, [activeTheme, branding]);

  const setThemeId = (id: AppThemeId) => {
    if (BRAND_THEMES[id]) {
      setBranding((prev) => ({ ...prev, themeId: id }));
    }
  };

  const updateBranding = (newBranding: Partial<AppBrandingSettings>) => {
    setBranding((prev) => ({ ...prev, ...newBranding }));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: activeTheme,
        themeId: branding.themeId,
        branding,
        setThemeId,
        updateBranding,
        availableThemes: Object.values(BRAND_THEMES),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
