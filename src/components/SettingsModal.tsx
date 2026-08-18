import React, { useState } from 'react';
import { ScannerSettings } from '../types';
import { X, Sliders, Save, RotateCcw, ShieldCheck, Mail, Clock, Bell, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ScannerSettings;
  onSave: (newSettings: ScannerSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState<ScannerSettings>(settings);

  if (!isOpen) return null;

  const handleReset = () => {
    setLocalSettings({
      minPriceFallPercent: 1.0,
      minVolumeRatio: 1.5,
      volumeBaselineDays: 20,
      universe: 'ALL ETFS',
      scanIntervalMinutes: 15,
      strongScoreThreshold: 80,
      opportunityScoreThreshold: 65,
      watchScoreThreshold: 50,
      alertCooldownHours: 4,
      notificationEmail: 'investor@niveshai.in',
    });
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto no-scrollbar" id="settings-modal-backdrop">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden my-auto" id="settings-modal-content">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">ETF Scanner & Strategy Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders & Fields */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar text-xs">
          {/* Section 1: Core Deterministic Triggers */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              1. Deterministic ETF Strategy Rules
            </h4>

            {/* Min Price Fall */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Minimum Price Pullback Fall (%):</span>
                <span className="font-mono text-emerald-700 font-bold">-{localSettings.minPriceFallPercent.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={localSettings.minPriceFallPercent}
                onChange={(e) => setLocalSettings({ ...localSettings, minPriceFallPercent: parseFloat(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-600">
                ETFs must drop at least this percentage vs previous close to trigger candidate evaluation.
              </p>
            </div>

            {/* Min Volume Ratio */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Minimum Volume Surge Ratio:</span>
                <span className="font-mono text-emerald-700 font-bold">{localSettings.minVolumeRatio.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="4.0"
                step="0.1"
                value={localSettings.minVolumeRatio}
                onChange={(e) => setLocalSettings({ ...localSettings, minVolumeRatio: parseFloat(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-600">
                Current trading volume divided by the 20-day average volume baseline.
              </p>
            </div>
          </div>

          {/* Section 2: Scanning Schedule & Universe */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-600" />
              2. ETF Universe & Refresh Intervals
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-medium">Default Universe:</label>
                <select
                  value={localSettings.universe}
                  onChange={(e) => setLocalSettings({ ...localSettings, universe: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 shadow-2xs"
                >
                  <option value="ALL ETFS">All Listed ETFs (Complete Universe)</option>
                  <option value="EV & AUTO">⚡ EV & Automotive (EVINDIA, AUTOBEES)</option>
                  <option value="BANKING & FINANCIALS">🏦 Banking & PSU Financials (BANKBEES, PSUBNKBEES)</option>
                  <option value="IT & TECH">💻 IT & Technology (ITBEES, MON100)</option>
                  <option value="PHARMA & HEALTHCARE">💊 Pharma & Healthcare (PHARMABEES, HEALTHBEES)</option>
                  <option value="ENERGY & INFRA">⚡ Energy & Infrastructure (CPSEETF, INFRABEES)</option>
                  <option value="METALS & COMMODITIES">🪙 Metals & Commodities (GOLDBEES, SILVERBEES)</option>
                  <option value="DEFENCE & PSU">🛡️ Defence & Aerospace (DEFENCEETF)</option>
                  <option value="CONSUMPTION">🛒 Consumption & Retail (CONSUMBEES)</option>
                  <option value="SMART BETA">📈 Momentum & Low Volatility (MOM50, LOWVOLIETF)</option>
                  <option value="WATCHLIST">⭐ My Watchlist</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 font-medium">Auto-Scan Interval:</label>
                <select
                  value={localSettings.scanIntervalMinutes}
                  onChange={(e) => setLocalSettings({ ...localSettings, scanIntervalMinutes: parseInt(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 shadow-2xs"
                >
                  <option value={5}>Every 5 Minutes (Intraday)</option>
                  <option value={15}>Every 15 Minutes (Default)</option>
                  <option value={30}>Every 30 Minutes</option>
                  <option value={60}>Every 1 Hour</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: App Branding & Visual Theme */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              4. App Branding & Visual Theme
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'emerald-bharat',
                  name: 'Emerald Bharat',
                  sub: 'NSE Green & Growth',
                  color: '#059669',
                },
                {
                  id: 'dalal-navy',
                  name: 'Dalal Street Navy',
                  sub: 'Institutional Blue-Chip',
                  color: '#2563eb',
                },
                {
                  id: 'vedic-gold',
                  name: 'Vedic Ochre & Gold',
                  sub: 'Sovereign Gold & Amber',
                  color: '#d97706',
                },
                {
                  id: 'cyber-terminal',
                  name: 'Midnight Pro Terminal',
                  sub: 'Dark Mode High Contrast',
                  color: '#10b981',
                },
                {
                  id: 'royal-amethyst',
                  name: 'FinTech Amethyst',
                  sub: 'Modern Violet & Fuchsia',
                  color: '#7c3aed',
                },
              ].map((th) => {
                const isSelected = (localSettings.branding?.themeId || 'emerald-bharat') === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => {
                      setLocalSettings({
                        ...localSettings,
                        branding: {
                          themeId: th.id as any,
                          deskName: localSettings.branding?.deskName || 'Family Office & Pro Desk',
                          showLivePulse: localSettings.branding?.showLivePulse ?? true,
                          density: localSettings.branding?.density || 'comfortable',
                        },
                      });
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                        style={{ backgroundColor: th.color }}
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{th.name}</div>
                        <div className="text-[10px] text-slate-500">{th.sub}</div>
                      </div>
                    </div>
                    {isSelected && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium">Custom Desk / Firm Subtitle:</label>
              <input
                type="text"
                value={localSettings.branding?.deskName || ''}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    branding: {
                      themeId: localSettings.branding?.themeId || 'emerald-bharat',
                      deskName: e.target.value,
                      showLivePulse: localSettings.branding?.showLivePulse ?? true,
                      density: localSettings.branding?.density || 'comfortable',
                    },
                  })
                }
                placeholder="Family Office & Pro Desk"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-emerald-500 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
