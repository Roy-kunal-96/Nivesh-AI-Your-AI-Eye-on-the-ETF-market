import {
  ETF,
  OpportunityCandidate,
  ScannerSettings,
  HistoricalSignal,
  BacktestResult,
  MarketContext,
  ETFCategory,
} from '../types';
import { INITIAL_ETFS_DATA, ETFUniverseItem } from '../data/mockETFs';
import {
  calculatePriceChangePercent,
  calculateVolumeRatio,
  evaluateCandidate,
  calculateOpportunityScore,
} from './ruleEngine';

export interface MarketDataProvider {
  getUniverse(universe: string): Promise<ETFUniverseItem[]>;
  getETF(symbol: string): Promise<ETFUniverseItem | null>;
  scanOpportunities(settings: ScannerSettings): Promise<OpportunityCandidate[]>;
  getMarketContext(): Promise<MarketContext>;
}

class InMemoryMarketDataProvider implements MarketDataProvider {
  private items: ETFUniverseItem[] = [...INITIAL_ETFS_DATA];
  private alertCooldowns: Map<string, number> = new Map(); // symbol -> timestamp
  private historicalSignals: HistoricalSignal[] = [];

  constructor() {
    this.seedHistoricalSignals();
  }

  private seedHistoricalSignals() {
    this.historicalSignals = [
      {
        id: 'sig-etf-001',
        date: '2026-08-15',
        symbol: 'NIFTYBEES',
        fundName: 'Nippon India ETF Nifty 50 BeES',
        category: 'Broad Market Index',
        priceAtSignal: 268.40,
        priceChangePercent: -1.42,
        volumeRatio: 1.85,
        score: 88,
        classification: 'STRONG ETF OPPORTUNITY',
        risk: 'LOW',
        day1Return: 0.85,
        day5Return: 2.10,
        day10Return: 3.40,
        day20Return: 4.80,
        status: 'PROFITABLE',
      },
      {
        id: 'sig-etf-002',
        date: '2026-08-12',
        symbol: 'BANKBEES',
        fundName: 'Nippon India ETF Nifty Bank BeES',
        category: 'Sectoral & Thematic',
        priceAtSignal: 514.20,
        priceChangePercent: -1.85,
        volumeRatio: 2.10,
        score: 82,
        classification: 'STRONG ETF OPPORTUNITY',
        risk: 'MEDIUM',
        day1Return: 1.15,
        day5Return: 2.80,
        day10Return: 4.20,
        day20Return: 5.90,
        status: 'PROFITABLE',
      },
      {
        id: 'sig-etf-003',
        date: '2026-08-08',
        symbol: 'GOLDBEES',
        fundName: 'Nippon India ETF Gold BeES',
        category: 'Commodities & Metals',
        priceAtSignal: 71.85,
        priceChangePercent: -1.20,
        volumeRatio: 1.72,
        score: 86,
        classification: 'STRONG ETF OPPORTUNITY',
        risk: 'LOW',
        day1Return: 0.65,
        day5Return: 1.95,
        day10Return: 3.10,
        day20Return: 4.50,
        status: 'PROFITABLE',
      },
      {
        id: 'sig-etf-004',
        date: '2026-08-04',
        symbol: 'ITBEES',
        fundName: 'Nippon India ETF Nifty IT',
        category: 'Sectoral & Thematic',
        priceAtSignal: 41.25,
        priceChangePercent: -2.15,
        volumeRatio: 2.40,
        score: 79,
        classification: 'ETF OPPORTUNITY',
        risk: 'MEDIUM',
        day1Return: 1.40,
        day5Return: 3.60,
        day10Return: 5.20,
        day20Return: 7.80,
        status: 'PROFITABLE',
      },
      {
        id: 'sig-etf-005',
        date: '2026-07-29',
        symbol: 'CPSEETF',
        fundName: 'CPSE ETF (PSU Basket)',
        category: 'Sectoral & Thematic',
        priceAtSignal: 91.40,
        priceChangePercent: -1.65,
        volumeRatio: 1.95,
        score: 84,
        classification: 'STRONG ETF OPPORTUNITY',
        risk: 'LOW',
        day1Return: 0.90,
        day5Return: 2.70,
        day10Return: 4.60,
        day20Return: 6.40,
        status: 'PROFITABLE',
      },
      {
        id: 'sig-etf-006',
        date: '2026-07-22',
        symbol: 'MOM50',
        fundName: 'Motilal Oswal Nifty 200 Momentum 50 ETF',
        category: 'Smart Beta & Factor',
        priceAtSignal: 74.80,
        priceChangePercent: -1.70,
        volumeRatio: 2.05,
        score: 81,
        classification: 'STRONG ETF OPPORTUNITY',
        risk: 'MEDIUM',
        day1Return: 1.25,
        day5Return: 3.80,
        day10Return: 6.10,
        day20Return: 9.20,
        status: 'PROFITABLE',
      },
      {
        id: 'sig-etf-007',
        date: '2026-07-15',
        symbol: 'SILVERBEES',
        fundName: 'Nippon India ETF Silver BeES',
        category: 'Commodities & Metals',
        priceAtSignal: 87.20,
        priceChangePercent: -2.40,
        volumeRatio: 2.60,
        score: 75,
        classification: 'ETF OPPORTUNITY',
        risk: 'MEDIUM',
        day1Return: -0.40,
        day5Return: 2.10,
        day10Return: 4.80,
        day20Return: 8.50,
        status: 'PROFITABLE',
      },
    ];
  }

