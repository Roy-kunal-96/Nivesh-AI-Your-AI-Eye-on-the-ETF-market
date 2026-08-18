import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Play, ShieldAlert, Cpu, Calculator, RefreshCw } from 'lucide-react';

interface TestResult {
  name: string;
  passed: boolean;
  actual: any;
  expected: any;
  explanation: string;
}

export const RuleEngineTester: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [allPassed, setAllPassed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAndRunTests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tests/verify-rules');
      if (res.ok) {
        const data = await res.json();
        const list = data.results || data.testCases || (Array.isArray(data) ? data : []);
        setTestResults(list);
        setAllPassed(Boolean(data.allPassed));
      }
    } catch (err) {
      console.error('Failed to run rule verification tests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndRunTests();
  }, []);

  return (
    <div className="space-y-6" id="rule-engine-tester-container">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Deterministic Rule Engine & Boundary Verification
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Validates mathematical calculations for price pullbacks, volume ratios, and zero-division edge cases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-2 ${
            allPassed
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-rose-100 text-rose-800 border border-rose-300'
          }`}>
            {allPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
            <span>{allPassed ? 'ALL 6 SUITE TESTS PASSED (100%)' : 'TESTS FAILED'}</span>
          </div>

          <button
            onClick={fetchAndRunTests}
            disabled={loading}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
            title="Re-run Test Suite"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Core Strategy Mathematical Specifications Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 font-mono text-xs shadow-2xs">
          <div className="text-emerald-800 font-bold flex items-center gap-2 font-sans">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Formula 1: Price Change Percentage</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-[11px] leading-relaxed">
            <code>priceChangePercent = ((currentPrice - previousClose) / previousClose) * 100</code>
          </div>
          <p className="text-[11px] text-slate-600 font-sans">
            A pullback candidate is registered when <code>priceChangePercent &lt;= -minPriceFallPercent</code> (default -1.0%).
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 font-mono text-xs shadow-2xs">
          <div className="text-amber-800 font-bold flex items-center gap-2 font-sans">
            <Calculator className="w-4 h-4 text-amber-600" />
            <span>Formula 2: 20-Day Volume Ratio</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-[11px] leading-relaxed">
            <code>volumeRatio = currentVolume / averageVolume20D</code>
          </div>
          <p className="text-[11px] text-slate-600 font-sans">
            Unusual volume confirmation is registered when <code>volumeRatio &gt;= minVolumeRatio</code> (default 1.5×).
          </p>
        </div>
      </div>

      {/* Unit Test Results Table */}
      <div className="overflow-x-auto no-scrollbar rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200 text-[11px] uppercase">
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Test Case Specification</th>
              <th className="p-3.5 text-center">Expected</th>
              <th className="p-3.5 text-center">Actual (Calculated)</th>
              <th className="p-3.5">Mathematical Validation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
            {testResults.map((t, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="p-3.5">
                  {t.passed ? (
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PASS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-800 font-bold bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" /> FAIL
                    </span>
                  )}
                </td>
                <td className="p-3.5 font-sans font-bold text-slate-900 text-xs">{t.name}</td>
                <td className="p-3.5 text-center text-slate-700">{JSON.stringify(t.expected)}</td>
                <td className="p-3.5 text-center text-emerald-700 font-bold">{JSON.stringify(t.actual)}</td>
                <td className="p-3.5 font-sans text-slate-600 text-xs">{t.explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
