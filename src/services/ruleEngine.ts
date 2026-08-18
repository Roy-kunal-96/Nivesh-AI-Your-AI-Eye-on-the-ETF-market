import {
  ETF,
  TechnicalIndicators,
  ETFFundamentals,
  MarketContext,
  OpportunityScoreBreakdown,
  SignalClassification,
  RiskLevel,
  RuleEngineTestCase,
} from '../types';

/**
 * Deterministic calculation of percentage price change from previous close.
 * Formula: ((current_price - previous_close) / previous_close) * 100
 */
export function calculatePriceChangePercent(
  currentPrice: number,
  previousClose: number
): number {
  if (!previousClose || previousClose <= 0) return 0;
  return Number((((currentPrice - previousClose) / previousClose) * 100).toFixed(2));
}

/**
 * Deterministic calculation of volume ratio compared to 20-day average.
 * Formula: current_volume / average_20_day_volume
 */
export function calculateVolumeRatio(
  currentVolume: number,
  averageVolume: number
): number {
  if (!averageVolume || averageVolume <= 0) return 0;
  return Number((currentVolume / averageVolume).toFixed(2));
}

/**
 * Core ETF Rule Check:
 * IF price_change_percent <= -minPriceFall (default -1.0%)
 * AND volume_ratio >= minVolumeRatio (default 1.5x)
 * THEN candidate = TRUE
 * ELSE candidate = FALSE
 */
export function evaluateCandidate(
  priceChangePercent: number,
  volumeRatio: number,
  minPriceFallPercent: number = 1.0,
  minVolumeRatio: number = 1.5
): boolean {
  const meetsPriceFall = priceChangePercent <= -Math.abs(minPriceFallPercent);
  const meetsVolumeRatio = volumeRatio >= minVolumeRatio;
  return meetsPriceFall && meetsVolumeRatio;
}

/**
 * Transparent 0-100 ETF Opportunity Score calculation.
 * Weightings:
 * - Technical Setup: 25
 * - Volume Confirmation: 20
 * - Trend: 15
 * - ETF Fundamentals (TER, Tracking Error, AUM Liquidity): 20
 * - Valuation (NAV Discount & Benchmark Valuation): 10
 * - Market/Sector Context: 10
 */
export function calculateOpportunityScore(
  etf: ETF,
  technicals: TechnicalIndicators,
  fundamentals: ETFFundamentals,
  marketContext: MarketContext,
  priceChangePercent: number,
  volumeRatio: number
): { breakdown: OpportunityScoreBreakdown; classification: SignalClassification; riskLevel: RiskLevel } {
  // 1. Technical Setup (Max 25)
  let techScore = 0;
  if (etf.currentPrice >= technicals.ema200) techScore += 8; // Above 200 EMA
  else if (etf.currentPrice >= technicals.ema200 * 0.96) techScore += 4;

  if (etf.currentPrice >= technicals.ema50) techScore += 6; // Above 50 EMA
  else if (etf.currentPrice >= technicals.ema50 * 0.97) techScore += 3;

  if (technicals.rsi14 >= 38 && technicals.rsi14 <= 54) {
    techScore += 7; // Ideal pullback dip zone for ETF accumulation
  } else if (technicals.rsi14 < 38) {
    techScore += 5; // Oversold dip
  } else if (technicals.rsi14 <= 65) {
    techScore += 4;
  } else {
    techScore += 1;
  }

  // Support proximity check
  const distToSupport = Math.abs(etf.currentPrice - technicals.supportLevel) / etf.currentPrice;
  if (distToSupport <= 0.03) techScore += 4; // Bouncing right at support
  else if (distToSupport <= 0.06) techScore += 2;

  techScore = Math.min(25, Math.max(0, techScore));

  // 2. Volume Confirmation (Max 20)
  let volScore = 0;
  if (volumeRatio >= 3.0) volScore = 20;
  else if (volumeRatio >= 2.0) volScore = 18;
  else if (volumeRatio >= 1.5) volScore = 15;
  else if (volumeRatio >= 1.2) volScore = 8;
  else volScore = 4;

  // 3. Trend (Max 15)
  let trendScore = 0;
  if (technicals.trend === 'Short-term Pullback in Uptrend' || technicals.trend === 'Long-term Bullish') {
    trendScore = 14;
    if (technicals.ema20 > technicals.ema50 && technicals.ema50 > technicals.ema200) {
      trendScore = 15; // Perfect bullish alignment
    }
  } else if (technicals.trend === 'Neutral') {
    trendScore = 8;
  } else {
    trendScore = 3; // Bearish
  }

  // 4. ETF Fundamentals & Efficiency (Max 20)
  let fundScore = 0;
  // A. Low Expense Ratio (TER %)
  if (fundamentals.expenseRatioPercent <= 0.08) fundScore += 7;
  else if (fundamentals.expenseRatioPercent <= 0.25) fundScore += 5;
  else if (fundamentals.expenseRatioPercent <= 0.50) fundScore += 3;
  else fundScore += 1;

  // B. Low Tracking Error %
  if (fundamentals.trackingErrorPercent <= 0.05) fundScore += 7;
  else if (fundamentals.trackingErrorPercent <= 0.10) fundScore += 5;
  else if (fundamentals.trackingErrorPercent <= 0.20) fundScore += 3;
  else fundScore += 1;

  // C. High AUM & Liquid Market Depth
  if (fundamentals.aumCr >= 5000) fundScore += 6;
  else if (fundamentals.aumCr >= 1500) fundScore += 4;
  else if (fundamentals.aumCr >= 500) fundScore += 2;
  else fundScore += 1;

  fundScore = Math.min(20, Math.max(0, fundScore));

  // 5. Valuation & NAV Spread (Max 10)
  let valScore = 0;
  // Discount to NAV is ideal for buyers
  if (etf.discountPremiumPercent <= -0.10) valScore += 5; // Buying at discount to NAV
  else if (Math.abs(etf.discountPremiumPercent) <= 0.25) valScore += 4; // Fair NAV pricing
  else if (etf.discountPremiumPercent > 1.0) valScore += 1; // High premium warning
  else valScore += 3;

  // Benchmark P/E or Dividend Yield
  if (fundamentals.benchmarkPE > 0) {
    if (fundamentals.benchmarkPE <= 18) valScore += 5;
    else if (fundamentals.benchmarkPE <= 26) valScore += 4;
    else valScore += 2;
  } else if (fundamentals.benchmarkDividendYield >= 3.0) {
    valScore += 5; // High yielding commodity/debt/PSU ETF
  } else {
    valScore += 4;
  }

  valScore = Math.min(10, Math.max(0, valScore));

  // 6. Market/Sector Context (Max 10)
  let mktScore = 0;
  if (marketContext.sectorTrend === 'Bullish') mktScore += 4;
  else if (marketContext.sectorTrend === 'Neutral') mktScore += 2;

  if (marketContext.relativeStrengthVsNifty >= 0) mktScore += 3;
  else if (marketContext.relativeStrengthVsNifty > -1.5) mktScore += 1;

  if (marketContext.nifty50ChangePercent >= 0) mktScore += 3;
  else if (marketContext.nifty50ChangePercent > -0.8) mktScore += 2;

  mktScore = Math.min(10, Math.max(0, mktScore));

  const totalScore = Math.round(techScore + volScore + trendScore + fundScore + valScore + mktScore);

  // Determine Risk Level
  let riskLevel: RiskLevel = 'MEDIUM';
  if (fundamentals.trackingErrorPercent > 0.30 || fundamentals.aumCr < 500 || technicals.rsi14 < 25) {
    riskLevel = 'HIGH';
  } else if (fundScore >= 16 && techScore >= 18 && fundamentals.aumCr >= 5000) {
    riskLevel = 'LOW';
  } else if (technicals.trend === 'Bearish' && marketContext.sectorTrend === 'Bearish') {
    riskLevel = 'HIGH';
  }

  // Determine Classification
  let classification: SignalClassification = 'NO SIGNAL';
  if (totalScore >= 80) {
    classification = riskLevel === 'HIGH' ? 'HIGH-RISK ETF' : 'STRONG ETF OPPORTUNITY';
  } else if (totalScore >= 65) {
    classification = riskLevel === 'HIGH' ? 'HIGH-RISK ETF' : 'ETF OPPORTUNITY';
  } else if (totalScore >= 50) {
    classification = 'ETF WATCH';
  } else {
    classification = riskLevel === 'HIGH' ? 'HIGH-RISK ETF' : 'NO SIGNAL';
  }

  return {
    breakdown: {
      technicalSetup: techScore,
      volumeConfirmation: volScore,
      trend: trendScore,
      etfFundamentals: fundScore,
      fundamentals: fundScore,
      valuation: valScore,
      marketContext: mktScore,
      totalScore,
    },
    classification,
    riskLevel,
  };
}

