import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Sun,
  Moon,
  SlidersHorizontal,
  ChevronRight,
  Check,
  AlertTriangle,
  Zap,
  HeartPulse,
  Brain,
  Shield,
  Activity,
  BedDouble
} from 'lucide-react';
import { HealthGoal } from '../types';

interface HomeScreenProps {
  onOpenAuth: (mode?: 'signin' | 'register') => void;
  onFastTrackDemo?: () => void;
  onCreateSchedule?: (params?: { name?: string; goals?: HealthGoal[]; bedtime?: string; wakeTime?: string }) => void;
  onOpenWizard?: () => void;
}

const PRIMARY_OBJECTIVES: { id: HealthGoal; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: 'Better Sleep',
    label: 'Deep Restorative Sleep',
    icon: <Moon className="w-4 h-4 text-indigo-700" />,
    desc: 'GABA, Magnesium Glycinate & Melatonin precursors'
  },
  {
    id: 'More Energy',
    label: 'Sustained Daily Energy',
    icon: <Zap className="w-4 h-4 text-amber-700" />,
    desc: 'Mitochondrial CoQ10, B-Complex & Methylation'
  },
  {
    id: 'Muscle Gain & Performance',
    label: 'Athletic Recovery & Power',
    icon: <Activity className="w-4 h-4 text-emerald-800" />,
    desc: 'Creapure® Creatine, Electrolytes & Protein'
  },
  {
    id: 'Cognitive Focus',
    label: 'Focus & Neuro-Clarity',
    icon: <Brain className="w-4 h-4 text-stone-700" />,
    desc: 'Omega-3 DHA/EPA & L-Threonate uptake'
  },
  {
    id: 'Stress & Mood',
    label: 'Cortisol & Stress Balance',
    icon: <HeartPulse className="w-4 h-4 text-rose-700" />,
    desc: 'Ashwagandha KSM-66® & Adaptogenic support'
  },
  {
    id: 'Immune Support',
    label: 'Cellular Immunity',
    icon: <Shield className="w-4 h-4 text-stone-700" />,
    desc: 'Vitamin D3/K2, Zinc Glycinate & Vitamin C'
  }
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenAuth,
  onFastTrackDemo,
  onCreateSchedule,
  onOpenWizard
}) => {
  const [userName, setUserName] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<HealthGoal[]>(['Better Sleep', 'More Energy']);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');

  const toggleGoal = (goal: HealthGoal) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goal)) {
        if (prev.length <= 1) return prev;
        return prev.filter((g) => g !== goal);
      } else {
        return [...prev, goal];
      }
    });
  };

  const handleLaunchCreation = () => {
    if (onCreateSchedule) {
      onCreateSchedule({
        name: userName.trim() || undefined,
        goals: selectedGoals,
        bedtime,
        wakeTime
      });
    } else if (onFastTrackDemo) {
      onFastTrackDemo();
    }
  };

  return (
    <div className="py-6 sm:py-12 max-w-4xl mx-auto space-y-16 sm:space-y-24">
      {/* Editorial Hero Statement */}
      <section className="text-center space-y-6 pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-sans tracking-[0.16em] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>Evidence-Based Chrono-Nutrition</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-stone-950 tracking-tight leading-[1.08] max-w-3xl mx-auto">
          Supplements only work when your body can <span className="italic font-normal">actually absorb them</span>.
        </h1>

        <p className="text-base sm:text-lg text-stone-600 font-sans max-w-2xl mx-auto leading-relaxed font-light">
          Swallowing a handful of vitamins at breakfast causes calcium and iron to compete, wastes fat-soluble nutrients, and triggers morning nausea. NutriSync choreographs your daily intake around your biological clock.
        </p>

        {/* The Live Interactive Protocol Intake Card */}
        <div className="pt-2 max-w-2xl mx-auto text-left">
          <div className="bg-white rounded-3xl border border-stone-300/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 block">
                  Quick Protocol Intake
                </span>
                <span className="text-[11px] text-stone-500 font-sans">
                  Instant circadian calibration based on your natural schedule
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                60-Second Setup
              </span>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-stone-600">
                First Name (Optional)
              </label>
              <input
                id="input-home-user-name"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full px-4 py-3 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 font-medium placeholder:text-stone-400 transition-colors"
              />
            </div>

            {/* Health Goals Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-stone-600">
                  Select Primary Focus Areas
                </label>
                <span className="text-[11px] text-stone-500 font-sans">
                  {selectedGoals.length} selected
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRIMARY_OBJECTIVES.map((goal) => {
                  const isSelected = selectedGoals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleGoal(goal.id)}
                      className={`text-left p-3.5 rounded-2xl border text-xs transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-stone-900 bg-stone-950 text-white shadow-2xs'
                          : 'border-stone-200 hover:border-stone-400 bg-stone-50/30 text-stone-800'
                      }`}
                    >
                      <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-stone-800 text-white' : 'bg-white border border-stone-200'
                      }`}>
                        {goal.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs leading-snug">{goal.label}</p>
                        <p className={`text-[11px] mt-0.5 line-clamp-1 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                          {goal.desc}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 self-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sleep and Wake Clock Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-stone-600 mb-1 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-700" /> Morning Wake Time
                </label>
                <select
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50/60 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 cursor-pointer"
                >
                  <option value="05:30">5:30 AM (Early Riser)</option>
                  <option value="06:00">6:00 AM</option>
                  <option value="06:30">6:30 AM</option>
                  <option value="07:00">7:00 AM (Standard)</option>
                  <option value="07:30">7:30 AM</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="08:30">8:30 AM</option>
                  <option value="09:00">9:00 AM</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-stone-600 mb-1 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-700" /> Night Bedtime
                </label>
                <select
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50/60 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 cursor-pointer"
                >
                  <option value="21:30">9:30 PM</option>
                  <option value="22:00">10:00 PM</option>
                  <option value="22:30">10:30 PM</option>
                  <option value="23:00">11:00 PM (Standard)</option>
                  <option value="23:30">11:30 PM</option>
                  <option value="00:00">12:00 AM (Midnight)</option>
                  <option value="00:30">12:30 AM</option>
                </select>
              </div>
            </div>

            {/* Launch Action */}
            <div className="space-y-3 pt-2">
              <button
                id="btn-create-my-schedule"
                type="button"
                onClick={handleLaunchCreation}
                className="w-full py-4 rounded-2xl bg-stone-950 hover:bg-stone-900 text-stone-50 text-xs font-semibold tracking-widest uppercase transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 border border-stone-800"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate My Daily Protocol</span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500 pt-1">
                {onOpenWizard && (
                  <button
                    type="button"
                    onClick={onOpenWizard}
                    className="hover:text-stone-950 font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
                    <span>Include prescription medications & bloodwork flags →</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onOpenAuth('signin')}
                  className="hover:text-stone-950 font-medium transition-colors cursor-pointer underline underline-offset-2 ml-auto"
                >
                  Existing plan? Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem & Solution: Why Timing Changes Everything */}
      <section className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 space-y-8 shadow-2xs">
        <div className="max-w-2xl space-y-2">
          <span className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-stone-500">
            Receptor Kinetics
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-stone-950 tracking-tight">
            How NutriSync eliminates nutrient clashes
          </h2>
          <p className="text-sm text-stone-600 font-sans leading-relaxed">
            Nutrients share the exact same intestinal transporters. When ingested simultaneously, they bind competitively, blocking systemic uptake.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#faf9f5] border border-stone-200/70 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-stone-950">
              Circadian Phasing
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Cortisol-peaking vitamins like B-Complex and Vitamin D belong strictly with morning dietary fats. Relaxing neuro-minerals like Magnesium L-Threonate are saved for evening restoration.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#faf9f5] border border-stone-200/70 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-900 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-stone-950">
              DMT-1 Receptor Clearance
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Calcium, Iron, and Zinc battle for the exact same intestinal transport channel. NutriSync automatically spaces them 2+ hours apart so your body receives 100% of both.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#faf9f5] border border-stone-200/70 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-stone-200/80 text-stone-900 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-stone-950">
              Body Mass Calibration
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Dosages are dynamically calculated to your body weight and BMI metrics. Heavy athletic loads require different cellular saturation than sedentary baselines.
            </p>
          </div>
        </div>
      </section>

      {/* Visual Workflow: What Your Day Looks Like */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-stone-500">
            A Typical Chrono-Nutritional Day
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-stone-950">
            Built around your biological rhythms
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">07:30</span>
              <Sun className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <h4 className="font-serif text-base font-semibold text-stone-950">Morning Fuel</h4>
            <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
              Vitamin D3+K2 & Omega-3 with breakfast fats (avocado/eggs) + Methylated B-Complex.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">12:30</span>
              <Activity className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <h4 className="font-serif text-base font-semibold text-stone-950">Midday Focus</h4>
            <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
              CoQ10 & Zinc with lunch, completely separated from morning calcium and caffeine.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 font-medium">17:30</span>
              <Zap className="w-3.5 h-3.5 text-stone-700" />
            </div>
            <h4 className="font-serif text-base font-semibold text-stone-950">Post-Workout</h4>
            <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
              Creapure® Creatine Monohydrate & Whey/Plant protein for rapid glycogen and muscle repair.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-medium">22:00</span>
              <Moon className="w-3.5 h-3.5 text-indigo-700" />
            </div>
            <h4 className="font-serif text-base font-semibold text-stone-950">Night Restoration</h4>
            <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
              Magnesium Bisglycinate & L-Theanine 30 minutes before sleep to trigger deep slow-wave rest.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Quiet Call to Action */}
      <section className="bg-stone-950 text-stone-100 rounded-3xl p-8 sm:p-12 text-center space-y-6">
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-serif font-light text-white tracking-tight">
            Stop guessing your supplement routine.
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 font-sans leading-relaxed">
            Experience the clinical difference of high-bioavailability chronobiology.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleLaunchCreation}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-sans font-semibold text-xs tracking-wider uppercase transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-stone-950" />
            <span>Build Your Protocol</span>
          </button>
          <button
            onClick={() => onOpenAuth('signin')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 font-sans font-medium text-xs tracking-wider uppercase transition-all cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </section>
    </div>
  );
};
