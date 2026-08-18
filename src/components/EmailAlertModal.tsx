import React, { useState } from 'react';
import { OpportunityCandidate, ScannerSettings } from '../types';
import { NiveshLogo } from './NiveshLogo';
import { X, Send, CheckCircle2, Mail, Clock, ShieldCheck } from 'lucide-react';

interface EmailAlertModalProps {
  candidate: OpportunityCandidate | null;
  isOpen: boolean;
  onClose: () => void;
  settings: ScannerSettings;
  onConfirmSend: (symbol: string) => void;
}

export const EmailAlertModal: React.FC<EmailAlertModalProps> = ({
  candidate,
  isOpen,
  onClose,
  settings,
  onConfirmSend,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen || !candidate) return null;

  const etf = candidate.etf;

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      onConfirmSend(etf.symbol);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 1800);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto no-scrollbar" id="email-alert-modal-backdrop">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden my-auto" id="email-alert-modal-content">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Nivesh AI Institutional ETF Alert</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Body Preview */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar text-xs font-sans">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
            {/* Email Top Brand */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <NiveshLogo variant="full" size="sm" theme="light" />
              <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                ETF MARKET INTELLIGENCE DISPATCH
              </span>
            </div>

            {/* Email Subject Line */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-600 font-medium">Subject:</span>
              <div className="p-2.5 bg-white rounded-lg text-slate-900 font-bold font-mono text-xs border border-slate-200 shadow-2xs">
                [Nivesh AI Alert] ETF Opportunity Detected: {etf.symbol} (Pullback: {candidate.priceChangePercent.toFixed(2)}%, Vol: {candidate.volumeRatio.toFixed(2)}×, Score: {candidate.scoreBreakdown.totalScore}/100)
              </div>
            </div>

            {/* Email Recipient */}
            <div className="flex items-center justify-between text-slate-600 text-[11px]">
              <span>To: <strong className="text-slate-900">{settings.notificationEmail}</strong></span>
              <span className="font-mono text-slate-500">{new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span>
            </div>

            {/* Structured Table */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-baseline justify-between border-b border-slate-200 pb-2">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{etf.fundName} ({etf.symbol})</h4>
                  <span className="text-slate-600 text-[11px]">{etf.underlyingIndex || etf.sector} • {etf.amcName || 'NSE'}</span>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-slate-900 font-mono">₹{etf.currentPrice}</div>
                  <div className="text-rose-700 font-bold font-mono text-xs">{candidate.priceChangePercent.toFixed(2)}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>Volume Surge: <strong className="text-amber-800 font-bold">{candidate.volumeRatio.toFixed(2)}×</strong></div>
                <div>Opportunity Score: <strong className="text-emerald-700 font-bold">{candidate.scoreBreakdown.totalScore}/100</strong></div>
                <div>RSI (14): <strong className="text-slate-800">{candidate.technicals.rsi14.toFixed(1)}</strong></div>
                <div>Risk Rating: <strong className="text-emerald-800">{candidate.riskLevel}</strong></div>
              </div>

              {candidate.aiAnalysis && (
                <div className="pt-2 border-t border-slate-200 space-y-1.5 font-sans">
                  <span className="text-emerald-800 font-bold text-[11px]">Gemini AI Executive Thesis:</span>
                  <p className="text-slate-700 text-xs leading-relaxed">{candidate.aiAnalysis.summary}</p>
                </div>
              )}
            </div>

            {/* Compliance Footer */}
            <div className="text-[10px] text-slate-500 space-y-1 border-t border-slate-200 pt-3">
              <div className="flex items-center gap-1 text-emerald-800 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nivesh AI ETF Opportunity Intelligence • Not an execution broker</span>
              </div>
              <p>
                This email was triggered automatically by deterministic price-volume scanning rules and evaluated by Gemini AI. No automatic orders are ever placed.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>4-Hour symbol cooldown will activate upon dispatch.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              onClick={handleSend}
              disabled={isSending || sentSuccess}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition-all disabled:opacity-50"
            >
              {sentSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Alert Dispatched!</span>
                </>
              ) : isSending ? (
                <>
                  <Send className="w-4 h-4 animate-bounce" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Institutional ETF Alert</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
