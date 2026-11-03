import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Copy,
  Check,
  Clock,
  Sparkles,
  BarChart3,
  Award,
  ChevronRight
} from 'lucide-react';
import { AdherenceLog, ScheduleItem } from '../types';

interface WeeklyAdherenceReportProps {
  adherenceLogs: AdherenceLog[];
  scheduleItems: ScheduleItem[];
  adherenceMap: Record<string, boolean>;
}

export const WeeklyAdherenceReport: React.FC<WeeklyAdherenceReportProps> = ({
  adherenceLogs,
  scheduleItems,
  adherenceMap
}) => {
  const [copied, setCopied] = useState(false);

  // Generate 7-day window (today and the 6 preceding days)
  const today = new Date();
  const last7Days: {
    dateStr: string;
    dayLabel: string;
    dayOfWeek: string;
    fullDate: string;
    isToday: boolean;
  }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    last7Days.push({
      dateStr,
      dayLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      isToday: i === 0
    });
  }

  const plannedPerDay = scheduleItems.length;
  const totalPlannedIn7Days = plannedPerDay * 7;

  // Compute daily metrics for each of the 7 days
  const dailyStats = last7Days.map((day) => {
    let takenCount = 0;
    if (day.isToday) {
      takenCount = scheduleItems.filter((item) => adherenceMap[item.id]).length;
    } else {
      const logsForDay = adherenceLogs.filter((l) => l.date === day.dateStr && l.taken);
      // Count unique schedule items taken on that day
      const takenItemIds = new Set(logsForDay.map((l) => l.scheduleItemId));
      takenCount = takenItemIds.size;
    }

    const percentage = plannedPerDay > 0 ? Math.round((takenCount / plannedPerDay) * 100) : 0;
    return {
      ...day,
      takenCount,
      plannedCount: plannedPerDay,
      percentage
    };
  });

  // Aggregate 7-day calculations
  const totalTakenIn7Days = dailyStats.reduce((acc, curr) => acc + curr.takenCount, 0);
  const weeklyPercentage =
    totalPlannedIn7Days > 0 ? Math.round((totalTakenIn7Days / totalPlannedIn7Days) * 100) : 0;

  const perfectDaysCount = dailyStats.filter((d) => d.percentage === 100).length;

  // Breakdown by Circadian Slot (Morning, Midday, Workout, Evening, Bedtime)
  const slots = Array.from(new Set(scheduleItems.map((item) => item.slot)));
  const slotStats = slots.map((slot) => {
    const itemsInSlot = scheduleItems.filter((i) => i.slot === slot);
    const slotItemIds = new Set(itemsInSlot.map((i) => i.id));
    const plannedForSlotIn7Days = itemsInSlot.length * 7;

    let takenInSlot = 0;
    last7Days.forEach((day) => {
      if (day.isToday) {
        itemsInSlot.forEach((item) => {
          if (adherenceMap[item.id]) takenInSlot++;
        });
      } else {
        const logsForDay = adherenceLogs.filter(
          (l) => l.date === day.dateStr && l.taken && slotItemIds.has(l.scheduleItemId)
        );
        const unique = new Set(logsForDay.map((l) => l.scheduleItemId));
        takenInSlot += unique.size;
      }
    });

    const percentage =
      plannedForSlotIn7Days > 0
        ? Math.round((takenInSlot / plannedForSlotIn7Days) * 100)
        : 0;

    return {
      slot,
      itemCount: itemsInSlot.length,
      taken: takenInSlot,
      planned: plannedForSlotIn7Days,
      percentage
    };
  });

  // Sort slot performance
  const sortedSlots = [...slotStats].sort((a, b) => b.percentage - a.percentage);
  const bestSlot = sortedSlots[0];
  const lowestSlot = sortedSlots[sortedSlots.length - 1];

  // Adherence Tier
  let tierBadge = {
    title: 'Optimal Adherence',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    description: 'Outstanding consistency! Biological bioavailability and blood nutrient concentrations remain stable.'
  };

  if (weeklyPercentage < 50) {
    tierBadge = {
      title: 'Inconsistent Window Timing',
      color: 'bg-rose-50 text-rose-800 border-rose-200',
      description: 'Taking less than half of scheduled doses reduces efficacy. Consider setting alarm cues tied to meals.'
    };
  } else if (weeklyPercentage < 75) {
    tierBadge = {
      title: 'Moderate Adherence',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      description: 'Consistent on most days, but missing key circadian windows. Focus on closing the gap in your lowest slot.'
    };
  } else if (weeklyPercentage < 90) {
    tierBadge = {
      title: 'Strong Circadian Routine',
      color: 'bg-teal-50 text-teal-800 border-teal-200',
      description: 'Solid habit loop with high compliance across primary daily meals.'
    };
  }

  // Copy Summary text
  const handleCopyReport = () => {
    const text = [
      `📊 NutriSync 7-Day Supplement Adherence Summary`,
      `Period: ${last7Days[0].dayLabel} – ${last7Days[6].dayLabel} (${new Date().getFullYear()})`,
      `----------------------------------------`,
      `• Overall 7-Day Adherence: ${weeklyPercentage}% (${totalTakenIn7Days} / ${totalPlannedIn7Days} doses taken)`,
      `• Perfect Days: ${perfectDaysCount} / 7 days`,
      `• Status: ${tierBadge.title}`,
      ``,
      `Daily Breakdown:`,
      ...dailyStats.map(
        (d) => `  - ${d.dayOfWeek} (${d.dayLabel}): ${d.percentage}% [${d.takenCount}/${d.plannedCount} taken]`
      ),
      ``,
      `Circadian Timing Window Adherence:`,
      ...slotStats.map((s) => `  - ${s.slot}: ${s.percentage}% (${s.taken}/${s.planned} doses)`),
      ``,
      `Grounded Clinical Insight:`,
      `Best adherence window: ${bestSlot?.slot || 'N/A'} (${bestSlot?.percentage || 0}%).`,
      lowestSlot && lowestSlot.percentage < 75
        ? `Window needing attention: ${lowestSlot.slot} (${lowestSlot.percentage}%). Try pairing this slot directly with your existing meal or nightstand routine.`
        : `All timing windows maintain excellent consistency above 75%.`,
      ``,
      `NutriSync Chrono-Nutrition Engine`
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="luxury-card rounded-3xl p-8 sm:p-10 space-y-8">
      {/* Header with Title and Copy Action */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-stone-100 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-stone-700 bg-stone-100 px-3 py-1 rounded-full border border-stone-200 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              7-Day Chrono-Audit
            </span>
            <span className="text-xs text-stone-400 font-sans tracking-wide">
              {last7Days[0].dayLabel} – {last7Days[6].dayLabel}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-stone-950 font-normal tracking-tight">
            Weekly Adherence Monograph
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 font-sans">
            Chronobiological timing compliance and intake rate across your active supplement protocol.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyReport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-sans font-medium transition-all shadow-2xs shrink-0 self-start sm:self-auto active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-700" />
              <span className="text-emerald-800 font-medium">Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-stone-400" />
              <span>Export Audit Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: 7-Day Adherence Percentage */}
        <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-stone-500">
              7-Day Compliance Rate
            </span>
            <div className="w-7 h-7 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-serif font-normal text-stone-950">
                {weeklyPercentage}%
              </span>
              <span className="text-xs text-stone-500 font-sans">target accuracy</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-stone-200/70 rounded-full h-1.5 mt-4 overflow-hidden">
              <div
                className="bg-stone-900 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(weeklyPercentage, 100)}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-stone-500 font-sans">
            {totalTakenIn7Days} of {totalPlannedIn7Days} total doses recorded
          </p>
        </div>

        {/* Card 2: Consistency Assessment */}
        <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-stone-500">
              Chrono-Consistency Tier
            </span>
            <div className="w-7 h-7 rounded-lg bg-stone-200/80 text-stone-700 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-4 space-y-2">
            <div>
              <span className="inline-block bg-white text-stone-900 border border-stone-200/80 px-3 py-1 rounded-full text-xs font-serif font-medium">
                {tierBadge.title}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              {tierBadge.description}
            </p>
          </div>

          <div className="text-xs text-stone-700 font-sans flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-stone-900" />
            <span>{perfectDaysCount} perfect 100% adherence {perfectDaysCount === 1 ? 'day' : 'days'}</span>
          </div>
        </div>

        {/* Card 3: Window Diagnostics */}
        <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-stone-500">
              Circadian Slot Breakdown
            </span>
            <div className="w-7 h-7 rounded-lg bg-stone-200/80 text-stone-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-3 space-y-2.5">
            {slotStats.slice(0, 3).map((slot) => (
              <div key={slot.slot} className="space-y-1">
                <div className="flex justify-between text-xs font-sans text-stone-700">
                  <span className="font-medium">{slot.slot}</span>
                  <span className="font-serif font-bold text-stone-950">{slot.percentage}%</span>
                </div>
                <div className="w-full bg-stone-200/60 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-1 rounded-full bg-stone-800"
                    style={{ width: `${Math.min(slot.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-stone-500 font-sans mt-1">
            Top window: <strong className="text-stone-900 font-medium">{bestSlot?.slot || 'N/A'}</strong> ({bestSlot?.percentage || 0}%)
          </p>
        </div>
      </div>

      {/* 7-Day Visual Daily Performance Matrix */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-stone-500" />
          <h3 className="text-xs font-sans font-semibold uppercase tracking-widest text-stone-800">
            7-Day Daily Completion Matrix
          </h3>
        </div>

        <div className="grid grid-cols-7 gap-2.5">
          {dailyStats.map((day) => (
            <div
              key={day.dateStr}
              className={`p-3.5 rounded-2xl border flex flex-col items-center text-center transition-all ${
                day.isToday
                  ? 'bg-stone-100 border-stone-400/80 shadow-2xs'
                  : 'bg-stone-50/70 border-stone-200/80'
              }`}
            >
              <span className="text-[10px] font-sans font-semibold text-stone-500 uppercase tracking-widest">
                {day.dayOfWeek}
              </span>
              <span className="text-xs text-stone-400 font-sans my-0.5">
                {day.dayLabel.split(' ')[1]}
              </span>

              {/* Completion badge */}
              <div
                className={`w-11 h-11 rounded-xl my-1.5 flex flex-col items-center justify-center text-xs font-serif font-bold ${
                  day.percentage >= 90
                    ? 'bg-stone-900 text-amber-200 shadow-2xs'
                    : day.percentage >= 60
                    ? 'bg-stone-200 text-stone-800 border border-stone-300'
                    : day.percentage > 0
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'bg-stone-100 text-stone-400'
                }`}
              >
                <span>{day.percentage}%</span>
              </div>

              <span className="text-[10px] text-stone-500 font-sans font-medium">
                {day.takenCount}/{day.plannedCount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Slot-by-Slot Chrono Analysis Table */}
      <div className="border border-stone-200/80 rounded-2xl overflow-hidden bg-white">
        <div className="bg-stone-50/80 px-5 py-3 border-b border-stone-200/80 flex items-center justify-between text-[10px] font-sans font-semibold text-stone-500 uppercase tracking-widest">
          <span>Circadian Slot Performance (7-Day Aggregate)</span>
          <span>Doses Taken / Target</span>
        </div>

        <div className="divide-y divide-stone-100">
          {slotStats.map((s) => (
            <div key={s.slot} className="px-5 py-3.5 flex items-center justify-between text-xs font-sans">
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    s.percentage >= 80 ? 'bg-stone-900' : s.percentage >= 50 ? 'bg-amber-600' : 'bg-rose-500'
                  }`}
                />
                <div>
                  <span className="font-serif text-sm font-medium text-stone-950">{s.slot}</span>
                  <span className="text-stone-400 ml-2 text-xs">({s.itemCount} nutrients / day)</span>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-28 bg-stone-100 rounded-full h-1.5 overflow-hidden hidden sm:block">
                  <div
                    className="h-1.5 rounded-full bg-stone-900"
                    style={{ width: `${Math.min(s.percentage, 100)}%` }}
                  />
                </div>
                <div className="text-right">
                  <span className="font-serif font-bold text-stone-950 text-sm">{s.percentage}%</span>
                  <span className="text-stone-400 text-[11px] ml-1.5">
                    ({s.taken}/{s.planned})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chrono-Nutrition Guidance Insight */}
      <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-5 flex items-start gap-3.5 text-xs text-stone-700">
        <Sparkles className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-serif text-sm font-medium text-stone-950">Chrono-Pharmacokinetic Clinical Observation</p>
          <p className="text-stone-600 leading-relaxed font-sans">
            {lowestSlot && lowestSlot.percentage < 70 ? (
              <>
                Your <strong>{lowestSlot.slot}</strong> window exhibits the greatest timing variance ({lowestSlot.percentage}%).
                Fat-soluble and water-soluble compounds rely on consistent circadian rhythmicity to stabilize active plasma
                concentrations. We recommend anchoring this window directly to an immutable daily habit, such as morning coffee or dinner preparation.
              </>
            ) : (
              <>
                Exemplary circadian adherence across all targeted daily windows. Consistent timing optimizes intestinal transporter saturation
                and preserves discrete 2-hour buffer intervals between competing mineral pairs (e.g. iron vs calcium).
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
