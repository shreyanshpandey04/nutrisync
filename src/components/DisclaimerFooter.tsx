import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export const DisclaimerFooter: React.FC = () => {
  return (
    <footer id="nutrisync-footer-disclaimer" className="mt-20 border-t border-stone-200/80 bg-stone-100/50 py-10 px-4 sm:px-8 text-stone-600 text-xs sm:text-sm font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start gap-4 bg-white/90 p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <AlertCircle className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-serif text-sm font-medium text-stone-900">
              Clinical Chrono-Pharmacology & Regulatory Monograph Disclaimer
            </p>
            <p className="leading-relaxed text-stone-600 font-sans text-xs sm:text-sm">
              NutriSync provides personalized pharmacokinetic timing and chronobiological scheduling guidance for wellness optimization. It does not constitute medical diagnosis, prescription, or therapeutic intervention. Always consult a licensed clinical practitioner prior to introducing bioactive compounds, particularly if pregnant, nursing, or managing active prescription regimens.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3 pt-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-stone-700" />
            <span className="tracking-wide">Grounded Clinical Matrix · NIH Office of Dietary Supplements & EFSA Pharmacokinetics</span>
          </div>
          <p className="font-sans text-stone-400">© {new Date().getFullYear()} NutriSync · Chronobiological Protocol Architecture</p>
        </div>
      </div>
    </footer>
  );
};

