import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  RefreshCw,
  PlayCircle,
  History,
  Bookmark,
  CheckCircle2,
  Clock,
  Radio,
  SlidersHorizontal,
  Palette,
  ChevronDown,
  Sparkles,
  Check,
} from 'lucide-react';
import { NiveshLogo } from './NiveshLogo';
import { ScannerSettings, ETFUniverseOption } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface NavbarProps {
  currentView: 'scanner' | 'backtest' | 'history' | 'watchlist' | 'tests';
  onSelectView: (view: 'scanner' | 'backtest' | 'history' | 'watchlist' | 'tests') => void;
  settings: ScannerSettings;
  onOpenSettings: () => void;
  onOpenThemeModal: () => void;
  onTriggerScan: () => void;
  isScanning: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUniverseChange: (universe: ETFUniverseOption) => void;
  activeCandidatesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  settings,
  onOpenSettings,
  onOpenThemeModal,
  onTriggerScan,
  isScanning,
  searchQuery,
  onSearchChange,
  onUniverseChange,
  activeCandidatesCount,
}) => {
  const { theme, themeId, setThemeId, branding, availableThemes } = useTheme();
  const [istTime, setIstTime] = useState<string>('');
  const [isMarketOpen, setIsMarketOpen] = useState<boolean>(true);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close theme dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        day: '2-digit',
        month: 'short',
      };
      setIstTime(now.toLocaleString('en-IN', options) + ' IST');

      // Indian market hours: 9:15 AM to 3:30 PM IST (Mon-Fri)
      const istHours = Number(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }));
      const istMinutes = Number(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', minute: 'numeric' }));
      const day = now.getDay();
      const timeInMinutes = istHours * 60 + istMinutes;
      const isOpen = day >= 1 && day <= 5 && timeInMinutes >= 555 && timeInMinutes <= 930;
      setIsMarketOpen(isOpen || true); // active live feed simulation
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-xs" id="nivesh-main-navbar">
      {/* Top Utility & Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => onSelectView('scanner')}
              className="text-left focus:outline-none focus:ring-2 rounded-lg p-1 transition-all"
              style={{ outlineColor: theme.primaryColor }}
              id="nivesh-brand-button"
            >
              <NiveshLogo
                variant="full"
                size="md"
                theme={theme.mode}
                brandTheme={theme}
                deskName={branding.deskName}
              />
            </button>

            {/* Indian ETF Market Status Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300" id="market-status-pill">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: isMarketOpen ? theme.primaryColor : '#f59e0b' }}
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">NSE ETF Hub</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="font-semibold" style={{ color: isMarketOpen ? theme.primaryColor : '#f59e0b' }}>
                {isMarketOpen ? 'Market Active' : 'Market Closed'}
              </span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{istTime || 'Loading IST...'}</span>
            </div>
          </div>

          {/* Quick Search & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative hidden md:block w-44 lg:w-64" id="search-container">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search ETF (e.g. NIFTYBEES)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none transition-colors"
                id="search-etfs-input"
              />
            </div>

            {/* Quick Theme Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
                title="Change Brand Theme & Palette"
                id="theme-switcher-button"
              >
                <div className="flex items-center -space-x-1">
                  <span
                    className="w-3 h-3 rounded-full border border-white dark:border-slate-800 shadow-xs"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                  <span
                    className="w-3 h-3 rounded-full border border-white dark:border-slate-800 shadow-xs"
                    style={{ backgroundColor: theme.accentColor }}
                  />
                </div>
                <span className="hidden xl:inline text-[11px]">{theme.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Theme Dropdown Menu */}
              {isThemeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-2 z-50 animate-fade-in text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Brand Themes
                    </span>
                    <button
                      onClick={() => {
                        setIsThemeDropdownOpen(false);
                        onOpenThemeModal();
                      }}
                      className="text-[10px] font-semibold text-emerald-600 hover:underline"
                    >
                      Customize Desk
                    </button>
                  </div>

                  <div className="py-1 space-y-0.5">
                    {availableThemes.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setThemeId(item.id);
                          setIsThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                          item.id === themeId
                            ? 'bg-slate-100 dark:bg-slate-800 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-800 shadow-2xs"
                            style={{ backgroundColor: item.primaryColor }}
                          />
                          <div>
                            <div className="text-xs text-slate-800 dark:text-slate-200">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal line-clamp-1">
                              {item.subtitle}
                            </div>
                          </div>
                        </div>
                        {item.id === themeId && (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 px-2 pb-1">
                    <button
                      onClick={() => {
                        setIsThemeDropdownOpen(false);
                        onOpenThemeModal();
                      }}
                      className="w-full text-center py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px] flex items-center justify-center gap-1.5"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Full Branding Studio</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Trigger Instant Scan Button */}
            <button
              onClick={onTriggerScan}
              disabled={isScanning}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
              style={{ backgroundColor: theme.primaryColor }}
              id="trigger-scan-button"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Scan ETFs Now</span>
              <span className="sm:hidden">Scan</span>
            </button>

            {/* Settings Modal Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors"
              title="Configure Strategy, Thresholds & Theme"
              id="open-settings-button"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Bar: Navigation Tabs & Universe Selector */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 py-2">
          {/* Main Navigation Views */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar" id="nav-tabs">
            <button
              onClick={() => onSelectView('scanner')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                currentView === 'scanner'
                  ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              style={currentView === 'scanner' ? { color: theme.primaryColor } : {}}
              id="tab-scanner"
            >
              <Radio className="w-3.5 h-3.5" style={{ color: theme.primaryColor }} />
              <span>ETF Opportunities</span>
              {activeCandidatesCount > 0 && (
                <span
                  className="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: theme.primaryLight,
                    color: theme.primaryDark,
                    borderColor: theme.primaryBorder,
                    borderWidth: 1,
                  }}
                >
                  {activeCandidatesCount} Triggered
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectView('backtest')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                currentView === 'backtest'
                  ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              style={currentView === 'backtest' ? { color: theme.primaryColor } : {}}
              id="tab-backtest"
            >
              <PlayCircle className="w-3.5 h-3.5" style={{ color: theme.primaryColor }} />
              <span>Backtest Lab</span>
            </button>

            <button
              onClick={() => onSelectView('history')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                currentView === 'history'
                  ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              style={currentView === 'history' ? { color: theme.primaryColor } : {}}
              id="tab-history"
            >
              <History className="w-3.5 h-3.5" style={{ color: theme.primaryColor }} />
              <span>Signal History</span>
            </button>

            <button
              onClick={() => onSelectView('watchlist')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                currentView === 'watchlist'
                  ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              style={currentView === 'watchlist' ? { color: theme.primaryColor } : {}}
              id="tab-watchlist"
            >
              <Bookmark className="w-3.5 h-3.5" style={{ color: theme.primaryColor }} />
              <span>ETF Watchlist</span>
            </button>

            <button
              onClick={() => onSelectView('tests')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                currentView === 'tests'
                  ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              style={currentView === 'tests' ? { color: theme.primaryColor } : {}}
              id="tab-tests"
            >
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: theme.primaryColor }} />
              <span>Rule Engine Tests</span>
            </button>
          </nav>

          {/* ETF Universe Filter Tabs */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] overflow-x-auto no-scrollbar max-w-full shadow-2xs" id="universe-selector">
            <span className="text-slate-500 font-semibold px-1.5 hidden sm:inline whitespace-nowrap">Sector / Universe:</span>
            {[
              { id: 'ALL ETFS', label: 'All ETFs' },
              { id: 'EV & AUTO', label: 'EV & Auto' },
              { id: 'BANKING & FINANCIALS', label: 'Banking' },
              { id: 'IT & TECH', label: 'IT & Tech' },
              { id: 'PHARMA & HEALTHCARE', label: 'Pharma' },
              { id: 'ENERGY & INFRA', label: 'Energy & Infra' },
              { id: 'METALS & COMMODITIES', label: 'Commodities' },
              { id: 'DEFENCE & PSU', label: 'Defence & PSU' },
              { id: 'CONSUMPTION', label: 'Consumption' },
              { id: 'SMART BETA', label: 'Smart Beta' },
              { id: 'WATCHLIST', label: 'Watchlist' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onUniverseChange(item.id)}
                className={`px-2.5 py-1 rounded font-medium transition-all whitespace-nowrap ${
                  settings.universe === item.id
                    ? 'font-bold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                style={
                  settings.universe === item.id
                    ? {
                        backgroundColor: theme.primaryLight,
                        color: theme.primaryDark,
                        borderColor: theme.primaryBorder,
                        borderWidth: 1,
                      }
                    : {}
                }
                id={`universe-${item.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

