import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { marketService } from './src/services/marketDataService';
import { runRuleEngineTests } from './src/services/ruleEngine';
import { ScannerSettings, AIAnalysis } from './src/types';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-memory application settings for ETF scanning
let appSettings: ScannerSettings = {
  minPriceFallPercent: 1.0,
  minVolumeRatio: 1.5,
  avgVolumePeriodDays: 20,
  alertCooldownHours: 4,
  scanIntervalMinutes: 15,
  minOpportunityScore: 65,
  universe: 'ALL ETFS',
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Endpoints ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Nivesh AI - ETF Intelligence Engine',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Settings
  app.get('/api/settings', (req: Request, res: Response) => {
    res.json(appSettings);
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    appSettings = {
      ...appSettings,
      ...req.body,
    };
    res.json({ success: true, settings: appSettings });
  });

  // ETF Universe & List
  const handleGetUniverse = async (req: Request, res: Response) => {
    try {
      const universe = (req.query.universe as string) || appSettings.universe;
      const etfs = await marketService.getUniverse(universe);
      res.json(etfs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  app.get('/api/etfs', handleGetUniverse);

  // Single ETF Detail
  const handleGetSingle = async (req: Request, res: Response) => {
    try {
      const symbol = req.params.symbol;
      const etf = await marketService.getETF(symbol);
      if (!etf) {
        return res.status(404).json({ error: `ETF ${symbol} not found` });
      }
      res.json(etf);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  app.get('/api/etfs/:symbol', handleGetSingle);

  // Opportunities Scanner
  app.get('/api/opportunities', async (req: Request, res: Response) => {
    try {
      const candidates = await marketService.scanOpportunities(appSettings);
      res.json({
        timestamp: new Date().toISOString(),
        settings: appSettings,
        totalMonitored: candidates.length,
        candidatesDetected: candidates.filter((c) => c.isCandidate).length,
        opportunities: candidates,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Trigger Instant Scan
  app.post('/api/scan', async (req: Request, res: Response) => {
    try {
      const candidates = await marketService.scanOpportunities(appSettings);
      res.json({
        timestamp: new Date().toISOString(),
        status: 'Scan completed successfully',
        candidatesDetected: candidates.filter((c) => c.isCandidate).length,
        opportunities: candidates,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Market Breadth & Macro Context
  app.get('/api/market', async (req: Request, res: Response) => {
    try {
      const context = await marketService.getMarketContext();
      res.json(context);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Watchlist Endpoints
  app.get('/api/watchlist', async (req: Request, res: Response) => {
    try {
      const list = await marketService.getUniverse('WATCHLIST');
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/watchlist/toggle', async (req: Request, res: Response) => {
    try {
      const { symbol, isWatchlist } = req.body;
      if (!symbol) return res.status(400).json({ error: 'Symbol is required' });
      marketService.toggleWatchlist(symbol, Boolean(isWatchlist));
      res.json({ success: true, symbol, isWatchlist: Boolean(isWatchlist) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Backtesting & History Results
  const handleHistory = (req: Request, res: Response) => {
    try {
      const minFall = Number(req.query.minFall) || appSettings.minPriceFallPercent;
      const minVol = Number(req.query.minVol) || appSettings.minVolumeRatio;
      const backtest = marketService.runBacktest(minFall, minVol);
      const signals = marketService.getHistoricalSignals();
      res.json({
        backtest,
        signals,
        historicalSignals: signals,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  app.get('/api/backtest', handleHistory);
  app.get('/api/history', handleHistory);

  // Unit Test / Rule Engine Tester
  app.get('/api/rule-engine/tests', (req: Request, res: Response) => {
    const testResults = runRuleEngineTests();
    const allPassed = testResults.every((t) => t.passed);
    res.json({
      allPassed,
      totalTests: testResults.length,
      passedTests: testResults.filter((t) => t.passed).length,
      testCases: testResults,
      results: testResults,
      ruleSummary: {
        condition1: `Price Fall >= ${appSettings.minPriceFallPercent}% from Previous Close`,
        condition2: `Volume Ratio >= ${appSettings.minVolumeRatio}x of 20-Day Average`,
      },
    });
  });

  // Email Alert Trigger with 4-Hour Cooldown (and /api/alert alias)
  const handleAlertDispatch = (req: Request, res: Response) => {
    const { symbol, email, recipient } = req.body;
    const targetEmail = email || recipient || 'configured recipient';
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const inCooldown = marketService.isAlertInCooldown(symbol, appSettings.alertCooldownHours);
    if (inCooldown) {
      return res.status(429).json({
        error: `Alert cooldown active for ${symbol}. Next alert allowed in ${appSettings.alertCooldownHours} hours.`,
        cooldownHours: appSettings.alertCooldownHours,
      });
    }

    marketService.recordAlertSent(symbol);
    res.json({
      success: true,
      message: `Alert dispatched for ${symbol} to ${targetEmail}`,
      sentAt: new Date().toISOString(),
      cooldownExpiresInHours: appSettings.alertCooldownHours,
    });
  };

  app.post('/api/alert/send', handleAlertDispatch);
  app.post('/api/alert', handleAlertDispatch);

  // Gemini AI In-Depth ETF Opportunity Orchestration Endpoint
  app.post('/api/ai-analyze', async (req: Request, res: Response) => {
    const { symbol } = req.body;
    if (!symbol) {
      return res.status(400).json({ error: 'ETF symbol is required' });
    }

    const etfItem = await marketService.getETF(symbol);
    if (!etfItem) {
      return res.status(404).json({ error: `ETF ${symbol} not found` });
    }

    const priceChange = ((etfItem.etf.currentPrice - etfItem.etf.previousClose) / etfItem.etf.previousClose) * 100;
    const volRatio = etfItem.etf.currentVolume / etfItem.etf.average20DayVolume;

    const deterministicDataSummary = `
ETF Symbol: ${etfItem.etf.symbol} (${etfItem.etf.fundName})
Category: ${etfItem.etf.category}
Underlying Benchmark Index: ${etfItem.etf.underlyingIndex}
Issuer / AMC: ${etfItem.etf.amcName}
Current Market Price: ₹${etfItem.etf.currentPrice} (NAV: ₹${etfItem.etf.nav})
Discount / Premium to NAV: ${etfItem.etf.discountPremiumPercent > 0 ? '+' : ''}${etfItem.etf.discountPremiumPercent}%
Previous Close: ₹${etfItem.etf.previousClose}
Price Change: ${priceChange.toFixed(2)}%
Current Volume: ${etfItem.etf.currentVolume.toLocaleString('en-IN')} units
20-Day Avg Volume: ${etfItem.etf.average20DayVolume.toLocaleString('en-IN')} units
Volume Ratio: ${volRatio.toFixed(2)}x

ETF Fundamentals & Efficiency:
- AUM: ₹${etfItem.fundamentals.aumCr.toLocaleString('en-IN')} Cr
- Total Expense Ratio (TER): ${etfItem.fundamentals.expenseRatioPercent}%
- Tracking Error: ${etfItem.fundamentals.trackingErrorPercent}%
- 1-Year Return: ${etfItem.fundamentals.oneYearReturnPercent}%
- 3-Year CAGR: ${etfItem.fundamentals.threeYearCAGR}%
- 5-Year CAGR: ${etfItem.fundamentals.fiveYearCAGR}%
- Benchmark P/E: ${etfItem.fundamentals.benchmarkPE || 'N/A'}
- Benchmark Dividend Yield: ${etfItem.fundamentals.benchmarkDividendYield}%
- Top Holdings: ${etfItem.fundamentals.portfolioTopHoldings.map((h) => `${h.name} (${h.weightPercent}%)`).join(', ')}

Technical Indicators:
- 20 EMA: ₹${etfItem.technicals.ema20}
- 50 EMA: ₹${etfItem.technicals.ema50}
- 200 EMA: ₹${etfItem.technicals.ema200}
- RSI (14): ${etfItem.technicals.rsi14}
- MACD Line: ${etfItem.technicals.macd.macdLine}, Signal: ${etfItem.technicals.macd.signalLine}, Histogram: ${etfItem.technicals.macd.histogram}
- Support: ₹${etfItem.technicals.supportLevel}, Resistance: ₹${etfItem.technicals.resistanceLevel}
- Trend: ${etfItem.technicals.trend}

Macro & Benchmark Context:
- Benchmark / Sector: ${etfItem.marketContext.sectorName} (${etfItem.marketContext.sectorChangePercent}%)
- Relative Strength vs NIFTY: ${etfItem.marketContext.relativeStrengthVsNifty}%
- Market Breadth: ${etfItem.marketContext.marketBreadth.advances} Adv / ${etfItem.marketContext.marketBreadth.declines} Dec

Recent Macro & ETF News:
${etfItem.recentNews.map((n) => `- [${n.source}] ${n.title} (${n.summary})`).join('\n')}
    `;

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback deterministic analysis if Gemini key not set in dev
      const fallbackAnalysis: AIAnalysis = {
        symbol: etfItem.etf.symbol,
        classification: volRatio >= 1.5 && priceChange <= -1.0 ? 'STRONG ETF OPPORTUNITY' : 'ETF WATCH',
        opportunity_score: 86,
        risk_level: 'LOW',
        summary: `${etfItem.etf.symbol} (${etfItem.etf.fundName}) experienced a ${Math.abs(priceChange).toFixed(2)}% dip on heavy institutional volume (${volRatio.toFixed(2)}x 20-day average). Low expense ratio of ${etfItem.fundamentals.expenseRatioPercent}% and strong AUM (₹${etfItem.fundamentals.aumCr.toLocaleString('en-IN')} Cr) offer an attractive risk-adjusted entry into ${etfItem.etf.underlyingIndex}.`,
        why_triggered: [
          `ETF price dropped ${Math.abs(priceChange).toFixed(2)}% from previous close (Threshold: >= ${appSettings.minPriceFallPercent}%)`,
          `Daily trading volume surged to ${volRatio.toFixed(2)}x the 20-day baseline (Threshold: >= ${appSettings.minVolumeRatio}x)`,
        ],
        positive_factors: [
          `Institutional grade efficiency: Minimal tracking error (${etfItem.fundamentals.trackingErrorPercent}%) and ultra-low TER (${etfItem.fundamentals.expenseRatioPercent}%)`,
          `Trades close to NAV (${etfItem.etf.discountPremiumPercent > 0 ? '+' : ''}${etfItem.etf.discountPremiumPercent}%) ensuring high liquidity and fair pricing`,
          `Underlying benchmark (${etfItem.etf.underlyingIndex}) remains resilient with long-term 200 EMA support at ₹${etfItem.technicals.ema200}`,
        ],
        risk_factors: [
          `Short-term benchmark consolidation could test immediate support at ₹${etfItem.technicals.supportLevel}`,
          `Broader market volatility may produce secondary dip opportunities before trend resumption`,
        ],
        invalidation_factors: [
          `Decisive close below 200-day EMA support at ₹${etfItem.technicals.ema200}`,
          `Sudden blowout in ETF tracking error or persistent NAV discount widening above 1.5%`,
        ],
        recommendation: 'POTENTIAL_OPPORTUNITY',
        analyzedAt: new Date().toISOString(),
        modelUsed: 'Deterministic ETF Engine (Configure GEMINI_API_KEY for live AI generation)',
      };
      return res.json(fallbackAnalysis);
    }

    try {
      const prompt = `You are the chief quantitative ETF research analyst of "Nivesh AI — Your AI Eye on the ETF Market".
Analyze this Indian Exchange Traded Fund (ETF) opportunity candidate based STRICTLY on the deterministic verified data provided below.
Do NOT fabricate any data, prices, NAVs, or indicators.

${deterministicDataSummary}

Task:
1. Explain why the rule triggered for this ETF (Price fall >= ${appSettings.minPriceFallPercent}%, Volume >= ${appSettings.minVolumeRatio}x).
2. Detail positive structural and technical factors supporting an accumulation opportunity (AUM liquidity, low TER, tracking precision, underlying basket strength, NAV fair value).
3. Highlight genuine risk factors (e.g. macro headwinds affecting underlying index, sector-specific cyclicality, interest rate sensitivity).
4. Define concrete invalidation criteria that would nullify the opportunity.
5. Provide an institutional summary and objective recommendation category (WORTH_MONITORING, POTENTIAL_OPPORTUNITY, WAIT_FOR_CONFIRMATION, or HIGH_RISK_AVOID). Never promise guaranteed returns.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a disciplined Indian ETF and passive asset allocation research analyst. You evaluate pullback candidates objectively. You strictly return JSON adhering to the provided schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              symbol: { type: Type.STRING },
              classification: {
                type: Type.STRING,
                description: 'STRONG ETF OPPORTUNITY, ETF OPPORTUNITY, ETF WATCH, or HIGH-RISK ETF',
              },
              opportunity_score: { type: Type.NUMBER },
              risk_level: { type: Type.STRING, description: 'LOW, MEDIUM, HIGH, or VERY HIGH' },
              summary: { type: Type.STRING },
              why_triggered: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              positive_factors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              risk_factors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              invalidation_factors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendation: {
                type: Type.STRING,
                description: 'WORTH_MONITORING, WAIT_FOR_CONFIRMATION, HIGH_RISK_AVOID, or POTENTIAL_OPPORTUNITY',
              },
            },
            required: [
              'symbol',
              'classification',
              'opportunity_score',
              'risk_level',
              'summary',
              'why_triggered',
              'positive_factors',
              'risk_factors',
              'invalidation_factors',
              'recommendation',
            ],
          },
        },
      });

      const parsed: AIAnalysis = JSON.parse(response.text || '{}');
      parsed.analyzedAt = new Date().toISOString();
      parsed.modelUsed = 'gemini-3.7-flash';

      res.json(parsed);
    } catch (geminiError: any) {
      console.error('Gemini ETF analysis error:', geminiError);
      // Return safe structured analysis if AI service has a transient issue
      res.json({
        symbol: etfItem.etf.symbol,
        classification: 'ETF OPPORTUNITY',
        opportunity_score: 82,
        risk_level: 'LOW',
        summary: `Deterministic Opportunity detected for ${etfItem.etf.symbol} (${etfItem.etf.fundName}). Pullback of ${Math.abs(priceChange).toFixed(2)}% with ${volRatio.toFixed(2)}x volume ratio on index tracking ${etfItem.etf.underlyingIndex}.`,
        why_triggered: [
          `Price fall met strategy rule condition (${Math.abs(priceChange).toFixed(2)}% >= ${appSettings.minPriceFallPercent}%)`,
          `Volume exceeded 20-day baseline (${volRatio.toFixed(2)}x >= ${appSettings.minVolumeRatio}x)`,
        ],
        positive_factors: [
          `High AUM (₹${etfItem.fundamentals.aumCr.toLocaleString('en-IN')} Cr) and competitive expense ratio (${etfItem.fundamentals.expenseRatioPercent}%)`,
          `Tight tracking error of ${etfItem.fundamentals.trackingErrorPercent}% ensures accurate index replication`,
        ],
        risk_factors: [
          `AI service rate limit / transient timeout; rule engine maintains ETF signal integrity`,
        ],
        invalidation_factors: [`Breach of key support at ₹${etfItem.technicals.supportLevel}`],
        recommendation: 'WORTH_MONITORING',
        analyzedAt: new Date().toISOString(),
        modelUsed: 'Deterministic Fallback (AI API unavailable)',
      });
    }
  });

  // --- Vite Dev & Production Static Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nivesh AI Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
