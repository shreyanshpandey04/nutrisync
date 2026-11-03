import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Volume2,
  VolumeX,
  FastForward,
  Activity,
  Layers,
  Clock,
  Dna,
  Cpu
} from 'lucide-react';
import { UserProfile } from '../types';
import { chronoAudio } from '../utils/audioSynth';

interface ChronoSynthesisExperienceProps {
  profile: UserProfile;
  onFinish: () => void;
  onCancel?: () => void;
}

interface OrbitCompound {
  id: string;
  name: string;
  symbol: string;
  color: string;
  bgColor: string;
  borderColor: string;
  role: string;
  circadianSlot: string;
  bioavailability: string;
  angle: number;
}

export const ChronoSynthesisExperience: React.FC<ChronoSynthesisExperienceProps> = ({
  profile,
  onFinish,
  onCancel
}) => {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeCompound, setActiveCompound] = useState<OrbitCompound | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const tier = profile.regimenTier || 'beginner';
  const tierLabel =
    tier === 'beginner'
      ? 'Beginner (Pareto 80/20 Core)'
      : tier === 'intermediate'
      ? 'Intermediate (Targeted Boosters)'
      : 'Advanced (Full Biostack)';

  // Key simulated interactive compounds orbiting the circadian core
  const compounds: OrbitCompound[] = [
    {
      id: 'd3',
      name: 'Vitamin D3 + K2',
      symbol: 'D₃',
      color: 'text-amber-300',
      bgColor: 'bg-amber-950/80',
      borderColor: 'border-amber-400/60',
      role: 'Immune support, healthy bones & daily energy',
      circadianSlot: 'Morning with breakfast',
      bioavailability: 'Absorbed best with healthy fats',
      angle: 0
    },
    {
      id: 'mg',
      name: 'Magnesium Glycinate',
      symbol: 'Mg',
      color: 'text-purple-300',
      bgColor: 'bg-purple-950/80',
      borderColor: 'border-purple-400/60',
      role: 'Muscle relaxation & calming bedtime support',
      circadianSlot: 'Evening before bed (22:00)',
      bioavailability: 'Gentle on stomach, highly absorbable',
      angle: 60
    },
    {
      id: 'omega3',
      name: 'Omega-3 (EPA/DHA)',
      symbol: 'Ω-3',
      color: 'text-blue-300',
      bgColor: 'bg-blue-950/80',
      borderColor: 'border-blue-400/60',
      role: 'Heart, brain, and joint recovery',
      circadianSlot: 'Morning with breakfast',
      bioavailability: 'Best taken with a meal',
      angle: 120
    },
    {
      id: 'zn',
      name: 'Zinc Glycinate',
      symbol: 'Zn',
      color: 'text-emerald-300',
      bgColor: 'bg-emerald-950/80',
      borderColor: 'border-emerald-400/60',
      role: 'Immune defenses & cellular health',
      circadianSlot: 'Midday with lunch',
      bioavailability: 'Kept away from calcium for full absorption',
      angle: 180
    },
    {
      id: 'coq10',
      name: 'Coenzyme Q10',
      symbol: 'Q₁₀',
      color: 'text-rose-300',
      bgColor: 'bg-rose-950/80',
      borderColor: 'border-rose-400/60',
      role: 'Cellular energy and stamina',
      circadianSlot: 'Morning with breakfast',
      bioavailability: 'Absorbed best with food',
      angle: 240
    },
    {
      id: 'ashwa',
      name: 'Ashwagandha',
      symbol: 'Ash',
      color: 'text-amber-200',
      bgColor: 'bg-stone-900',
      borderColor: 'border-amber-300/40',
      role: 'Calm stress relief & daily recovery',
      circadianSlot: 'Evening wind-down',
      bioavailability: 'Gentle herbal adaptogen',
      angle: 300
    }
  ];

  // Tailored scientific steps referencing the user's specific answers
  const stages = [
    {
      title: 'Analyzing Daily Routine',
      detail: `Setting morning and evening windows based on your wake time at ${profile.wakeTime} and bedtime at ${profile.sleepTime}.`,
      tag: 'Daily Rhythm'
    },
    {
      title: 'Preventing Nutrient Clashes',
      detail: `Separating iron, zinc, and calcium across separate meals so your body absorbs 100% of each mineral.`,
      tag: 'Zero Clashes'
    },
    {
      title: 'Pairing with Meals',
      detail: `Routing fat-soluble vitamins (D3, K2, Omega-3) to your breakfast and lunch for maximum absorption.`,
      tag: 'Meal Pairing'
    },
    {
      title: 'Keeping Your Routine Simple',
      detail: `Selecting only the most effective, high-yield supplements for your ${tierLabel} plan to avoid pill fatigue.`,
      tag: 'Simple & Focused'
    },
    {
      title: 'Organizing Evening Wind-Down',
      detail: `Placing calming minerals like Magnesium in the evening to help you relax before sleep at ${profile.sleepTime}.`,
      tag: 'Evening Rest'
    },
    {
      title: 'Safety & Medication Check',
      detail: `Double-checking your schedule against known interactions. ${
        profile.existingMedications?.length
          ? `Verified with your ${profile.existingMedications.length} current medications.`
          : 'Zero prescription conflicts detected.'
      }`,
      tag: 'Safety Verified'
    }
  ];

  // Dynamic personalized log entries that stream in as progress rises
  const dynamicLogs = [
    `[START] Loading personal profile for ${profile.name || 'User'} (${profile.sex || 'individual'}, age ${profile.age || 30})...`,
    `[ROUTINE] Setting wake time at ${profile.wakeTime} and sleep time at ${profile.sleepTime}...`,
    `[MEALS] Connecting diet preferences: ${profile.dietType} diet with regular meals...`,
    `[CHECK] Conflict check: Spacing iron and calcium apart to avoid competition...`,
    `[MEALS] Pairing fat-soluble vitamins (D3, Omega-3) with meal times...`,
    `[PLAN] Focusing on the highest-yield nutrients for your ${tier} goals...`,
    `[EVENING] Scheduling calming Magnesium for bedtime relaxation...`,
    `[SAFETY] Safety scan passed: 100% safe dosage bounds and no medication conflicts...`,
    `[COMPLETE] Your personalized daily schedule is ready!`
  ];

  // Timer loop that drives the synthesis progression
  useEffect(() => {
    let currentP = 0;
    const interval = setInterval(() => {
      currentP += 1;
      setProgress(currentP);

      // Determine stage index
      const newStage = Math.min(Math.floor((currentP / 100) * stages.length), stages.length - 1);
      setStageIndex((prev) => {
        if (newStage !== prev) {
          chronoAudio.playStageChime(newStage);
        }
        return newStage;
      });

      // Stream logs progressively
      const logIdx = Math.min(Math.floor((currentP / 100) * dynamicLogs.length), dynamicLogs.length - 1);
      setLogs((prev) => {
        const nextLogs = dynamicLogs.slice(0, logIdx + 1);
        return nextLogs;
      });

      if (currentP >= 100) {
        clearInterval(interval);
        setIsCompleted(true);
        chronoAudio.playCompleteChord();
        // Give the user a brief, satisfying moment to view 100% before transitioning
        setTimeout(() => {
          onFinish();
        }, 1200);
      }
    }, 45); // ~4.5 seconds total runtime for immersive luxury feel

    return () => clearInterval(interval);
  }, [onFinish]);

  // Scroll logs to bottom automatically
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Accelerate / Skip immediately
  const handleAccelerate = () => {
    setProgress(100);
    setStageIndex(stages.length - 1);
    setIsCompleted(true);
    setLogs(dynamicLogs);
    chronoAudio.playCompleteChord();
    setTimeout(() => {
      onFinish();
    }, 400);
  };

  const toggleSound = () => {
    const next = chronoAudio.toggleMute();
    setSoundEnabled(next);
  };

  const currentStage = stages[stageIndex];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-xl flex flex-col items-center justify-between text-stone-100 p-4 sm:p-8 overflow-y-auto font-sans animate-in fade-in duration-300">
      {/* Ambient background glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-semibold text-lg text-white tracking-wide">
                NutriSync Live Schedule Builder
              </span>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                LIVE ENGINE
              </span>
            </div>
            <p className="text-xs text-stone-400 font-light">
              Smart timing & zero nutrient clashes
            </p>
          </div>
        </div>

        {/* Top Controls: Sound Toggle & Fast-Forward */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            className="p-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
            title={soundEnabled ? 'Mute Harmonic Audio' : 'Unmute Harmonic Audio'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-stone-500" />
            )}
            <span className="text-[11px] hidden sm:inline">{soundEnabled ? 'Audio On' : 'Muted'}</span>
          </button>

          <button
            type="button"
            onClick={handleAccelerate}
            className="px-3 py-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 border border-stone-800 hover:border-stone-700 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[11px] font-medium hidden sm:inline">Accelerate</span>
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-stone-500 hover:text-stone-300 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </header>

      {/* Main Interactive Synthesis Visualizer */}
      <main className="w-full max-w-4xl my-auto py-6 flex flex-col items-center gap-8 z-10">
        {/* Personalization HUD Banner */}
        <div className="text-center space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900/80 border border-stone-800 text-stone-300 text-xs">
            <Dna className="w-3.5 h-3.5 text-emerald-400" />
            <span>Creating Schedule For: <strong className="text-white font-medium">{profile.name || 'Personalized Plan'}</strong></span>
            <span className="text-stone-600">·</span>
            <span className="text-amber-300 font-mono capitalize">{tier} Plan</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif font-light text-white tracking-tight leading-tight">
            Building your <span className="italic font-normal text-amber-200">daily schedule</span>
          </h2>

          <p className="text-xs sm:text-sm text-stone-400 font-light max-w-md mx-auto">
            Pairing vitamins with the right meals, preventing mineral conflicts, and organizing your morning, midday, and evening routine.
          </p>
        </div>

        {/* Central Kinetic Chrono-Core & Orbiting Molecule Lattice */}
        <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center select-none">
          {/* Outer Pulsing Circadian Ring with 24-hour hour marks */}
          <div className="absolute inset-0 rounded-full border border-stone-800/80 animate-[spin_60s_linear_infinite]" />
          <div className="absolute inset-4 rounded-full border border-dashed border-stone-700/60 animate-[spin_35s_linear_infinite_reverse]" />
          <div className="absolute inset-10 rounded-full border border-stone-800/40" />

          {/* Central Pulsing Heart Core */}
          <motion.div
            animate={{
              scale: isCompleted ? [1, 1.06, 1] : 1,
              borderColor: isCompleted ? 'rgba(52, 211, 153, 0.8)' : 'rgba(87, 83, 78, 0.8)'
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border border-stone-700 flex flex-col items-center justify-center p-4 shadow-2xl shadow-amber-500/10 text-center"
          >
            <div
              className={`absolute -inset-1 rounded-full blur-md animate-pulse transition-colors duration-500 ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-500/40 to-teal-500/40'
                  : 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20'
              }`}
            />
            <div className="relative z-10 flex flex-col items-center">
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-0.5" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-mono">
                    CALIBRATED
                  </span>
                </motion.div>
              ) : (
                <>
                  <span className="text-3xl sm:text-4xl font-serif font-light text-amber-200 tracking-tight">
                    {progress}%
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-mono mt-1">
                    BUILDING SCHEDULE
                  </span>
                </>
              )}
            </div>
          </motion.div>

          {/* Orbiting Interactive Compounds */}
          {compounds.map((comp, idx) => {
            // Distribute on circle with trigonometric placement
            const radius = 125; // px distance from center
            const angleDeg = comp.angle + progress * 1.8;
            const angleRad = (angleDeg * Math.PI) / 180;
            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;
            const isHovered = activeCompound?.id === comp.id;

            return (
              <div
                key={comp.id}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  transition: 'transform 0.1s ease-out'
                }}
                onMouseEnter={() => {
                  setActiveCompound(comp);
                  chronoAudio.playNodePulse(500 + idx * 80);
                }}
                onMouseLeave={() => setActiveCompound(null)}
                className={`absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full ${comp.bgColor} border ${comp.borderColor} shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 z-20 ${
                  isHovered ? 'scale-125 ring-2 ring-amber-300' : 'hover:scale-110'
                }`}
                title={`${comp.name} (${comp.role})`}
              >
                <span className={`text-xs font-serif font-bold ${comp.color}`}>
                  {comp.symbol}
                </span>

                {/* Laser connection line to center */}
                <div
                  className={`absolute w-[125px] h-[1px] origin-left pointer-events-none -z-10 ${
                    isHovered
                      ? 'bg-gradient-to-r from-amber-400/80 to-transparent'
                      : 'bg-gradient-to-r from-stone-700/30 to-transparent'
                  }`}
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `rotate(${angleDeg + 180}deg)`
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Active Hover Compound Quick Inspector / Stage Description with AnimatePresence */}
        <div className="w-full max-w-xl min-h-[110px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {activeCompound ? (
              <motion.div
                key={activeCompound.id}
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-stone-900/95 border border-stone-700/90 rounded-2xl px-5 py-3.5 max-w-md w-full text-center space-y-1.5 shadow-xl shadow-stone-950/40"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className={`font-serif font-semibold text-sm ${activeCompound.color}`}>
                    {activeCompound.name}
                  </span>
                  <span className="text-[10px] font-mono text-stone-300 bg-stone-800 px-2 py-0.5 rounded-full border border-stone-700">
                    {activeCompound.circadianSlot}
                  </span>
                </div>
                <p className="text-xs text-stone-300">{activeCompound.role}</p>
                <p className="text-[11px] text-emerald-400 font-mono">{activeCompound.bioavailability}</p>
              </motion.div>
            ) : (
              /* Active Phase Description */
              <motion.div
                key={stageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="bg-stone-900/70 border border-stone-800/90 rounded-2xl p-5 w-full text-center space-y-2 shadow-lg shadow-stone-950/20"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300 bg-amber-950/70 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    {currentStage.tag}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    Step {stageIndex + 1} of {stages.length}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-serif text-white font-medium">
                  {currentStage.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-md mx-auto">
                  {currentStage.detail}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progressive Multi-Segment Progress Bar */}
        <div className="w-full max-w-xl space-y-2">
          <div className="h-2 w-full bg-stone-900 rounded-full overflow-hidden border border-stone-800/80 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-amber-200 to-emerald-400 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
            <span>DAILY RHYTHM</span>
            <span>NO CLASHES</span>
            <span>MEALS</span>
            <span>FOCUSED</span>
            <span>EVENING</span>
            <span>ALL SAFE</span>
          </div>
        </div>

        {/* Live Streaming Telemetry Terminal */}
        <div className="w-full max-w-xl bg-stone-950/90 rounded-xl border border-stone-800/80 p-3.5 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-[10px] text-stone-500 border-b border-stone-800/60 pb-1.5 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE SCHEDULE BUILDER</span>
            </div>
            <span>PERSONALIZING YOUR PLAN</span>
          </div>

          <div
            ref={logContainerRef}
            className="h-20 overflow-y-auto font-mono text-[11px] space-y-1 pr-1 text-left scrollbar-thin scrollbar-thumb-stone-800"
          >
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="text-stone-300 leading-tight"
              >
                <span className="text-amber-400/90 font-semibold">{log.slice(0, log.indexOf(']') + 1)}</span>
                <span className="text-stone-300">{log.slice(log.indexOf(']') + 1)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Status */}
      <footer className="w-full max-w-4xl flex items-center justify-between text-xs text-stone-500 z-10 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Evidence-based safety checks & safe daily limits</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAccelerate}
            className="text-amber-300 hover:text-amber-200 transition-colors text-xs font-medium underline underline-offset-4 cursor-pointer"
          >
            View My Schedule Now →
          </button>
        </div>
      </footer>
    </div>
  );
};
