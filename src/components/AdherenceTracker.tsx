import React, { useState } from 'react';
import {
  CalendarCheck,
  Flame,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Clock,
  Award,
  BarChart3
} from 'lucide-react';
import { AdherenceLog, ScheduleItem } from '../types';
import { WeeklyAdherenceReport } from './WeeklyAdherenceReport';

interface AdherenceTrackerProps {
  adherenceLogs: AdherenceLog[];
  scheduleItems: ScheduleItem[];
  adherenceMap: Record<string, boolean>;
  onToggleAdherence: (item: ScheduleItem, taken: boolean, dateStr?: string) => void;
}

export const AdherenceTracker: React.FC<AdherenceTrackerProps> = ({
  adherenceLogs,
  scheduleItems,
  adherenceMap,
  onToggleAdherence
}) => {
  const [selectedDateOffset, setSelectedDateOffset] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');

  // Generate last 14 days dates
  const days: { dateStr: string; label: string; dayName: string; isToday: boolean }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 0;
    days.push({
      dateStr,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      isToday
    });
  }

  // Calculate stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTaken = scheduleItems.filter((item) => adherenceMap[item.id]).length;
  const totalItems = scheduleItems.length;
  const todayPercent = totalItems > 0 ? Math.round((todayTaken / totalItems) * 100) : 0;

  // Streak calculation
  let streak = 0;
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const logsForDate = adherenceLogs.filter((l) => l.date === dStr && l.taken);
    if (i === 0 && logsForDate.length === 0) {
      // If today is not done yet, continue to check yesterday for streak
      continue;
    }
    if (logsForDate.length > 0) {
      streak++;
    } else {
      break;
    }
  }

  // Selected date items
  const activeDateObj = days[days.length - 1 - selectedDateOffset] || days[days.length - 1];
  const logsForSelectedDate = adherenceLogs.filter((l) => l.date === activeDateObj.dateStr);

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Overview Stats */}
      <div className="luxury-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-stone-700 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                Chrono-Habit Engine
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-stone-950 font-normal tracking-tight">
              Circadian Compliance & History
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed max-w-xl font-sans">
              Consistent circadian pacing maximizes receptor uptake while avoiding nutrient competition across distinct biological meal and rest windows.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-200 flex items-center justify-center">
                <Flame className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <p className="text-[10px] font-sans uppercase tracking-widest text-stone-500 font-medium">Active Streak</p>
                <p className="text-xl font-serif font-bold text-stone-950">{streak} Days</p>
              </div>
            </div>

            <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-stone-200/80 text-stone-800 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-sans uppercase tracking-widest text-stone-500 font-medium">Today's Intake</p>
                <p className="text-xl font-serif font-bold text-stone-950">{todayPercent}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs: 7-Day Weekly Report vs 14-Day Calendar Logs */}
        <div className="mt-8 pt-6 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center bg-stone-100/90 p-1.5 rounded-2xl border border-stone-200/80 text-xs font-sans font-medium">
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                viewMode === 'weekly'
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-stone-700" />
              <span>7-Day Summary Monograph</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                viewMode === 'daily'
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5 text-stone-500" />
              <span>14-Day Activity Heatmap</span>
            </button>
          </div>

          <span className="text-xs text-stone-400 font-sans tracking-wide">
            {viewMode === 'weekly'
              ? 'Aggregated 7-day adherence diagnostics'
              : 'Interactive 14-day history & checkmarks'}
          </span>
        </div>
      </div>

      {/* Render Weekly Adherence Report */}
      {viewMode === 'weekly' && (
        <WeeklyAdherenceReport
          adherenceLogs={adherenceLogs}
          scheduleItems={scheduleItems}
          adherenceMap={adherenceMap}
        />
      )}

      {/* 14-Day Calendar Heatmap */}
      {viewMode === 'daily' && (
        <>
          <div className="luxury-card rounded-3xl p-8 sm:p-10 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif text-stone-950 font-normal flex items-center gap-2.5">
                <CalendarCheck className="w-4 h-4 text-stone-600" />
                14-Day Activity Heatmap
              </h3>
              <span className="text-xs text-stone-500 font-sans">Select any day to review chronological log</span>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-2">
              {days.map((day, idx) => {
                const countTaken = adherenceLogs.filter((l) => l.date === day.dateStr && l.taken).length;
                const isSelected = day.dateStr === activeDateObj.dateStr;

                // Color scale based on completed items
                let bgClass = 'bg-stone-100 text-stone-400';
                if (countTaken >= 5) bgClass = 'bg-stone-900 text-amber-200';
                else if (countTaken >= 3) bgClass = 'bg-stone-700 text-stone-100';
                else if (countTaken > 0) bgClass = 'bg-stone-300 text-stone-900';

                return (
                  <button
                    key={day.dateStr}
                    onClick={() => setSelectedDateOffset(days.length - 1 - idx)}
                    className={`flex flex-col items-center justify-between p-2.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'ring-2 ring-stone-900 border-stone-900 bg-stone-50'
                        : 'border-stone-200/80 hover:border-stone-400 bg-white'
                    }`}
                  >
                    <span className="text-[10px] text-stone-500 font-sans font-semibold uppercase">{day.dayName}</span>
                    <div
                      className={`w-7 h-7 rounded-xl my-1.5 flex items-center justify-center text-xs font-serif font-bold transition-all ${bgClass}`}
                    >
                      {countTaken}
                    </div>
                    <span className={`text-[10px] font-sans ${day.isToday ? 'text-stone-950 font-bold' : 'text-stone-500'}`}>
                      {day.label.split(' ')[1]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 text-[11px] text-stone-500 pt-2 font-sans">
              <span>Less</span>
              <span className="w-3 h-3 rounded-xs bg-stone-100 border border-stone-200" />
              <span className="w-3 h-3 rounded-xs bg-stone-300" />
              <span className="w-3 h-3 rounded-xs bg-stone-700" />
              <span className="w-3 h-3 rounded-xs bg-stone-900" />
              <span>More</span>
            </div>
          </div>

          {/* Selected Day Breakdown */}
          <div className="luxury-card rounded-3xl p-8 sm:p-10 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-2xl font-serif text-stone-950 font-normal">
                  {activeDateObj.isToday ? "Today's Intake Log" : `Log for ${activeDateObj.label}`}
                </h3>
                <p className="text-xs text-stone-500 font-sans mt-0.5">
                  {activeDateObj.dateStr} · {scheduleItems.length} planned compounds
                </p>
              </div>
              <span className="text-xs font-sans font-medium px-3 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
                {logsForSelectedDate.filter((l) => l.taken).length} / {scheduleItems.length} Completed
              </span>
            </div>

            <div className="space-y-3">
              {scheduleItems.map((item) => {
                const isTaken = activeDateObj.isToday
                  ? adherenceMap[item.id]
                  : logsForSelectedDate.some((l) => l.scheduleItemId === item.id && l.taken);

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isTaken ? 'bg-stone-50/80 border-stone-300/80' : 'bg-white border-stone-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <button
                        type="button"
                        onClick={() => onToggleAdherence(item, !isTaken, activeDateObj.dateStr)}
                        className="focus:outline-none shrink-0"
                      >
                        {isTaken ? (
                          <div className="w-6 h-6 rounded-full bg-stone-900 text-amber-200 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-stone-300 hover:border-stone-500" />
                        )}
                      </button>
                      <div>
                        <p className={`text-base font-serif font-medium ${isTaken ? 'text-stone-400 line-through' : 'text-stone-950'}`}>
                          {item.nutrientName}
                        </p>
                        <p className="text-xs text-stone-500 font-sans">
                          {item.slot} · {item.recommendedTime} · Dose: {item.dosage}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-sans font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        isTaken ? 'bg-stone-100 text-stone-900 border-stone-300' : 'bg-stone-50 text-stone-500 border-stone-200'
                      }`}
                    >
                      {isTaken ? 'Recorded' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
