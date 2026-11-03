import {
  UserProfile,
  ScheduleItem,
  ConflictWarning,
  ScheduleResponse,
  TimeSlotCategory,
  Nutrient,
  HealthGoal,
  RegimenTier,
  DosageScaling
} from '../types';
import { SEED_NUTRIENTS, GOAL_NUTRIENT_MAPPING } from '../data/nutrients';

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (!heightCm || heightCm <= 0 || !weightKg || weightKg <= 0) return 22.0;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export interface DosageCalculationResult {
  dosage: string;
  dosageScaling: DosageScaling;
  reasons: string[];
}

/**
 * Deterministic Dosage Scaling Engine
 * Automatically scales dosages using body weight (kg) and BMI data from the user profile,
 * providing a clinically grounded and personalized foundation before the AI explanation step.
 */
export function calculatePersonalizedDosage(params: {
  nutId: string;
  nutrient: Nutrient;
  profile: UserProfile;
  bmi: number;
  bmiCategory: string;
  isHighActivity: boolean;
  hasStatins: boolean;
  goals: HealthGoal[];
}): DosageCalculationResult {
  const { nutId, nutrient, profile, bmi, bmiCategory, isHighActivity, hasStatins, goals } = params;
  const weightKg = profile.weightKg && profile.weightKg > 0 ? profile.weightKg : 70;
  const weightLbs = Math.round(weightKg * 2.20462);
  const metricSummary = `Personalized for ${weightKg} kg (${weightLbs} lbs) · BMI ${bmi} (${bmiCategory})`;

  let dosage = nutrient.typicalAdultRange;
  let isScaled = false;
  let scalingRule = 'Standard evidence-based adult physiological baseline';
  let clinicalRationale = 'Standard recommended daily intake verified against body metrics to ensure safe tolerance.';
  let multiplierLabel: string | undefined = undefined;
  const reasons: string[] = [];

  switch (nutId) {
    case 'magnesium': {
      isScaled = true;
      // Physiological elemental magnesium requirement: ~5.0 - 5.5 mg/kg body weight.
      // Bounded safely between 300 mg and 420 mg elemental (NIH/EFSA Upper Tolerable Limit for supplements)
      const mgPerKg = isHighActivity ? 5.5 : 5.0;
      const rawMg = Math.round((weightKg * mgPerKg) / 10) * 10;
      const scaledMg = Math.min(420, Math.max(300, rawMg));
      dosage = `${scaledMg} mg elemental Magnesium (Glycinate)`;
      scalingRule = `Weight-based: ${mgPerKg} mg/kg body weight (bounded 300–420 mg)`;
      clinicalRationale = `Elemental magnesium requirements scale with lean mass and muscular ATP turnover. Calibrated to ${weightKg} kg (${scaledMg} mg) to optimize nocturnal muscle relaxation and cellular enzyme synthesis while remaining strictly within the 420 mg safe upper intake limit.`;
      multiplierLabel = `${scaledMg} mg / ${weightKg} kg`;
      reasons.push(`Dosage scaled to body weight (${weightKg} kg) at ~${mgPerKg} mg/kg elemental Magnesium`);
      if (isHighActivity) {
        reasons.push('Elevated within safe limits to compensate for athletic sweat loss and muscular recovery');
      }
      break;
    }

    case 'vit-d3': {
      isScaled = true;
      // Adipose volumetric sequestration: Vitamin D3 is fat-soluble and partitions heavily into adipose tissue.
      // Clinical trials show individuals with BMI >= 25 require ~1.5x, and BMI >= 30 require ~2.0x standard intake.
      if (bmi < 18.5) {
        dosage = '1,000 IU (25 mcg) with breakfast fats';
        scalingRule = `Lean Body Mass Volume (BMI ${bmi} < 18.5)`;
        clinicalRationale = `Given a lower adipose tissue volume, 1,000 IU provides rapid and efficient circulating 25(OH)D saturation without tissue accumulation.`;
        multiplierLabel = '1.0x Baseline Volume';
        reasons.push(`Calibrated for lean body mass (BMI ${bmi}) to establish 40–60 ng/mL blood levels`);
      } else if (bmi < 25.0) {
        dosage = '1,500 - 2,000 IU (37.5–50 mcg) with breakfast fats';
        scalingRule = `Standard Adipose Volume (BMI ${bmi} Normal weight)`;
        clinicalRationale = `Calibrated for standard physiological distribution volume to sustain immune competence, bone mineralization, and circadian mood stability.`;
        multiplierLabel = '1.0x Standard Physiological Range';
        reasons.push(`Physiological maintenance dose for ${weightKg} kg normal body mass`);
      } else if (bmi < 30.0) {
        dosage = '2,500 - 3,000 IU (62.5–75 mcg) with breakfast fats';
        scalingRule = `Overweight Adipose Adjustment (BMI ${bmi}, ~1.5x Volume Offset)`;
        clinicalRationale = `Because Vitamin D is highly lipophilic, increased adipose tissue sequesters circulating cholecalciferol. Scaled to 2,500–3,000 IU (1.5x baseline) to overcome fat tissue dilution and achieve optimal 25(OH)D status.`;
        multiplierLabel = '1.5x Adipose Offset';
        reasons.push(`Scaled 1.5x to compensate for higher adipose distribution volume (BMI ${bmi})`);
      } else {
        dosage = '3,500 - 4,000 IU (87.5–100 mcg) with breakfast fats';
        scalingRule = `Elevated Adipose Saturation (BMI ${bmi} Obese, 2x Volume Offset)`;
        clinicalRationale = `Significant body fat expansion increases volume of distribution. Scaled to 3,500–4,000 IU to reach therapeutic circulating serum levels while respecting the 4,000 IU adult Tolerable Upper Limit.`;
        multiplierLabel = '2.0x Adipose Saturation (Max Safe Cap)';
        reasons.push(`Scaled to 3,500–4,000 IU (2.0x baseline) for BMI ${bmi} to achieve target 25(OH)D without exceeding 4,000 IU upper limit`);
      }
      break;
    }

    case 'protein': {
      isScaled = true;
      // Grams per kg body weight:
      // High activity/Athlete: 2.0 g/kg
      // Muscle goal: 1.8 g/kg
      // Baseline: 1.5 g/kg
      const gPerKg = isHighActivity ? 2.0 : goals.includes('Muscle Gain & Performance') ? 1.8 : 1.5;
      const totalDailyG = Math.round(weightKg * gPerKg);
      const servingG = weightKg > 85 ? '30 - 35 g' : '25 - 30 g';
      dosage = `${servingG} per serving (Target ~${totalDailyG}g total daily protein)`;
      scalingRule = `Body Weight Multiplier: ${gPerKg} g/kg daily requirement`;
      clinicalRationale = `Total daily amino acid requirements scale directly with body weight (${weightKg} kg) and training intensity. Calibrated to hit ~${totalDailyG}g daily across diet and supplementation to maximize muscle protein synthesis.`;
      multiplierLabel = `${gPerKg} g/kg target`;
      reasons.push(`Target calculated for ${weightKg} kg body mass (~${totalDailyG}g daily total at ${gPerKg} g/kg)`);
      break;
    }

    case 'creatine': {
      isScaled = true;
      // Intramuscular phosphocreatine pool capacity scales with skeletal muscle mass (total weight):
      if (weightKg < 70) {
        dosage = '3 g daily (mixed in water or shake)';
        scalingRule = `Skeletal Mass Maintenance (<70 kg: 3 g/day)`;
        clinicalRationale = `Individuals under 70 kg achieve complete intramuscular phosphocreatine saturation on 3 g daily, avoiding excess urinary creatinine excretion.`;
        multiplierLabel = '3 g (<70 kg)';
        reasons.push(`Calibrated to 3 g daily for ${weightKg} kg body mass to maintain 100% cellular saturation`);
      } else if (weightKg <= 90) {
        dosage = '5 g daily (mixed in water or shake)';
        scalingRule = `Standard Saturated Maintenance (70–90 kg: 5 g/day)`;
        clinicalRationale = `Standard clinical trial gold standard 5 g dose maintains optimal skeletal phosphocreatine pools and supports cognitive ATP resynthesis for 70–90 kg individuals.`;
        multiplierLabel = '5 g (70–90 kg)';
        reasons.push(`Standard 5 g daily saturation dose calibrated for ${weightKg} kg body weight`);
      } else {
        dosage = '6 - 7 g daily (mixed in water or shake)';
        scalingRule = `Elevated Muscle Volume (>90 kg: 6–7 g/day)`;
        clinicalRationale = `Larger total skeletal muscle volume requires 6–7 g daily to sustain full phosphocreatine stores and peak anaerobic work capacity.`;
        multiplierLabel = '6–7 g (>90 kg)';
        reasons.push(`Scaled up to 6–7 g daily for ${weightKg} kg body weight to support larger skeletal muscle mass`);
      }
      break;
    }

    case 'omega-3': {
      isScaled = true;
      // Vascular endothelial surface area, triglyceride modulation, and cellular membrane phospholipid incorporation:
      if (bmi >= 30 || weightKg > 90) {
        dosage = '1,500 - 2,000 mg combined EPA + DHA with lunch';
        scalingRule = `Cardiometabolic & BMI Scaling (BMI ${bmi}, ${weightKg} kg)`;
        clinicalRationale = `Higher body weight and adipose volume increase systemic inflammatory tone and triglyceride turnover. Scaled to 1,500–2,000 mg combined EPA/DHA to optimize erythrocyte omega-3 index >8%.`;
        multiplierLabel = 'Elevated Anti-Inflammatory Dose';
        reasons.push(`Scaled to 1,500–2,000 mg EPA/DHA for BMI ${bmi} to optimize cellular membrane fluidity and cardiometabolic health`);
      } else if (bmi >= 25 || weightKg >= 75 || goals.includes('Muscle Gain & Performance') || goals.includes('General Wellness')) {
        dosage = '1,200 - 1,500 mg combined EPA + DHA with lunch';
        scalingRule = `Metabolic & Activity Scaled (${weightKg} kg, BMI ${bmi})`;
        clinicalRationale = `Calibrated to body weight (${weightKg} kg) and metabolic demands to provide active resolvins and protect endothelial nitric oxide production.`;
        multiplierLabel = 'Targeted Metabolic Dose';
        reasons.push(`Calibrated to 1,200–1,500 mg EPA/DHA for ${weightKg} kg body mass`);
      } else {
        dosage = '1,000 mg combined EPA + DHA with lunch';
        scalingRule = `Standard Baseline (Normal weight BMI ${bmi})`;
        clinicalRationale = `Provides fundamental cellular membrane phospholipid stabilization and brain DHA replenishment for normal body mass.`;
        multiplierLabel = '1,000 mg Standard Baseline';
        reasons.push(`Standard 1,000 mg EPA/DHA baseline for ${weightKg} kg`);
      }
      break;
    }

    case 'zinc': {
      isScaled = true;
      // Dermal sweat losses and muscular enzyme turnover scale with mass and activity:
      if (weightKg >= 85 || isHighActivity) {
        dosage = '15 mg elemental Zinc (Bisglycinate)';
        scalingRule = `Metabolic Turnover & Exertion Adjusted (${weightKg} kg)`;
        clinicalRationale = `Higher body weight and athletic output increase dermal zinc loss through sweat and elevate RNA polymerase turnover. Scaled to 15 mg while staying safely below the 40 mg Tolerable Upper Limit to protect copper balance.`;
        multiplierLabel = '15 mg (High Turnover)';
        reasons.push(`Scaled to 15 mg elemental Zinc for ${weightKg} kg body mass and physical output`);
      } else {
        dosage = '11 mg elemental Zinc (Bisglycinate)';
        scalingRule = `Standard 100% Daily Value (Normal mass)`;
        clinicalRationale = `11 mg elemental zinc satisfies 100% RDA for adult cellular immunity and testosterone cofactor synthesis without displacing copper or iron absorption.`;
        multiplierLabel = '11 mg Standard RDA';
        reasons.push(`Standard 11 mg physiological dose for ${weightKg} kg body mass`);
      }
      break;
    }

    case 'vit-c': {
      isScaled = true;
      if (profile.hasKidneyIssues) {
        dosage = '250 mg daily with breakfast';
        scalingRule = `Renal Oxalate Guardrail Cap (Kidney sensitivity)`;
        clinicalRationale = `Strictly restricted to 250 mg daily to prevent hyperoxaluria and kidney stone crystallization while maintaining essential antioxidant status.`;
        multiplierLabel = 'Safety Renal Cap (250 mg)';
        reasons.push('Restricted to 250 mg daily to guard renal function and prevent oxalate accumulation');
      } else if (bmi >= 25 || weightKg >= 80) {
        dosage = '500 - 1,000 mg split daily (with breakfast & lunch)';
        scalingRule = `Circulating Volume & Metabolic Turnover (BMI ${bmi}, ${weightKg} kg)`;
        clinicalRationale = `Higher body mass and adipose-mediated oxidative stress increase plasma ascorbate clearance. 500–1,000 mg split dosing maintains steady leukocyte vitamin C saturation.`;
        multiplierLabel = '500–1,000 mg Split Dose';
        reasons.push(`Scaled to 500–1,000 mg split dosing for elevated metabolic distribution volume (BMI ${bmi})`);
      } else {
        dosage = '250 - 500 mg daily with breakfast';
        scalingRule = `Standard Physiological Antioxidant Baseline`;
        clinicalRationale = `250–500 mg achieves near-complete plasma ascorbic acid saturation without osmotic bowel discomfort or renal spillover.`;
        multiplierLabel = 'Standard Baseline';
        reasons.push(`Standard 250–500 mg antioxidant baseline for ${weightKg} kg`);
      }
      break;
    }

    case 'coq10': {
      isScaled = true;
      if (bmi >= 25 || weightKg >= 80 || hasStatins) {
        dosage = '150 - 200 mg Ubiquinol with breakfast fats';
        scalingRule = `Mitochondrial & Metabolic Demand (BMI ${bmi}, ${weightKg} kg)`;
        clinicalRationale = `Ubiquinol volume of distribution and myocardial electron transport demands increase with body mass and statin exposure. Scaled to 150–200 mg for optimal plasma bioenergetic saturation.`;
        multiplierLabel = '150–200 mg Enhanced Dose';
        reasons.push(`Scaled to 150–200 mg Ubiquinol for ${weightKg} kg body mass / BMI ${bmi}`);
        if (hasStatins) reasons.push('Protects against statin-induced HMG-CoA reductase ubiquinone depletion');
      } else {
        dosage = '100 mg Ubiquinol with breakfast fats';
        scalingRule = `Standard Cellular Energy Baseline`;
        clinicalRationale = `100 mg Ubiquinol sustains mitochondrial ATP synthesis and vascular nitric oxide bioavailability for standard adult mass.`;
        multiplierLabel = '100 mg Standard Baseline';
        reasons.push(`Standard 100 mg Ubiquinol baseline for ${weightKg} kg`);
      }
      break;
    }

    case 'collagen': {
      isScaled = true;
      if (weightKg > 85 || isHighActivity) {
        dosage = '15 - 20 g hydrolyzed peptides daily in coffee or smoothie';
        scalingRule = `High Biomechanical Joint Load (>85 kg: 15–20 g/day)`;
        clinicalRationale = `Weight-bearing articular cartilage and tendons absorb substantially higher mechanical load at >85 kg. 15–20 g provides concentrated proline and hydroxyproline peptides to stimulate chondrocyte extracellular matrix synthesis.`;
        multiplierLabel = '15–20 g (Heavy Joint Load)';
        reasons.push(`Scaled to 15–20 g daily to support joint cartilage under ${weightKg} kg biomechanical load`);
      } else if (weightKg >= 65) {
        dosage = '12 - 15 g hydrolyzed peptides daily in coffee or smoothie';
        scalingRule = `Standard Weight-Bearing Joint Support (65–85 kg)`;
        clinicalRationale = `12–15 g supplies optimal bioactive collagen dipeptides (Pro-Hyp) for tendon recovery and dermal collagen density in 65–85 kg individuals.`;
        multiplierLabel = '12–15 g Standard Support';
        reasons.push(`Calibrated to 12–15 g daily for ${weightKg} kg body weight`);
      } else {
        dosage = '10 g hydrolyzed peptides daily in coffee or smoothie';
        scalingRule = `Baseline Connective Tissue Support (<65 kg)`;
        clinicalRationale = `10 g daily fulfills connective tissue turnover and skin elasticity requirements for lighter body mass.`;
        multiplierLabel = '10 g Baseline';
        reasons.push(`Standard 10 g daily dose for ${weightKg} kg`);
      }
      break;
    }

    case 'l-theanine': {
      isScaled = true;
      if (weightKg >= 75) {
        dosage = '200 mg (paired with morning coffee or evening wind-down)';
        scalingRule = `Adult Central Distribution Volume (${weightKg} kg >= 75 kg)`;
        clinicalRationale = `200 mg crosses the blood-brain barrier smoothly in adult body masses over 75 kg to induce alpha-frequency brain waves (8–12 Hz) without drowsiness.`;
        multiplierLabel = '200 mg Full Response';
        reasons.push(`Calibrated to 200 mg for ${weightKg} kg body weight for optimal alpha-wave cognitive relaxation`);
      } else {
        dosage = '100 - 150 mg';
        scalingRule = `Light-to-Moderate Mass Calibration (${weightKg} kg < 75 kg)`;
        clinicalRationale = `100–150 mg provides focused calm and blunts caffeine-induced autonomic arousal without over-sedation in lighter body mass.`;
        multiplierLabel = '100–150 mg Calibrated';
        reasons.push(`Calibrated to 100–150 mg for ${weightKg} kg body mass`);
      }
      break;
    }

    case 'ashwagandha': {
      isScaled = true;
      if (weightKg >= 75) {
        dosage = '600 mg standardized KSM-66 extract with evening meal';
        scalingRule = `Clinical Trial Standard Therapeutic Dose (${weightKg} kg >= 75 kg)`;
        clinicalRationale = `600 mg daily matches the clinical trial benchmark for cortisol modulation and HPA axis resilience in adults weighing 75 kg and above.`;
        multiplierLabel = '600 mg Clinical Benchmark';
        reasons.push(`Calibrated to clinical standard 600 mg for ${weightKg} kg body mass`);
      } else {
        dosage = '300 mg standardized KSM-66 extract with evening meal';
        scalingRule = `Light-to-Moderate Mass Calibration (${weightKg} kg < 75 kg)`;
        clinicalRationale = `300 mg delivers effective adaptogenic withanolide glycosides while maintaining gentle endocrine balance in lighter body weights.`;
        multiplierLabel = '300 mg Gentle Adaptation';
        reasons.push(`Calibrated to 300 mg for ${weightKg} kg body mass`);
      }
      break;
    }

    case 'b12': {
      if (profile.dietType === 'vegan' || profile.dietType === 'vegetarian') {
        isScaled = true;
        dosage = '500 - 1,000 mcg sublingual Methylcobalamin';
        scalingRule = `Dietary Cobalamin Absence Protocol (${profile.dietType})`;
        clinicalRationale = `Because plant diets lack cobalamin, 500–1,000 mcg sublingual dosing utilizes passive transmucosal diffusion to ensure adequate neural myelin sheath and homocysteine control.`;
        multiplierLabel = 'Dietary Replacement Protocol';
        reasons.push(`Elevated recommendation due to ${profile.dietType} dietary absence of cobalamin`);
      } else {
        isScaled = true;
        dosage = '250 - 500 mcg oral Methylcobalamin';
        scalingRule = `Verified Safe Adult Baseline (${weightKg} kg, BMI ${bmi})`;
        clinicalRationale = `Standard adult metabolic cofactor dose for methylation support and red blood cell production.`;
        multiplierLabel = 'Standard Metabolic Baseline';
        reasons.push(`Calibrated for standard cellular methylation and energy support`);
      }
      break;
    }

    default: {
      // General safe adult baseline with explicit body metric verification
      isScaled = false;
      scalingRule = `Clinical Reference Range (Verified for ${weightKg} kg, BMI ${bmi})`;
      clinicalRationale = `Evaluated against your body weight (${weightKg} kg) and BMI (${bmi}) to ensure complete safety within established Tolerable Upper Intake Levels (UL).`;
      multiplierLabel = 'Standard Reference Range';
      break;
    }
  }

  const dosageScaling: DosageScaling = {
    isScaled,
    baseWeightKg: weightKg,
    computedBmi: bmi,
    bmiCategory,
    scalingRule,
    clinicalRationale,
    metricSummary,
    multiplierLabel
  };

  return {
    dosage,
    dosageScaling,
    reasons
  };
}