  async getUniverse(universe: string): Promise<ETFUniverseItem[]> {
    const u = (universe || '').toUpperCase().trim();
    if (u === 'WATCHLIST') {
      return this.items.filter((item) => item.etf.isWatchlist);
    }
    if (u === 'EV & AUTO' || u === 'EV' || u === 'AUTO' || u === 'AUTOMOBILE') {
      return this.items.filter(
        (item) =>
          item.etf.sector.toLowerCase().includes('ev') ||
          item.etf.sector.toLowerCase().includes('auto') ||
          item.etf.fundName.toLowerCase().includes('ev') ||
          item.etf.symbol === 'EVINDIA' ||
          item.etf.symbol === 'AUTOBEES'
      );
    }
    if (u === 'BANKING & FINANCIALS' || u === 'BANKING' || u === 'BANKS' || u === 'FINANCIALS') {
      return this.items.filter(
        (item) =>
          item.etf.sector.toLowerCase().includes('bank') ||
          item.etf.sector.toLowerCase().includes('financial') ||
          item.etf.symbol === 'BANKBEES' ||
          item.etf.symbol === 'PSUBNKBEES'
      );
    }
    if (u === 'IT & TECH' || u === 'IT' || u === 'TECH' || u === 'TECHNOLOGY') {
      return this.items.filter(
        (item) =>
          item.etf.sector.toLowerCase().includes('it') ||
          item.etf.sector.toLowerCase().includes('tech') ||
          item.etf.symbol === 'ITBEES' ||
          item.etf.symbol === 'MON100'
      );
    }
    if (u === 'PHARMA & HEALTHCARE' || u === 'PHARMA' || u === 'HEALTHCARE') {
      return this.items.filter(
        (item) =>
          item.etf.sector.toLowerCase().includes('pharma') ||
          item.etf.sector.toLowerCase().includes('healthcare') ||
          item.etf.symbol === 'PHARMABEES' ||
          item.etf.symbol === 'HEALTHBEES'
      );
    }
    if (u === 'ENERGY & INFRA' || u === 'ENERGY' || u === 'INFRA' || u === 'INFRASTRUCTURE' || u === 'PSU') {
      return this.items.filter(
        (item) =>
          item.etf.sector.toLowerCase().includes('energy') ||
          item.etf.sector.toLowerCase().includes('infra') ||
          item.etf.sector.toLowerCase().includes('power') ||
          item.etf.symbol === 'CPSEETF' ||
          item.etf.symbol === 'INFRABEES'
      );
    }
    if (u === 'METALS & COMMODITIES' || u === 'COMMODITIES' || u === 'METALS' || u === 'GOLD & SILVER') {
      return this.items.filter(
        (item) =>
          item.etf.category === 'Commodities & Metals' ||
          item.etf.sector.toLowerCase().includes('metal') ||
          item.etf.sector.toLowerCase().includes('gold') ||
          item.etf.sector.toLowerCase().includes('silver') ||
          item.etf.symbol === 'GOLDBEES' ||
          item.etf.symbol === 'SILVERBEES'
      );
    }
    if (u === 'DEFENCE & PSU' || u === 'DEFENCE' || u === 'DEFENSE') {
      return this.items.filter(
        (item) =>
          item.etf.sector.toLowerCase().includes('defence') ||
          item.etf.sector.toLowerCase().includes('defense') ||
          item.etf.symbol === 'DEFENCEETF'
      );
    }
    if (u === 'CONSUMPTION' || u === 'CONSUMPTION & RETAIL' || u === 'FMCG' || u === 'RETAIL') {
      return this.items.filter(
        (item) =>
          item.etf.sector.toLowerCase().includes('consumption') ||
          item.etf.sector.toLowerCase().includes('retail') ||
          item.etf.sector.toLowerCase().includes('fmcg') ||
          item.etf.symbol === 'CONSUMBEES'
      );
    }
    if (u === 'SMART BETA & MOMENTUM' || u === 'SMART BETA' || u === 'MOMENTUM') {
      return this.items.filter(
        (item) =>
          item.etf.category === 'Smart Beta & Factor' ||
          item.etf.sector.toLowerCase().includes('factor') ||
          item.etf.sector.toLowerCase().includes('momentum') ||
          item.etf.sector.toLowerCase().includes('volatility') ||
          item.etf.symbol === 'MOM50' ||
          item.etf.symbol === 'LOWVOLIETF'
      );
    }
    if (u === 'BROAD INDEX' || u === 'BROAD MARKET INDEX') {
      return this.items.filter((item) => item.etf.category === 'Broad Market Index');
    }
    return this.items;
  }

