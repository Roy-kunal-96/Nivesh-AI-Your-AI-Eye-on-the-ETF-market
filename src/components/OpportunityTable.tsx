import React, { useState, useMemo } from 'react';
import {
  OpportunityCandidate,
  SignalClassification,
  RiskLevel,
} from '../types';
import {
  TrendingDown,
  TrendingUp,
  Sparkles,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Info,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  Percent,
  SlidersHorizontal,
  X,
  Scale,
  Award,
  Bookmark,
} from 'lucide-react';
import { ETFComparisonModal } from './ETFComparisonModal';

interface OpportunityTableProps {
  opportunities: OpportunityCandidate[];
  onSelectETF: (candidate: OpportunityCandidate) => void;
  searchQuery: string;
  onToggleWatchlist?: (symbol: string, isWatchlist: boolean) => void;
}

export const OpportunityTable: React.FC<OpportunityTableProps> = ({
  opportunities,
  onSelectETF,
  searchQuery,
  onToggleWatchlist,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSignal, setSelectedSignal] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [activePreset, setActivePreset] = useState<'ALL' | 'TOP5' | 'CANDIDATES' | 'LOW_TER' | 'HIGH_VOL' | 'LARGE_AUM'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [sortField, setSortField] = useState<'score' | 'change' | 'volume' | 'symbol' | 'aum' | 'ter'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [comparedSymbols, setComparedSymbols] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Sectors / Categories list
  const categories = useMemo(() => [
    'ALL',
    ...Array.from(
      new Set(
        opportunities
          .map((o) => o.etf.sector || o.etf.category || 'Broad Market Index')
          .filter(Boolean)
      )
    ),
  ], [opportunities]);

  // Filtering
  const filtered = useMemo(() => {
    return opportunities.filter((item) => {
      const etf = item.etf;
      const name = etf.fundName || '';
      const symbol = etf.symbol || '';
      const sector = etf.sector || '';
      const category = etf.category || '';
      const amc = etf.amcName || '';
      const index = etf.underlyingIndex || '';

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          symbol.toLowerCase().includes(q) ||
          name.toLowerCase().includes(q) ||
          sector.toLowerCase().includes(q) ||
          category.toLowerCase().includes(q) ||
          amc.toLowerCase().includes(q) ||
          index.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Presets
      if (activePreset === 'CANDIDATES' && !item.isCandidate) {
        return false;
      }
      if (activePreset === 'LOW_TER' && (item.fundamentals.expenseRatioPercent || 0.1) > 0.1) {
        return false;
      }
      if (activePreset === 'HIGH_VOL' && item.volumeRatio < 1.5) {
        return false;
      }
      if (activePreset === 'LARGE_AUM' && (item.fundamentals.aumCr || 0) < 5000) {
        return false;
      }

      // Sector / Category filter
      if (selectedCategory !== 'ALL' && sector !== selectedCategory && category !== selectedCategory) {
        return false;
      }

      // Signal classification
      if (selectedSignal !== 'ALL' && item.classification !== selectedSignal) {
        return false;
      }

      // Risk
      if (selectedRisk !== 'ALL' && item.riskLevel !== selectedRisk) {
        return false;
      }

      return true;
    });
  }, [opportunities, searchQuery, activePreset, selectedCategory, selectedSignal, selectedRisk]);

  // Sorting
  const sorted = useMemo(() => {
    let list = [...filtered];

    if (activePreset === 'TOP5') {
      list.sort((a, b) => b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore);
      return list.slice(0, 5);
    }

    return list.sort((a, b) => {
      let diff = 0;
      const etfA = a.etf;
      const etfB = b.etf;

      if (sortField === 'score') {
        diff = a.scoreBreakdown.totalScore - b.scoreBreakdown.totalScore;
      } else if (sortField === 'change') {
        diff = a.priceChangePercent - b.priceChangePercent;
      } else if (sortField === 'volume') {
        diff = a.volumeRatio - b.volumeRatio;
      } else if (sortField === 'symbol') {
        diff = etfA.symbol.localeCompare(etfB.symbol);
      } else if (sortField === 'aum') {
        const aumA = a.fundamentals.aumCr || 0;
        const aumB = b.fundamentals.aumCr || 0;
        diff = aumA - aumB;
      } else if (sortField === 'ter') {
        const terA = a.fundamentals.expenseRatioPercent || 0;
        const terB = b.fundamentals.expenseRatioPercent || 0;
        diff = terA - terB;
      }
      return sortOrder === 'asc' ? diff : -diff;
    });
  }, [filtered, sortField, sortOrder, activePreset]);

  const handleSort = (field: 'score' | 'change' | 'volume' | 'symbol' | 'aum' | 'ter') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'ter' ? 'asc' : 'desc');
    }
  };

  const toggleCompare = (symbol: string) => {
    setComparedSymbols((prev) => {
      if (prev.includes(symbol)) {
        return prev.filter((s) => s !== symbol);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), symbol];
      }
      return [...prev, symbol];
    });
  };

  const getSignalBadge = (classification: SignalClassification) => {
    switch (classification) {
      case 'STRONG ETF OPPORTUNITY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap shadow-2xs">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            STRONG OPPORTUNITY
          </span>
        );
      case 'ETF OPPORTUNITY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            OPPORTUNITY
          </span>
        );
      case 'ETF WATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
            WATCH
          </span>
        );
      case 'HIGH-RISK ETF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            HIGH-RISK
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] text-slate-500 bg-slate-100">
            MONITORING
          </span>
        );
    }
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'LOW':
        return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Low Risk</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Med Risk</span>;
      case 'HIGH':
      case 'VERY HIGH':
        return <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">High Risk</span>;
    }
  };

  const selectedComparedETFs = opportunities.filter((o) => comparedSymbols.includes(o.etf.symbol));

  return (
    <div className="space-y-4" id="opportunity-table-section">
      {/* Quick Preset Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActivePreset('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activePreset === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ETFs ({opportunities.length})
            </button>

            <button
              onClick={() => setActivePreset('TOP5')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activePreset === 'TOP5'
                  ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Top 5 Recommendations</span>
            </button>

            <button
              onClick={() => setActivePreset('CANDIDATES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activePreset === 'CANDIDATES'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pullback Triggers ({opportunities.filter((o) => o.isCandidate).length})</span>
            </button>

            <button
              onClick={() => setActivePreset('LOW_TER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                activePreset === 'LOW_TER'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Low TER (≤0.10%)</span>
            </button>

            <button
              onClick={() => setActivePreset('HIGH_VOL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                activePreset === 'HIGH_VOL'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>High Volume (&ge;1.5x)</span>
            </button>

            <button
              onClick={() => setActivePreset('LARGE_AUM')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activePreset === 'LARGE_AUM'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              AUM &gt; ₹5,000 Cr
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dense Table View"
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>

        {/* Detailed Secondary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 font-medium"
                id="category-filter-select"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'ALL' ? 'All ETF Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Signal Classification */}
            <select
              value={selectedSignal}
              onChange={(e) => setSelectedSignal(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 font-medium"
              id="signal-filter-select"
            >
              <option value="ALL">All Signal Strengths</option>
              <option value="STRONG ETF OPPORTUNITY">Strong ETF Opportunity (80+)</option>
              <option value="ETF OPPORTUNITY">ETF Opportunity (65-79)</option>
              <option value="ETF WATCH">ETF Watch (50-64)</option>
              <option value="HIGH-RISK ETF">High-Risk ETF</option>
            </select>

            {/* Risk Filter */}
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 font-medium"
              id="risk-filter-select"
            >
              <option value="ALL">All Risk Ratings</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
            </select>

            {(selectedCategory !== 'ALL' || selectedSignal !== 'ALL' || selectedRisk !== 'ALL' || activePreset !== 'ALL') && (
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedSignal('ALL');
                  setSelectedRisk('ALL');
                  setActivePreset('ALL');
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span>
              Showing <strong className="text-slate-900">{sorted.length}</strong> of {opportunities.length} ETFs
            </span>

            {comparedSymbols.length > 0 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs animate-bounce"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare ({comparedSymbols.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Comparison Drawer if items selected */}
      {comparedSymbols.length > 0 && (
        <div className="sticky top-16 z-30 bg-slate-900 text-white p-3 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold font-mono">Comparing ({comparedSymbols.length}/3):</span>
            <div className="flex items-center gap-1.5">
              {comparedSymbols.map((sym) => (
                <span
                  key={sym}
                  className="bg-slate-800 text-emerald-300 text-[11px] font-mono px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1"
                >
                  {sym}
                  <button
                    onClick={() => toggleCompare(sym)}
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setComparedSymbols([])}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition-all shadow-xs"
            >
              <span>Open Side-by-Side Matrix</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: GRID CARDS VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="opportunity-grid-view">
          {sorted.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No ETFs match the selected criteria.
            </div>
          ) : (
            sorted.map((item) => {
              const { etf, fundamentals, scoreBreakdown, isCandidate, priceChangePercent, volumeRatio } = item;
              const isFall = priceChangePercent < 0;
              const discount = etf.discountPremiumPercent ?? 0;
              const isCompared = comparedSymbols.includes(etf.symbol);

              return (
                <div
                  key={etf.symbol}
                  onClick={() => onSelectETF(item)}
                  className={`bg-white rounded-2xl border transition-all p-4 cursor-pointer hover:shadow-md flex flex-col justify-between group relative ${
                    isCandidate ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Card Top Row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black font-mono text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {etf.symbol}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {etf.category}
                        </span>
                      </div>

                      {/* Compare Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompare(etf.symbol);
                        }}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all ${
                          isCompared
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                        title="Add to comparison matrix"
                      >
                        {isCompared ? '✓ Comparing' : '+ Compare'}
                      </button>
                    </div>

                    <p className="text-xs font-semibold text-slate-700 truncate">{etf.fundName}</p>
                    <p className="text-[10px] text-slate-400 truncate mb-3">Tracks: {etf.underlyingIndex}</p>

                    {/* Price & Change Row */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3 flex items-baseline justify-between font-mono">
                      <div>
                        <div className="text-lg font-black text-slate-900">
                          ₹{etf.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          NAV ₹{(etf.nav || etf.currentPrice).toFixed(2)} ({discount > 0 ? '+' : ''}{discount.toFixed(2)}%)
                        </span>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold ${
                            isFall ? 'text-rose-700 bg-rose-50' : 'text-emerald-700 bg-emerald-50'
                          }`}
                        >
                          {isFall ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                          {isFall ? '' : '+'}
                          {priceChangePercent.toFixed(2)}%
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Vol: <strong className="text-amber-800">{volumeRatio.toFixed(2)}×</strong>
                        </div>
                      </div>
                    </div>

                    {/* Key Stats Pill Row */}
                    <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono text-center mb-3">
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block text-[9px]">TER</span>
                        <strong className="text-slate-800">{fundamentals.expenseRatioPercent || 0.05}%</strong>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block text-[9px]">AUM</span>
                        <strong className="text-slate-800">₹{Math.round(fundamentals.aumCr).toLocaleString('en-IN')}Cr</strong>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block text-[9px]">1Y RET</span>
                        <strong className="text-emerald-700">+{fundamentals.oneYearReturnPercent || 18.5}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Score + Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 font-medium">Score:</span>
                      <span className="text-sm font-black font-mono text-emerald-700">
                        {scoreBreakdown.totalScore}/100
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectETF(item);
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>AI Thesis</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW MODE 2: DENSE PRO TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs no-scrollbar" id="opportunity-table-wrapper">
          <table className="w-full text-left border-collapse" id="nivesh-opportunity-table">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-3 text-center w-10">Compare</th>

                <th
                  onClick={() => handleSort('symbol')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                  id="th-etf"
                >
                  <div className="flex items-center gap-1.5">
                    <span>ETF / Benchmark Index</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="py-3.5 px-3 text-right">Price / NAV (₹)</th>

                <th
                  onClick={() => handleSort('change')}
                  className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-900 transition-colors"
                  id="th-change"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Price Change %</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('volume')}
                  className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-900 transition-colors"
                  id="th-volume"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Volume Ratio</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="py-3.5 px-3 text-center">Rule Check</th>

                <th
                  onClick={() => handleSort('ter')}
                  className="py-3.5 px-3 text-center cursor-pointer hover:text-slate-900 transition-colors"
                  id="th-ter"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>TER & Error</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('aum')}
                  className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-900 transition-colors"
                  id="th-aum"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>AUM (₹ Cr)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('score')}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-slate-900 transition-colors"
                  id="th-score"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>ETF Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="py-3.5 px-3 text-center">Risk</th>
                <th className="py-3.5 px-4 text-left">Signal</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Info className="w-6 h-6 text-slate-400" />
                      <span>No ETFs match the selected filter criteria.</span>
                      <button
                        onClick={() => {
                          setSelectedCategory('ALL');
                          setSelectedSignal('ALL');
                          setSelectedRisk('ALL');
                          setActivePreset('ALL');
                        }}
                        className="text-xs text-emerald-600 font-semibold hover:underline mt-1"
                      >
                        Reset all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sorted.map((item) => {
                  const etf = item.etf;
                  const isFall = item.priceChangePercent < 0;
                  const meetsRule = item.isCandidate;
                  const discount = etf.discountPremiumPercent ?? 0;
                  const aum = item.fundamentals.aumCr ?? etf.aumCr ?? 0;
                  const ter = item.fundamentals.expenseRatioPercent ?? 0.05;
                  const trackErr = item.fundamentals.trackingErrorPercent ?? 0.04;
                  const isCompared = comparedSymbols.includes(etf.symbol);

                  return (
                    <tr
                      key={etf.symbol}
                      onClick={() => onSelectETF(item)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                        meetsRule ? 'bg-emerald-50/30' : ''
                      }`}
                      id={`etf-row-${etf.symbol.toLowerCase()}`}
                    >
                      {/* Compare Checkbox */}
                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => toggleCompare(etf.symbol)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                          title="Select to compare"
                        />
                      </td>

                      {/* Symbol & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                              {etf.symbol}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-800 px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200">
                              {etf.category || 'ETF'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-700 font-medium truncate max-w-[220px]">
                            {etf.fundName}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[220px]">
                            Tracks: {etf.underlyingIndex || 'Benchmark Index'}
                          </span>
                        </div>
                      </td>

                      {/* Price & NAV */}
                      <td className="py-3.5 px-3 text-right font-mono">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-slate-900">
                            ₹{etf.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] mt-0.5">
                            <span className="text-slate-500">NAV ₹{(etf.nav || etf.currentPrice).toFixed(2)}</span>
                            <span
                              className={`px-1 py-0.2 rounded font-semibold ${
                                discount < 0
                                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                  : 'text-slate-600 bg-slate-100'
                              }`}
                              title="Discount/Premium to Net Asset Value"
                            >
                              {discount > 0 ? '+' : ''}{discount.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Change % */}
                      <td className="py-3.5 px-3 text-right font-mono">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-bold ${
                            isFall
                              ? 'text-rose-700 bg-rose-50 border border-rose-200'
                              : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {isFall ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : (
                            <TrendingUp className="w-3 h-3" />
                          )}
                          {item.priceChangePercent > 0 ? '+' : ''}
                          {item.priceChangePercent.toFixed(2)}%
                        </span>
                      </td>

                      {/* Volume Ratio */}
                      <td className="py-3.5 px-3 text-right font-mono">
                        <div className="flex flex-col items-end">
                          <span
                            className={`font-bold px-2 py-0.5 rounded ${
                              item.volumeRatio >= 1.5
                                ? 'text-amber-800 bg-amber-50 border border-amber-200'
                                : 'text-slate-700'
                            }`}
                          >
                            {item.volumeRatio.toFixed(2)}×
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5">
                            {(etf.currentVolume / 100000).toFixed(1)}L units
                          </span>
                        </div>
                      </td>

                      {/* Core Rule Check Badges */}
                      <td className="py-3.5 px-3 text-center">
                        {meetsRule ? (
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Rule Met
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              Fall ≥1% & Vol ≥1.5×
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                            Monitoring
                          </span>
                        )}
                      </td>

                      {/* TER & Tracking Error */}
                      <td className="py-3.5 px-3 text-center font-mono">
                        <div className="flex flex-col items-center">
                          <span className="text-slate-800 font-semibold">TER {ter.toFixed(2)}%</span>
                          <span className="text-[10px] text-slate-500">TE {trackErr.toFixed(2)}%</span>
                        </div>
                      </td>

                      {/* AUM (₹ Cr) */}
                      <td className="py-3.5 px-3 text-right font-mono">
                        <span className="text-slate-800 font-semibold">
                          ₹{aum.toLocaleString('en-IN')} Cr
                        </span>
                      </td>

                      {/* Opportunity Score */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-baseline gap-1">
                            <span
                              className={`text-base font-extrabold font-mono ${
                                item.scoreBreakdown.totalScore >= 80
                                  ? 'text-emerald-700'
                                  : item.scoreBreakdown.totalScore >= 65
                                  ? 'text-emerald-600'
                                  : item.scoreBreakdown.totalScore >= 50
                                  ? 'text-amber-700'
                                  : 'text-slate-500'
                              }`}
                            >
                              {item.scoreBreakdown.totalScore}
                            </span>
                            <span className="text-[10px] text-slate-400">/100</span>
                          </div>
                          {/* Mini score progress bar */}
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className={`h-full rounded-full ${
                                item.scoreBreakdown.totalScore >= 80
                                  ? 'bg-emerald-600'
                                  : item.scoreBreakdown.totalScore >= 65
                                  ? 'bg-emerald-500'
                                  : item.scoreBreakdown.totalScore >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400'
                              }`}
                              style={{ width: `${item.scoreBreakdown.totalScore}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Risk */}
                      <td className="py-3.5 px-3 text-center">
                        {getRiskBadge(item.riskLevel)}
                      </td>

                      {/* Signal Badge */}
                      <td className="py-3.5 px-4">
                        {getSignalBadge(item.classification)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectETF(item);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-all group-hover:border-emerald-300 shadow-2xs"
                          id={`btn-view-${etf.symbol.toLowerCase()}`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>AI Thesis</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Comparison Modal */}
      {isCompareModalOpen && (
        <ETFComparisonModal
          selectedETFs={selectedComparedETFs}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveETF={(sym) => setComparedSymbols((prev) => prev.filter((s) => s !== sym))}
          onSelectETF={onSelectETF}
        />
      )}
    </div>
  );
};
