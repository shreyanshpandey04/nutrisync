export interface ClinicalAllergen {
  id: string;
  name: string;
  category: string;
  clinicalImpact: string;
  recommendation: string;
}

export interface MedicationOption {
  id: string;
  name: string;
  brandNames: string;
  drugClass: string;
  clashSummary: string;
}

export interface SupplementOption {
  id: string;
  name: string;
  category: string;
  compendiumId?: string;
  commonDose?: string;
}

export const COMMON_ALLERGENS: ClinicalAllergen[] = [
  {
    id: 'fish',
    name: 'Fish & Marine Oils',
    category: 'Marine',
    clinicalImpact: 'Contraindicates standard marine-derived Omega-3 softgels.',
    recommendation: 'Substitutes with 100% microalgal-fermented EPA/DHA.'
  },
  {
    id: 'shellfish',
    name: 'Crustacean Shellfish',
    category: 'Marine',
    clinicalImpact: 'Shellfish chitin is the primary source of commercial Glucosamine.',
    recommendation: 'Requires vegetarian/corn-fermented Glucosamine or alternative joint peptides.'
  },
  {
    id: 'dairy',
    name: 'Dairy / Whey / Lactose',
    category: 'Dairy',
    clinicalImpact: 'Triggers GI inflammation with standard whey protein concentrate or bovine colostrum.',
    recommendation: 'Switches to pea, brown rice, or pumpkin seed fermented plant isolate.'
  },
  {
    id: 'soy',
    name: 'Soy & Soy Lecithin',
    category: 'Legumes',
    clinicalImpact: 'Found in emulsifiers, Vitamin E (mixed tocopherols), and Phosphatidylserine.',
    recommendation: 'Enforces sunflower lecithin and non-GMO soy-free certifications.'
  },
  {
    id: 'gluten',
    name: 'Gluten / Wheat / Celiac',
    category: 'Grains',
    clinicalImpact: 'Wheat starch often acts as an unlisted binder or flow agent in tableted supplements.',
    recommendation: 'Requires verified third-party certified Gluten-Free (GFCO) capsules.'
  },
  {
    id: 'tree_nuts',
    name: 'Tree Nuts & Peanuts',
    category: 'Nuts',
    clinicalImpact: 'Cross-contamination risk in lipid carrier oils and protein powder blending facilities.',
    recommendation: 'Guarantees nut-free dedicated manufacturing facility validation.'
  },
  {
    id: 'eggs',
    name: 'Eggs & Egg Albumin',
    category: 'Animal Protein',
    clinicalImpact: 'Egg white protein peptides and lutein extraction carriers.',
    recommendation: 'Specifies marigold-extracted lutein and vegetable protein matrices.'
  },
  {
    id: 'gelatin',
    name: 'Bovine / Porcine Gelatin',
    category: 'Animal Derivatives',
    clinicalImpact: 'Softgels and hard two-piece capsules conventionally made from bovine/porcine hide.',
    recommendation: 'Mandates 100% vegan hypromellose (HPMC) or tapioca pullulan capsules.'
  },
  {
    id: 'sulfites',
    name: 'Sulfites / Sulfur Sensitivities',
    category: 'Chemical',
    clinicalImpact: 'Sensitivity to thiol donors (MSM, high-dose Alpha Lipoic Acid, NAC).',
    recommendation: 'Lowers starting titration for sulfur-containing antioxidant donors.'
  },
  {
    id: 'nightshades',
    name: 'Nightshades (Solanaceae)',
    category: 'Botanical',
    clinicalImpact: 'Ashwagandha (Withania somnifera) belongs taxonomically to the Solanaceae family.',
    recommendation: 'Substitutes with L-Theanine or Holy Basil (Tulsi) for stress support.'
  }
];

