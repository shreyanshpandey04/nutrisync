import React, { useState } from 'react';
import { UserProfile, RegimenTier } from '../types';
import { User, Clock, Utensils, X, Check, Dumbbell, Zap } from 'lucide-react';

interface ProfileSettingsModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: UserProfile) => void;
  onReopenFullOnboarding: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
  onReopenFullOnboarding
}) => {
  const [regimenTier, setRegimenTier] = useState<RegimenTier>(profile.regimenTier || 'beginner');
  const [wakeTime, setWakeTime] = useState(profile.wakeTime);
  const [sleepTime, setSleepTime] = useState(profile.sleepTime);
  const [breakfastTime, setBreakfastTime] = useState(profile.breakfastTime || '08:00');
  const [lunchTime, setLunchTime] = useState(profile.lunchTime || '12:30');
  const [dinnerTime, setDinnerTime] = useState(profile.dinnerTime || '19:00');
  const [hasWorkout, setHasWorkout] = useState(profile.hasWorkout ?? true);
  const [workoutTime, setWorkoutTime] = useState(profile.workoutTime || '17:30');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...profile,
      regimenTier,
      wakeTime,
      sleepTime,
      breakfastTime,
      lunchTime,
      dinnerTime,
      hasWorkout,
      workoutTime: hasWorkout ? workoutTime : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xl max-w-lg w-full p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 font-sans">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-amber-200 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-stone-950 font-normal">Circadian Anchor Calibration</h2>
              <p className="text-[11px] text-stone-500">Tune meal and wake timestamps to recalibrate timing slots</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-800 p-2 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5 text-xs">
          <div className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200/80 space-y-1">
            <p className="font-serif text-base font-medium text-stone-950">{profile.name} <span className="font-sans text-xs text-stone-500 font-normal">({profile.age}y, {profile.sex})</span></p>
            <p className="text-stone-500 font-sans">
              Goals: {profile.goals.join(', ')} · Diet: {profile.dietType}
            </p>
          </div>

          {/* Regimen Depth & Complexity (Pareto 80/20) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500">
                Protocol Depth (Pareto Principle 80/20)
              </label>
              <span className="text-[10px] text-emerald-800 font-medium">
                {regimenTier === 'beginner' ? '80/20 Core (2–3 compounds)' : regimenTier === 'intermediate' ? 'Targeted (4–5 compounds)' : 'Full Stack (6–8 compounds)'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'beginner' as RegimenTier, label: 'Beginner', sub: '2–3 (80/20)' },
                { id: 'intermediate' as RegimenTier, label: 'Intermediate', sub: '4–5 Boosters' },
                { id: 'advanced' as RegimenTier, label: 'Advanced', sub: '6–8 Stack' }
              ].map((t) => {
                const isSelected = regimenTier === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setRegimenTier(t.id)}
                    className={`py-2.5 px-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-stone-900 bg-stone-900 text-stone-50 shadow-2xs'
                        : 'border-stone-200 hover:border-stone-400 bg-stone-50/50 text-stone-700'
                    }`}
                  >
                    <div className="font-semibold text-xs leading-tight">{t.label}</div>
                    <div className={`text-[10px] leading-tight mt-0.5 ${isSelected ? 'text-amber-200' : 'text-stone-500'}`}>
                      {t.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">Wake Timestamp</label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white text-sm font-sans font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">Sleep Timestamp</label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white text-sm font-sans font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">Breakfast</label>
              <input
                type="time"
                value={breakfastTime}
                onChange={(e) => setBreakfastTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white text-xs font-sans text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">Lunch</label>
              <input
                type="time"
                value={lunchTime}
                onChange={(e) => setLunchTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white text-xs font-sans text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">Dinner</label>
              <input
                type="time"
                value={dinnerTime}
                onChange={(e) => setDinnerTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white text-xs font-sans text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

          <div className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif text-sm font-medium text-stone-950 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-stone-700" /> Physical Training Window
              </span>
              <input
                type="checkbox"
                checked={hasWorkout}
                onChange={(e) => setHasWorkout(e.target.checked)}
                className="w-4 h-4 accent-stone-900 rounded border-stone-300 cursor-pointer"
              />
            </div>
            {hasWorkout && (
              <div>
                <label className="block text-stone-500 text-[11px] mb-1.5">Workout Commencing Timestamp</label>
                <input
                  type="time"
                  value={workoutTime}
                  onChange={(e) => setWorkoutTime(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              onReopenFullOnboarding();
            }}
            className="text-stone-500 hover:text-stone-950 font-sans tracking-wide underline font-medium transition-colors"
          >
            Reopen Full Profile Intake
          </button>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-sans font-medium hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-sans font-medium flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
            >
              <Check className="w-3.5 h-3.5 text-amber-200" />
              Recalibrate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
