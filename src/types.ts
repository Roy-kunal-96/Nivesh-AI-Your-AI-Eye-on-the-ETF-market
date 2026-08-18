export type ETFCategory =
  | 'Broad Market Index'
  | 'Sectoral & Thematic'
  | 'Commodities & Metals'
  | 'Smart Beta & Factor'
  | 'Global Index'
  | 'Debt & Fixed Income';

export interface TopHolding {
  name: string;
  weightPercent: number;
  sector?: string;
}

export interface ETF {
  id: string;
  symbol: string;
  fundName: string;
  amcName: string;
  companyName?: string;
  exchange: 'NSE' | 'BSE';
  category: ETFCategory | string;
  sector: string; // Underlying sector/theme
  underlyingIndex: string;
  currentPrice: number;
  nav?: number; // Net Asset Value in INR
  navPrice?: number; // Net Asset Value in INR (alias)
  discountPremiumPercent: number; // ((currentPrice - nav) / nav) * 100
  previousClose: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  currentVolume: number; // in units
  average20DayVolume: number; // in units
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  aumCr: number; // Assets Under Management in ₹ Crore
  marketCapCr?: number;
  expenseRatioPercent: number; // Total Expense Ratio (TER) %
  trackingErrorPercent: number; // 1Y Tracking Error %
  dividendYield?: number;
  peRatio?: number;
  benchmarkPE?: number;
  benchmarkDividendYield?: number; // %
  enabled?: boolean;
  isWatchlist?: boolean;
  lastUpdated?: string; // ISO date string
}

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  ema20: number;
  ema50: number;
  ema200: number;
  rsi14: number;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  atr14?: number;
  vwap: number;
  supportLevel: number;
  resistanceLevel: number;
  relativeVolume?: number;
  trend: 'Long-term Bullish' | 'Neutral' | 'Bearish' | 'Short-term Pullback in Uptrend' | string;
  historicalVolatility?: number; // %
}

export interface ETFFundamentals {
  expenseRatioPercent: number;
  aumCr: number;
  trackingErrorPercent: number;
  peRatio?: number;
  pbRatio?: number;
  roe?: number;
  roce?: number;
  debtToEquity?: number;
  freeCashFlowCr?: number;
  dividendYield?: number;
  promoterHolding?: number;
  benchmarkPE?: number;
  benchmarkPB?: number;
  benchmarkROE?: number;
  benchmarkDividendYield?: number;
  oneYearReturnPercent?: number;
  threeYearCAGR?: number;
  fiveYearCAGR?: number;
  standardDeviation1Y?: number; // Volatility %
  sharpeRatio?: number;
  betaVsNifty?: number;
  portfolioTopHoldings: TopHolding[];
  cashHoldingsPercent?: number;
  rebalancingFrequency?: string;
  categoryAvgTER?: number;
  categoryAvgTrackingError?: number;
}

export interface MarketContext {
  nifty50ChangePercent: number;
  nifty500ChangePercent?: number;
  indiaVix: number;
  marketBreadth?: {
    advances: number;
    declines: number;
    unchanged: number;
  };
  sectorName?: string;
  sectorChangePercent?: number;
  sectorTrend?: 'Bullish' | 'Neutral' | 'Bearish' | string;
  relativeStrengthVsNifty?: number; // % difference
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  category: 'Index Rebalance' | 'Macro' | 'AUM Surge' | 'Regulatory' | 'Commodity Cycle' | 'General' | string;
}

export interface OpportunityScoreBreakdown {
  technicalSetup: number; // out of 25
  volumeConfirmation: number; // out of 20
  trend: number; // out of 15
  etfFundamentals: number; // out of 20 (low TER, low tracking error, healthy AUM)
  fundamentals?: number; // alias
  valuation: number; // out of 10 (NAV discount, underlying benchmark valuation)
  marketContext: number; // out of 10
  totalScore: number; // out of 100
}

export type SignalClassification =
  | 'STRONG ETF OPPORTUNITY'
  | 'ETF OPPORTUNITY'
  | 'ETF WATCH'
  | 'HIGH-RISK ETF'
  | 'NO SIGNAL'
  | 'INSUFFICIENT DATA';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY HIGH';