export const COMMON_MEDICATIONS: MedicationOption[] = [
  // Anticoagulants & Antiplatelets
  {
    id: 'warfarin',
    name: 'Warfarin',
    brandNames: 'Coumadin, Jantoven',
    drugClass: 'Vitamin K Antagonist',
    clashSummary: 'Strict contraindication with Vitamin K1/K2; antiplatelet collision with high Omega-3 & Ginkgo.'
  },
  {
    id: 'eliquis',
    name: 'Apixaban',
    brandNames: 'Eliquis',
    drugClass: 'Direct Factor Xa Inhibitor',
    clashSummary: 'Additive bleeding risk with high-dose Omega-3 (>2,000 mg), Vitamin E, and high-dose Garlic.'
  },
  {
    id: 'xarelto',
    name: 'Rivaroxaban',
    brandNames: 'Xarelto',
    drugClass: 'Direct Factor Xa Inhibitor',
    clashSummary: 'Additive bleeding risk with high-dose Omega-3 (>2,000 mg) and high-dose antiplatelet botanicals.'
  },
  {
    id: 'aspirin',
    name: 'Aspirin (Cardioprotective low-dose)',
    brandNames: 'Bayer, Ecotrin (81mg)',
    drugClass: 'Antiplatelet',
    clashSummary: 'Platelet aggregation inhibition; monitor with supplemental Omega-3 and Ginkgo Biloba.'
  },
  {
    id: 'plavix',
    name: 'Clopidogrel',
    brandNames: 'Plavix',
    drugClass: 'Antiplatelet',
    clashSummary: 'Avoid high-dose Vitamin E (>400 IU) and Omega-3 without coagulation monitoring.'
  },

  // Antihypertensives & Cardiac
  {
    id: 'lisinopril',
    name: 'Lisinopril / ACE Inhibitors',
    brandNames: 'Prinivil, Zestril, Enalapril, Ramipril',
    drugClass: 'ACE Inhibitor',
    clashSummary: 'Impairs renal potassium clearance; strict contraindication with supplemental Potassium salts.'
  },
  {
    id: 'losartan',
    name: 'Losartan / ARBs',
    brandNames: 'Cozaar, Valsartan, Diovan',
    drugClass: 'Angiotensin II Receptor Blocker',
    clashSummary: 'Elevates potassium retention; supplemental potassium triggers hyperkalemia risk.'
  },
  {
    id: 'spironolactone',
    name: 'Spironolactone',
    brandNames: 'Aldactone',
    drugClass: 'Potassium-Sparing Diuretic',
    clashSummary: 'Causes potassium retention; never combine with potassium supplements.'
  },
  {
    id: 'amlodipine',
    name: 'Amlodipine',
    brandNames: 'Norvasc',
    drugClass: 'Calcium Channel Blocker',
    clashSummary: 'Avoid mega-dose supplemental calcium boluses simultaneously.'
  },
  {
    id: 'metoprolol',
    name: 'Metoprolol',
    brandNames: 'Lopressor, Toprol-XL',
    drugClass: 'Beta-Blocker',
    clashSummary: 'May interact with exogenous Melatonin; CoQ10 may support mitochondrial myocardial function.'
  },

  // Thyroid
  {
    id: 'levothyroxine',
    name: 'Levothyroxine',
    brandNames: 'Synthroid, Levoxyl, Tirosint, Euthyrox',
    drugClass: 'Thyroid Hormone (T4)',
    clashSummary: 'Divalent minerals (Iron, Calcium, Magnesium) bind and render T4 insoluble; space by 4+ hours. Avoid high Iodine.'
  },
  {
    id: 'armour_thyroid',
    name: 'Desiccated Thyroid',
    brandNames: 'Armour Thyroid, NP Thyroid',
    drugClass: 'Porcine Thyroid Extract (T3/T4)',
    clashSummary: 'Chelates with Iron, Calcium, Zinc; mandatory 4-hour absorption buffer.'
  },

  // Antidepressants & Mood
  {
    id: 'sertraline',
    name: 'Sertraline / SSRIs',
    brandNames: 'Zoloft, Prozac (Fluoxetine), Lexapro (Escitalopram), Celexa',
    drugClass: 'SSRI Antidepressant',
    clashSummary: 'Strict contraindication with 5-HTP, St. John\'s Wort, and SAMe (Serotonin Syndrome risk).'
  },
  {
    id: 'duloxetine',
    name: 'Duloxetine / SNRIs',
    brandNames: 'Cymbalta, Effexor (Venlafaxine)',
    drugClass: 'SNRI Antidepressant',
    clashSummary: 'Avoid combination with serotonergic botanicals (St. John\'s Wort, 5-HTP).'
  },
  {
    id: 'bupropion',
    name: 'Bupropion',
    brandNames: 'Wellbutrin, Zyban',
    drugClass: 'NDRI Antidepressant',
    clashSummary: 'Lowers seizure threshold; avoid excessive CNS stimulants (high-dose Yohimbine, Synephrine).'
  },

  // Metabolic & Diabetes
  {
    id: 'metformin',
    name: 'Metformin',
    brandNames: 'Glucophage, Fortamet',
    drugClass: 'Biguanide Antidiabetic',
    clashSummary: 'Interferes with ileal calcium-dependent absorption of Vitamin B12; monitoring & B12 repletion indicated.'
  },
  {
    id: 'semaglutide',
    name: 'Semaglutide / GLP-1 Agonists',
    brandNames: 'Ozempic, Wegovy, Rybelsus, Mounjaro (Tirzepatide)',
    drugClass: 'GLP-1 Receptor Agonist',
    clashSummary: 'Delays gastric emptying; ingest fat-soluble vitamins with your primary caloric meal window.'
  },
  {
    id: 'atorvastatin',
    name: 'Atorvastatin / Statins',
    brandNames: 'Lipitor, Crestor (Rosuvastatin), Zocor (Simvastatin)',
    drugClass: 'HMG-CoA Reductase Inhibitor',
    clashSummary: 'Inhibits mevalonate pathway and severely depletes endogenous CoQ10. CoQ10 supplementation strongly recommended.'
  },

  // Gastrointestinal
  {
    id: 'omeprazole',
    name: 'Omeprazole / PPIs',
    brandNames: 'Prilosec, Nexium (Esomeprazole), Protonix (Pantoprazole)',
    drugClass: 'Proton Pump Inhibitor',
    clashSummary: 'Hypochlorhydria reduces non-heme Iron, B12, and Magnesium absorption. Requires fully reacted organic chelates.'
  },

  // Immunosuppressants & Steroids
  {
    id: 'prednisone',
    name: 'Prednisone / Corticosteroids',
    brandNames: 'Deltasone, Medrol (Methylprednisolone)',
    drugClass: 'Glucocorticoid',
    clashSummary: 'Accelerates calcium & potassium urinary wasting; Vitamin D3 + K2 and Calcium bone protection recommended.'
  },
  {
    id: 'methotrexate',
    name: 'Methotrexate',
    brandNames: 'Trexall, Rasuvo',
    drugClass: 'Antimetabolite / DMARD',
    clashSummary: 'Folate antagonist; do not take OTC folic acid without exact rheumatologist dosing schedule.'
  }
];

