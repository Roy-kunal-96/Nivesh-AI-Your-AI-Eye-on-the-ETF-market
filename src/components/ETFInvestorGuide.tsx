import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, Percent, ShieldCheck, Zap, TrendingDown } from 'lucide-react';

export const ETFInvestorGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs" id="etf-investor-guide">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                ETF Investor Quick Guide & Strategy Rules
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                Beginner Friendly
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Understand NAV discounts, low TER compounding, Tracking Error, and the 200 EMA Pullback Rule.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-sky-700">
          <span>{isOpen ? 'Hide Guide' : 'Read Guide'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/50 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Concept 1 */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <Zap className="w-4 h-4" />
                <span>Pullback Rule (≥1% Fall & ≥1.5× Vol)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                When an index or sector ETF drops ≥1% while trading volume surges 1.5× above its 20-day average near the 200 EMA, it signals institutional liquidity absorption and favorable swing risk-reward.
              </p>
            </div>

            {/* Concept 2 */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-sky-700 font-bold">
                <Percent className="w-4 h-4" />
                <span>Total Expense Ratio (TER)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                The annual fee charged by the AMC. Index ETFs typically charge <strong>0.04% to 0.15%</strong> (vs 1.5%–2% in active mutual funds). Keeping TER low adds significant compounding returns over a 5–10 year horizon.
              </p>
            </div>

            {/* Concept 3 */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-purple-700 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Tracking Error (TE)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Measures how closely the ETF mirrors its underlying index benchmark. Lower tracking error (below <strong>0.10%</strong>) indicates superior fund manager execution and precise index replication.
              </p>
            </div>

            {/* Concept 4 */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold">
                <TrendingDown className="w-4 h-4" />
                <span>NAV Discount vs. Premium</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                If the exchange market price is lower than the Net Asset Value (NAV), you are buying underlying stocks at a <strong>discount</strong>. Buying at a discount offers an extra margin of safety on entry.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
