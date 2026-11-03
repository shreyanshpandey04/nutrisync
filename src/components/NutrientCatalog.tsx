import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Nutrient, NutrientType } from '../types';
import { SEED_NUTRIENTS } from '../data/nutrients';

export const NutrientCatalog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedNutrient, setSelectedNutrient] = useState<Nutrient | null>(null);

  const nutrientTypes = Array.from(new Set(SEED_NUTRIENTS.map((n) => n.type)));

  const filteredNutrients = SEED_NUTRIENTS.filter((n) => {
    const matchesSearch =
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.bestTiming.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.synergizesWith.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || n.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="luxury-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-stone-700 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                Supplement Library
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-stone-950 font-normal tracking-tight">
              Supplements & Vitamins Guide
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed max-w-2xl font-sans">
              Browse all 28 common vitamins, minerals, and supplements. Learn the best time of day to take them, what to eat with them, and how they work best.
            </p>
          </div>

          <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl px-5 py-4 text-right shrink-0 shadow-2xs">
            <p className="text-[11px] uppercase tracking-wider font-medium text-stone-500">Core Library</p>
            <p className="text-2xl font-serif font-bold text-stone-950">{SEED_NUTRIENTS.length} Supplements</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search supplements by name, timing, or pairing..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 text-sm font-sans transition-all placeholder:text-stone-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-stone-400 shrink-0" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
            >
              <option value="all">All Categories ({SEED_NUTRIENTS.length})</option>
              {nutrientTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Nutrients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNutrients.map((n) => (
          <div
            key={n.id}
            onClick={() => setSelectedNutrient(n)}
            className="luxury-card rounded-2xl p-6 cursor-pointer flex flex-col justify-between group transition-all duration-300"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-serif text-stone-950 font-medium group-hover:text-stone-700 transition-colors">
                    {n.name}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider font-sans font-medium text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200 inline-block mt-1">
                    {n.type}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-stone-50 group-hover:bg-stone-100 flex items-center justify-center transition-colors border border-stone-200/60">
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              <div className="space-y-2 text-xs text-stone-600 font-sans pt-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span className="truncate">{n.bestTiming}</span>
                </div>
                <p className="text-stone-600">
                  <span className="font-medium text-stone-800">Dietary Context: </span>
                  {n.withFood ? 'With meal / fats' : 'Empty stomach flexible'}
                </p>
                <p className="text-stone-600">
                  <span className="font-medium text-stone-800">Adult Dosage: </span>
                  {n.typicalAdultRange}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px]">
              <span className={`px-2.5 py-0.5 rounded-full font-medium text-[10px] uppercase tracking-wider border ${
                n.cyclingType === 'Cycled'
                  ? 'bg-amber-50 text-amber-900 border-amber-200/80'
                  : n.cyclingType === 'Short-term' || n.cyclingType === 'Deficiency-only'
                  ? 'bg-stone-100 text-stone-800 border-stone-300'
                  : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}>
                {n.cyclingType}
              </span>
              <span className="text-stone-900 font-medium text-xs group-hover:underline">View Guide →</span>
            </div>
          </div>
        ))}
      </div>

      {filteredNutrients.length === 0 && (
        <div className="text-center py-16 luxury-card rounded-3xl">
          <p className="text-stone-500 text-sm font-serif">No supplement entries found matching "{searchQuery}".</p>
        </div>
      )}

      {/* Nutrient Detail Modal / Drawer */}
      {selectedNutrient && (
        <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 lg:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-stone-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-sans uppercase tracking-widest font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                    {selectedNutrient.type}
                  </span>
                  <span className="text-[10px] font-sans uppercase tracking-widest font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                    Guide Entry
                  </span>
                </div>
                <h2 className="text-3xl font-serif text-stone-950 font-normal mt-2">
                  {selectedNutrient.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedNutrient(null)}
                className="text-stone-400 hover:text-stone-900 w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-sm font-semibold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Factsheet Key Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50/80 p-5 rounded-2xl border border-stone-200/80 font-sans">
              <div>
                <span className="uppercase tracking-wider font-semibold text-stone-500 text-[10px] block mb-1">Best Time to Take</span>
                <p className="text-stone-950 font-medium">{selectedNutrient.bestTiming}</p>
              </div>
              <div>
                <span className="uppercase tracking-wider font-semibold text-stone-500 text-[10px] block mb-1">Food Guidelines</span>
                <p className="text-stone-950 font-medium">{selectedNutrient.withFood ? 'With meal / healthy fats' : 'Can be taken on empty stomach'}</p>
                {selectedNutrient.withFoodNotes && (
                  <p className="text-stone-600 mt-0.5">{selectedNutrient.withFoodNotes}</p>
                )}
              </div>
              <div>
                <span className="uppercase tracking-wider font-semibold text-stone-500 text-[10px] block mb-1">Typical Daily Amount</span>
                <p className="text-stone-950 font-medium">{selectedNutrient.typicalAdultRange}</p>
              </div>
              <div>
                <span className="uppercase tracking-wider font-semibold text-stone-500 text-[10px] block mb-1">Daily Routine & Breaks</span>
                <p className="text-stone-950 font-medium">{selectedNutrient.cyclingNotes}</p>
              </div>
            </div>

            {/* Synergies & Conflicts */}
            <div className="space-y-4 text-xs font-sans">
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80">
                <span className="uppercase tracking-wider font-semibold text-emerald-950 text-[10px] block mb-2">
                  Works Great With
                </span>
                {selectedNutrient.synergizesWith.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNutrient.synergizesWith.map((s) => (
                      <span key={s} className="bg-white text-emerald-950 px-2.5 py-0.5 rounded-lg border border-emerald-200 text-xs font-medium">
                        + {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-stone-500">No specific pairings required</span>
                )}
              </div>

              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80">
                <span className="uppercase tracking-wider font-semibold text-amber-950 text-[10px] block mb-2">
                  Keep Separate (Take 2+ Hours Apart)
                </span>
                {selectedNutrient.avoidPairingWith.length > 0 ? (
                  <div className="space-y-1">
                    {selectedNutrient.avoidPairingWith.map((a) => (
                      <span key={a} className="inline-block bg-white text-amber-950 px-2.5 py-0.5 rounded-lg border border-amber-200 text-xs font-medium">
                        ! {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-stone-500">No primary competition recorded</span>
                )}
              </div>

              {selectedNutrient.absorptionInhibitors.length > 0 && (
                <div className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200">
                  <span className="uppercase tracking-wider font-semibold text-stone-600 text-[10px] block mb-1">
                    Things That Can Block Absorption
                  </span>
                  <p className="text-stone-700">{selectedNutrient.absorptionInhibitors.join(', ')}</p>
                </div>
              )}

              {selectedNutrient.notes && (
                <div className="p-4 rounded-2xl border border-stone-200/80 bg-stone-50/40 text-stone-700">
                  <span className="uppercase tracking-wider font-semibold text-stone-900 text-[10px] block mb-1">Helpful Advice</span>
                  <p className="leading-relaxed">{selectedNutrient.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedNutrient(null)}
                className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium tracking-wide rounded-xl shadow-xs transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