export const COMMON_SUPPLEMENTS: SupplementOption[] = [
  { id: 'multivitamin', name: 'Comprehensive Multivitamin', category: 'General Foundation' },
  { id: 'vit-d3', name: 'Vitamin D3 (Cholecalciferol)', category: 'Vitamins', compendiumId: 'vit-d3', commonDose: '2,000 - 5,000 IU' },
  { id: 'vit-k2', name: 'Vitamin K2 (MK-7)', category: 'Vitamins', compendiumId: 'vit-k2', commonDose: '100 - 180 mcg' },
  { id: 'magnesium', name: 'Magnesium Bisglycinate', category: 'Minerals', compendiumId: 'magnesium', commonDose: '300 - 400 mg' },
  { id: 'omega-3', name: 'Omega-3 Fish Oil (EPA/DHA)', category: 'Fatty Acids', compendiumId: 'omega-3', commonDose: '1,000 - 2,000 mg' },
  { id: 'zinc', name: 'Zinc (Bisglycinate / Picolinate)', category: 'Minerals', compendiumId: 'zinc', commonDose: '15 - 30 mg' },
  { id: 'b-complex', name: 'Active B-Complex (Methylated)', category: 'Vitamins', compendiumId: 'b-complex' },
  { id: 'b12', name: 'Vitamin B12 (Methylcobalamin)', category: 'Vitamins', compendiumId: 'b12', commonDose: '500 - 1,000 mcg' },
  { id: 'vit-c', name: 'Vitamin C (Ascorbic Acid / Liposomal)', category: 'Vitamins', compendiumId: 'vit-c', commonDose: '500 - 1,000 mg' },
  { id: 'iron', name: 'Iron (Ferrous Bisglycinate Chelate)', category: 'Minerals', compendiumId: 'iron', commonDose: '18 - 28 mg' },
  { id: 'creatine', name: 'Creatine Monohydrate', category: 'Performance', compendiumId: 'creatine', commonDose: '5 g' },
  { id: 'protein', name: 'Whey / Plant Isolate Protein', category: 'Performance', compendiumId: 'protein', commonDose: '25 - 30 g' },
  { id: 'coq10', name: 'CoQ10 (Ubiquinol)', category: 'Cardiovascular & Energy', compendiumId: 'coq10', commonDose: '100 - 200 mg' },
  { id: 'ashwagandha', name: 'Ashwagandha (KSM-66 / Sensoril)', category: 'Adaptogens', compendiumId: 'ashwagandha', commonDose: '300 - 600 mg' },
  { id: 'melatonin', name: 'Melatonin', category: 'Sleep Hormones', compendiumId: 'melatonin', commonDose: '0.3 - 1.0 mg' },
  { id: 'probiotics', name: 'Spore / Live Probiotics', category: 'Digestive Health', compendiumId: 'probiotics' },
  { id: 'calcium', name: 'Calcium (Citrate / Malate)', category: 'Minerals', compendiumId: 'calcium', commonDose: '500 - 600 mg' },
  { id: 'iodine', name: 'Iodine / Kelp Extract', category: 'Minerals', compendiumId: 'iodine', commonDose: '150 mcg' },
  { id: 'selenium', name: 'Selenium (Selenomethionine)', category: 'Minerals', compendiumId: 'selenium', commonDose: '100 - 200 mcg' },
  { id: 'curcumin', name: 'Curcumin (BCM-95 / Phytosome)', category: 'Botanicals', compendiumId: 'curcumin', commonDose: '500 mg' },
  { id: 'nac', name: 'NAC (N-Acetyl Cysteine)', category: 'Antioxidants', compendiumId: 'nac', commonDose: '600 - 1,200 mg' },
  { id: 'l-theanine', name: 'L-Theanine', category: 'Amino Acids', compendiumId: 'l-theanine', commonDose: '100 - 200 mg' },
  { id: 'collagen', name: 'Hydrolyzed Collagen Peptides', category: 'Joint & Skin', commonDose: '10 - 15 g' },
  { id: 'berberine', name: 'Berberine HCl', category: 'Metabolic Support', commonDose: '500 mg' },
  { id: 'electrolytes', name: 'Electrolyte Hydration Matrix', category: 'Hydration' },
  { id: 'rhodiola', name: 'Rhodiola Rosea (3% Rosavins)', category: 'Adaptogens', commonDose: '200 - 400 mg' },
  { id: 'biotin', name: 'Biotin (High-Dose B7)', category: 'Vitamins', commonDose: '2,500 - 5,000 mcg' },
  { id: 'ala', name: 'Alpha Lipoic Acid (R-ALA)', category: 'Antioxidants', commonDose: '300 - 600 mg' },
  { id: 'glucosamine', name: 'Glucosamine & Chondroitin', category: 'Joint Support', commonDose: '1,500 mg' }
];
