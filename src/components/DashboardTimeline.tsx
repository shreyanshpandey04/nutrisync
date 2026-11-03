import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Sun,
  SunMedium,
  Moon,
  Dumbbell,
  ShieldCheck,
  Check,
  Scale
} from 'lucide-react';
import { ScheduleItem, TimeSlotCategory, UserProfile, RegimenTier } from '../types';

interface DashboardTimelineProps {
  scheduleItems: ScheduleItem[];
  profile: UserProfile | null;
  adherenceMap: Record<string, boolean>; // scheduleItemId -> taken
  onToggleAdherence: (item: ScheduleItem, taken: boolean) => void;
  onGenerateAIExplanations: () => void;
  isLoadingAI: boolean;
  hasAIGenerated: boolean;
  onUpdateTier?: (tier: RegimenTier) => void;
  onResynthesize?: () => void;
}

const SLOT_CONFIG: Record<
  TimeSlotCategory,
  { label: string; period: string; icon: React.ReactNode; desc: string }
> = {
  Morning: {
    label: 'Morning Routine',
    period: '07:00 – 09:00',
    icon: <Sun className="w-4 h-4 text-amber-700" />,
    desc: 'Take with breakfast and dietary fats for optimal absorption'
  },
  Midday: {
    label: 'Midday Lunch',
    period: '12:00 – 14:00',
    icon: <SunMedium className="w-4 h-4 text-emerald-800" />,
    desc: 'Absorbed with midday meal, separated from morning minerals'
  },
  'Post-Workout': {
    label: 'Post-Workout',
    period: 'Within 45m of Exercise',
    icon: <Dumbbell className="w-4 h-4 text-stone-700" />,
    desc: 'Hydration, cellular recovery, and amino acid replenishment'
  },
  'Pre-Workout': {
    label: 'Pre-Workout',
    period: '30–45m Before Exercise',
    icon: <Dumbbell className="w-4 h-4 text-stone-700" />,
    desc: 'Clean energy and stamina'
  },
  Evening: {
    label: 'Evening Dinner',
    period: '18:00 – 20:00',
    icon: <Moon className="w-4 h-4 text-stone-700" />,
    desc: 'Evening meal window, separated from competing compounds'
  },
  Bedtime: {
    label: 'Bedtime Wind-Down',
    period: '30–45m Before Sleep',
    icon: <Moon className="w-4 h-4 text-indigo-800" />,
    desc: 'Relaxing minerals to promote deep restorative sleep'
  }
};

