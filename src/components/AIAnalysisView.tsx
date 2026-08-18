import React from 'react';
import { AIAnalysis, OpportunityScoreBreakdown, RiskLevel, SignalClassification } from '../types';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldX,
  TrendingUp,
  Brain,
  Mail,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface AIAnalysisViewProps {
  analysis: AIAnalysis | null;
  scoreBreakdown: OpportunityScoreBreakdown;
  isLoading: boolean;
  onRefreshAI: () => void;
  onSendAlert: () => void;
  isAlertSent?: boolean;
}

export const AIAnalysisView: React.FC<AIAnalysisViewProps> = ({
  analysis,
  scoreBreakdown,
  isLoading,
  onRefreshAI,
  onSendAlert,
  isAlertSent = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs" id="ai-loading-state">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin" />
          <Brain className="w-6 h-6 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900">Synthesizing Market Intelligence...</h4>
          <p className="text-xs text-slate-600 max-w-md">
            Gemini is evaluating price pullback dynamics, volume accumulation signatures, moving average alignment, and fundamental health.
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-3 shadow-2xs" id="ai-empty-state">
        <Sparkles className="w-8 h-8 text-emerald-600 mx-auto" />
        <h4 className="text-sm font-bold text-slate-900">AI Institutional Analysis Ready</h4>
        <p className="text-xs text-slate-600 max-w-sm mx-auto">
          Generate an in-depth context breakdown, catalyst analysis, and risk invalidation thesis.
        </p>
        <button
          onClick={onRefreshAI}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Run Gemini Deep-Dive
        </button>
      </div>
    );
  }

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'WORTH_MONITORING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            WORTH MONITORING
          </span>
        );
      case 'POTENTIAL_OPPORTUNITY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300 shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5 text-sky-700" />
            POTENTIAL OPPORTUNITY
          </span>
        );
      case 'WAIT_FOR_CONFIRMATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            WAIT FOR CONFIRMATION
          </span>
        );
      case 'HIGH_RISK_AVOID':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
            HIGH RISK / AVOID
          </span>
        );
      default:
        return <span className="text-xs text-slate-600">{rec}</span>;
    }
  };

  return (
    <div className="space-y-4" id="ai-analysis-view-container">
      {/* AI Summary Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 sm:p-5 shadow-2xs relative overflow-hidden" id="ai-summary-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">Gemini Market Intelligence Synthesis</h4>
                <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                  {analysis.modelUsed}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                IST Analyzed: {new Date(analysis.analyzedAt).toLocaleTimeString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getRecommendationBadge(analysis.recommendation)}

            <button
              onClick={onRefreshAI}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              title="Refresh AI Analysis"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <p className="mt-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
          {analysis.summary}
        </p>

        {/* Actions Bar */}
        <div className="mt-4 pt-3 border-t border-emerald-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Deterministic strategy rules verified by backend engine.</span>
          </div>

          <button
            onClick={onSendAlert}
            disabled={isAlertSent}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              isAlertSent
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
            }`}
            id="dispatch-email-alert-button"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{isAlertSent ? 'Alert Cooldown Active (4h)' : 'Dispatch Email Alert'}</span>
          </button>
        </div>
      </div>

      {/* 4-Box Structured Factor Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="ai-factor-grid">
        {/* 1. Why Triggered */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>Why It Triggered (Core Rules)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {analysis.why_triggered.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Positive Supporting Factors */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>What Supports the Setup</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {analysis.positive_factors.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Key Risks & Warnings */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Key Risks & Friction Points</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {analysis.risk_factors.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-600 font-bold mt-0.5">!</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Thesis Invalidation Triggers */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2 text-indigo-800 text-xs font-bold">
            <ShieldX className="w-4 h-4 text-indigo-600" />
            <span>What Could Invalidate The Thesis</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {analysis.invalidation_factors.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold mt-0.5">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
