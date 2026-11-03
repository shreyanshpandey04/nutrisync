export type BiologicalSex = 'male' | 'female' | 'prefer_not_to_say';

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'athlete';

export type DietType =
  | 'omnivore'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'keto'
  | 'other';

export type HealthGoal =
  | 'Weight Management'
  | 'Muscle Gain & Performance'
  | 'Clear/Healthy Skin'
  | 'More Energy'
  | 'Better Sleep'
  | 'Immune Support'
  | 'Stress & Mood'
  | 'Digestive Health'
  | 'Hair & Nail Health'
  | 'Cognitive Focus'
  | 'General Wellness';

export type NutrientType =
  | 'Fat-soluble vit'
  | 'Water-soluble vit'
  | 'Mineral'
  | 'Trace mineral'
  | 'Fatty acid'
  | 'Live culture'
  | 'Performance'
  | 'Adaptogen'
  | 'Hormone'
  | 'Protein'
  | 'Macronutrient'
  | 'Amino acid'
  | 'Blend';

export type CyclingType = 'Continuous' | 'Cycled' | 'Short-term' | 'Deficiency-only';

export type RegimenTier = 'beginner' | 'intermediate' | 'advanced';

export interface Nutrient {
  id: string;
  name: string;
  type: NutrientType;
  bestTiming: string; // e.g. "Morning, with breakfast"
  withFood: boolean;
  withFoodNotes?: string;
  synergizesWith: string[];
  avoidPairingWith: string[];
  absorptionInhibitors: string[];
  typicalAdultRange: string;
  cyclingNotes: string;
  cyclingType: CyclingType;
  isHighRiskPregnancy?: boolean;
  requiresDeficiencyFlag?: boolean;
  specialMedicationFlags?: string[]; // e.g. "blood thinners", "BP medications", "thyroid meds"
  contraindications?: string[];
  notes?: string;
  // Pareto 80/20 & Tier prioritization
  paretoImpact?: 'core_80_20' | 'targeted' | 'specialized';
  paretoScore?: number; // 1-100 baseline biological yield
  paretoReason?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  age: number;
  sex: BiologicalSex;
  heightCm: number;
  weightKg: number;
  useImperial: boolean;
  pregnantOrNursing: boolean;
  hasIronDeficiency: boolean;
  // Regimen Depth & Pareto Experience Level
  regimenTier?: RegimenTier; // 'beginner' (2-3 items) | 'intermediate' (4-5 items) | 'advanced' (6-8 items)
  // Clinical Guardrail Flags
  hasKidneyIssues?: boolean; // Nephrolithiasis or renal sensitivity (bounds Vit C / oxalate risk)
  hasThyroidCondition?: boolean; // Hypo/hyperthyroidism or Hashimoto's (iodine caution, 4hr chelation separation)
  hasBleedingDisorder?: boolean; // Anticoagulation or bleeding tendencies (guards Omega-3, Vit E, Ginkgo)
  hasGastroSensitivity?: boolean; // Gastric ulcer / GERD / nausea sensitivity (mandates bisglycinate chelates + food)
  hasLiverCondition?: boolean; // Hepatic sensitivity (guards concentrated EGCG, high-dose niacin)
  hasAutoimmuneCondition?: boolean; // Autoimmune disorder (guards immune-stimulating botanicals)
  activityLevel: ActivityLevel;
  goals: HealthGoal[];
  dietType: DietType;
  allergies: string[];
  existingSupplements: string[];
  existingMedications: string[];
  // Daily Routine
  wakeTime: string; // "07:00"
  sleepTime: string; // "23:00"
  mealCount: number; // e.g. 3
  breakfastTime: string; // "08:00"
  lunchTime: string; // "13:00"
  dinnerTime: string; // "19:00"
  hasWorkout: boolean;
  workoutTime?: string; // "17:00"
  fastingWindow?: string; // e.g. "16:8 (12:00 - 20:00)" or none
}

export type TimeSlotCategory = 'Morning' | 'Midday' | 'Evening' | 'Bedtime' | 'Pre-Workout' | 'Post-Workout';

export interface DosageScaling {
  isScaled: boolean;
  baseWeightKg: number;
  computedBmi: number;
  bmiCategory: string;
  scalingRule: string; // e.g. "Body Weight Scaled: 5.0 mg/kg elemental magnesium (bounded 300–420 mg)"
  clinicalRationale: string; // Clinical justification for the weight/BMI adjustment
  metricSummary: string; // e.g. "Personalized for 78 kg & BMI 24.1 (Normal weight)"
  multiplierLabel?: string; // e.g. "1.5x Adipose Volume Adjustment"
}

export interface ScheduleItem {
  id: string;
  nutrientId: string;
  nutrientName: string;
  nutrientType: NutrientType;
  slot: TimeSlotCategory;
  recommendedTime: string; // e.g. "08:00 AM"
  dosage: string;
  dosageScaling?: DosageScaling;
  withFood: boolean;
  withFoodInstructions: string;
  synergyPartners: string[];
  conflictWarnings: string[];
  cyclingNote: string;
  cyclingType: CyclingType;
  priorityScore: number;
  reasons: string[]; // deterministic reasons (e.g. "Selected for Muscle Gain & Performance + Better Sleep", "Scaled for body weight")
  aiExplanation?: string; // friendly narrative explanation from Gemini
  isDuplicateWithExisting?: boolean;
  duplicateWarning?: string;
  hardFlags?: string[];
  // Pareto Principle and Tier Metadata
  tierLevel?: RegimenTier;
  paretoBadge?: string; // e.g. "80/20 Core Impact", "Targeted Booster", "Advanced Compound"
  paretoReason?: string;
  paretoImpact?: 'core_80_20' | 'targeted' | 'specialized';
  paretoScore?: number;
}

export interface ConflictWarning {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  supplementsInvolved: string[];
  actionRecommendation: string;
}

export interface AdherenceLog {
  date: string; // YYYY-MM-DD
  scheduleItemId: string;
  nutrientName: string;
  taken: boolean;
  timestamp: string;
}

export interface ScheduleResponse {
  schedule: ScheduleItem[];
  warnings: ConflictWarning[];
  computedBmi: number;
  bmiCategory: string;
  generatedAt: string;
}
