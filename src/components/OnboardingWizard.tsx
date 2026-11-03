import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Plus,
  X,
  HeartPulse,
  Activity,
  Calendar,
  Utensils,
  Moon,
  Sun,
  Dumbbell,
  Search,
  ShieldAlert,
  Pill,
  Stethoscope,
  CheckCircle2
} from 'lucide-react';
import {
  UserProfile,
  BiologicalSex,
  ActivityLevel,
  DietType,
  HealthGoal,
  RegimenTier
} from '../types';
import { calculateBMI, getBMICategory } from '../utils/ruleEngine';
import {
  COMMON_ALLERGENS,
  COMMON_MEDICATIONS,
  COMMON_SUPPLEMENTS
} from '../data/clinicalCatalog';

interface OnboardingWizardProps {
  initialProfile?: UserProfile | null;
  onComplete: (profile: UserProfile) => void;
  onCancel?: () => void;
}

const ALL_GOALS: { id: HealthGoal; label: string; desc: string }[] = [
  { id: 'Better Sleep', label: 'Better Sleep', desc: 'Fall asleep faster, wake up refreshed, and rest deeply' },
  { id: 'More Energy', label: 'More Energy', desc: 'Steady daytime vitality without afternoon crashes' },
  { id: 'Muscle Gain & Performance', label: 'Muscle & Performance', desc: 'Faster exercise recovery, strength, and endurance' },
  { id: 'Stress & Mood', label: 'Stress & Mood', desc: 'Calm mind, stress relief, and steady daily mood' },
  { id: 'Immune Support', label: 'Immune Defense', desc: 'Year-round body defenses and seasonal wellness' },
  { id: 'Cognitive Focus', label: 'Cognitive Focus', desc: 'Clear concentration, sharp memory, and mental flow' },
  { id: 'Clear/Healthy Skin', label: 'Skin Radiance', desc: 'Hydrated, glowing skin and cellular support' },
  { id: 'Digestive Health', label: 'Digestive Health', desc: 'Smooth digestion, gut balance, and reduced bloating' },
  { id: 'Weight Management', label: 'Weight Management', desc: 'Healthy metabolism and balanced daily energy' },
  { id: 'Hair & Nail Health', label: 'Hair & Nails', desc: 'Stronger hair growth and healthy, resilient nails' },
  { id: 'General Wellness', label: 'General Wellness', desc: 'Essential daily nutrients to feel your best' }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialProfile,
  onComplete,
  onCancel
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 7;

  // Form State
  const [name, setName] = useState<string>(initialProfile?.name || '');
  const [age, setAge] = useState<number>(initialProfile?.age || 28);
  const [sex, setSex] = useState<BiologicalSex>(initialProfile?.sex || 'male');

  // Height & Weight
  const [useImperial, setUseImperial] = useState<boolean>(initialProfile?.useImperial || false);
  const [heightCm, setHeightCm] = useState<number>(initialProfile?.heightCm || 175);
  const [weightKg, setWeightKg] = useState<number>(initialProfile?.weightKg || 72);

  // Imperial inputs
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(9);
  const [weightLbs, setWeightLbs] = useState<number>(160);

  // Health Flags & Clinical Guardrails
  const [pregnantOrNursing, setPregnantOrNursing] = useState<boolean>(initialProfile?.pregnantOrNursing || false);
  const [hasIronDeficiency, setHasIronDeficiency] = useState<boolean>(initialProfile?.hasIronDeficiency || false);
  const [hasKidneyIssues, setHasKidneyIssues] = useState<boolean>(initialProfile?.hasKidneyIssues || false);
  const [hasThyroidCondition, setHasThyroidCondition] = useState<boolean>(initialProfile?.hasThyroidCondition || false);
  const [hasBleedingDisorder, setHasBleedingDisorder] = useState<boolean>(initialProfile?.hasBleedingDisorder || false);
  const [hasGastroSensitivity, setHasGastroSensitivity] = useState<boolean>(initialProfile?.hasGastroSensitivity || false);
  const [hasLiverCondition, setHasLiverCondition] = useState<boolean>(initialProfile?.hasLiverCondition || false);
  const [hasAutoimmuneCondition, setHasAutoimmuneCondition] = useState<boolean>(initialProfile?.hasAutoimmuneCondition || false);

  // Activity & Diet
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(initialProfile?.activityLevel || 'moderately_active');
  const [dietType, setDietType] = useState<DietType>(initialProfile?.dietType || 'omnivore');

  // Goals (max 3) & Protocol Tier
  const [goals, setGoals] = useState<HealthGoal[]>(
    initialProfile?.goals && initialProfile.goals.length > 0
      ? initialProfile.goals
      : ['More Energy', 'Better Sleep', 'General Wellness']
  );
  const [regimenTier, setRegimenTier] = useState<RegimenTier>(initialProfile?.regimenTier || 'beginner');

  // Allergies & Existing
  const [allergies, setAllergies] = useState<string[]>(initialProfile?.allergies || []);
  const [newAllergy, setNewAllergy] = useState<string>('');
  const [existingSupplements, setExistingSupplements] = useState<string[]>(initialProfile?.existingSupplements || []);
  const [existingMedications, setExistingMedications] = useState<string[]>(initialProfile?.existingMedications || []);
  
  // Search-and-Select State for Medications & Supplements
  const [medSearchQuery, setMedSearchQuery] = useState<string>('');
  const [isMedDropdownOpen, setIsMedDropdownOpen] = useState<boolean>(false);
  const [suppSearchQuery, setSuppSearchQuery] = useState<string>('');
  const [isSuppDropdownOpen, setIsSuppDropdownOpen] = useState<boolean>(false);

  // Routine
  const [wakeTime, setWakeTime] = useState<string>(initialProfile?.wakeTime || '07:00');
  const [sleepTime, setSleepTime] = useState<string>(initialProfile?.sleepTime || '23:00');
  const [mealCount, setMealCount] = useState<number>(initialProfile?.mealCount || 3);
  const [breakfastTime, setBreakfastTime] = useState<string>(initialProfile?.breakfastTime || '08:00');
  const [lunchTime, setLunchTime] = useState<string>(initialProfile?.lunchTime || '12:30');
  const [dinnerTime, setDinnerTime] = useState<string>(initialProfile?.dinnerTime || '19:00');
  const [hasWorkout, setHasWorkout] = useState<boolean>(initialProfile?.hasWorkout ?? true);
  const [workoutTime, setWorkoutTime] = useState<string>(initialProfile?.workoutTime || '17:30');
  const [fastingWindow, setFastingWindow] = useState<string>(initialProfile?.fastingWindow || '');

  // Height / Weight sync
  const handleUnitToggle = (toImperial: boolean) => {
    setUseImperial(toImperial);
    if (toImperial) {
      const totalInches = Math.round(heightCm / 2.54);
      setHeightFeet(Math.floor(totalInches / 12));
      setHeightInches(totalInches % 12);
      setWeightLbs(Math.round(weightKg * 2.20462));
    } else {
      const totalInches = heightFeet * 12 + heightInches;
      setHeightCm(Math.round(totalInches * 2.54));
      setWeightKg(Math.round(weightLbs / 2.20462));
    }
  };

  const activeWeightKg = useImperial ? Math.round(weightLbs / 2.20462) : weightKg;
  const activeHeightCm = useImperial ? Math.round((heightFeet * 12 + heightInches) * 2.54) : heightCm;
  const currentBMI = calculateBMI(activeWeightKg, activeHeightCm);
  const bmiCategory = getBMICategory(currentBMI);

  const toggleGoal = (g: HealthGoal) => {
    if (goals.includes(g)) {
      setGoals(goals.filter((item) => item !== g));
    } else {
      if (goals.length >= 3) return; // max 3 constraint
      setGoals([...goals, g]);
    }
  };

  const addAllergy = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !allergies.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      setAllergies([...allergies, trimmed]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (val: string) => {
    setAllergies(allergies.filter((a) => a.toLowerCase() !== val.toLowerCase()));
  };

  const toggleAllergyOption = (allergenName: string) => {
    const exists = allergies.some((a) => a.toLowerCase() === allergenName.toLowerCase());
    if (exists) {
      removeAllergy(allergenName);
    } else {
      setAllergies([...allergies, allergenName]);
    }
  };

  const addMedication = (medName: string) => {
    const trimmed = medName.trim();
    if (!trimmed) return;
    if (!existingMedications.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      setExistingMedications([...existingMedications, trimmed]);
    }
    setMedSearchQuery('');
    setIsMedDropdownOpen(false);
  };

  const removeMedication = (medName: string) => {
    setExistingMedications(existingMedications.filter((m) => m.toLowerCase() !== medName.toLowerCase()));
  };

  const addSupplement = (suppName: string) => {
    const trimmed = suppName.trim();
    if (!trimmed) return;
    if (!existingSupplements.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setExistingSupplements([...existingSupplements, trimmed]);
    }
    setSuppSearchQuery('');
    setIsSuppDropdownOpen(false);
  };

  const removeSupplement = (suppName: string) => {
    setExistingSupplements(existingSupplements.filter((s) => s.toLowerCase() !== suppName.toLowerCase()));
  };

  const handleFinish = () => {
    const finalProfile: UserProfile = {
      id: initialProfile?.id || `user-${Date.now()}`,
      email: initialProfile?.email || 'user@nutrisync.local',
      name: name.trim() || 'Wellness Member',
      age: Number(age) || 28,
      sex,
      heightCm: activeHeightCm,
      weightKg: activeWeightKg,
      useImperial,
      pregnantOrNursing,
      hasIronDeficiency,
      hasKidneyIssues,
      hasThyroidCondition,
      hasBleedingDisorder,
      hasGastroSensitivity,
      hasLiverCondition,
      hasAutoimmuneCondition,
      activityLevel,
      goals: goals.length > 0 ? goals : ['General Wellness'],
      regimenTier,
      dietType,
      allergies,
      existingSupplements,
      existingMedications,
      wakeTime,
      sleepTime,
      mealCount,
      breakfastTime,
      lunchTime,
      dinnerTime,
      hasWorkout,
      workoutTime: hasWorkout ? workoutTime : undefined,
      fastingWindow: fastingWindow.trim() || undefined
    };

    onComplete(finalProfile);
  };

  return (
    <div className="max-w-2xl mx-auto luxury-card rounded-2xl sm:rounded-3xl overflow-hidden my-4 sm:my-8 font-sans border border-stone-200/90">
      {/* Header with Progress Bar */}
      <div className="bg-stone-50/90 px-4 sm:px-8 py-4 sm:py-5 border-b border-stone-200/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-stone-900 text-amber-200 flex items-center justify-center text-xs font-serif font-bold">
              {step}
            </span>
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-[0.2em]">
              Step {step} of {totalSteps}
            </span>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-wider font-medium"
            >
              Dismiss
            </button>
          )}
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-stone-200/80 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-stone-900 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Contents */}
      <div className="p-5 sm:p-8 lg:p-10">
        {/* STEP 1: Name, Age, Biological Sex */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-3xl font-serif text-stone-950 font-normal tracking-tight">
                About You
              </h2>
              <p className="text-sm text-stone-500 mt-1 font-sans leading-relaxed">
                Tell us a bit about yourself so we can personalize your supplement schedule and safe daily amounts.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 text-sm font-sans placeholder:text-stone-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">
                  Age (years)
                </label>
                <input
                  type="number"
                  min={12}
                  max={110}
                  value={age}
                  onChange={(e) => setAge(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 text-sm font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">
                  Biological Sex
                </label>
                <p className="text-xs text-stone-500 mb-2.5 leading-relaxed">
                  Used solely to apply safe daily vitamin and mineral intake guidelines established by health agencies.
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['female', 'male', 'prefer_not_to_say'] as BiologicalSex[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSex(s)}
                      className={`py-3 px-3 rounded-2xl border text-xs font-medium transition-all ${
                        sex === s
                          ? 'border-stone-900 bg-stone-900 text-stone-50 shadow-2xs'
                          : 'border-stone-200 hover:border-stone-400 text-stone-700 bg-stone-50/40'
                      }`}
                    >
                      {s === 'female' ? 'Female' : s === 'male' ? 'Male' : 'Prefer not to say'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Height & Weight (BMI calculation) */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
              <div>
                <h2 className="text-3xl font-serif text-stone-950 font-normal tracking-tight">
                  Body Measurements
                </h2>
                <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                  Helps calculate accurate daily water and magnesium amounts based on your body size.
                </p>
              </div>

              {/* Metric / Imperial toggle */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200/80 self-start">
                <button
                  type="button"
                  onClick={() => handleUnitToggle(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    !useImperial ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  Metric (cm / kg)
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitToggle(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    useImperial ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  Imperial (ft / lbs)
                </button>
              </div>
            </div>

            <div className="space-y-5">
              {!useImperial ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">
                      Stature (cm)
                    </label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 text-sm font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">
                      Mass (kg)
                    </label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 text-sm font-sans"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">Feet</label>
                    <input
                      type="number"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 text-sm font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">Inches</label>
                    <input
                      type="number"
                      value={heightInches}
                      onChange={(e) => setHeightInches(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 text-sm font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">Weight (lbs)</label>
                    <input
                      type="number"
                      value={weightLbs}
                      onChange={(e) => setWeightLbs(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 text-sm font-sans"
                    />
                  </div>
                </div>
              )}

              {/* Real-time Computed BMI Indicator */}
              <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-200 flex items-center justify-center shadow-2xs">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">Calculated Body Mass Index</p>
                    <p className="text-xl font-serif text-stone-950 font-normal">
                      {currentBMI} <span className="text-xs font-sans text-stone-500 font-normal">({bmiCategory})</span>
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-stone-600 font-sans max-w-[210px] leading-snug">
                  Calibrates elemental Magnesium (310–420 mg) and daily target hydration
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Health & Safety Screening */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600 bg-stone-100 px-3 py-0.5 rounded-full border border-stone-200">
                  Health & Safety Check
                </span>
              </div>
              <h2 className="text-3xl font-serif text-stone-950 font-normal tracking-tight">
                Health & Safety Considerations
              </h2>
              <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                We make sure your supplements are 100% safe for you. If any conditions apply, we automatically adjust recommendations and avoid ingredients that wouldn't be safe.
              </p>
            </div>

            <div className="space-y-3.5">
              {/* Pregnancy / Nursing */}
              <div
                onClick={() => setPregnantOrNursing(!pregnantOrNursing)}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  pregnantOrNursing
                    ? 'border-amber-700/70 bg-amber-50/70 ring-1 ring-amber-700/60'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base text-stone-950 font-medium">
                        Currently Pregnant, Trying to Conceive, or Nursing
                      </span>
                      {pregnantOrNursing && (
                        <span className="text-[10px] font-sans uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                          Safe Care Mode
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed font-sans">
                      Automatically excludes ingredients not recommended during pregnancy or nursing, focusing only on gentle, pregnancy-safe nutrition like folate.
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                    pregnantOrNursing ? 'bg-amber-800 border-amber-800 text-amber-100' : 'border-stone-300'
                  }`}>
                    {pregnantOrNursing && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>

              {/* Ferritin Confirmed Iron Deficiency */}
              <div
                onClick={() => setHasIronDeficiency(!hasIronDeficiency)}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  hasIronDeficiency
                    ? 'border-stone-900 bg-stone-900/5 ring-1 ring-stone-900'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base text-stone-950 font-medium">
                        Doctor-Confirmed Low Iron or Anemia
                      </span>
                      {hasIronDeficiency && (
                        <span className="text-[10px] font-sans uppercase font-bold tracking-wider px-2 py-0.5 bg-stone-900 text-stone-100 rounded-full">
                          Iron Enabled
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed font-sans">
                      Iron is only included when you specifically need it. When active, we schedule it away from calcium and tea so your body can absorb it properly.
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                    hasIronDeficiency ? 'bg-stone-900 border-stone-900 text-stone-100' : 'border-stone-300'
                  }`}>
                    {hasIronDeficiency && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>

              {/* Renal Health & Nephrolithiasis (Kidney Stones) */}
              <div
                onClick={() => setHasKidneyIssues(!hasKidneyIssues)}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  hasKidneyIssues
                    ? 'border-amber-700/70 bg-amber-50/70 ring-1 ring-amber-700/60'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base text-stone-950 font-medium">
                        Kidney Concerns or History of Kidney Stones
                      </span>
                      {hasKidneyIssues && (
                        <span className="text-[10px] font-sans uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                          Kidney Safe Mode
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed font-sans">
                      Caps high-dose Vitamin C and avoids excess minerals to protect your kidneys.
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                    hasKidneyIssues ? 'bg-amber-800 border-amber-800 text-amber-100' : 'border-stone-300'
                  }`}>
                    {hasKidneyIssues && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>

              {/* Thyroid & Endocrine */}
              <div
                onClick={() => setHasThyroidCondition(!hasThyroidCondition)}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  hasThyroidCondition
                    ? 'border-amber-700/70 bg-amber-50/70 ring-1 ring-amber-700/60'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base text-stone-950 font-medium">
                        Thyroid Condition or Taking Thyroid Medication
                      </span>
                      {hasThyroidCondition && (
                        <span className="text-[10px] font-sans uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                          Thyroid Safe Mode
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed font-sans">
                      Keeps all minerals like calcium and iron at least 4 hours away from thyroid meds so they don't block your medication.
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                    hasThyroidCondition ? 'bg-amber-800 border-amber-800 text-amber-100' : 'border-stone-300'
                  }`}>
                    {hasThyroidCondition && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>

              {/* Bleeding Disorders & Anticoagulant */}
              <div
                onClick={() => setHasBleedingDisorder(!hasBleedingDisorder)}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  hasBleedingDisorder
                    ? 'border-amber-700/70 bg-amber-50/70 ring-1 ring-amber-700/60'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base text-stone-950 font-medium">
                        Bleeding Condition or Taking Blood Thinners
                      </span>
                      {hasBleedingDisorder && (
                        <span className="text-[10px] font-sans uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                          Blood Thinner Safe Mode
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed font-sans">
                      Limits high-dose fish oil and Vitamin E, and avoids herbs that thin the blood (like Ginkgo) to keep you safe.
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                    hasBleedingDisorder ? 'bg-amber-800 border-amber-800 text-amber-100' : 'border-stone-300'
                  }`}>
                    {hasBleedingDisorder && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>

              {/* Gastrointestinal Sensitivity & GERD */}
              <div
                onClick={() => setHasGastroSensitivity(!hasGastroSensitivity)}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  hasGastroSensitivity
                    ? 'border-stone-900 bg-stone-900/5 ring-1 ring-stone-900'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base text-stone-950 font-medium">
                        Sensitive Stomach, Heartburn, or Acid Reflux
                      </span>
                      {hasGastroSensitivity && (
                        <span className="text-[10px] font-sans uppercase font-bold tracking-wider px-2 py-0.5 bg-stone-900 text-stone-100 rounded-full">
                          Gentle Forms Only
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed font-sans">
                      Chooses gentle, easy-to-digest forms of minerals (like gentle magnesium and zinc) and always pairs them with solid meals.
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                    hasGastroSensitivity ? 'bg-stone-900 border-stone-900 text-stone-100' : 'border-stone-300'
                  }`}>
                    {hasGastroSensitivity && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>

              {/* Liver / Hepatic Protection */}
              <div
                onClick={() => setHasLiverCondition(!hasLiverCondition)}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  hasLiverCondition
                    ? 'border-amber-700/70 bg-amber-50/70 ring-1 ring-amber-700/60'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base text-stone-950 font-medium">
                        Liver Concerns or Elevated Liver Enzymes
                      </span>
                      {hasLiverCondition && (
                        <span className="text-[10px] font-sans uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                          Liver Safe Mode
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed font-sans">
                      Avoids high-dose green tea extracts and mega-dose niacin to protect your liver.
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                    hasLiverCondition ? 'bg-amber-800 border-amber-800 text-amber-100' : 'border-stone-300'
                  }`}>
                    {hasLiverCondition && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>

              {/* Autoimmune Conditions */}
              <div
                onClick={() => setHasAutoimmuneCondition(!hasAutoimmuneCondition)}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  hasAutoimmuneCondition
                    ? 'border-amber-700/70 bg-amber-50/70 ring-1 ring-amber-700/60'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base text-stone-950 font-medium">
                        Autoimmune Condition (e.g., Lupus, Rheumatoid, Hashimoto's)
                      </span>
                      {hasAutoimmuneCondition && (
                        <span className="text-[10px] font-sans uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                          Autoimmune Safe Mode
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed font-sans">
                      Skips strong immune-stimulating herbs (like echinacea or elderberry) to help keep your immune system calm and balanced.
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                    hasAutoimmuneCondition ? 'bg-amber-800 border-amber-800 text-amber-100' : 'border-stone-300'
                  }`}>
                    {hasAutoimmuneCondition && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Goals (Max 3) */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-serif text-stone-950 font-normal tracking-tight">
                  Your Health Goals
                </h2>
                <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                  Choose up to 3 goals you want to focus on most.
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[11px] font-mono tracking-wider border ${
                goals.length === 3 ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}>
                {goals.length}/3 SELECTED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
              {ALL_GOALS.map((g) => {
                const isSelected = goals.includes(g.id);
                const disabled = !isSelected && goals.length >= 3;
                return (
                  <button
                    key={g.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleGoal(g.id)}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-stone-900 bg-stone-900 text-stone-50 shadow-2xs'
                        : disabled
                        ? 'border-stone-200 opacity-40 cursor-not-allowed bg-stone-50/30'
                        : 'border-stone-200 hover:border-stone-400 bg-stone-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-medium ${isSelected ? 'text-amber-100 font-serif text-base' : 'text-stone-900 font-sans'}`}>
                        {g.label}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-amber-300" />}
                    </div>
                    <p className={`text-xs leading-relaxed ${isSelected ? 'text-stone-300 font-sans' : 'text-stone-500 font-sans'}`}>
                      {g.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Regimen Depth & Complexity */}
            <div className="pt-6 border-t border-stone-200/80 space-y-3">
              <div>
                <h3 className="text-xl font-serif text-stone-950 font-normal">
                  How Many Supplements Would You Prefer?
                </h3>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Start simple with just the essentials, or build a more comprehensive routine.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    tier: 'beginner' as RegimenTier,
                    label: 'Simple (2–3 items)',
                    badge: 'Essentials Only',
                    desc: 'The most impactful foundational nutrients (like Vitamin D3, Magnesium, Omega-3). Easy to stick with every single day.',
                    tag: 'Most Popular',
                    accentColor: 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                  },
                  {
                    tier: 'intermediate' as RegimenTier,
                    label: 'Balanced (4–5 items)',
                    badge: 'Targeted Support',
                    desc: 'Essentials plus targeted nutrients tailored directly to your chosen health goals.',
                    tag: 'Goal Focused',
                    accentColor: 'border-blue-200 bg-blue-50/50 text-blue-900'
                  },
                  {
                    tier: 'advanced' as RegimenTier,
                    label: 'Complete (6–8 items)',
                    badge: 'Full Coverage',
                    desc: 'Comprehensive coverage covering sleep, recovery, mood, and daytime energy.',
                    tag: 'Complete',
                    accentColor: 'border-purple-200 bg-purple-50/50 text-purple-900'
                  }
                ].map((t) => {
                  const isSelected = regimenTier === t.tier;
                  return (
                    <button
                      key={t.tier}
                      type="button"
                      onClick={() => setRegimenTier(t.tier)}
                      className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-stone-50 shadow-md ring-1 ring-stone-900'
                          : 'border-stone-200 hover:border-stone-400 bg-stone-50/40 text-stone-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isSelected ? 'bg-stone-800 text-amber-200 border-stone-700' : t.accentColor
                          }`}>
                            {t.tag}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-amber-300" />}
                        </div>
                        <div className={`font-serif text-lg font-medium ${isSelected ? 'text-white' : 'text-stone-950'}`}>
                          {t.label}
                        </div>
                        <div className={`text-xs font-semibold mb-2 ${isSelected ? 'text-amber-200' : 'text-stone-800'}`}>
                          {t.badge}
                        </div>
                        <p className={`text-xs leading-relaxed ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                          {t.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Activity & Diet Type */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-3xl font-serif text-stone-950 font-normal tracking-tight">
                Activity & Diet
              </h2>
              <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                Your daily movement and eating style help us tailor which vitamins to recommend and how to pair them with meals.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-2">
                  Daily Activity Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'sedentary', label: 'Mostly Sitting', desc: 'Desk work, limited structured movement' },
                    { id: 'lightly_active', label: 'Lightly Active', desc: 'Casual walks or light movement 1–2x / week' },
                    { id: 'moderately_active', label: 'Moderately Active', desc: 'Gym or regular exercise 3–4x / week' },
                    { id: 'very_active', label: 'Very Active', desc: 'Challenging workouts 5–6x / week' },
                    { id: 'athlete', label: 'High Performance', desc: 'Intensive training 1–2x daily' }
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setActivityLevel(act.id as ActivityLevel)}
                      className={`text-left p-3.5 rounded-2xl border text-sm transition-all ${
                        activityLevel === act.id
                          ? 'border-stone-900 bg-stone-900 text-stone-50 shadow-2xs'
                          : 'border-stone-200 hover:border-stone-400 bg-stone-50/40 text-stone-700'
                      }`}
                    >
                      <div className={`font-medium ${activityLevel === act.id ? 'text-amber-100 font-serif text-base' : 'text-stone-900 font-sans'}`}>
                        {act.label}
                      </div>
                      <div className={`text-xs mt-0.5 ${activityLevel === act.id ? 'text-stone-300' : 'text-stone-500'}`}>
                        {act.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-2">
                  Diet Style
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'other'] as DietType[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDietType(d)}
                      className={`py-3 px-3 rounded-2xl border text-xs font-medium capitalize transition-all ${
                        dietType === d
                          ? 'border-stone-900 bg-stone-900 text-stone-50 shadow-2xs'
                          : 'border-stone-200 hover:border-stone-400 text-stone-700 bg-stone-50/40'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Medications, Existing Supplements & Allergies */}
        {step === 6 && (
          <div className="space-y-7 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600 bg-stone-100 px-3 py-0.5 rounded-full border border-stone-200">
                  Safety & Conflict Check
                </span>
              </div>
              <h2 className="text-3xl font-serif text-stone-950 font-normal tracking-tight">
                Medications & Current Supplements
              </h2>
              <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                Checks for conflicts with prescriptions (like blood thinners or thyroid medicine) and prevents double-dosing on any vitamin.
              </p>
            </div>

            <div className="space-y-6">
              {/* 1. Prescription Medications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500">
                    Prescription Medications (for automated clash detection)
                  </label>
                  <span className="text-[10px] text-stone-400 font-sans">
                    {existingMedications.length} active
                  </span>
                </div>

                {/* Popular Quick-Select Pills */}
                <div className="space-y-1.5">
                  <p className="text-[11px] text-stone-500 font-sans">Quick-select common prescriptions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Warfarin (Coumadin)',
                      'Levothyroxine (Synthroid)',
                      'Lisinopril (Zestril)',
                      'Metformin (Glucophage)',
                      'Atorvastatin (Lipitor)',
                      'Sertraline (Zoloft)',
                      'Omeprazole (Prilosec)'
                    ].map((med) => {
                      const isSelected = existingMedications.some((m) => m.toLowerCase().includes(med.split(' ')[0].toLowerCase()));
                      return (
                        <button
                          key={med}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              const found = existingMedications.find((m) => m.toLowerCase().includes(med.split(' ')[0].toLowerCase()));
                              if (found) removeMedication(found);
                            } else {
                              addMedication(med);
                            }
                          }}
                          className={`text-xs px-2.5 py-1 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-amber-900 text-amber-100 border-amber-950 font-medium shadow-2xs'
                              : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-100'
                          }`}
                        >
                          {isSelected && <span className="mr-1">✓</span>}
                          {med}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search & Select Input with Dropdown */}
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={medSearchQuery}
                        onChange={(e) => {
                          setMedSearchQuery(e.target.value);
                          setIsMedDropdownOpen(true);
                        }}
                        onFocus={() => setIsMedDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsMedDropdownOpen(false), 250)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addMedication(medSearchQuery);
                          }
                        }}
                        placeholder="Search prescription drug catalog or type custom name..."
                        className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => addMedication(medSearchQuery)}
                      disabled={!medSearchQuery.trim()}
                      className="px-4 py-2.5 text-xs font-semibold bg-stone-900 text-stone-50 rounded-xl hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Add
                    </button>
                  </div>

                  {/* Autocomplete Dropdown */}
                  {isMedDropdownOpen && medSearchQuery.trim().length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto divide-y divide-stone-100">
                      {/* Direct Add Custom Option */}
                      <div
                        onMouseDown={() => addMedication(medSearchQuery)}
                        className="p-3 text-xs text-stone-900 hover:bg-stone-50 cursor-pointer flex items-center justify-between font-medium bg-amber-50/50 border-b border-amber-100"
                      >
                        <span className="flex items-center gap-1.5 text-amber-950">
                          <Plus className="w-3.5 h-3.5 text-amber-800" />
                          Add custom medication: &ldquo;{medSearchQuery.trim()}&rdquo;
                        </span>
                        <span className="text-[10px] text-stone-400 font-sans">Press Enter</span>
                      </div>

                      {/* Filtered Catalog Options */}
                      {COMMON_MEDICATIONS.filter((m) =>
                        m.name.toLowerCase().includes(medSearchQuery.toLowerCase()) ||
                        m.brandNames.toLowerCase().includes(medSearchQuery.toLowerCase()) ||
                        m.drugClass.toLowerCase().includes(medSearchQuery.toLowerCase())
                      ).map((m) => (
                        <div
                          key={m.id}
                          onMouseDown={() => addMedication(`${m.name} (${m.brandNames})`)}
                          className="p-3 text-xs hover:bg-stone-50 cursor-pointer transition-colors space-y-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-stone-950">
                              {m.name} <span className="font-normal text-stone-500">({m.brandNames})</span>
                            </span>
                            <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full border border-stone-200 font-mono">
                              {m.drugClass}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1">{m.clashSummary}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Medications Display */}
                {existingMedications.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {existingMedications.map((med) => (
                      <span
                        key={med}
                        className="bg-amber-50 text-amber-950 border border-amber-200/90 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-2xs font-medium"
                      >
                        <Pill className="w-3.5 h-3.5 text-amber-800" />
                        {med}
                        <X
                          className="w-3.5 h-3.5 cursor-pointer text-amber-700 hover:text-amber-950 hover:scale-110 transition-transform"
                          onClick={() => removeMedication(med)}
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Currently Active Supplements */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500">
                    Currently Active Supplements (to prevent duplicate stacking)
                  </label>
                  <span className="text-[10px] text-stone-400 font-sans">
                    {existingSupplements.length} active
                  </span>
                </div>

                {/* Popular Quick-Select Pills */}
                <div className="space-y-1.5">
                  <p className="text-[11px] text-stone-500 font-sans">Quick-select popular foundations:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Multivitamin',
                      'Vitamin D3',
                      'Fish Oil / Omega-3',
                      'Magnesium Glycinate',
                      'Zinc Picolinate',
                      'Creatine Monohydrate',
                      'Whey Protein',
                      'B-Complex'
                    ].map((sup) => {
                      const isSelected = existingSupplements.some((s) => s.toLowerCase().includes(sup.split(' ')[0].toLowerCase()));
                      return (
                        <button
                          key={sup}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              const found = existingSupplements.find((s) => s.toLowerCase().includes(sup.split(' ')[0].toLowerCase()));
                              if (found) removeSupplement(found);
                            } else {
                              addSupplement(sup);
                            }
                          }}
                          className={`text-xs px-2.5 py-1 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-stone-900 text-stone-50 border-stone-950 font-medium shadow-2xs'
                              : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-100'
                          }`}
                        >
                          {isSelected && <span className="mr-1">✓</span>}
                          {sup}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search & Select Input with Dropdown */}
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={suppSearchQuery}
                        onChange={(e) => {
                          setSuppSearchQuery(e.target.value);
                          setIsSuppDropdownOpen(true);
                        }}
                        onFocus={() => setIsSuppDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsSuppDropdownOpen(false), 250)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSupplement(suppSearchQuery);
                          }
                        }}
                        placeholder="Search supplement catalog or type custom supplement..."
                        className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => addSupplement(suppSearchQuery)}
                      disabled={!suppSearchQuery.trim()}
                      className="px-4 py-2.5 text-xs font-semibold bg-stone-900 text-stone-50 rounded-xl hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Add
                    </button>
                  </div>

                  {/* Autocomplete Dropdown */}
                  {isSuppDropdownOpen && suppSearchQuery.trim().length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto divide-y divide-stone-100">
                      {/* Direct Add Custom Option */}
                      <div
                        onMouseDown={() => addSupplement(suppSearchQuery)}
                        className="p-3 text-xs text-stone-900 hover:bg-stone-50 cursor-pointer flex items-center justify-between font-medium bg-stone-50/80 border-b border-stone-200"
                      >
                        <span className="flex items-center gap-1.5 text-stone-950">
                          <Plus className="w-3.5 h-3.5 text-stone-800" />
                          Add custom supplement: &ldquo;{suppSearchQuery.trim()}&rdquo;
                        </span>
                        <span className="text-[10px] text-stone-400 font-sans">Press Enter</span>
                      </div>

                      {/* Filtered Catalog Options */}
                      {COMMON_SUPPLEMENTS.filter((s) =>
                        s.name.toLowerCase().includes(suppSearchQuery.toLowerCase()) ||
                        s.category.toLowerCase().includes(suppSearchQuery.toLowerCase())
                      ).map((s) => (
                        <div
                          key={s.id}
                          onMouseDown={() => addSupplement(s.name)}
                          className="p-3 text-xs hover:bg-stone-50 cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <span className="font-semibold text-stone-950">{s.name}</span>
                          <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">
                            {s.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Supplements Display */}
                {existingSupplements.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {existingSupplements.map((sup) => (
                      <span
                        key={sup}
                        className="bg-stone-100 text-stone-900 border border-stone-200 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-2xs font-medium"
                      >
                        {sup}
                        <X
                          className="w-3.5 h-3.5 cursor-pointer text-stone-500 hover:text-stone-900 hover:scale-110 transition-transform"
                          onClick={() => removeSupplement(sup)}
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Allergies & Sensitivities */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500">
                      Allergies & Sensitivities (Select All That Apply)
                    </label>
                    <span className="text-[10px] text-stone-400 font-sans">
                      {allergies.length} selected
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 font-sans leading-relaxed">
                    NutriSync automatically excludes marine oils, shellfish extracts, dairy/whey, soy lecithin, and gelatin capsules, substituting hypoallergenic vegan alternatives.
                  </p>
                </div>

                {/* Common Allergen Selection Options */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMON_ALLERGENS.map((item) => {
                    const isSelected = allergies.some((a) => a.toLowerCase() === item.name.toLowerCase());
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleAllergyOption(item.name)}
                        className={`text-left p-2.5 rounded-xl border text-xs transition-all flex items-start justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-amber-900 text-amber-50 border-amber-950 font-medium shadow-2xs'
                            : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-100'
                        }`}
                      >
                        <span className="leading-tight">{item.name}</span>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-amber-800 border-amber-800 text-amber-100' : 'border-stone-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Allergen Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addAllergy(newAllergy);
                      }
                    }}
                    placeholder="Enter additional allergy or food intolerance (e.g. Corn, Histamine, Sulfites)..."
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => addAllergy(newAllergy)}
                    disabled={!newAllergy.trim()}
                    className="px-4 py-2.5 text-xs font-semibold bg-stone-900 text-stone-50 rounded-xl hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                  >
                    Add Filter
                  </button>
                </div>

                {/* Selected Custom & Filtered Allergies Tags */}
                {allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {allergies.map((a) => (
                      <span
                        key={a}
                        className="bg-amber-50 text-amber-950 border border-amber-200/90 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-2xs font-medium"
                      >
                        {a}
                        <X
                          className="w-3.5 h-3.5 cursor-pointer text-amber-700 hover:text-amber-950 hover:scale-110 transition-transform"
                          onClick={() => removeAllergy(a)}
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Daily Routine & Timing Anchor Points */}
        {step === 7 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-3xl font-serif text-stone-950 font-normal tracking-tight">
                Your Daily Routine
              </h2>
              <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                NutriSync organizes your supplements around your wake, meal, and sleep times so they fit naturally into your day and don't clash.
              </p>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-600" /> Wake Time
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 focus:bg-white text-stone-900 text-sm font-mono font-medium focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5 flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-stone-600" /> Sleep Time
                  </label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 focus:bg-white text-stone-900 text-sm font-mono font-medium focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              {/* Meal times */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5 flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-stone-500" /> Breakfast
                  </label>
                  <input
                    type="time"
                    value={breakfastTime}
                    onChange={(e) => setBreakfastTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5 flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-stone-500" /> Lunch
                  </label>
                  <input
                    type="time"
                    value={lunchTime}
                    onChange={(e) => setLunchTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5 flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-stone-500" /> Dinner
                  </label>
                  <input
                    type="time"
                    value={dinnerTime}
                    onChange={(e) => setDinnerTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              {/* Workout Timing */}
              <div className="p-5 rounded-2xl border border-stone-200/80 bg-stone-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Dumbbell className="w-4 h-4 text-stone-700" />
                    <span className="text-sm font-medium text-stone-900">Include Workout or Exercise Session?</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasWorkout}
                    onChange={(e) => setHasWorkout(e.target.checked)}
                    className="w-4 h-4 text-stone-900 rounded border-stone-300 focus:ring-stone-900 accent-stone-900 cursor-pointer"
                  />
                </div>
                {hasWorkout && (
                  <div className="pt-2 border-t border-stone-200/80">
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">
                      Workout Start Time (helps schedule post-exercise recovery)
                    </label>
                    <input
                      type="time"
                      value={workoutTime}
                      onChange={(e) => setWorkoutTime(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-mono font-medium"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="bg-stone-50/90 px-4 sm:px-8 py-4 sm:py-5 border-t border-stone-200/80 flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-950 px-4 py-2.5 rounded-xl hover:bg-stone-200/50 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous
          </button>
        ) : (
          <div />
        )}

        {step < totalSteps ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-2 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-stone-50 px-6 py-3 rounded-2xl shadow-xs transition-all uppercase tracking-wider cursor-pointer"
          >
            Next Step
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            id="btn-create-my-schedule"
            data-testid="btn-synthesize-protocol"
            type="button"
            onClick={handleFinish}
            className="flex items-center gap-2.5 text-xs font-semibold bg-gradient-to-r from-stone-950 via-stone-850 to-stone-950 hover:from-black hover:via-stone-900 hover:to-black text-stone-50 px-7 py-3.5 rounded-2xl shadow-md hover:shadow-xl transition-all uppercase tracking-wider cursor-pointer active:scale-95 border border-stone-700/60 group"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
            <span>Create My Schedule</span>
          </button>
        )}
      </div>
    </div>
  );
};