export const DashboardTimeline: React.FC<DashboardTimelineProps> = ({
  scheduleItems,
  profile,
  adherenceMap,
  onToggleAdherence,
  onGenerateAIExplanations,
  isLoadingAI,
  hasAIGenerated,
  onResynthesize
}) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [currentActiveSlot, setCurrentActiveSlot] = useState<string>('morning');

  useEffect(() => {
    const updateActiveSlot = () => {
      const now = new Date();
      const currentM = now.getHours() * 60 + now.getMinutes();
      const wakeM = profile?.wakeTime
        ? parseInt(profile.wakeTime.split(':')[0]) * 60 + parseInt(profile.wakeTime.split(':')[1])
        : 420;
      const sleepM = profile?.sleepTime
        ? parseInt(profile.sleepTime.split(':')[0]) * 60 + parseInt(profile.sleepTime.split(':')[1])
        : 1380;

      if (currentM < wakeM || currentM >= sleepM) {
        setCurrentActiveSlot('bedtime');
      } else if (currentM < wakeM + 150) {
        setCurrentActiveSlot('morning');
      } else if (currentM < wakeM + 450) {
        setCurrentActiveSlot('midday');
      } else {
        setCurrentActiveSlot('evening');
      }
    };

    updateActiveSlot();
    const interval = setInterval(updateActiveSlot, 60000);
    return () => clearInterval(interval);
  }, [profile?.wakeTime, profile?.sleepTime]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Group items by slot category in logical daily order
  const slots: TimeSlotCategory[] = ['Morning', 'Midday', 'Post-Workout', 'Evening', 'Bedtime'];
  const groupedSchedule: Record<TimeSlotCategory, ScheduleItem[]> = {
    Morning: [],
    Midday: [],
    'Post-Workout': [],
    'Pre-Workout': [],
    Evening: [],
    Bedtime: []
  };

  scheduleItems.forEach((item) => {
    if (groupedSchedule[item.slot]) {
      groupedSchedule[item.slot].push(item);
    } else {
      groupedSchedule['Morning'].push(item);
    }
  });

  const totalItems = scheduleItems.length;
  const takenCount = scheduleItems.filter((i) => adherenceMap[i.id]).length;
  const progressPercent = totalItems > 0 ? Math.round((takenCount / totalItems) * 100) : 0;
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-2">
      {/* Clean, Uncluttered Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-stone-500 font-sans tracking-wide">
              {todayFormatted}
            </p>
            <h1 className="text-2xl sm:text-3xl font-serif text-stone-950 font-normal tracking-tight">
              {profile ? `${profile.name}'s Daily Schedule` : 'Daily Supplement Schedule'}
            </h1>
            <p className="text-xs text-stone-600 font-sans">
              Separated by time of day to maximize absorption and prevent nutrient clashes.
            </p>
          </div>

          {/* Actions & Explanations Button */}
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <button
              id="btn-generate-ai-explanations"
              type="button"
              onClick={onGenerateAIExplanations}
              disabled={isLoadingAI}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
              title="Get personalized timing explanations"
            >
              {isLoadingAI ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>Explaining...</span>
                </>
              ) : hasAIGenerated ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Update AI Insights</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Explain Timing</span>
                </>
              )}
            </button>

            {onResynthesize && (
              <button
                type="button"
                onClick={onResynthesize}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50/80 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
                title="Re-run the schedule builder"
              >
                <RefreshCw className="w-3 h-3 text-stone-500" />
                <span className="hidden sm:inline">Rebuild</span>
              </button>
            )}
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="pt-2 border-t border-stone-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-600 font-sans">
            <span className="font-medium">
              {takenCount} of {totalItems} completed today
            </span>
            <span className="text-stone-500">{progressPercent}%</span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-stone-900 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Clean Timeline Windows */}
      <div className="space-y-8">
        {slots.map((slotKey, slotIdx) => {
          const itemsInSlot = groupedSchedule[slotKey];
          if (!itemsInSlot || itemsInSlot.length === 0) return null;
          const conf = SLOT_CONFIG[slotKey];
          const isCurrentSlot = slotKey.toLowerCase() === currentActiveSlot;

          return (
            <section
              key={slotKey}
              id={`slot-${slotKey.toLowerCase()}`}
              className="space-y-3 scroll-mt-24"
            >
              {/* Slot Header - Clean and Minimal */}
              <div className="flex items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-200/80 flex items-center justify-center shrink-0">
                    {conf.icon}
                  </div>
                  <h2 className="font-serif text-lg sm:text-xl font-normal text-stone-950">
                    {conf.label}
                  </h2>
                  <span className="text-xs font-sans text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                    {conf.period}
                  </span>
                  {isCurrentSlot && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-medium tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Current Window
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 font-sans hidden md:block">
                  {conf.desc}
                </p>
              </div>

              {/* Items in Slot */}
              <div className="space-y-2.5">
                {itemsInSlot.map((item, itemIdx) => {
                  const itemAnimDelay = (slotIdx * 2 + itemIdx) * 0.04;
                  const isTaken = adherenceMap[item.id] || false;
                  const isExpanded = expandedItems[item.id] || false;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: itemAnimDelay,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      className={`rounded-2xl transition-all duration-200 border ${
                        isTaken
                          ? 'border-emerald-200/90 bg-emerald-50/25 shadow-2xs'
                          : 'border-stone-200/90 bg-white hover:border-stone-300 hover:shadow-2xs hover:-translate-y-0.5'
                      }`}
                    >
                        {/* Compact Card Main Row */}
                        <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            {/* Checkbox with tactile spring physics */}
                            <button
                              type="button"
                              onClick={() => onToggleAdherence(item, !isTaken)}
                              className="mt-0.5 focus:outline-none shrink-0 cursor-pointer active:scale-90 transition-transform"
                              title={isTaken ? 'Mark as not taken' : 'Mark as taken'}
                            >
                              {isTaken ? (
                                <motion.div
                                  initial={{ scale: 0.7, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                  className="w-6 h-6 rounded-full bg-stone-900 text-amber-200 flex items-center justify-center shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </motion.div>
                              ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-stone-300 hover:border-stone-500 bg-white transition-colors" />
                              )}
                            </button>

                            {/* Info Column */}
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3
                                  className={`text-base font-medium font-sans tracking-tight transition-colors duration-200 ${
                                    isTaken ? 'text-stone-400 line-through' : 'text-stone-950'
                                  }`}
                                >
                                  {item.nutrientName}
                                </h3>

                                {/* Clean subtle badges only if essential */}
                                {item.dosageScaling?.isScaled && (
                                  <span
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.2 rounded-md transition-all"
                                    title="Calibrated to your weight and BMI"
                                  >
                                    <Scale className="w-3 h-3 text-amber-700" />
                                    <span>Scaled to Body Stats</span>
                                  </span>
                                )}

                                {item.cyclingType && item.cyclingType !== 'Continuous' && (
                                  <span className="text-[10px] uppercase tracking-wider text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.2 rounded-md font-sans">
                                    {item.cyclingType}
                                  </span>
                                )}
                              </div>

                              {/* Dosage & Timing Line */}
                              <p className="text-xs text-stone-700 font-sans flex flex-wrap items-center gap-x-2.5 gap-y-1">
                                <span className="font-semibold text-stone-900">{item.dosage}</span>
                                <span className="text-stone-400">·</span>
                                <span className="text-stone-600 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-stone-400" />
                                  {item.recommendedTime}
                                </span>
                                <span className="text-stone-400">·</span>
                                <span className="text-stone-600">{item.withFoodInstructions}</span>
                              </p>
                            </div>
                          </div>

                          {/* Expand Details Trigger */}
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.id)}
                            className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors shrink-0 cursor-pointer"
                            title={isExpanded ? 'Hide details' : 'View details'}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-250 ${
                                isExpanded ? 'rotate-180 text-stone-900' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {/* Duplicate Stack Warning (if present) */}
                        {item.duplicateWarning && (
                          <div className="mx-4 sm:mx-5 mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <p className="leading-relaxed">{item.duplicateWarning}</p>
                          </div>
                        )}

                        {/* Clean Consolidated Details View with AnimatePresence */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              key={`details-${item.id}`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-stone-100 space-y-3 bg-stone-50/60 text-xs rounded-b-2xl">
                                {/* Timing Rationale / AI Explanation */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-stone-800 font-medium text-xs">
                                    {item.aiExplanation ? (
                                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                                    ) : (
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                                    )}
                                    <span>Why this time & dose?</span>
                                  </div>
                                  <p className="text-stone-600 leading-relaxed font-sans pl-5">
                                    {item.aiExplanation || item.reasons.join(' · ')}
                                  </p>
                                </div>

                                {/* Personalized Dosage Breakdown (if scaled) */}
                                {item.dosageScaling && item.dosageScaling.isScaled && (
                                  <div className="p-3 bg-white rounded-xl border border-amber-200/70 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-semibold text-stone-900 flex items-center gap-1 text-[11px]">
                                        <Scale className="w-3 h-3 text-amber-700" />
                                        <span>Personalized Dosage Calibration</span>
                                      </span>
                                      {item.dosageScaling.multiplierLabel && (
                                        <span className="text-[10px] font-mono text-amber-900 bg-amber-50 px-2 py-0.2 rounded border border-amber-200">
                                          {item.dosageScaling.multiplierLabel}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-stone-600 text-[11px] leading-relaxed">
                                      {item.dosageScaling.clinicalRationale}
                                    </p>
                                    <p className="text-[10px] text-stone-500 font-sans">
                                      Calibrated for: {item.dosageScaling.metricSummary}
                                    </p>
                                  </div>
                                )}

                                {/* Synergies & Separation (only shown if present) */}
                                {(item.synergyPartners.length > 0 || item.conflictWarnings.length > 0) && (
                                  <div className="pt-1 flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
                                    {item.synergyPartners.length > 0 && (
                                      <div className="text-stone-700">
                                        <span className="font-medium text-stone-900">Pairs well with: </span>
                                        <span className="text-emerald-900">
                                          {item.synergyPartners.join(', ')}
                                        </span>
                                      </div>
                                    )}
                                    {item.conflictWarnings.length > 0 && (
                                      <div className="text-amber-900">
                                        <span className="font-medium text-stone-900">Keep 2+ hours apart from: </span>
                                        <span>{item.conflictWarnings.join(', ')}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Routine Note */}
                                {item.cyclingNote && (
                                  <p className="text-[11px] text-stone-500 font-sans pt-1 border-t border-stone-200/50">
                                    <span className="font-medium text-stone-700">Tip: </span>
                                    {item.cyclingNote}
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  };