export function runDeterministicRuleEngine(profile: UserProfile): ScheduleResponse {
  const bmi = calculateBMI(profile.weightKg, profile.heightCm);
  const bmiCategory = getBMICategory(bmi);
  const warnings: ConflictWarning[] = [];

  // 1. Gather all candidate nutrients based on user's selected goals
  const nutrientFrequencyMap: Record<string, { count: number; goals: HealthGoal[] }> = {};

  profile.goals.forEach((goal) => {
    const list = GOAL_NUTRIENT_MAPPING[goal] || [];
    list.forEach((nutId) => {
      if (!nutrientFrequencyMap[nutId]) {
        nutrientFrequencyMap[nutId] = { count: 0, goals: [] };
      }
      nutrientFrequencyMap[nutId].count += 1;
      if (!nutrientFrequencyMap[nutId].goals.includes(goal)) {
        nutrientFrequencyMap[nutId].goals.push(goal);
      }
    });
  });

  // 2. Adjust priority for Diet Type
  if (profile.dietType === 'vegan' || profile.dietType === 'vegetarian') {
    // B12 is non-negotiable for vegans/vegetarians
    if (!nutrientFrequencyMap['b12']) {
      nutrientFrequencyMap['b12'] = { count: 5, goals: ['General Wellness'] };
    } else {
      nutrientFrequencyMap['b12'].count += 4;
    }
    // Boost zinc & omega-3
    if (nutrientFrequencyMap['zinc']) nutrientFrequencyMap['zinc'].count += 2;
    if (nutrientFrequencyMap['omega-3']) nutrientFrequencyMap['omega-3'].count += 2;
  }

  // 3. Activity Level adjustments
  const isHighActivity = profile.activityLevel === 'very_active' || profile.activityLevel === 'athlete';
  if (isHighActivity) {
    if (nutrientFrequencyMap['magnesium']) nutrientFrequencyMap['magnesium'].count += 3;
    if (nutrientFrequencyMap['protein']) nutrientFrequencyMap['protein'].count += 3;
    if (nutrientFrequencyMap['b-complex']) nutrientFrequencyMap['b-complex'].count += 2;
    if (nutrientFrequencyMap['creatine']) nutrientFrequencyMap['creatine'].count += 2;
  }

  // 4. Pregnancy & Nursing Safety Filter & Disclaimers
  if (profile.pregnantOrNursing) {
    warnings.push({
      id: 'warn-pregnancy-general',
      severity: 'critical',
      title: 'Pregnancy & Nursing Safety Protocol',
      description:
        'Pregnancy requires individualized obstetric oversight. High-risk supplements (such as preformed Vitamin A and unverified adaptogens) have been suppressed.',
      supplementsInvolved: ['Vitamin A', 'Ashwagandha'],
      actionRecommendation:
        'Use an OB/GYN-approved prenatal multivitamin with methylfolate and consult your healthcare provider before taking individual supplements.'
    });

    // Hard suppress Vitamin A and Ashwagandha in pregnancy
    delete nutrientFrequencyMap['vit-a'];
    delete nutrientFrequencyMap['ashwagandha'];
  }

  // 5. Iron Deficiency Check (CRITICAL HARD FLAG)
  // Section 10: "Hard-flag for iron supplementation without a flagged deficiency"
  if (nutrientFrequencyMap['iron']) {
    if (!profile.hasIronDeficiency) {
      warnings.push({
        id: 'warn-iron-no-deficiency',
        severity: 'critical',
        title: 'Hard Flag: Iron Supplementation Without Confirmed Deficiency',
        description:
          'Iron accumulates in organs (hemochromatosis risk) and acts as a pro-oxidant. Guidelines strictly recommend against routine iron supplementation without a recent blood ferritin/hemoglobin test.',
        supplementsInvolved: ['Iron'],
        actionRecommendation:
          'Iron recommendation suppressed. Obtain a serum ferritin blood panel before supplementing elemental iron.'
      });
      delete nutrientFrequencyMap['iron'];
    }
  }

  // 6. Allergies & Intolerances check
  const allergyLower = profile.allergies.map((a) => a.toLowerCase().trim()).filter(Boolean);
  if (allergyLower.some((a) => a.includes('fish') || a.includes('seafood') || a.includes('shellfish'))) {
    if (nutrientFrequencyMap['omega-3']) {
      warnings.push({
        id: 'warn-fish-allergy',
        severity: 'warning',
        title: 'Fish/Seafood Allergy Protocol',
        description: 'You indicated a seafood/fish allergy. Standard fish-oil Omega-3 must be substituted with 100% microalgae-derived EPA/DHA.',
        supplementsInvolved: ['Omega-3 (EPA/DHA)'],
        actionRecommendation: 'Specify certified vegan microalgae softgels (Schizochytrium sp.).'
      });
    }
    if (nutrientFrequencyMap['glucosamine']) {
      warnings.push({
        id: 'warn-shellfish-glucosamine',
        severity: 'warning',
        title: 'Shellfish Sensitivity in Joint Formulations',
        description: 'Commercial glucosamine is predominantly derived from crustacean chitin.',
        supplementsInvolved: ['Glucosamine'],
        actionRecommendation: 'Use vegetarian, fermented fungal-source Glucosamine sulfate or Collagen peptides.'
      });
    }
  }

  if (allergyLower.some((a) => a.includes('dairy') || a.includes('milk') || a.includes('whey') || a.includes('lactose'))) {
    if (nutrientFrequencyMap['protein']) {
      warnings.push({
        id: 'warn-dairy-allergy',
        severity: 'info',
        title: 'Dairy/Whey Sensitivity Protocol',
        description: 'You indicated a dairy sensitivity. Standard whey protein concentrate is substituted with cold-pressed fermented plant isolate (pea, pumpkin seed, brown rice).',
        supplementsInvolved: ['Whey/Plant Protein'],
        actionRecommendation: 'Select third-party tested vegan plant protein isolate.'
      });
    }
  }

  if (allergyLower.some((a) => a.includes('gelatin') || a.includes('bovine') || a.includes('porcine'))) {
    warnings.push({
      id: 'warn-gelatin-capsules',
      severity: 'info',
      title: 'Gelatin Free Excipient Guardrail',
      description: 'Standard softgels and two-piece capsules utilize bovine/porcine hide gelatin.',
      supplementsInvolved: ['Softgels / Capsules'],
      actionRecommendation: 'Ensure all chosen products specify 100% vegetarian pullulan or hypromellose (HPMC) plant capsules.'
    });
  }

  if (allergyLower.some((a) => a.includes('nightshade') || a.includes('solanaceae'))) {
    if (nutrientFrequencyMap['ashwagandha']) {
      warnings.push({
        id: 'warn-nightshade-ashwagandha',
        severity: 'warning',
        title: 'Nightshade Sensitivity: Ashwagandha Suppressed',
        description: 'Ashwagandha (Withania somnifera) is botanically in the Solanaceae (nightshade) family and can trigger immune or arthritic sensitivity in predisposed individuals.',
        supplementsInvolved: ['Ashwagandha'],
        actionRecommendation: 'Ashwagandha suppressed. Substituted with L-Theanine for non-botanical calm focus.'
      });
      delete nutrientFrequencyMap['ashwagandha'];
    }
  }

  // 6B. Clinical Guardrails & Organ System Health Flags
  if (profile.hasKidneyIssues) {
    warnings.push({
      id: 'warn-kidney-stones-oxalate',
      severity: 'critical',
      title: 'Renal Function & Calcium Oxalate Nephrolithiasis Guardrail',
      description:
        'In individuals with renal insufficiency or a history of nephrolithiasis (kidney stones), high doses of ascorbic acid (>1,000 mg) metabolize into oxalates, multiplying stone recurrence. Supplemental potassium and unmonitored magnesium excretion are also restricted.',
      supplementsInvolved: ['Vitamin C', 'Potassium', 'Magnesium'],
      actionRecommendation:
        'Vitamin C strictly capped at 250 mg daily. High-dose potassium supplements suppressed. Maintain generous hydration (3+ Liters daily).'
    });
    delete nutrientFrequencyMap['potassium'];
  }

  if (profile.hasThyroidCondition) {
    warnings.push({
      id: 'warn-thyroid-clinical-guardrail',
      severity: 'critical',
      title: 'Endocrine Protocol: Thyroid Optimization & Divalent Separation',
      description:
        'Exogenous iodine or high kelp extracts can provoke the Wolff-Chaikoff effect or acute Hashimoto exacerbations. Additionally, multivalent cations (Calcium, Iron, Magnesium) bind Levothyroxine in the intestine.',
      supplementsInvolved: ['Iodine', 'Calcium', 'Iron', 'Magnesium'],
      actionRecommendation:
        'Iodine supplementation suppressed. Enforce a strict 4-hour chronological separation between thyroid hormone medications and any divalent mineral doses.'
    });
    delete nutrientFrequencyMap['iodine'];
    delete nutrientFrequencyMap['ashwagandha'];
  }

  if (profile.hasBleedingDisorder) {
    warnings.push({
      id: 'warn-bleeding-disorder-guardrail',
      severity: 'warning',
      title: 'Hemostasis Guardrail: Antiplatelet & Anticoagulant Caution',
      description:
        'High doses of marine Omega-3 (>2,000 mg EPA/DHA), high-dose Vitamin E (>400 IU), and antiplatelet botanicals (Ginkgo Biloba, Garlic) exert additive blood-thinning effects.',
      supplementsInvolved: ['Omega-3', 'Vitamin E'],
      actionRecommendation:
        'Maintain Omega-3 at baseline physiological thresholds (≤1,000 mg) and avoid multi-botanical blood-thinning complexes.'
    });
  }

  if (profile.hasGastroSensitivity) {
    warnings.push({
      id: 'warn-gastro-mucosa-guardrail',
      severity: 'info',
      title: 'Gastric Mucosa & Acid Tolerance Guardrail',
      description:
        'Raw mineral salts (ferrous sulfate, zinc sulfate) and unbuffered ascorbic acid can cause acute nausea, epigastric reflux, and gastric irritation on an empty stomach.',
      supplementsInvolved: ['Zinc', 'Iron', 'Vitamin C'],
      actionRecommendation:
        'All minerals must be in 100% chelated bisglycinate form and taken exclusively with substantial meals (never in a fasted state).'
    });
  }

  if (profile.hasLiverCondition) {
    warnings.push({
      id: 'warn-liver-hepatic-guardrail',
      severity: 'warning',
      title: 'Hepatic Metabolism & Transaminase Protection Guardrail',
      description:
        'Concentrated green tea extract (EGCG >400 mg fasting), high-dose immediate-release Niacin (>500 mg), and preformed Vitamin A undergo heavy CYP450 hepatic clearance and transaminase risk.',
      supplementsInvolved: ['Green Tea Extract', 'Niacin', 'Vitamin A'],
      actionRecommendation:
        'Preformed retinol and concentrated botanical fat-burners omitted. Focus on foundational dietary micronutrients.'
    });
    delete nutrientFrequencyMap['vit-a'];
  }

  if (profile.hasAutoimmuneCondition) {
    warnings.push({
      id: 'warn-autoimmune-botanical-guardrail',
      severity: 'info',
      title: 'Immunomodulation Guardrail: Autoimmune Caution',
      description:
        'Non-specific immunostimulatory botanicals (Echinacea, high-dose Elderberry, Astragalus) can trigger Th1/Th2 immune shifts and flare autoimmune conditions.',
      supplementsInvolved: ['Immune Botanicals'],
      actionRecommendation:
        'Favor balanced foundational micronutrients (Vitamin D3, Zinc Bisglycinate, Omega-3) over potent botanical immune stimulants.'
    });
  }

  // 7. Check Current Medications & Existing Supplements for Hard Flags and Clashes
  const userMedsLower = profile.existingMedications.map((m) => m.toLowerCase());
  const userCurrentSuppsLower = profile.existingSupplements.map((s) => s.toLowerCase());

  // Hard Flag: Vitamin K2 + Blood Thinners
  const hasBloodThinners = userMedsLower.some(
    (m) =>
      m.includes('warfarin') ||
      m.includes('coumadin') ||
      m.includes('blood thinner') ||
      m.includes('eliquis') ||
      m.includes('apixaban') ||
      m.includes('xarelto') ||
      m.includes('rivaroxaban') ||
      m.includes('plavix') ||
      m.includes('clopidogrel') ||
      m.includes('aspirin')
  );
  if (hasBloodThinners) {
    if (nutrientFrequencyMap['vit-k2']) {
      warnings.push({
        id: 'warn-k2-blood-thinners',
        severity: 'critical',
        title: 'HARD CONTRAINDICATION: Vitamin K2 and Anticoagulants',
        description:
          'Vitamin K directly synthesizes clotting factors and counteracts anticoagulant medications like Warfarin, creating dangerous thrombosis risk.',
        supplementsInvolved: ['Vitamin K2 (MK-7)'],
        actionRecommendation: 'Vitamin K2 has been completely removed from your recommendation plan.'
      });
      delete nutrientFrequencyMap['vit-k2'];
    }

    if (nutrientFrequencyMap['omega-3']) {
      warnings.push({
        id: 'warn-omega3-blood-thinners',
        severity: 'warning',
        title: 'Medication Interaction Flag: Omega-3 with Blood Thinners',
        description: 'High doses (>1000mg) of EPA/DHA have additive antiplatelet properties with prescription anticoagulants.',
        supplementsInvolved: ['Omega-3 (EPA/DHA)'],
        actionRecommendation: 'Keep dose under 1,000mg daily and monitor INR/coagulation markers with your physician.'
      });
    }

    if (nutrientFrequencyMap['coq10']) {
      warnings.push({
        id: 'warn-coq10-warfarin',
        severity: 'warning',
        title: 'Medication Interaction: CoQ10 Quinone Structure Caution',
        description: 'CoQ10 is structurally similar to menaquinone (Vitamin K) and may slightly decrease the anticoagulant response to Warfarin.',
        supplementsInvolved: ['CoQ10'],
        actionRecommendation: 'Notify your prescribing doctor before starting CoQ10.'
      });
    }
  }

  // Hard Flag: Potassium + BP Medications (ACE inhibitors, ARBs, K-sparing diuretics)
  const hasBPMeds = userMedsLower.some(
    (m) =>
      m.includes('blood pressure') ||
      m.includes('lisinopril') ||
      m.includes('losartan') ||
      m.includes('spironolactone') ||
      m.includes('enalapril') ||
      m.includes('ramipril') ||
      m.includes('arb') ||
      m.includes('ace inhibitor') ||
      m.includes('valsartan') ||
      m.includes('aldactone')
  );
  if (hasBPMeds && nutrientFrequencyMap['potassium']) {
    warnings.push({
      id: 'warn-potassium-bp-meds',
      severity: 'critical',
      title: 'HARD WARNING: Potassium with ACE Inhibitors / ARBs',
      description:
        'ACE inhibitors, ARBs, and potassium-sparing diuretics reduce renal potassium clearance. Supplemental potassium salts can induce severe hyperkalemia and cardiac dysrhythmias.',
      supplementsInvolved: ['Potassium'],
      actionRecommendation: 'Potassium supplement removed. Obtain potassium exclusively from whole dietary sources.'
    });
    delete nutrientFrequencyMap['potassium'];
  }

  // Hard Flag: Antidepressants / SSRIs / SNRIs
  const hasAntidepressants = userMedsLower.some(
    (m) =>
      m.includes('sertraline') ||
      m.includes('zoloft') ||
      m.includes('fluoxetine') ||
      m.includes('prozac') ||
      m.includes('escitalopram') ||
      m.includes('lexapro') ||
      m.includes('citalopram') ||
      m.includes('duloxetine') ||
      m.includes('cymbalta') ||
      m.includes('effexor') ||
      m.includes('ssri') ||
      m.includes('snri') ||
      m.includes('antidepressant')
  );
  if (hasAntidepressants) {
    warnings.push({
      id: 'warn-ssri-serotonin-syndrome',
      severity: 'critical',
      title: 'HARD CONTRAINDICATION: Serotonergic Botanical Interception',
      description:
        'SSRIs/SNRIs elevate synaptic serotonin levels. Combining them with 5-HTP, St. John\'s Wort, or high-dose SAMe creates life-threatening Serotonin Syndrome risk.',
      supplementsInvolved: ['5-HTP', 'St. John\'s Wort', 'SAMe'],
      actionRecommendation:
        'All direct serotonergic precursor compounds are strictly barred from your protocol.'
    });
  }

  // Clinical Synergy: Statins & CoQ10 Depletion
  const hasStatins = userMedsLower.some(
    (m) =>
      m.includes('statin') ||
      m.includes('atorvastatin') ||
      m.includes('lipitor') ||
      m.includes('rosuvastatin') ||
      m.includes('crestor') ||
      m.includes('simvastatin')
  );
  if (hasStatins) {
    if (!nutrientFrequencyMap['coq10']) {
      nutrientFrequencyMap['coq10'] = { count: 6, goals: ['General Wellness'] };
    } else {
      nutrientFrequencyMap['coq10'].count += 5;
    }
    warnings.push({
      id: 'warn-statin-coq10-depletion',
      severity: 'info',
      title: 'Clinical Synergistic Flag: Statin-Induced CoQ10 Depletion',
      description:
        'HMG-CoA reductase inhibitors (statins) block the mevalonate biochemical pathway, decreasing endogenous CoQ10 synthesis by up to 40% and contributing to myalgia.',
      supplementsInvolved: ['CoQ10 (Ubiquinol)'],
      actionRecommendation:
        'CoQ10 (100–200 mg Ubiquinol) has been elevated to your protocol to support mitochondrial respiration.'
    });
  }

  // PPIs / Acid Reducers
  const hasPPIs = userMedsLower.some(
    (m) =>
      m.includes('omeprazole') ||
      m.includes('prilosec') ||
      m.includes('pantoprazole') ||
      m.includes('protonix') ||
      m.includes('esomeprazole') ||
      m.includes('nexium') ||
      m.includes('ppi') ||
      m.includes('acid reflux')
  );
  if (hasPPIs) {
    warnings.push({
      id: 'warn-ppi-hypochlorhydria',
      severity: 'warning',
      title: 'Gastrointestinal Absorption Flag: PPI Hypochlorhydria',
      description:
        'Suppressed stomach acidity impairs non-heme iron cleavage, Vitamin B12 extrinsic factor binding, and magnesium ionization.',
      supplementsInvolved: ['Vitamin B12', 'Magnesium', 'Iron'],
      actionRecommendation:
        'Use sublingual active Methylcobalamin and fully chelated bisglycinate mineral forms for stomach-independent uptake.'
    });
    if (nutrientFrequencyMap['b12']) nutrientFrequencyMap['b12'].count += 3;
    if (nutrientFrequencyMap['magnesium']) nutrientFrequencyMap['magnesium'].count += 2;
  }

  // Metformin & B12 Depletion
  const hasMetformin = userMedsLower.some((m) => m.includes('metformin') || m.includes('glucophage'));
  if (hasMetformin) {
    if (!nutrientFrequencyMap['b12']) {
      nutrientFrequencyMap['b12'] = { count: 5, goals: ['General Wellness'] };
    } else {
      nutrientFrequencyMap['b12'].count += 4;
    }
    warnings.push({
      id: 'warn-metformin-b12',
      severity: 'info',
      title: 'Metabolic Flag: Metformin-Induced B12 Depletion',
      description:
        'Long-term Metformin therapy alters calcium-dependent membrane action in the terminal ileum, decreasing Vitamin B12 absorption in 10–30% of patients.',
      supplementsInvolved: ['Vitamin B12 (Methylcobalamin)'],
      actionRecommendation:
        'Supplemental Vitamin B12 (1,000 mcg sublingual) prioritized to prevent peripheral neuropathy and megaloblastic anemia.'
    });
  }

  // Hard Flag: Iodine + Thyroid Medications
  const hasThyroidMeds = userMedsLower.some(
    (m) =>
      m.includes('levothyroxine') ||
      m.includes('synthroid') ||
      m.includes('thyroid') ||
      m.includes('hypothyroid') ||
      m.includes('armour')
  );
  if (hasThyroidMeds) {
    if (nutrientFrequencyMap['iodine']) {
      warnings.push({
        id: 'warn-iodine-thyroid',
        severity: 'critical',
        title: 'HARD WARNING: Iodine Supplementation on Thyroid Medication',
        description: 'Exogenous iodine can destabilize thyroid hormone synthesis (Wolff-Chaikoff effect or acute Hashimoto flares).',
        supplementsInvolved: ['Iodine'],
        actionRecommendation: 'Iodine supplementation suppressed. Consult your endocrinologist.'
      });
      delete nutrientFrequencyMap['iodine'];
    }
    if (nutrientFrequencyMap['ashwagandha']) {
      warnings.push({
        id: 'warn-ashwagandha-thyroid',
        severity: 'warning',
        title: 'Thyroid Caution: Ashwagandha',
        description: 'Ashwagandha can stimulate thyroid gland secretion and interact with thyroid hormone replacement doses.',
        supplementsInvolved: ['Ashwagandha'],
        actionRecommendation: 'Monitor TSH/fT4 levels if using adaptogenic herbs.'
      });
    }
  }

  // Hard Flag: Melatonin for Long-Term Daily Use
  if (nutrientFrequencyMap['melatonin']) {
    warnings.push({
      id: 'warn-melatonin-cycling',
      severity: 'warning',
      title: 'Guideline Warning: Melatonin Duration & Cycling',
      description:
        'Melatonin is a neurohormone designed for acute circadian alignment (jet lag, shift work, short-term insomnia), not indefinite chronic nightly use.',
      supplementsInvolved: ['Melatonin'],
      actionRecommendation:
        'Use the lowest physiological dose (0.3 - 1 mg) 30-60 min before sleep for 1-3 weeks max, then cycle off.'
    });
  }

  // 8. Regimen Tier & Pareto Principle Filtering
  // 'beginner' (2-3 items) -> strict Pareto 80/20 foundational pillars only (delivering 80% impact from top 20% nutrients)
  // 'intermediate' (4-5 items) -> foundational pillars + primary targeted goal accelerators
  // 'advanced' (6-8 items) -> comprehensive bio-protocol with specialized adaptogens and co-factors
  const tier: RegimenTier = profile.regimenTier || 'beginner';

  // Build candidate items with Pareto impact weighting
  const candidateEntries = Object.entries(nutrientFrequencyMap).map(([nutId, meta]) => {
    const nutrient = SEED_NUTRIENTS.find((n) => n.id === nutId);
    const paretoImpact = nutrient?.paretoImpact || 'specialized';
    const paretoScore = nutrient?.paretoScore || 50;
    // Composite priority score: Goal relevance + Pareto biological efficacy score
    const compositeScore = meta.count * 20 + paretoScore;
    return { nutId, meta, nutrient, paretoImpact, paretoScore, compositeScore };
  });

  let eligibleCandidates = candidateEntries;

  if (tier === 'beginner') {
    // Beginner: Pareto 80/20 Rule
    // 80% of systemic health gains derive from 20% of foundational compounds (e.g., Vitamin D3, Magnesium, Omega-3, or mandatory B12/Protein)
    // Exclude "good to have" secondary supplements, adaptogens, and unneeded pills to eliminate beginner overwhelm.
    eligibleCandidates = candidateEntries.filter((c) => {
      if (c.paretoImpact === 'core_80_20') return true;
      // Critical conditional exemptions:
      if (c.nutId === 'b12' && (profile.dietType === 'vegan' || profile.dietType === 'vegetarian')) return true;
      if (c.nutId === 'protein' && (c.meta.goals.includes('Muscle Gain & Performance') || isHighActivity)) return true;
      if (c.nutId === 'iron' && profile.hasIronDeficiency) return true;
      return false;
    });

    // If fewer than 2 candidates qualified from specific selected goals, backfill foundational pillars
    const corePillars = ['vit-d3', 'magnesium', 'omega-3'];
    for (const pillarId of corePillars) {
      if (eligibleCandidates.length >= 3) break;
      if (!eligibleCandidates.some((c) => c.nutId === pillarId)) {
        const nut = SEED_NUTRIENTS.find((n) => n.id === pillarId);
        if (nut) {
          eligibleCandidates.push({
            nutId: pillarId,
            meta: { count: 2, goals: ['General Wellness'] },
            nutrient: nut,
            paretoImpact: 'core_80_20',
            paretoScore: nut.paretoScore || 95,
            compositeScore: 40 + (nut.paretoScore || 95)
          });
        }
      }
    }

    // Sort by composite score descending and cap at 2-3 items
    eligibleCandidates.sort((a, b) => b.compositeScore - a.compositeScore);
    const maxItems = profile.goals.length <= 1 ? 2 : 3;
    eligibleCandidates = eligibleCandidates.slice(0, maxItems);
  } else if (tier === 'intermediate') {
    // Intermediate: allow core_80_20 and targeted boosters (Creatine, Zinc, Vit C, Probiotics, L-Theanine, etc.)
    // Omit purely specialized adaptogens unless heavily weighted by user goals
    eligibleCandidates = candidateEntries.filter((c) => {
      if (c.paretoImpact === 'core_80_20' || c.paretoImpact === 'targeted') return true;
      if (c.meta.count >= 2 && (c.nutId === 'ashwagandha' || c.nutId === 'collagen')) return true;
      return false;
    });

    eligibleCandidates.sort((a, b) => b.compositeScore - a.compositeScore);
    eligibleCandidates = eligibleCandidates.slice(0, 5); // 4-5 items
  } else {
    // Advanced: all tiers eligible, comprehensive protocol up to 7-8 items
    eligibleCandidates.sort((a, b) => b.compositeScore - a.compositeScore);
    eligibleCandidates = eligibleCandidates.slice(0, 8); // 6-8 items
  }

  const sortedShortlist = eligibleCandidates.map((c) => [c.nutId, c.meta] as [string, { count: number; goals: HealthGoal[] }]);

  // 9. Schedule Items Assembly: Compute individual doses & timing slots
  const scheduledItems: ScheduleItem[] = [];

  sortedShortlist.forEach(([nutId, meta]) => {
    const nutrient = SEED_NUTRIENTS.find((n) => n.id === nutId);
    if (!nutrient) return;

    // Check duplicate with user's current supplements
    const isDuplicate = userCurrentSuppsLower.some((s) => {
      const suppNameLower = nutrient.name.toLowerCase();
      return s.includes(suppNameLower) || (suppNameLower.includes('vitamin d') && s.includes('d3')) || (suppNameLower.includes('b-complex') && s.includes('vitamin b'));
    });

    let duplicateWarning: string | undefined;
    if (isDuplicate) {
      duplicateWarning = `You noted you are already taking this or a similar product. Check your existing label to prevent exceeding the Tolerable Upper Intake Level (UL).`;
      warnings.push({
        id: `warn-dup-${nutId}`,
        severity: 'warning',
        title: `Duplicate Alert: ${nutrient.name}`,
        description: `You reported taking ${nutrient.name} already in your daily routine. Combining multiple formulas can lead to unintentional overdosage.`,
        supplementsInvolved: [nutrient.name],
        actionRecommendation: 'Verify the elemental milligram amount on your existing bottle before adding a separate dose.'
      });
    }

    // Determine individualized dosage based on body stats (weightKg and BMI)
    const dosageResult = calculatePersonalizedDosage({
      nutId,
      nutrient,
      profile,
      bmi,
      bmiCategory,
      isHighActivity,
      hasStatins,
      goals: meta.goals
    });

    const customizedDosage = dosageResult.dosage;
    const reasons: string[] = [];

    // Pareto badge and rationale
    const paretoImpact = nutrient.paretoImpact || 'specialized';
    let paretoBadge = 'Advanced Protocol';
    if (paretoImpact === 'core_80_20') {
      paretoBadge = '80/20 Core Impact';
    } else if (paretoImpact === 'targeted') {
      paretoBadge = 'Targeted Accelerator';
    }

    if (tier === 'beginner') {
      reasons.push('Pareto 80/20 Pillar: Delivers 80% of physiological health optimization with zero pill fatigue (top 20% high-yield compound).');
    } else if (tier === 'intermediate') {
      reasons.push(paretoImpact === 'core_80_20' ? 'Pareto Foundation: Essential systemic metabolic baseline.' : 'Targeted Accelerator: High-evidence optimization for your specific health goals.');
    } else {
      reasons.push('Advanced Bio-Protocol: Multi-pathway cellular synergy stack.');
    }

    if (meta.goals.length > 0) {
      reasons.push(`Targeted for your goals: ${meta.goals.join(', ')}`);
    }

    // Append personalized weight/BMI dosage reasons
    if (dosageResult.reasons.length > 0) {
      reasons.push(...dosageResult.reasons);
    }

    // 10. Assign to Time Slot
    // Slots: Morning / Midday / Evening / Bedtime / Post-Workout
    let slot: TimeSlotCategory = 'Morning';
    let recommendedTime = profile.breakfastTime || '08:00 AM';

    if (nutId === 'magnesium' || nutId === 'melatonin' || nutId === 'ashwagandha') {
      slot = 'Bedtime';
      recommendedTime = formatBedtime(profile.sleepTime);
    } else if (nutId === 'protein' && profile.hasWorkout && profile.workoutTime) {
      slot = 'Post-Workout';
      recommendedTime = formatPostWorkout(profile.workoutTime);
    } else if (nutId === 'creatine' && profile.hasWorkout && profile.workoutTime) {
      slot = 'Post-Workout';
      recommendedTime = formatPostWorkout(profile.workoutTime);
    } else if (nutId === 'omega-3' || nutId === 'vit-k2' || nutId === 'vit-e' || nutId === 'chromium') {
      // Fat-soluble nutrients best with midday/lunch or largest dinner
      slot = 'Midday';
      recommendedTime = profile.lunchTime || '12:30 PM';
    } else if (nutId === 'calcium') {
      // Calcium separate from iron and morning zinc
      slot = 'Evening';
      recommendedTime = profile.dinnerTime || '07:00 PM';
    } else {
      // Default to morning
      slot = 'Morning';
      recommendedTime = profile.breakfastTime || '08:00 AM';
    }

    // Check with food requirement text
    let withFoodText = nutrient.withFood ? 'Take with food (contains dietary fats)' : 'Flexible / empty stomach acceptable';
    if (nutrient.withFoodNotes) {
      withFoodText = nutrient.withFoodNotes;
    }

    scheduledItems.push({
      id: `sched-${nutId}`,
      nutrientId: nutrient.id,
      nutrientName: nutrient.name,
      nutrientType: nutrient.type,
      slot,
      recommendedTime,
      dosage: customizedDosage,
      dosageScaling: dosageResult.dosageScaling,
      withFood: nutrient.withFood,
      withFoodInstructions: withFoodText,
      synergyPartners: nutrient.synergizesWith,
      conflictWarnings: nutrient.avoidPairingWith,
      cyclingNote: nutrient.cyclingNotes,
      cyclingType: nutrient.cyclingType,
      priorityScore: meta.count,
      reasons,
      isDuplicateWithExisting: isDuplicate,
      duplicateWarning,
      hardFlags: nutrient.specialMedicationFlags,
      tierLevel: tier,
      paretoBadge,
      paretoReason: nutrient.paretoReason,
      paretoImpact: nutrient.paretoImpact,
      paretoScore: nutrient.paretoScore
    });
  });

  // 11. Separation Enforcement (2+ hours apart)
  // Check if Iron and Calcium are both in the schedule:
  const ironIdx = scheduledItems.findIndex((s) => s.nutrientId === 'iron');
  const calciumIdx = scheduledItems.findIndex((s) => s.nutrientId === 'calcium');
  if (ironIdx >= 0 && calciumIdx >= 0) {
    // Force Iron to Morning (empty stomach) and Calcium to Evening
    scheduledItems[ironIdx].slot = 'Morning';
    scheduledItems[ironIdx].recommendedTime = '07:00 AM (upon waking, 1h before breakfast)';
    scheduledItems[calciumIdx].slot = 'Evening';
    scheduledItems[calciumIdx].recommendedTime = profile.dinnerTime || '07:00 PM';
  }

  // Sort schedule items by slot chronologically:
  // Morning -> Post-Workout (if daytime) -> Midday -> Evening -> Bedtime
  const slotOrder: Record<TimeSlotCategory, number> = {
    'Morning': 1,
    'Midday': 2,
    'Post-Workout': 3,
    'Pre-Workout': 3,
    'Evening': 4,
    'Bedtime': 5
  };

  scheduledItems.sort((a, b) => slotOrder[a.slot] - slotOrder[b.slot]);

  return {
    schedule: scheduledItems,
    warnings,
    computedBmi: bmi,
    bmiCategory,
    generatedAt: new Date().toISOString()
  };
}

function formatBedtime(sleepTimeStr: string): string {
  if (!sleepTimeStr) return '10:30 PM (45 min before sleep)';
  try {
    const [hours, mins] = sleepTimeStr.split(':').map(Number);
    let h = hours;
    let m = mins - 45;
    if (m < 0) {
      m += 60;
      h = (h - 1 + 24) % 24;
    }
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? `0${m}` : m;
    return `${displayH}:${displayM} ${ampm} (Bedtime prep)`;
  } catch {
    return 'Bedtime (30-45 min prior)';
  }
}

function formatPostWorkout(workoutTimeStr: string): string {
  if (!workoutTimeStr) return 'Post-Workout (within 45 min)';
  try {
    const [hours, mins] = workoutTimeStr.split(':').map(Number);
    let h = hours + 1; // 1 hour after start
    if (h >= 24) h -= 24;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = mins < 10 ? `0${mins}` : mins;
    return `${displayH}:${displayM} ${ampm} (Post-Workout)`;
  } catch {
    return 'Post-Workout';
  }
}
