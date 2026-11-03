import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  ShieldAlert,
  ArrowRight,
  Clock,
  Pill
} from 'lucide-react';
import { ConflictWarning } from '../types';

interface ConflictWarningBannerProps {
  warnings: ConflictWarning[];
  onNavigateToTimeline?: () => void;
}

export const ConflictWarningBanner: React.FC<ConflictWarningBannerProps> = ({
  warnings,
  onNavigateToTimeline
}) => {
  const criticalWarnings = warnings.filter((w) => w.severity === 'critical');
  const standardWarnings = warnings.filter((w) => w.severity === 'warning');
  const infoWarnings = warnings.filter((w) => w.severity === 'info');

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="luxury-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-stone-700 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                Safety & Interactions
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-stone-950 font-normal tracking-tight">
              Safety & Conflict Checker
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed max-w-xl font-sans">
              We automatically check your supplements against your daily meals, medications, and health conditions so nothing clashes or blocks absorption.
            </p>
          </div>

          <div className={`p-5 rounded-2xl border flex items-center gap-4 shrink-0 transition-colors shadow-2xs ${
            criticalWarnings.length > 0
              ? 'bg-rose-50/70 border-rose-200 text-rose-950'
              : warnings.length > 0
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-stone-50 border-stone-200 text-stone-900'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              criticalWarnings.length > 0
                ? 'bg-rose-100/80 border-rose-200 text-rose-900'
                : warnings.length > 0
                ? 'bg-amber-100/80 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-sans uppercase tracking-widest text-stone-500 font-medium">Status</p>
              <p className="text-base font-serif font-bold tracking-tight text-stone-950">
                {criticalWarnings.length > 0
                  ? `${criticalWarnings.length} Important Warning${criticalWarnings.length > 1 ? 's' : ''}`
                  : warnings.length > 0
                  ? `${warnings.length} Active Notice${warnings.length > 1 ? 's' : ''}`
                  : 'All Clear'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* No warnings state */}
      {warnings.length === 0 && (
        <div className="luxury-card rounded-3xl p-10 text-center space-y-3 bg-[#fafbfa]">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-6 h-6 text-emerald-700" />
          </div>
          <h3 className="text-2xl font-serif text-stone-950 font-normal">All Safety Checks Passed</h3>
          <p className="text-sm text-stone-600 max-w-md mx-auto font-sans leading-relaxed">
            No medication clashes, nutrient conflicts, or duplicate doses were found in your schedule.
          </p>
        </div>
      )}

      {/* Critical Hard-Flags */}
      {criticalWarnings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-rose-950">
            <AlertCircle className="w-4 h-4 text-rose-700" />
            <h2 className="text-xs font-sans font-semibold uppercase tracking-widest">
              Important Safety Warnings ({criticalWarnings.length})
            </h2>
          </div>

          <div className="space-y-3.5">
            {criticalWarnings.map((warn) => (
              <div
                key={warn.id}
                className="bg-rose-50/50 border border-rose-200/90 rounded-2xl p-6 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                    <h3 className="text-lg font-serif text-rose-950 font-medium">{warn.title}</h3>
                  </div>
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-widest bg-rose-900 text-rose-50 px-2.5 py-0.5 rounded-full">
                    Action Needed
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-rose-950 leading-relaxed font-sans">
                  {warn.description}
                </p>

                <div className="bg-white/90 p-4 rounded-xl border border-rose-100 text-xs text-stone-800 space-y-1 font-sans">
                  <p className="font-semibold text-rose-950 uppercase tracking-wider text-[10px]">Recommended Action:</p>
                  <p className="leading-relaxed">{warn.actionRecommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standard Warnings */}
      {standardWarnings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-stone-900">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <h2 className="text-xs font-sans font-semibold uppercase tracking-widest text-stone-800">
              Timing & Spacing Notices ({standardWarnings.length})
            </h2>
          </div>

          <div className="space-y-3.5">
            {standardWarnings.map((warn) => (
              <div
                key={warn.id}
                className="luxury-card bg-amber-50/40 border-amber-200/80 rounded-2xl p-6 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-serif text-stone-950 font-medium">{warn.title}</h3>
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-widest bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Spacing Tip
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                  {warn.description}
                </p>

                <div className="bg-white/90 p-4 rounded-xl border border-stone-200/80 text-xs text-stone-800 space-y-1 font-sans">
                  <p className="font-semibold text-stone-950 uppercase tracking-wider text-[10px]">Our Recommendation:</p>
                  <p className="leading-relaxed">{warn.actionRecommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info notices */}
      {infoWarnings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-stone-600">
            <Info className="w-4 h-4 text-stone-500" />
            <h2 className="text-xs font-sans font-semibold uppercase tracking-widest text-stone-600">
              Helpful Tips & Notes ({infoWarnings.length})
            </h2>
          </div>

          <div className="space-y-3">
            {infoWarnings.map((warn) => (
              <div
                key={warn.id}
                className="luxury-card rounded-2xl p-5 text-xs text-stone-700 space-y-1.5 font-sans"
              >
                <p className="font-serif text-base text-stone-950 font-medium">{warn.title}</p>
                <p className="leading-relaxed">{warn.description}</p>
                <p className="text-stone-500 italic pt-1">{warn.actionRecommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Educational Chrono-Spacing Reference Card */}
      <div className="luxury-card rounded-3xl p-8 sm:p-10 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-stone-700" />
          </div>
          <h3 className="text-xl font-serif text-stone-950 font-medium">
            The 2-Hour Spacing Rule
          </h3>
        </div>
        <p className="text-sm text-stone-600 leading-relaxed font-sans max-w-3xl">
          Certain minerals compete with each other when taken at the same time. For example, taking iron together with calcium or morning coffee can block iron absorption by over half. NutriSync automatically spaces them 2 or more hours apart so your body gets the full benefit of both without stomach upset.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-sans">
          <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200/80 space-y-1.5">
            <span className="font-serif text-stone-950 font-medium block text-sm">Iron vs Calcium & Coffee</span>
            <span className="text-stone-600 leading-relaxed">Separate iron supplements from milk, dairy, calcium, and morning coffee by at least 2 hours.</span>
          </div>
          <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200/80 space-y-1.5">
            <span className="font-serif text-stone-950 font-medium block text-sm">Zinc & Copper Balance</span>
            <span className="text-stone-600 leading-relaxed">High daily doses of zinc can lower copper levels over time. Keep them balanced or take them at separate meals.</span>
          </div>
          <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200/80 space-y-1.5">
            <span className="font-serif text-stone-950 font-medium block text-sm">Probiotics Care</span>
            <span className="text-stone-600 leading-relaxed">Take on an empty stomach or with a light snack, and avoid washing down with hot tea or boiling water.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