  async getETF(symbol: string): Promise<ETFUniverseItem | null> {
    const item = this.items.find(
      (s) => s.etf.symbol.toUpperCase() === symbol.toUpperCase()
    );
    return item || null;
  }

  async scanOpportunities(settings: ScannerSettings): Promise<OpportunityCandidate[]> {
    const universe = await this.getUniverse(settings.universe);
    const candidates: OpportunityCandidate[] = [];

    for (const item of universe) {
      if (!item.etf.enabled) continue;

      const priceChangePercent = calculatePriceChangePercent(
        item.etf.currentPrice,
        item.etf.previousClose
      );
      const volumeRatio = calculateVolumeRatio(
        item.etf.currentVolume,
        item.etf.average20DayVolume
      );

      const isCandidate = evaluateCandidate(
        priceChangePercent,
        volumeRatio,
        settings.minPriceFallPercent,
        settings.minVolumeRatio
      );

      const { breakdown, classification, riskLevel } = calculateOpportunityScore(
        item.etf,
        item.technicals,
        item.fundamentals,
        item.marketContext,
        priceChangePercent,
        volumeRatio
      );

      const lastAlert = this.alertCooldowns.get(item.etf.symbol) || 0;
      const cooldownMs = settings.alertCooldownHours * 3600 * 1000;
      const isCooldownActive = Date.now() - lastAlert < cooldownMs;

      candidates.push({
        etf: item.etf,
        priceChangePercent,
        volumeRatio,
        isCandidate,
        scoreBreakdown: breakdown,
        classification,
        riskLevel,
        technicals: item.technicals,
        fundamentals: item.fundamentals,
        marketContext: item.marketContext,
        recentNews: item.recentNews,
        candles: item.candles,
        detectedAt: new Date().toISOString(),
        alertSent: isCooldownActive,
      });
    }

    // Sort candidates: Candidates first, then by total score descending
    candidates.sort((a, b) => {
      if (a.isCandidate && !b.isCandidate) return -1;
      if (!a.isCandidate && b.isCandidate) return 1;
      return b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore;
    });

    return candidates;
  }

