import React from 'react';
import { HistoricalSignal } from '../types';
import { History, ExternalLink } from 'lucide-react';

interface SignalHistoryViewProps {
  signals: HistoricalSignal[];
  onSelectSymbol: (symbol: string) => void;
}

export const SignalHistoryView: React.FC<SignalHistoryViewProps> = ({
  signals,
  onSelectSymbol,
}) => {
  return (
    <div className="space-y-4" id="signal-history-container">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                <History className="w-5 h-5" />
              </div>
              <span>Historical ETF Opportunity Signals Archive</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Deterministic log of ETF price pullback and unusual volume trigger events with post-signal performance tracking.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Total Logged: <strong className="text-slate-900 font-bold">{signals.length}</strong>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200 text-[11px] uppercase">
              <th className="p-3.5">Signal Timestamp</th>
              <th className="p-3.5">ETF Symbol & Name</th>
              <th className="p-3.5 text-right">Price at Signal</th>
              <th className="p-3.5 text-right">Price Fall %</th>
              <th className="p-3.5 text-right">Volume Ratio</th>
              <th className="p-3.5 text-center">Score</th>
              <th className="p-3.5 text-right">Day 1 Return</th>
              <th className="p-3.5 text-right">Day 5 Return</th>
              <th className="p-3.5 text-right">Day 20 Return</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
            {signals.map((sig) => (
              <tr key={sig.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3.5 text-slate-500 font-medium">{sig.date}</td>
                <td className="p-3.5">
                  <div className="flex flex-col font-sans">
                    <span className="font-bold text-slate-900 text-xs font-mono">{sig.symbol}</span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[180px]">
                      {sig.fundName || sig.companyName}
                    </span>
                  </div>
                </td>
                <td className="p-3.5 text-right text-slate-800">₹{sig.priceAtSignal}</td>
                <td className="p-3.5 text-right text-rose-700 font-bold">
                  {sig.priceChangePercent > 0 ? '+' : ''}{sig.priceChangePercent}%
                </td>
                <td className="p-3.5 text-right text-amber-800 font-bold">{sig.volumeRatio}×</td>
                <td className="p-3.5 text-center text-emerald-700 font-bold">{sig.score}</td>
                <td className={`p-3.5 text-right font-medium ${(sig.day1Return || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {(sig.day1Return || 0) > 0 ? '+' : ''}{sig.day1Return}%
                </td>
                <td className={`p-3.5 text-right font-medium ${(sig.day5Return || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {(sig.day5Return || 0) > 0 ? '+' : ''}{sig.day5Return}%
                </td>
                <td className={`p-3.5 text-right font-bold ${(sig.day20Return || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {(sig.day20Return || 0) > 0 ? '+' : ''}{sig.day20Return}%
                </td>
                <td className="p-3.5 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    sig.status === 'PROFITABLE'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {sig.status}
                  </span>
                </td>
                <td className="p-3.5 text-center">
                  <button
                    onClick={() => onSelectSymbol(sig.symbol)}
                    className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
                    title="View ETF Deep-Dive"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
