import React from 'react';
import { OpportunityCandidate } from '../types';
import { Bookmark, Trash2, Eye, Percent, Layers } from 'lucide-react';

interface WatchlistManagerProps {
  opportunities: OpportunityCandidate[];
  onToggleWatchlist: (symbol: string, isWatchlist: boolean) => void;
  onSelectETF: (candidate: OpportunityCandidate) => void;
}

export const WatchlistManager: React.FC<WatchlistManagerProps> = ({
  opportunities,
  onToggleWatchlist,
  onSelectETF,
}) => {
  const watchlistItems = opportunities.filter((o) => o.etf.isWatchlist);

  return (
    <div className="space-y-4" id="watchlist-manager-container">
      {/* Header & Watchlist Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Bookmark className="w-5 h-5" />
            </div>
            <span>My ETF Watchlist</span>
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Focus ETF opportunity scanning and alert engines on your specific high-conviction index and commodity funds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300">
            {watchlistItems.length} ETFs Tracked
          </span>
        </div>
      </div>

      {/* Watchlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="watchlist-cards-grid">
        {watchlistItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200 shadow-2xs">
            No ETFs in your watchlist yet. Click the bookmark icon on any ETF opportunity to track it here.
          </div>
        ) : (
          watchlistItems.map((item) => {
            const etf = item.etf;
            const isFall = item.priceChangePercent < 0;
            const ter = item.fundamentals.expenseRatioPercent ?? 0.05;
            const discount = etf.discountPremiumPercent ?? 0;

            return (
              <div
                key={etf.symbol}
                onClick={() => onSelectETF(item)}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-xl p-4 transition-all cursor-pointer space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900 font-mono">{etf.symbol}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {etf.category || 'Index ETF'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-semibold mt-0.5 truncate max-w-[200px]">
                      {etf.fundName}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                      {etf.underlyingIndex}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist(etf.symbol, false);
                    }}
                    className="p-1.5 rounded bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition-colors border border-slate-200"
                    title="Remove from Watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-lg font-black font-mono text-slate-900">
                      ₹{etf.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      NAV ₹{(etf.nav || etf.currentPrice).toFixed(2)} ({discount > 0 ? '+' : ''}{discount.toFixed(2)}%)
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className={`px-2 py-0.5 rounded font-bold ${isFall ? 'text-rose-700 bg-rose-100' : 'text-emerald-700 bg-emerald-100'}`}>
                      {isFall ? '' : '+'}{item.priceChangePercent.toFixed(2)}%
                    </span>
                    <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                      {item.volumeRatio.toFixed(2)}× Vol
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>TER: <strong className="text-slate-800 font-mono">{ter.toFixed(2)}%</strong></span>
                  <span>Opp Score: <strong className="text-emerald-700 font-mono font-bold">{item.scoreBreakdown.totalScore}/100</strong></span>
                  <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                    <Eye className="w-3 h-3" /> Thesis
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