export interface OpportunityCandidate {
  etf: ETF;
  priceChangePercent: number;
  volumeRatio: number;
  isCandidate: boolean;
  scoreBreakdown: OpportunityScoreBreakdown;
  classification: SignalClassification;
  riskLevel: RiskLevel;
  technicals: TechnicalIndicators;
  fundamentals: ETFFundamentals;
  marketContext: MarketContext;
  recentNews: NewsItem[];
  candles: Candle[];
  aiAnalysis?: AIAnalysis;
  detectedAt?: string;
  alertSent?: boolean;
}

export interface AIAnalysis {
  symbol: string;
  classification: SignalClassification;
  opportunity_score: number;
  risk_level: RiskLevel;
  summary: string;
  why_triggered: string[];
  positive_factors: string[];
  risk_factors: string[];
  invalidation_factors: string[];
  recommendation: 'WORTH_MONITORING' | 'WAIT_FOR_CONFIRMATION' | 'HIGH_RISK_AVOID' | 'POTENTIAL_OPPORTUNITY';
  analyzedAt: string;
  modelUsed: string;
}

export type ETFUniverseOption =
  | 'ALL ETFS'
  | 'EV & AUTO'
  | 'BANKING & FINANCIALS'
  | 'IT & TECH'
  | 'PHARMA & HEALTHCARE'
  | 'ENERGY & INFRA'
  | 'METALS & COMMODITIES'
  | 'DEFENCE & PSU'
  | 'CONSUMPTION'
  | 'SMART BETA'
  | 'WATCHLIST'
  | string;

export type AppThemeId =
  | 'emerald-bharat'
  | 'dalal-navy'
  | 'vedic-gold'
  | 'cyber-terminal'
  | 'royal-amethyst';

export interface BrandTheme {
  id: AppThemeId;
  name: string;
  subtitle: string;
  tagline: string;
  primaryColor: string; // hex
  primaryDark: string;
  primaryLight: string;
  primaryBorder: string;
  accentColor: string;
  gradient: string;
  bgClass: string;
  cardBgClass: string;
  textClass: string;
  mode: 'light' | 'dark';
  description: string;
}

export interface AppBrandingSettings {
  themeId: AppThemeId;
  deskName?: string; // e.g. "Family Office Desk", "Alpha Capital", "Personal Wealth"
  showLivePulse: boolean;
  density: 'comfortable' | 'compact';
}

export interface ScannerSettings {
  minPriceFallPercent: number; // default: 1.0%
  minVolumeRatio: number; // default: 1.5x
  volumeBaselineDays?: number; // default: 20
  avgVolumePeriodDays?: number;
  alertCooldownHours: number; // default: 4
  scanIntervalMinutes: number; // default: 15
  strongScoreThreshold?: number; // default: 80
  opportunityScoreThreshold?: number; // default: 65
  watchScoreThreshold?: number; // default: 50
  minOpportunityScore?: number; // default: 60
  notificationEmail?: string;
  universe: ETFUniverseOption;
  branding?: AppBrandingSettings;
}

export interface HistoricalSignal {
  id: string;
  date: string;
  symbol: string;
  fundName: string;
  category: ETFCategory | string;
  priceAtSignal: number;
  priceChangePercent: number;
  volumeRatio: number;
  score: number;
  classification: SignalClassification;
  risk: RiskLevel;
  day1Return?: number;
  day5Return?: number;
  day10Return?: number;
  day20Return?: number;
  status: 'PROFITABLE' | 'NEUTRAL' | 'LOSS' | string;
}

export interface BacktestResult {
  totalSignals: number;
  winRate: number; // %
  averageReturn1D: number;
  averageReturn5D: number;
  averageReturn10D: number;
  averageReturn20D: number;
  medianReturn: number;
  maxDrawdown: number;
  profitFactor: number;
  signals: HistoricalSignal[];
  equityCurve: { date: string; equity: number }[];
}

export interface RuleEngineTestCase {
  id: string;
  name: string;
  priceChangePercent: number;
  volumeRatio: number;
  expectedCandidate: boolean;
  actualCandidate?: boolean;
  passed?: boolean;
  notes: string;
}
