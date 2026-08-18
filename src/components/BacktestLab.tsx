import React, { useState, useEffect } from 'react';
import { BacktestResult, ScannerSettings } from '../types';
import {
  TrendingUp,
  Award,
  BarChart2,
  Percent,
  Sliders,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

interface BacktestLabProps {
  settings: ScannerSettings;
}

export const BacktestLab: React.FC<BacktestLabProps> = ({ settings }) => {
  const [minFall, setMinFall] = useState<number>(settings.minPriceFallPercent);
  const [minVol, setMinVol] = useState<number>(settings.minVolumeRatio);
  const [backtestData, setBacktestData] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runBacktest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minPriceFall: minFall, minVolumeRatio: minVol }),
      });
      if (res.ok) {
        const data = await res.json();
        setBacktestData(data);
      }
    } catch (err) {
      console.error('Backtest error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runBacktest();
  }, [minFall, minVol]);

  return (
    <div className="space-y-6" id="backtest-lab-container">
      {/* Strategy Rule Parameter Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs" id="backtest-controls-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                <BarChart2 className="w-5 h-5" />
              </div>
              <span>Deterministic Strategy Backtesting Simulator</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Simulate performance on historical price pullback and unusual volume events across Indian index and sectoral ETFs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runBacktest}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition-all disabled:opacity-50"
            >
              {loading ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-800 font-semibold">Min. Price Pullback Trigger (%):</span>
              <span className="font-mono text-emerald-700 font-bold">-{minFall.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={minFall}
              onChange={(e) => setMinFall(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.5% (Aggressive)</span>
              <span>1.0% (Default)</span>
              <span>4.0% (Deep Selloff)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-800 font-semibold">Min. Volume Surge Ratio:</span>
              <span className="font-mono text-emerald-700 font-bold">{minVol.toFixed(1)}× (20D Avg)</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.5"
              step="0.1"
              value={minVol}
              onChange={(e) => setMinVol(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1.0× (Standard)</span>
              <span>1.5× (Default)</span>
              <span>3.5× (Institutional Surge)</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Disclaimer:</strong> Historical backtest performance does not guarantee future returns. The rule engine highlights opportunities for human evaluation, not automated execution.
          </span>
        </div>
      </div>

      {/* Backtest Key Performance Metrics */}
      {backtestData && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" id="backtest-metrics-grid">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
              <span className="text-slate-500 text-xs font-semibold">Win Rate (20D)</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-emerald-700">{backtestData.winRate}%</span>
                <Percent className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
              <span className="text-slate-500 text-xs font-semibold">Avg Return (1D)</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-emerald-700">+{backtestData.averageReturn1D}%</span>
                <span className="text-[10px] text-slate-400 font-medium">Day 1</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
              <span className="text-slate-500 text-xs font-semibold">Avg Return (5D)</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-emerald-700">+{backtestData.averageReturn5D}%</span>
                <span className="text-[10px] text-slate-400 font-medium">Day 5</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
              <span className="text-slate-500 text-xs font-semibold">Avg Return (10D)</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-emerald-700">+{backtestData.averageReturn10D}%</span>
                <span className="text-[10px] text-slate-400 font-medium">Day 10</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
              <span className="text-slate-500 text-xs font-semibold">Avg Return (20D)</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-emerald-700">+{backtestData.averageReturn20D}%</span>
                <span className="text-[10px] text-slate-400 font-medium">Day 20</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
              <span className="text-slate-500 text-xs font-semibold">Profit Factor</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-sky-700">{backtestData.profitFactor}×</span>
                <span className="text-[10px] text-slate-400 font-medium">Max DD: {backtestData.maxDrawdown}%</span>
              </div>
            </div>
          </div>

          {/* Equity Growth Simulation Curve */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3" id="backtest-equity-chart">
            <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900">Simulated Portfolio Growth (Starting ₹1,00,000)</span>
              </div>
              <span className="font-mono text-emerald-700 font-bold text-sm">
                ₹{backtestData.equityCurve[backtestData.equityCurve.length - 1].equity.toLocaleString('en-IN')} (+18.4%)
              </span>
            </div>

            {/* SVG Equity Curve */}
            <div className="h-44 w-full">
              <svg viewBox="0 0 600 160" className="w-full h-full">
                <defs>
                  <linearGradient id="equityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[30, 70, 110].map((y, i) => (
                  <line key={i} x1="20" y1={y} x2="580" y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
                ))}

                {/* Area under curve */}
                <polygon
                  fill="url(#equityGrad)"
                  points="20,130 110,118 220,100 330,75 440,55 560,25 560,140 20,140"
                />

                {/* Main line */}
                <polyline
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="20,130 110,118 220,100 330,75 440,55 560,25"
                />

                {/* Nodes */}
                {[
                  { x: 20, y: 130, d: '01 Jul' },
                  { x: 110, y: 118, d: '15 Jul' },
                  { x: 220, y: 100, d: '28 Jul' },
                  { x: 330, y: 75, d: '05 Aug' },
                  { x: 440, y: 55, d: '12 Aug' },
                  { x: 560, y: 25, d: '16 Aug' },
                ].map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r="4" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
                    <text x={pt.x} y="152" fill="#64748B" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="semibold">
                      {pt.d}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Historical Trade Signals Log */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs" id="backtest-trades-table">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Simulated Historical Trade Signals ({backtestData.signals.length})
              </h4>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                    <th className="p-3">Signal Date</th>
                    <th className="p-3">ETF Symbol</th>
                    <th className="p-3 text-right">Price at Signal</th>
                    <th className="p-3 text-right">Pullback Fall %</th>
                    <th className="p-3 text-right">Volume Ratio</th>
                    <th className="p-3 text-center">Score</th>
                    <th className="p-3 text-right">1D Return</th>
                    <th className="p-3 text-right">5D Return</th>
                    <th className="p-3 text-right">20D Return</th>
                    <th className="p-3 text-center">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {backtestData.signals.map((sig) => (
                    <tr key={sig.id} className="hover:bg-slate-50 transition-colors font-mono text-[11px]">
                      <td className="p-3 text-slate-500 font-medium">{sig.date}</td>
                      <td className="p-3 font-bold text-slate-900">{sig.symbol}</td>
                      <td className="p-3 text-right text-slate-700">₹{sig.priceAtSignal}</td>
                      <td className="p-3 text-right text-rose-700 font-bold">{sig.priceChangePercent}%</td>
                      <td className="p-3 text-right text-amber-800 font-bold">{sig.volumeRatio}×</td>
                      <td className="p-3 text-center text-emerald-700 font-bold">{sig.score}</td>
                      <td className={`p-3 text-right font-medium ${(sig.day1Return || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {(sig.day1Return || 0) > 0 ? '+' : ''}{sig.day1Return}%
                      </td>
                      <td className={`p-3 text-right font-medium ${(sig.day5Return || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {(sig.day5Return || 0) > 0 ? '+' : ''}{sig.day5Return}%
                      </td>
                      <td className={`p-3 text-right font-bold ${(sig.day20Return || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {(sig.day20Return || 0) > 0 ? '+' : ''}{sig.day20Return}%
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sig.status === 'PROFITABLE'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {sig.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
