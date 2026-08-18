import React, { useState, useEffect } from 'react';
import {
  OpportunityCandidate,
  AIAnalysis,
  ScannerSettings,
} from '../types';
import { ETFPriceChart } from './ETFPriceChart';
import { AIAnalysisView } from './AIAnalysisView';
import {
  X,
  Activity,
  Layers,
  FileText,
  BarChart3,
  ShieldCheck,
  Zap,
  Bookmark,
  Check,
  PieChart,
  Coins,
  Percent,
} from 'lucide-react';

interface ETFDetailModalProps {
  candidate: OpportunityCandidate | null;
  onClose: () => void;
  settings: ScannerSettings;
  onToggleWatchlist: (symbol: string, isWatchlist: boolean) => void;
  onSendEmailAlert: (symbol: string) => void;
}

export const ETFDetailModal: React.FC<ETFDetailModalProps> = ({
  candidate,
  onClose,
  settings,
  onToggleWatchlist,
  onSendEmailAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'chart' | 'holdings' | 'etf_efficiency' | 'technicals' | 'news'>('ai');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isAlertSent, setIsAlertSent] = useState<boolean>(false);

  // Fetch AI Analysis from server
  const fetchAiAnalysis = async (symbol: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
      }
    } catch (err) {
      console.error('Failed to fetch AI analysis:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (candidate) {
      const sym = candidate.etf.symbol;
      setIsAlertSent(Boolean(candidate.alertSent));
      if (candidate.aiAnalysis) {
        setAiAnalysis(candidate.aiAnalysis);
      } else {
        fetchAiAnalysis(sym);
      }
    }
  }, [candidate]);

  if (!candidate) return null;

  const etf = candidate.etf;
  const { technicals, fundamentals, marketContext, scoreBreakdown, recentNews, candles, isCandidate, priceChangePercent, volumeRatio } = candidate;

  const isPriceFall = priceChangePercent < 0;
  const discount = etf.discountPremiumPercent ?? 0;
  const nav = etf.nav ?? etf.currentPrice;
  const topHoldings = fundamentals.portfolioTopHoldings || [];

  // 52 Week Range calculation
  const fiftyTwoRange = etf.fiftyTwoWeekHigh - etf.fiftyTwoWeekLow || 1;
  const fiftyTwoPos = Math.min(100, Math.max(0, ((etf.currentPrice - etf.fiftyTwoWeekLow) / fiftyTwoRange) * 100));

  const handleAlertTrigger = () => {
    onSendEmailAlert(etf.symbol);
    setIsAlertSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-scrollbar" id="etf-detail-modal-backdrop">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto" id="etf-detail-modal-content">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center text-emerald-800 font-bold text-xs font-mono shadow-2xs">
              <span className="text-[10px] text-emerald-600">ETF</span>
              <span>{etf.symbol.slice(0, 4)}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-mono">{etf.symbol}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {etf.category || 'Broad Market Index'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                  {etf.amcName || 'NSE Listed'}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">{etf.fundName}</p>
              <p className="text-[11px] text-slate-500">Benchmark: {etf.underlyingIndex || 'Benchmark Index'}</p>
            </div>
          </div>

          {/* Price, NAV & Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                ₹{etf.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-end gap-2 text-xs font-mono">
                <span className={isPriceFall ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                  {isPriceFall ? '' : '+'}
                  {priceChangePercent.toFixed(2)}%
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-medium">NAV ₹{nav.toFixed(2)}</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">Vol: <strong className="text-amber-800">{volumeRatio.toFixed(2)}×</strong></span>
              </div>
            </div>

            {/* Watchlist Toggle */}
            <button
              onClick={() => onToggleWatchlist(etf.symbol, !etf.isWatchlist)}
              className={`p-2 rounded-lg border transition-all ${
                etf.isWatchlist
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={etf.isWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Bookmark className="w-4 h-4" />
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
              id="close-etf-detail-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Rule Trigger Banner */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>ETF Rule Status:</span>
            </div>
            {isCandidate ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                PULLBACK CANDIDATE TRIGGERED (Fall ≥ 1% & Vol Ratio ≥ 1.5×)
              </span>
            ) : (
              <span className="text-xs text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded font-medium">
                Standard Monitoring Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600">
            <span>52W Range: <strong className="text-slate-800">₹{etf.fiftyTwoWeekLow}</strong> - <strong className="text-slate-800">₹{etf.fiftyTwoWeekHigh}</strong></span>
            <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
              <div className="h-full bg-emerald-600" style={{ width: `${fiftyTwoPos}%` }} />
            </div>
          </div>
        </div>

        {/* Score Breakdown Strip */}
        <div className="px-4 sm:px-6 py-3 bg-white border-b border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">ETF Opportunity Score:</span>
              <span className="text-base font-black font-mono text-emerald-700">
                {scoreBreakdown.totalScore}/100
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-700">
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                Technical: <strong className="text-emerald-700">{scoreBreakdown.technicalSetup}/25</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                Volume: <strong className="text-emerald-700">{scoreBreakdown.volumeConfirmation}/20</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                Trend: <strong className="text-emerald-700">{scoreBreakdown.trend}/15</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                ETF Efficiency: <strong className="text-emerald-700">{scoreBreakdown.etfFundamentals}/20</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                Valuation / NAV: <strong className="text-emerald-700">{scoreBreakdown.valuation}/10</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                Benchmark Context: <strong className="text-emerald-700">{scoreBreakdown.marketContext}/10</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ai'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>AI Opportunity Thesis</span>
          </button>

          <button
            onClick={() => setActiveTab('chart')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'chart'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Candlestick & EMAs</span>
          </button>

          <button
            onClick={() => setActiveTab('holdings')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'holdings'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Underlying Index Holdings</span>
          </button>

          <button
            onClick={() => setActiveTab('etf_efficiency')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'etf_efficiency'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>TER, AUM & NAV Valuation</span>
          </button>

          <button
            onClick={() => setActiveTab('technicals')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'technicals'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Technical Indicators</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'news'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Macro & Sector News ({recentNews.length})</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 no-scrollbar bg-slate-50/50">
          {activeTab === 'ai' && (
            <AIAnalysisView
              analysis={aiAnalysis}
              scoreBreakdown={scoreBreakdown}
              isLoading={isAiLoading}
              onRefreshAI={() => fetchAiAnalysis(etf.symbol)}
              onSendAlert={handleAlertTrigger}
              isAlertSent={isAlertSent}
            />
          )}

          {activeTab === 'chart' && (
            <ETFPriceChart
              candles={candles}
              currentPrice={etf.currentPrice}
              technicals={technicals}
            />
          )}

          {activeTab === 'holdings' && (
            <div className="space-y-4" id="holdings-section">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Underlying Index Weight Distribution</h4>
                  <p className="text-xs text-slate-500">Key constituents tracked by {etf.underlyingIndex || etf.symbol}</p>
                </div>
                <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  Total Holdings: {topHoldings.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topHoldings.map((holding, idx: number) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{holding.name}</span>
                      <span className="text-[10px] text-slate-500">{holding.sector || 'Constituent'}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-sm font-bold text-emerald-700">{holding.weightPercent}%</span>
                      <span className="text-[10px] text-slate-400 block">Weight</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'etf_efficiency' && (
            <div className="space-y-4" id="etf-efficiency-grid">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
                  <span className="text-slate-500 text-xs">Total Expense Ratio (TER)</span>
                  <div className="text-base font-bold font-mono text-emerald-700 mt-1">{fundamentals.expenseRatioPercent || 0.05}%</div>
                  <span className="text-[10px] text-slate-400">Low Cost Structure</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
                  <span className="text-slate-500 text-xs">Tracking Error</span>
                  <div className="text-base font-bold font-mono text-emerald-700 mt-1">{fundamentals.trackingErrorPercent || 0.03}%</div>
                  <span className="text-[10px] text-slate-400">Tight Benchmark Match</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
                  <span className="text-slate-500 text-xs">Assets Under Mgmt (AUM)</span>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">₹{(fundamentals.aumCr || 0).toLocaleString('en-IN')} Cr</div>
                  <span className="text-[10px] text-emerald-700 font-medium">High Liquid Market Depth</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
                  <span className="text-slate-500 text-xs">NAV Discount / Premium</span>
                  <div className={`text-base font-bold font-mono mt-1 ${discount < 0 ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {discount > 0 ? '+' : ''}{discount.toFixed(2)}%
                  </div>
                  <span className="text-[10px] text-slate-400">NAV ₹{nav.toFixed(2)}</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
                  <span className="text-slate-500 text-xs">1-Year Return</span>
                  <div className="text-base font-bold font-mono text-emerald-700 mt-1">+{fundamentals.oneYearReturnPercent || 18.5}%</div>
                  <span className="text-[10px] text-slate-400">Historical Annual</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
                  <span className="text-slate-500 text-xs">3-Year CAGR</span>
                  <div className="text-base font-bold font-mono text-emerald-700 mt-1">+{fundamentals.threeYearCAGR || 16.2}%</div>
                  <span className="text-[10px] text-slate-400">Compound Growth</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
                  <span className="text-slate-500 text-xs">Benchmark P/E</span>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">{fundamentals.benchmarkPE || 'N/A'}</div>
                  <span className="text-[10px] text-slate-400">Index Valuation</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
                  <span className="text-slate-500 text-xs">Benchmark Dividend Yield</span>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">{fundamentals.benchmarkDividendYield || 1.2}%</div>
                  <span className="text-[10px] text-slate-400">Underlying Cash Flow</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'technicals' && (
            <div className="space-y-4" id="technicals-grid">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                  <span className="text-slate-500 text-xs">20 EMA</span>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">₹{technicals.ema20}</div>
                  <span className={`text-[10px] font-semibold ${etf.currentPrice >= technicals.ema20 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {etf.currentPrice >= technicals.ema20 ? 'Price Above' : 'Price Below'}
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                  <span className="text-slate-500 text-xs">50 EMA</span>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">₹{technicals.ema50}</div>
                  <span className={`text-[10px] font-semibold ${etf.currentPrice >= technicals.ema50 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {etf.currentPrice >= technicals.ema50 ? 'Price Above' : 'Price Below'}
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                  <span className="text-slate-500 text-xs">200 EMA (Primary Trend)</span>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">₹{technicals.ema200}</div>
                  <span className={`text-[10px] font-bold ${etf.currentPrice >= technicals.ema200 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {etf.currentPrice >= technicals.ema200 ? 'Bullish Structure ✓' : 'Under 200 EMA'}
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                  <span className="text-slate-500 text-xs">RSI (14)</span>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">{technicals.rsi14.toFixed(1)}</div>
                  <span className="text-[10px] font-semibold text-amber-700">
                    {technicals.rsi14 < 50 ? 'Pullback Zone' : 'Overbought'}
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                  <span className="text-slate-500 text-xs">MACD Histogram</span>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">{technicals.macd.histogram}</div>
                  <span className="text-[10px] text-slate-500">Line: {technicals.macd.macdLine} | Signal: {technicals.macd.signalLine}</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                  <span className="text-slate-500 text-xs">VWAP</span>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">₹{technicals.vwap}</div>
                  <span className="text-[10px] text-slate-500">Intraday Weight</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                  <span className="text-slate-500 text-xs">Support Level</span>
                  <div className="text-base font-bold font-mono text-emerald-700 mt-1">₹{technicals.supportLevel}</div>
                  <span className="text-[10px] text-slate-500">Demand Floor</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                  <span className="text-slate-500 text-xs">Resistance Level</span>
                  <div className="text-base font-bold font-mono text-rose-700 mt-1">₹{technicals.resistanceLevel}</div>
                  <span className="text-[10px] text-slate-500">Supply Overhead</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-3" id="news-feed-list">
              {recentNews.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">No recent macro or ETF news found.</div>
              ) : (
                recentNews.map((news) => (
                  <div key={news.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {news.category}
                        </span>
                        <span className="text-slate-600 font-semibold">{news.source}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(news.publishedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 leading-snug">{news.title}</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{news.summary}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
