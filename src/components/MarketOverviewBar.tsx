import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Clock,
  Eye,
  CheckCircle,
  Sliders,
  Layers,
  Coins,
} from 'lucide-react';
import { MarketContext, ScannerSettings } from '../types';

interface MarketOverviewBarProps {
  marketContext: MarketContext | null;
  monitoredCount: number;
  activeCandidatesCount: number;
  strongOpportunitiesCount: number;
  lastScanTime: string;
  settings: ScannerSettings;
  onOpenSettings: () => void;
}

export const MarketOverviewBar: React.FC<MarketOverviewBarProps> = ({
  marketContext,
  monitoredCount,
  activeCandidatesCount,
  strongOpportunitiesCount,
  lastScanTime,
  settings,
  onOpenSettings,
}) => {
  const niftyChange = marketContext?.nifty50ChangePercent ?? -0.35;
  const isNiftyPositive = niftyChange >= 0;

  const formattedLastScan = lastScanTime
    ? new Date(lastScanTime).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' IST'
    : 'Just now';

  return (
    <div className="bg-white border-b border-slate-200 py-3.5 shadow-2xs" id="market-overview-strip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* NIFTY 50 Index Card */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all" id="metric-nifty50">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>NIFTY 50 (Benchmark)</span>
              {isNiftyPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
              )}
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-slate-900 font-bold text-base font-mono">24,785.40</span>
              <span
                className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                  isNiftyPositive
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    : 'text-rose-700 bg-rose-50 border border-rose-200'
                }`}
              >
                {isNiftyPositive ? '+' : ''}
                {niftyChange.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* India VIX & Volatility */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all" id="metric-india-vix">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>India VIX (Volatility)</span>
              <Activity className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-slate-900 font-bold text-base font-mono">{marketContext?.indiaVix ?? 14.1}</span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                Optimal for Dips
              </span>
            </div>
          </div>

          {/* Monitored ETFs */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all" id="metric-monitored">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Monitored ETFs</span>
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-slate-900 font-bold text-base font-mono">{monitoredCount} Funds</span>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{settings.universe}</span>
            </div>
          </div>

          {/* Active Pullback Candidates */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all" id="metric-active-opps">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Rule Met Candidates</span>
              <Zap className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-slate-900 font-bold text-base font-mono">{activeCandidatesCount} Triggered</span>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                Fall ≥ 1%
              </span>
            </div>
          </div>

          {/* Strong ETF Opportunities */}
          <div className="bg-emerald-50/50 border border-emerald-300/80 rounded-xl p-3 flex flex-col justify-between shadow-2xs hover:border-emerald-400 transition-all" id="metric-strong-opps">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
              <span>Strong ETF Signals</span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-emerald-900 font-bold text-base font-mono">{strongOpportunitiesCount} ETFs</span>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded">
                Score ≥ 80
              </span>
            </div>
          </div>

          {/* Last Scan Time & Interval */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all" id="metric-scan-time">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Last Scan</span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-slate-800 font-bold text-xs font-mono">{formattedLastScan}</span>
              <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                Every {settings.scanIntervalMinutes}m
              </span>
            </div>
          </div>
        </div>

        {/* Rule Engine Active Parameters Banner */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 shadow-2xs" id="rule-parameters-banner">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-bold flex items-center gap-1.5 text-emerald-950">
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              Active ETF Strategy Criteria:
            </span>
            <span className="px-2 py-0.5 rounded bg-white border border-emerald-300 text-[11px] font-bold text-emerald-800 font-mono shadow-2xs">
              Price Pullback ≤ -{settings.minPriceFallPercent.toFixed(1)}%
            </span>
            <span className="text-emerald-700 font-bold">&</span>
            <span className="px-2 py-0.5 rounded bg-white border border-emerald-300 text-[11px] font-bold text-emerald-800 font-mono shadow-2xs">
              Volume Ratio ≥ {settings.minVolumeRatio.toFixed(1)}× (20D Avg)
            </span>
            <span className="text-slate-600 text-[11px] hidden md:inline font-medium">
              • Validates TER, Tracking Error, AUM & NAV Dis/Premium
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
            id="adjust-rule-link"
          >
            <Sliders className="w-3 h-3 text-emerald-600" />
            Customize Thresholds
          </button>
        </div>
      </div>
    </div>
  );
};
