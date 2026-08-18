import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { AppThemeId } from '../types';
import {
  Palette,
  Check,
  X,
  Sparkles,
  Sun,
  Moon,
  Building,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { NiveshLogo } from './NiveshLogo';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme, themeId, setThemeId, branding, updateBranding, availableThemes } = useTheme();
  const [deskNameInput, setDeskNameInput] = useState<string>(branding.deskName || 'Family Office & Pro Desk');
  const [selectedDensity, setSelectedDensity] = useState<'comfortable' | 'compact'>(branding.density || 'comfortable');

  if (!isOpen) return null;

  const handleSaveBranding = () => {
    updateBranding({
      deskName: deskNameInput,
      density: selectedDensity,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-scrollbar"
      id="theme-selector-modal-backdrop"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-fade-in"
        id="theme-selector-modal-content"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Brand Theme & Visual Identity
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Live Customizer
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select your institutional theme, color palette, and firm desk identity.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[72vh] overflow-y-auto no-scrollbar text-xs">
          {/* Section 1: Themes Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Curated Brand Palettes
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Active: <strong className="text-emerald-700 dark:text-emerald-400">{theme.name}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableThemes.map((item) => {
                const isSelected = item.id === themeId;

                return (
                  <div
                    key={item.id}
                    onClick={() => setThemeId(item.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                      isSelected
                        ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60 hover:shadow-xs'
                    }`}
                  >
                    {/* Top Palette Bar */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {/* Swatch dots */}
                        <div className="flex items-center -space-x-1">
                          <span
                            className="w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-xs"
                            style={{ backgroundColor: item.primaryColor }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-xs"
                            style={{ backgroundColor: item.accentColor }}
                          />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60">
                          {item.mode === 'dark' ? 'Dark Mode' : 'Light Canvas'}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Gradient preview bar */}
                    <div
                      className={`w-full h-1.5 rounded-full mt-3 bg-gradient-to-r ${item.gradient}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Custom Desk & Firm Branding */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-sky-600" />
              Custom Desk & Organization Identity
            </span>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Desk / Institutional Subtitle:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={deskNameInput}
                    onChange={(e) => setDeskNameInput(e.target.value)}
                    placeholder="e.g. Family Office Desk, Alpha Research, Personal Terminal"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                  <button
                    onClick={() => setDeskNameInput('Family Office & Pro Desk')}
                    className="px-2.5 py-2 text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 font-medium whitespace-nowrap"
                    title="Reset to default"
                  >
                    Reset
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Appears next to the Nivesh AI brand insignia on your header and generated analytical reports.
                </p>
              </div>

              {/* Layout Density */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    UI Layout Density
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Adjust row padding and spacing for high-density monitors.
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setSelectedDensity('comfortable')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedDensity === 'comfortable'
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDensity('compact')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedDensity === 'compact'
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Compact
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Branding Header Live Preview
            </span>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <NiveshLogo variant="icon" size="sm" theme={theme.mode} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900 dark:text-white text-base">Nivesh</span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded text-white bg-gradient-to-r ${theme.gradient}`}
                    >
                      AI
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {deskNameInput || 'Family Office & Pro Desk'}
                  </span>
                </div>
              </div>

              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  backgroundColor: theme.primaryLight,
                  color: theme.primaryDark,
                  borderColor: theme.primaryBorder,
                  borderWidth: 1,
                }}
              >
                {theme.name} Active
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveBranding}
            className="px-5 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Theme & Identity</span>
          </button>
        </div>
      </div>
    </div>
  );
};
