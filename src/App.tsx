import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  OpportunityCandidate,
  MarketContext,
  ScannerSettings,
  HistoricalSignal,
  ETFUniverseOption,
} from './types';
import { Navbar } from './components/Navbar';
import { MarketOverviewBar } from './components/MarketOverviewBar';
import { TopRecommendations } from './components/TopRecommendations';
import { OpportunityTable } from './components/OpportunityTable';
import { ETFInvestorGuide } from './components/ETFInvestorGuide';
import { ETFDetailModal } from './components/ETFDetailModal';
import { BacktestLab } from './components/BacktestLab';
import { SignalHistoryView } from './components/SignalHistoryView';
import { WatchlistManager } from './components/WatchlistManager';
import { RuleEngineTester } from './components/RuleEngineTester';
import { SettingsModal } from './components/SettingsModal';
import { EmailAlertModal } from './components/EmailAlertModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { NiveshLogo } from './components/NiveshLogo';
import { useTheme } from './theme/ThemeContext';
import {
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const { theme, branding } = useTheme();

  // State
  const [currentView, setCurrentView] = useState<'scanner' | 'backtest' | 'history' | 'watchlist' | 'tests'>('scanner');
  const [opportunities, setOpportunities] = useState<OpportunityCandidate[]>([]);
  const [marketContext, setMarketContext] = useState<MarketContext | null>(null);
  const [historicalSignals, setHistoricalSignals] = useState<HistoricalSignal[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<OpportunityCandidate | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastScanTime, setLastScanTime] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [alertCandidate, setAlertCandidate] = useState<OpportunityCandidate | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings State
  const [settings, setSettings] = useState<ScannerSettings>({
    minPriceFallPercent: 1.0,
    minVolumeRatio: 1.5,
    volumeBaselineDays: 20,
    universe: 'ALL ETFS',
    scanIntervalMinutes: 15,
    strongScoreThreshold: 80,
    opportunityScoreThreshold: 65,
    watchScoreThreshold: 50,
    alertCooldownHours: 4,
    notificationEmail: 'investor@niveshai.in',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch opportunities
  const loadMarketData = useCallback(async () => {
    try {
      const [oppRes, marketRes, historyRes] = await Promise.all([
        fetch('/api/opportunities'),
        fetch('/api/market'),
        fetch('/api/history'),
      ]);

      if (oppRes.ok) {
        const oppData = await oppRes.json();
        const list = Array.isArray(oppData)
          ? oppData
          : Array.isArray(oppData?.opportunities)
          ? oppData.opportunities
          : [];
        setOpportunities(list);
      }
      if (marketRes.ok) {
        const mktData = await marketRes.json();
        setMarketContext(mktData);
      }
      if (historyRes.ok) {
        const histData = await historyRes.json();
        const histList = Array.isArray(histData)
          ? histData
          : Array.isArray(histData?.signals)
          ? histData.signals
          : [];
        setHistoricalSignals(histList);
      }
    } catch (err) {
      console.error('Failed to load market data:', err);
    }
  }, []);

  // Trigger Instant Scan
  const handleTriggerScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minPriceFall: settings.minPriceFallPercent,
          minVolumeRatio: settings.minVolumeRatio,
          universe: settings.universe,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.opportunities)
          ? data.opportunities
          : [];
        setOpportunities(list);
        setLastScanTime(data.scannedAt || data.timestamp || new Date().toISOString());
        const count = data.candidateCount ?? list.filter((c: OpportunityCandidate) => c.isCandidate).length;
        showToast(`ETF Scan complete: ${count} candidate(s) triggered.`);
      }
    } catch (err) {
      console.error('Scan failed:', err);
      showToast('Scan encounter an issue. Using live cached feed.');
    } finally {
      setIsScanning(false);
    }
  };

  // Toggle Watchlist
  const handleToggleWatchlist = async (symbol: string, isWatchlist: boolean) => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, isWatchlist }),
      });
      if (res.ok) {
        setOpportunities((prev) =>
          prev.map((item) => {
            const sym = item.etf.symbol;
            if (sym === symbol) {
              return {
                ...item,
                etf: { ...item.etf, isWatchlist },
              };
            }
            return item;
          })
        );
        showToast(
          isWatchlist
            ? `Added ${symbol} to ETF Watchlist.`
            : `Removed ${symbol} from ETF Watchlist.`
        );
      }
    } catch (err) {
      console.error('Watchlist update failed:', err);
    }
  };

  // Email Alert
  const handleSendEmailAlert = (symbol: string) => {
    const cand = opportunities.find((o) => o.etf.symbol === symbol);
    if (cand) {
      setAlertCandidate(cand);
    }
  };

  const handleConfirmSendAlert = async (symbol: string) => {
    try {
      await fetch('/api/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          recipient: settings.notificationEmail,
        }),
      });
      showToast(`ETF alert dispatched for ${symbol} to ${settings.notificationEmail}`);
      // Mark candidate as alert sent
      setOpportunities((prev) =>
        prev.map((item) =>
          item.etf.symbol === symbol ? { ...item, alertSent: true } : item
        )
      );
    } catch (err) {
      console.error('Alert send failed:', err);
    }
  };

  // Initial load
  useEffect(() => {
    loadMarketData();
    setLastScanTime(new Date().toISOString());
  }, [loadMarketData]);

  // Universe change handler
  const handleUniverseChange = (universe: ETFUniverseOption) => {
    setSettings((prev) => ({ ...prev, universe }));
    showToast(`Switched ETF universe to ${universe}`);
  };

  // Filter opportunities by universe or sector
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((o) => {
      const etf = o.etf;
      if (!etf) return false;
      const u = (settings.universe || 'ALL ETFS').toUpperCase().trim();
      if (u === 'ALL ETFS' || u === 'ALL') return true;
      if (u === 'WATCHLIST') return Boolean(etf.isWatchlist);

      const sector = (etf.sector || '').toLowerCase();
      const fundName = (etf.fundName || '').toLowerCase();
      const symbol = (etf.symbol || '').toUpperCase();
      const category = (etf.category || '').toLowerCase();

      if (u === 'EV & AUTO' || u === 'EV' || u === 'AUTO' || u === 'AUTOMOBILE') {
        return (
          sector.includes('ev') ||
          sector.includes('auto') ||
          fundName.includes('ev') ||
          fundName.includes('auto') ||
          symbol === 'EVINDIA' ||
          symbol === 'AUTOBEES'
        );
      }
      if (u === 'BANKING & FINANCIALS' || u === 'BANKING' || u === 'BANKS' || u === 'FINANCIALS') {
        return (
          sector.includes('bank') ||
          sector.includes('financial') ||
          symbol === 'BANKBEES' ||
          symbol === 'PSUBNKBEES'
        );
      }
      if (u === 'IT & TECH' || u === 'IT' || u === 'TECH' || u === 'TECHNOLOGY') {
        return (
          sector.includes('it') ||
          sector.includes('tech') ||
          symbol === 'ITBEES' ||
          symbol === 'MON100'
        );
      }
      if (u === 'PHARMA & HEALTHCARE' || u === 'PHARMA' || u === 'HEALTHCARE') {
        return (
          sector.includes('pharma') ||
          sector.includes('healthcare') ||
          symbol === 'PHARMABEES' ||
          symbol === 'HEALTHBEES'
        );
      }
      if (u === 'ENERGY & INFRA' || u === 'ENERGY' || u === 'INFRA' || u === 'INFRASTRUCTURE' || u === 'PSU') {
        return (
          sector.includes('energy') ||
          sector.includes('infra') ||
          sector.includes('power') ||
          symbol === 'CPSEETF' ||
          symbol === 'INFRABEES'
        );
      }
      if (u === 'METALS & COMMODITIES' || u === 'COMMODITIES' || u === 'METALS' || u === 'GOLD & SILVER') {
        return (
          category.includes('commodit') ||
          sector.includes('metal') ||
          sector.includes('gold') ||
          sector.includes('silver') ||
          symbol === 'GOLDBEES' ||
          symbol === 'SILVERBEES'
        );
      }
      if (u === 'DEFENCE & PSU' || u === 'DEFENCE' || u === 'DEFENSE') {
        return (
          sector.includes('defence') ||
          sector.includes('defense') ||
          symbol === 'DEFENCEETF'
        );
      }
      if (u === 'CONSUMPTION' || u === 'CONSUMPTION & RETAIL' || u === 'FMCG' || u === 'RETAIL') {
        return (
          sector.includes('consumption') ||
          sector.includes('retail') ||
          sector.includes('fmcg') ||
          symbol === 'CONSUMBEES'
        );
      }
      if (u === 'SMART BETA' || u === 'SMART BETA & MOMENTUM' || u === 'MOMENTUM') {
        return (
          category.includes('smart') ||
          sector.includes('factor') ||
          sector.includes('momentum') ||
          sector.includes('volatility') ||
          symbol === 'MOM50' ||
          symbol === 'LOWVOLIETF'
        );
      }
      if (u === 'BROAD INDEX' || u === 'BROAD MARKET INDEX') {
        return category.includes('broad');
      }
      return true;
    });
  }, [opportunities, settings.universe]);

  // Counts
  const activeCandidatesCount = filteredOpportunities.filter((o) => o.isCandidate).length;
  const strongOpportunitiesCount = filteredOpportunities.filter(
    (o) => o.scoreBreakdown.totalScore >= settings.strongScoreThreshold
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white" id="nivesh-app-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border border-emerald-500/40 text-emerald-800 text-xs font-semibold shadow-xl animate-fade-in" id="nivesh-toast">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onTriggerScan={handleTriggerScan}
        isScanning={isScanning}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onUniverseChange={handleUniverseChange}
        activeCandidatesCount={activeCandidatesCount}
      />

      {/* Market Overview Strip */}
      <MarketOverviewBar
        marketContext={marketContext}
        monitoredCount={filteredOpportunities.length}
        activeCandidatesCount={activeCandidatesCount}
        strongOpportunitiesCount={strongOpportunitiesCount}
        lastScanTime={lastScanTime}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Primary Content View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6" id="nivesh-main-content">
        {currentView === 'scanner' && (
          <div className="space-y-6">
            {/* Top 5 Recommended ETFs Spotlight */}
            <TopRecommendations
              opportunities={opportunities}
              onSelectETF={(candidate) => setSelectedCandidate(candidate)}
              onToggleWatchlist={handleToggleWatchlist}
              onSendEmailAlert={handleSendEmailAlert}
            />

            {/* Investor Guide Explainer (Collapsible) */}
            <ETFInvestorGuide />

            {/* Full Filterable Opportunity Table */}
            <OpportunityTable
              opportunities={filteredOpportunities}
              onSelectETF={(candidate) => setSelectedCandidate(candidate)}
              searchQuery={searchQuery}
              onToggleWatchlist={handleToggleWatchlist}
            />
          </div>
        )}

        {currentView === 'backtest' && <BacktestLab settings={settings} />}

        {currentView === 'history' && (
          <SignalHistoryView
            signals={historicalSignals}
            onSelectSymbol={(sym) => {
              const cand = opportunities.find((o) => o.etf.symbol === sym);
              if (cand) setSelectedCandidate(cand);
            }}
          />
        )}

        {currentView === 'watchlist' && (
          <WatchlistManager
            opportunities={opportunities}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectETF={(candidate) => setSelectedCandidate(candidate)}
          />
        )}

        {currentView === 'tests' && <RuleEngineTester />}
      </main>

      {/* Modals */}
      <ETFDetailModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        settings={settings}
        onToggleWatchlist={handleToggleWatchlist}
        onSendEmailAlert={handleSendEmailAlert}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => {
          setSettings(newSettings);
          showToast('Updated ETF scanner thresholds and configuration.');
        }}
      />

      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <EmailAlertModal
        candidate={alertCandidate}
        isOpen={Boolean(alertCandidate)}
        onClose={() => setAlertCandidate(null)}
        settings={settings}
        onConfirmSend={handleConfirmSendAlert}
      />

      {/* Platform Regulatory & Architectural Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NiveshLogo
              variant="icon"
              size="sm"
              theme={theme.mode}
              brandTheme={theme}
              deskName={branding.deskName}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">Nivesh AI</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">|</span>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {branding.deskName || 'Family Office & Pro Desk'}
                </span>
                <span
                  className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: theme.primaryLight,
                    color: theme.primaryDark,
                    border: `1px solid ${theme.primaryBorder}`,
                  }}
                >
                  {theme.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Deterministic Code Logic for Detection • Gemini 3.7 Flash for Context & Explanations
              </p>
            </div>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex items-center justify-center md:justify-end gap-1.5 font-semibold" style={{ color: theme.primaryDark }}>
              <ShieldAlert className="w-3.5 h-3.5" style={{ color: theme.primaryColor }} />
              <span>ETF Opportunity Detection Platform • Never Automates Orders</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500">
              For research and asset allocation analysis. Not registered SEBI investment advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
