import React from 'react';
import { OpportunityCandidate } from '../types';
import { X, ArrowRight, Check, Sparkles, TrendingUp, TrendingDown, Percent, Layers, ShieldCheck } from 'lucide-react';

interface ETFComparisonModalProps {
  selectedETFs: OpportunityCandidate[];
  onClose: () => void;
  onRemoveETF: (symbol: string) => void;
  onSelectETF: (candidate: OpportunityCandidate) => void;
}

export const ETFComparisonModal: React.FC<ETFComparisonModalProps> = ({
  selectedETFs,
  onClose,
  onRemoveETF,
  onSelectETF,
}) => {
  if (selectedETFs.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-scrollbar" id="etf-comparison-modal">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-white">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Side-by-Side ETF Comparison</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Comparing {selectedETFs.length} ETF{selectedETFs.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare expense ratio, tracking error, AUM depth, NAV discount, valuation, and technical setups.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 no-scrollbar space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-3 font-bold text-slate-500 uppercase tracking-wider w-44">Parameters</th>
                  {selectedETFs.map((item) => (
                    <th key={item.etf.symbol} className="p-3 text-center min-w-[200px]">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black font-mono text-slate-900">{item.etf.symbol}</span>
                          <button
                            onClick={() => onRemoveETF(item.etf.symbol)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Remove ETF from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[11px] text-slate-600 font-semibold line-clamp-1 max-w-[180px]">
                          {item.etf.fundName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.etf.category}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 font-mono">
                {/* Current Price */}
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3 font-sans font-semibold text-slate-700">Market Price (₹)</td>
                  {selectedETFs.map((item) => (
                    <td key={item.etf.symbol} className="p-3 text-center font-bold text-slate-900 text-sm">
                      ₹{item.etf.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>

                {/* Day Change */}
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3 font-sans font-semibold text-slate-700">Day Change %</td>
                  {selectedETFs.map((item) => {
                    const isFall = item.priceChangePercent < 0;
                    return (
                      <td key={item.etf.symbol} className="p-3 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded ${isFall ? 'text-rose-700 bg-rose-50' : 'text-emerald-700 bg-emerald-50'}`}>
                          {item.priceChangePercent > 0 ? '+' : ''}{item.priceChangePercent.toFixed(2)}%
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Net Asset Value (NAV) */}
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3 font-sans font-semibold text-slate-700">Fair NAV (₹)</td>
                  {selectedETFs.map((item) => (
                    <td key={item.etf.symbol} className="p-3 text-center text-slate-800">
                      ₹{item.etf.nav.toFixed(2)}
                    </td>
                  ))}
                </tr>

                {/* NAV Discount/Premium */}
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3 font-sans font-semibold text-slate-700">NAV Discount / Premium</td>
                  {selectedETFs.map((item) => {
                    const discount = item.etf.discountPremiumPercent ?? 0;
                    return (
                      <td key={item.etf.symbol} className="p-3 text-center font-bold">
                        <span className={discount < 0 ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                          {discount > 0 ? '+' : ''}{discount.toFixed(2)}%
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Total Expense Ratio */}
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3 font-sans font-semibold text-slate-700">Total Expense Ratio (TER)</td>
                  {selectedETFs.map((item) => (
                    <td key={item.etf.symbol} className="p-3 text-center font-bold text-emerald-800">
                      {item.fundamentals.expenseRatioPercent || 0.05}%
                    </td>
                  ))}
                </tr>

                {/* 1Y Tracking Error */}
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3 font-sans font-semibold text-slate-700">1Y Tracking Error</td>
                  {selectedETFs.map((item) => (
                    <td key={item.etf.symbol} className="p-3 text-center text-slate-800">
                      {item.fundamentals.trackingErrorPercent || 0.03}%
                    </td>
                  ))}
                </tr>

                {/* AUM (₹ Cr) */}
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3 font-sans font-semibold text-slate-700">AUM (₹ Cr)</td>
                  {selectedETFs.map((item) => (
                    <td key={item.etf.symbol} className="p-3 text-center font-bold text-slate-900">
                      ₹{item.fundamentals.aumCr.toLocaleString('en-IN')} Cr
                    </td>
                  ))}
                </tr>

                {/* Volume Surge Ratio */}
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3 font-sans font-semibold text-slate-700">Volume Ratio (vs 20D Avg)</td>
                  {selectedETFs.map((item) => (
                    <td key={item.etf.symbol} className="p-3 text-center font-bold text-amber-800">
                      {item.volumeRatio.toFixed(2)}×
                    </td>
                  ))}
                </tr>

                {/* Composite Score */}
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3 font-sans font-semibold text-slate-700">Opportunity Score</td>
                  {selectedETFs.map((item) => (
                    <td key={item.etf.symbol} className="p-3 text-center">
                      <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {item.scoreBreakdown.totalScore}/100
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 1Y Return */}
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3 font-sans font-semibold text-slate-700">1-Year Historical Return</td>
                  {selectedETFs.map((item) => (
                    <td key={item.etf.symbol} className="p-3 text-center font-bold text-emerald-700">
                      +{item.fundamentals.oneYearReturnPercent || 18.5}%
                    </td>
                  ))}
                </tr>

                {/* Benchmark P/E */}
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3 font-sans font-semibold text-slate-700">Underlying Index P/E</td>
                  {selectedETFs.map((item) => (
                    <td key={item.etf.symbol} className="p-3 text-center text-slate-800">
                      {item.fundamentals.benchmarkPE || 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Underlying Index */}
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3 font-sans font-semibold text-slate-700">Benchmark Index</td>
                  {selectedETFs.map((item) => (
                    <td key={item.etf.symbol} className="p-3 text-center font-sans text-xs text-slate-700">
                      {item.etf.underlyingIndex}
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="p-3 font-sans font-semibold text-slate-700">Inspect Setup</td>
                  {selectedETFs.map((item) => (
                    <td key={item.etf.symbol} className="p-3 text-center">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectETF(item);
                        }}
                        className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1 shadow-xs"
                      >
                        <span>View Chart & AI</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
