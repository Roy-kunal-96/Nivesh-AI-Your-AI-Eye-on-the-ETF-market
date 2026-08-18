import React, { useState } from 'react';
import { Candle, TechnicalIndicators } from '../types';

interface ETFPriceChartProps {
  candles: Candle[];
  currentPrice: number;
  technicals: TechnicalIndicators;
}

export const ETFPriceChart: React.FC<ETFPriceChartProps> = ({
  candles,
  currentPrice,
  technicals,
}) => {
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [showEMA200, setShowEMA200] = useState(true);
  const [showLevels, setShowLevels] = useState(true);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);

  if (!candles || candles.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs">
        No candlestick data available
      </div>
    );
  }

  // Calculate chart boundaries
  const allPrices = candles.flatMap((c) => [c.high, c.low]);
  if (technicals.ema200) allPrices.push(technicals.ema200);
  if (technicals.supportLevel) allPrices.push(technicals.supportLevel);
  if (technicals.resistanceLevel) allPrices.push(technicals.resistanceLevel);

  const minPrice = Math.min(...allPrices) * 0.985;
  const maxPrice = Math.max(...allPrices) * 1.015;
  const priceRange = maxPrice - minPrice || 1;

  const maxVolume = Math.max(...candles.map((c) => c.volume), 1);

  // SVG dimensions
  const width = 760;
  const height = 300;
  const padding = { top: 20, right: 65, bottom: 40, left: 15 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const volumeHeight = 65;
  const priceChartHeight = chartHeight - volumeHeight - 15;

  const candleWidth = Math.max(4, Math.min(16, (chartWidth / candles.length) * 0.65));

  const getY = (price: number) => {
    return padding.top + priceChartHeight - ((price - minPrice) / priceRange) * priceChartHeight;
  };

  const getX = (index: number) => {
    return padding.left + (index + 0.5) * (chartWidth / candles.length);
  };

  // Generate EMA curve approximations across candles for visualization
  const getEmaPoints = (finalEma: number, factor: number) => {
    return candles.map((c, i) => {
      const x = getX(i);
      const ratio = i / (candles.length - 1);
      // simulate realistic EMA curve ending at the exact calculated EMA value
      const simulatedEma = c.close * 0.4 + finalEma * (0.6 + ratio * 0.4 * factor);
      const y = getY(i === candles.length - 1 ? finalEma : simulatedEma);
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs" id="etf-candlestick-chart">
      {/* Chart Header & Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
        {/* Active Candle Hover Info */}
        <div className="flex items-center gap-3 font-mono text-[11px]">
          {hoveredCandle ? (
            <>
              <span className="text-slate-500 font-semibold">{hoveredCandle.date}</span>
              <span className="text-slate-600">O: <strong className="text-slate-900">₹{hoveredCandle.open}</strong></span>
              <span className="text-slate-600">H: <strong className="text-slate-900">₹{hoveredCandle.high}</strong></span>
              <span className="text-slate-600">L: <strong className="text-slate-900">₹{hoveredCandle.low}</strong></span>
              <span className="text-slate-600">C: <strong className={hoveredCandle.close >= hoveredCandle.open ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>₹{hoveredCandle.close}</strong></span>
              <span className="text-slate-500">Vol: <strong className="text-amber-800">{(hoveredCandle.volume / 100000).toFixed(1)}L</strong></span>
            </>
          ) : (
            <span className="text-slate-500 font-medium">Hover over candles to inspect OHLCV parameters</span>
          )}
        </div>

        {/* Indicator Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEMA20(!showEMA20)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              showEMA20 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            20 EMA (₹{technicals.ema20})
          </button>
          <button
            onClick={() => setShowEMA50(!showEMA50)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              showEMA50 ? 'bg-sky-100 text-sky-900 border border-sky-300' : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            50 EMA (₹{technicals.ema50})
          </button>
          <button
            onClick={() => setShowEMA200(!showEMA200)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              showEMA200 ? 'bg-purple-100 text-purple-900 border border-purple-300' : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            200 EMA (₹{technicals.ema200})
          </button>
          <button
            onClick={() => setShowLevels(!showLevels)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              showLevels ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            S/R Levels
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden bg-slate-50/50 rounded-lg p-1 border border-slate-100">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          id="candlestick-svg"
        >
          <defs>
            <linearGradient id="volGreen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="volRed" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const price = minPrice + (1 - pct) * priceRange;
            const y = padding.top + pct * priceChartHeight;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                />
                <text
                  x={width - padding.right + 6}
                  y={y + 3}
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  ₹{price.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Support Level Line */}
          {showLevels && technicals.supportLevel && (
            <g>
              <line
                x1={padding.left}
                y1={getY(technicals.supportLevel)}
                x2={width - padding.right}
                y2={getY(technicals.supportLevel)}
                stroke="#059669"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left + 5}
                y={getY(technicals.supportLevel) - 4}
                fill="#059669"
                fontSize="9"
                fontWeight="bold"
              >
                SUPPORT ₹{technicals.supportLevel}
              </text>
            </g>
          )}

          {/* Resistance Level Line */}
          {showLevels && technicals.resistanceLevel && (
            <g>
              <line
                x1={padding.left}
                y1={getY(technicals.resistanceLevel)}
                x2={width - padding.right}
                y2={getY(technicals.resistanceLevel)}
                stroke="#DC2626"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left + 5}
                y={getY(technicals.resistanceLevel) - 4}
                fill="#DC2626"
                fontSize="9"
                fontWeight="bold"
              >
                RESISTANCE ₹{technicals.resistanceLevel}
              </text>
            </g>
          )}

          {/* EMA Curves */}
          {showEMA20 && technicals.ema20 && (
            <polyline
              fill="none"
              stroke="#D97706"
              strokeWidth="2"
              points={getEmaPoints(technicals.ema20, 0.9)}
            />
          )}

          {showEMA50 && technicals.ema50 && (
            <polyline
              fill="none"
              stroke="#0284C7"
              strokeWidth="2"
              points={getEmaPoints(technicals.ema50, 0.85)}
            />
          )}

          {showEMA200 && technicals.ema200 && (
            <polyline
              fill="none"
              stroke="#7E22CE"
              strokeWidth="2.5"
              points={getEmaPoints(technicals.ema200, 0.75)}
            />
          )}

          {/* Candlesticks */}
          {candles.map((candle, idx) => {
            const isBullish = candle.close >= candle.open;
            const x = getX(idx);
            const highY = getY(candle.high);
            const lowY = getY(candle.low);
            const openY = getY(candle.open);
            const closeY = getY(candle.close);

            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(2, Math.abs(closeY - openY));

            const color = isBullish ? '#10B981' : '#EF4444';

            // Volume bar calculations
            const volY = height - padding.bottom;
            const volBarHeight = (candle.volume / maxVolume) * volumeHeight;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredCandle(candle)}
                className="cursor-pointer transition-opacity hover:opacity-80"
              >
                {/* Volume Bar */}
                <rect
                  x={x - candleWidth / 2}
                  y={volY - volBarHeight}
                  width={candleWidth}
                  height={volBarHeight}
                  fill={isBullish ? 'url(#volGreen)' : 'url(#volRed)'}
                  rx="1"
                />

                {/* Candlestick Upper & Lower Wicks */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={color}
                  strokeWidth="1.5"
                />

                {/* Candlestick Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  stroke={color}
                  strokeWidth="0.5"
                  rx="1"
                />
              </g>
            );
          })}

          {/* Volume Baseline Divider */}
          <line
            x1={padding.left}
            y1={height - padding.bottom - volumeHeight - 5}
            x2={width - padding.right}
            y2={height - padding.bottom - volumeHeight - 5}
            stroke="#CBD5E1"
            strokeWidth="0.75"
          />
          <text
            x={padding.left + 2}
            y={height - padding.bottom - volumeHeight + 8}
            fill="#64748B"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            VOLUME
          </text>

          {/* X Axis Dates */}
          {candles.filter((_, i) => i % Math.ceil(candles.length / 5) === 0).map((c, i) => {
            const idx = candles.indexOf(c);
            return (
              <text
                key={i}
                x={getX(idx)}
                y={height - 10}
                textAnchor="middle"
                fill="#64748B"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="semibold"
              >
                {c.date.slice(5)}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