/**
 * Standard Unit Test Suite for ETF Rule Engine verification
 */
export function runRuleEngineTests(): RuleEngineTestCase[] {
  const testCases: RuleEngineTestCase[] = [
    {
      id: 'test-1-niftybees-trigger',
      name: 'NIFTYBEES Pullback: Fall -1.42%, Vol Ratio 1.85x',
      priceChangePercent: -1.42,
      volumeRatio: 1.85,
      expectedCandidate: true,
      notes: 'Matches core ETF rule: price fall >= 1.0% AND volume ratio >= 1.5x on broad index ETF',
    },
    {
      id: 'test-2-insufficient-fall',
      name: 'JUNIORBEES: Fall -0.40%, Vol Ratio 2.20x',
      priceChangePercent: -0.40,
      volumeRatio: 2.20,
      expectedCandidate: false,
      notes: 'Volume is high but price fall is under 1% threshold, so Candidate = FALSE',
    },
    {
      id: 'test-3-insufficient-volume',
      name: 'GOLDBEES: Fall -2.40%, Vol Ratio 1.15x',
      priceChangePercent: -2.40,
      volumeRatio: 1.15,
      expectedCandidate: false,
      notes: 'Price drop is significant but volume ratio is below 1.5x threshold, so Candidate = FALSE',
    },
    {
      id: 'test-4-positive-day',
      name: 'BANKBEES: Gain +1.80%, Vol Ratio 3.10x',
      priceChangePercent: 1.80,
      volumeRatio: 3.10,
      expectedCandidate: false,
      notes: 'Positive day cannot be a pullback candidate, Candidate = FALSE',
    },
    {
      id: 'test-5-exact-boundary',
      name: 'Boundary Test: Fall -1.00%, Vol Ratio 1.50x',
      priceChangePercent: -1.00,
      volumeRatio: 1.50,
      expectedCandidate: true,
      notes: 'Exact boundary conditions should trigger Candidate = TRUE',
    },
    {
      id: 'test-6-deep-pullback-ultra-volume',
      name: 'ITBEES Heavy Pullback: Fall -2.15%, Vol Ratio 2.40x',
      priceChangePercent: -2.15,
      volumeRatio: 2.40,
      expectedCandidate: true,
      notes: 'Strong sectoral ETF candidate meeting all pullback volume surge criteria',
    },
  ];

  return testCases.map((tc) => {
    const actual = evaluateCandidate(tc.priceChangePercent, tc.volumeRatio);
    return {
      ...tc,
      actualCandidate: actual,
      passed: actual === tc.expectedCandidate,
    };
  });
}
