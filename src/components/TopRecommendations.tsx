import React, { useState } from 'react';
import { OpportunityCandidate } from '../types';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Bookmark,
  Award,
  ChevronDown,
  ChevronUp,
  Percent,
  CheckCircle2,
  Eye,
} from 'lucide-react';

interface TopRecommendationsProps {
  opportunities: OpportunityCandidate[];
  onSelectETF: (candidate: OpportunityCandidate) => void;
  onToggleWatchlist: (symbol: string, isWatchlist: boolean) => void;
  onSendEmailAlert?: (symbol: string) => void;
}

export const TopRecommendations: React.FC<TopRecommendationsProps> = ({
  opportunities,
  onSelectETF,
  onToggleWatchlist,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Compute top 5 recommended ETFs based on a multi-factor ranking
  // (Total score, Candidate trigger, Volume ratio, Low TER, Discount to NAV, healthy AUM)
  const rankedTop5 = React.useMemo(() => {
    const scoredList = opportunities.map((opp) => {
      const etf = opp.etf;
      const score = opp.scoreBreakdown.totalScore;
      const isCandidateBonus = opp.isCandidate ? 15 : 0;
      const lowTerBonus = (opp.fundamentals.expenseRatioPercent || 0.1) <= 0.08 ? 10 : 5;
      const discountBonus = (etf.discountPremiumPercent || 0) < 0 ? 8 : 0;
      const volBonus = Math.min(10, opp.volumeRatio * 3);
      const aumBonus = (opp.fundamentals.aumCr || 0) > 5000 ? 7 : 3;

      const recommendationScore =
        score * 0.5 + isCandidateBonus + lowTerBonus + discountBonus + volBonus + aumBonus;

      return {
        ...opp,
        recommendationScore,
      };
    });

    // Sort descending by recommendationScore
    scoredList.sort((a, b) => b.recommendationScore - a.recommendationScore);

    // Pick top 5 with customized editorial badges
    const top5 = scoredList.slice(0, 5);

    const badges = [
      {
        tag: '👑 #1 Best Pick',
        color: 'from-emerald-600 to-teal-700',
        bgPill: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      },
      {
        tag: '🎯 #2 Value Dip',
        color: 'from-blue-600 to-indigo-700',
        bgPill: 'bg-sky-50 text-sky-800 border-sky-300',
      },
      {
        tag: '💎 #3 Low TER',
        color: 'from-amber-600 to-orange-700',
        bgPill: 'bg-amber-50 text-amber-800 border-amber-300',
      },
      {
        tag: '⚡ #4 Momentum',
        color: 'from-purple-600 to-violet-700',
        bgPill: 'bg-purple-50 text-purple-800 border-purple-300',
      },
      {
        tag: '🛡️ #5 NAV Discount',
        color: 'from-slate-700 to-slate-900',
        bgPill: 'bg-slate-50 text-slate-800 border-slate-300',
      },
    ];

    return top5.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      badgeInfo: badges[idx] || {
        tag: `#${idx + 1} Top Pick`,
        color: 'from-emerald-600 to-teal-700',
        bgPill: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      },
    }));
  }, [opportunities]);

  if (rankedTop5.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all" id="top-5-recommendations-section">
      {/* Collapsible Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shadow-emerald-600/20 shrink-0">
            <Award className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                Top 5 Recommended ETF Opportunities
              </h2>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                <span>Ranked Picks</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">
              Pullback triggers, volume spike (&ge;1.5x), low TER (&le;0.08%), and NAV discount margin.
            </p>
          </div>
        </div>

        {/* Right side: Mini summary chips when collapsed & toggle button */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          {!isExpanded && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {rankedTop5.map((item) => (
                <span
                  key={item.etf.symbol}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectETF(item);
                  }}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
                  title={`${item.etf.fundName} (${item.scoreBreakdown.totalScore}/100)`}
                >
                  {item.etf.symbol} <span className="text-emerald-600 font-extrabold">{item.scoreBreakdown.totalScore}</span>
                </span>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Content: Compact Cards Grid */}
      {isExpanded && (
        <div className="p-3.5 sm:p-4 pt-0 border-t border-slate-100 bg-slate-50/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-3">
            {rankedTop5.map((item) => {
              const { etf, fundamentals, scoreBreakdown, isCandidate, priceChangePercent, volumeRatio, badgeInfo } = item;
              const isPriceFall = priceChangePercent < 0;
              const discount = etf.discountPremiumPercent ?? 0;
              const isNavDiscount = discount < 0;

              return (
                <div
                  key={etf.symbol}
                  onClick={() => onSelectETF(item)}
                  className="bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-150 flex flex-col justify-between p-3 cursor-pointer group relative overflow-hidden text-xs"
                  id={`top-etf-card-${etf.symbol.toLowerCase()}`}
                >
                  {/* Slim Accent Top Border */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${badgeInfo.color}`} />

                  <div>
                    {/* Top Row: Rank Tag + Bookmark */}
                    <div className="flex items-center justify-between gap-1.5 mb-1.5 pt-0.5">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${badgeInfo.bgPill} whitespace-nowrap truncate max-w-[120px]`}>
                        {badgeInfo.tag}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(etf.symbol, !etf.isWatchlist);
                        }}
                        className={`p-1 rounded transition-colors ${
                          etf.isWatchlist
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-slate-400 hover:text-slate-700'
                        }`}
                        title={etf.isWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                      >
                        <Bookmark className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Symbol & Category */}
                    <div className="mb-2">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="text-sm font-black font-mono text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                          {etf.symbol}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-500 truncate max-w-[65px]">
                          {etf.category || 'ETF'}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 truncate leading-tight mt-0.5" title={etf.fundName}>
                        {etf.fundName}
                      </p>
                    </div>

                    {/* Compact Price + Change + Score Bar */}
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 mb-2 font-mono">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-black text-slate-900">
                          ₹{etf.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span
                          className={`text-[11px] font-bold flex items-center gap-0.5 ${
                            isPriceFall ? 'text-rose-700' : 'text-emerald-700'
                          }`}
                        >
                          {isPriceFall ? <TrendingDown className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5" />}
                          {isPriceFall ? '' : '+'}
                          {priceChangePercent.toFixed(2)}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-1.5 mt-1 border-t border-slate-200/60">
                        <span className="text-slate-500 font-sans font-medium">Score</span>
                        <span className="font-extrabold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                          {scoreBreakdown.totalScore}/100
                        </span>
                      </div>
                    </div>

                    {/* 2x2 Mini Metric Grid */}
                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-600 mb-2">
                      <div className="bg-slate-50/70 border border-slate-100 rounded px-1.5 py-1">
                        <span className="text-slate-400 block text-[8px] uppercase">TER</span>
                        <strong className="text-slate-800 text-[10px]">{fundamentals.expenseRatioPercent || 0.05}%</strong>
                      </div>
                      <div className="bg-slate-50/70 border border-slate-100 rounded px-1.5 py-1">
                        <span className="text-slate-400 block text-[8px] uppercase">AUM</span>
                        <strong className="text-slate-800 text-[10px]">₹{Math.round(fundamentals.aumCr).toLocaleString('en-IN')}Cr</strong>
                      </div>
                      <div className="bg-slate-50/70 border border-slate-100 rounded px-1.5 py-1">
                        <span className="text-slate-400 block text-[8px] uppercase">Vol Ratio</span>
                        <strong className="text-amber-800 text-[10px]">{volumeRatio.toFixed(1)}×</strong>
                      </div>
                      <div className="bg-slate-50/70 border border-slate-100 rounded px-1.5 py-1">
                        <span className="text-slate-400 block text-[8px] uppercase">NAV Gap</span>
                        <strong className={`text-[10px] ${isNavDiscount ? 'text-emerald-700' : 'text-slate-700'}`}>
                          {discount > 0 ? '+' : ''}{discount.toFixed(1)}%
                        </strong>
                      </div>
                    </div>

                    {/* Trigger Highlight Pill */}
                    <div className="text-[10px] text-slate-600 bg-emerald-50/60 border border-emerald-100 rounded-md p-1.5 mb-2 leading-tight">
                      <div className="flex items-center gap-1 font-semibold text-emerald-800">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {isCandidate ? '200 EMA Pullback Trigger' : 'High Quality Passive Core'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compact Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectETF(item);
                    }}
                    className="w-full py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-all flex items-center justify-center gap-1 shadow-2xs group/btn"
                  >
                    <span>View Setup</span>
                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