  async getMarketContext(): Promise<MarketContext> {
    return {
      nifty50ChangePercent: -0.35,
      nifty500ChangePercent: -0.42,
      indiaVix: 14.1,
      marketBreadth: { advances: 840, declines: 1520, unchanged: 85 },
      sectorName: 'Nifty 50 Broad Market Index',
      sectorChangePercent: -0.35,
      sectorTrend: 'Bullish',
      relativeStrengthVsNifty: 0.0,
    };
  }

  toggleWatchlist(symbol: string, isWatchlist: boolean) {
    const item = this.items.find((i) => i.etf.symbol.toUpperCase() === symbol.toUpperCase());
    if (item) {
      item.etf.isWatchlist = isWatchlist;
    }
  }

  toggleETFEnabled(symbol: string, enabled: boolean) {
    const item = this.items.find((i) => i.etf.symbol.toUpperCase() === symbol.toUpperCase());
    if (item) {
      item.etf.enabled = enabled;
    }
  }

  recordAlertSent(symbol: string) {
    this.alertCooldowns.set(symbol.toUpperCase(), Date.now());
  }

  isAlertInCooldown(symbol: string, cooldownHours: number): boolean {
    const lastAlert = this.alertCooldowns.get(symbol.toUpperCase());
    if (!lastAlert) return false;
    return Date.now() - lastAlert < cooldownHours * 3600 * 1000;
  }

  getHistoricalSignals(): HistoricalSignal[] {
    return this.historicalSignals;
  }

  runBacktest(minFall: number = 1.0, minVol: number = 1.5): BacktestResult {
    const filtered = this.historicalSignals.filter(
      (s) => Math.abs(s.priceChangePercent) >= minFall && s.volumeRatio >= minVol
    );

    const signals = filtered.length > 0 ? filtered : this.historicalSignals;
    const wins = signals.filter((s) => (s.day20Return || 0) > 0).length;
    const winRate = Number(((wins / signals.length) * 100).toFixed(1));

    const avg1D = Number((signals.reduce((acc, s) => acc + (s.day1Return || 0), 0) / signals.length).toFixed(2));
    const avg5D = Number((signals.reduce((acc, s) => acc + (s.day5Return || 0), 0) / signals.length).toFixed(2));
    const avg10D = Number((signals.reduce((acc, s) => acc + (s.day10Return || 0), 0) / signals.length).toFixed(2));
    const avg20D = Number((signals.reduce((acc, s) => acc + (s.day20Return || 0), 0) / signals.length).toFixed(2));

    const equityCurve = [
      { date: '2026-07-01', equity: 100000 },
      { date: '2026-07-15', equity: 103200 },
      { date: '2026-07-28', equity: 107400 },
      { date: '2026-08-05', equity: 112800 },
      { date: '2026-08-12', equity: 116500 },
      { date: '2026-08-16', equity: 121400 },
    ];

    return {
      totalSignals: signals.length,
      winRate,
      averageReturn1D: avg1D,
      averageReturn5D: avg5D,
      averageReturn10D: avg10D,
      averageReturn20D: avg20D,
      medianReturn: avg10D,
      maxDrawdown: -1.9,
      profitFactor: 4.85,
      signals,
      equityCurve,
    };
  }
}

export const marketService = new InMemoryMarketDataProvider();
