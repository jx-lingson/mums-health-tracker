export interface BloodMarkerDef {
  id: string;
  name: string;
  category: string;
  unit: string;
  low: number;
  high: number;
}

export const BLOOD_MARKER_CATEGORIES = [
  "Complete Blood Count",
  "Liver Function",
  "Kidney Function",
  "Metabolic Panel",
  "Lipid Panel",
  "Thyroid",
  "Iron Studies",
  "Inflammatory",
  "Vitamins & Minerals",
  "Hormones",
  "Diabetes",
  "Other",
];

export const BLOOD_MARKER_DEFS: BloodMarkerDef[] = [
  // Complete Blood Count
  { id: "wbc", name: "WBC", category: "Complete Blood Count", unit: "x10⁹/L", low: 4.0, high: 11.0 },
  { id: "rbc", name: "RBC", category: "Complete Blood Count", unit: "x10¹²/L", low: 3.8, high: 5.5 },
  { id: "haemoglobin", name: "Haemoglobin", category: "Complete Blood Count", unit: "g/L", low: 120, high: 160 },
  { id: "haematocrit", name: "Haematocrit", category: "Complete Blood Count", unit: "%", low: 36, high: 46 },
  { id: "platelets", name: "Platelets", category: "Complete Blood Count", unit: "x10⁹/L", low: 150, high: 400 },
  { id: "neutrophils", name: "Neutrophils", category: "Complete Blood Count", unit: "x10⁹/L", low: 2.0, high: 7.5 },
  { id: "lymphocytes", name: "Lymphocytes", category: "Complete Blood Count", unit: "x10⁹/L", low: 1.0, high: 4.0 },
  { id: "monocytes", name: "Monocytes", category: "Complete Blood Count", unit: "x10⁹/L", low: 0.2, high: 0.8 },
  { id: "eosinophils", name: "Eosinophils", category: "Complete Blood Count", unit: "x10⁹/L", low: 0.0, high: 0.5 },
  { id: "basophils", name: "Basophils", category: "Complete Blood Count", unit: "x10⁹/L", low: 0.0, high: 0.1 },
  { id: "mcv", name: "MCV", category: "Complete Blood Count", unit: "fL", low: 80, high: 100 },
  { id: "mch", name: "MCH", category: "Complete Blood Count", unit: "pg", low: 27, high: 33 },
  { id: "mchc", name: "MCHC", category: "Complete Blood Count", unit: "g/L", low: 320, high: 360 },
  { id: "rdw", name: "RDW", category: "Complete Blood Count", unit: "%", low: 11.5, high: 14.5 },

  // Liver Function
  { id: "alt", name: "ALT", category: "Liver Function", unit: "IU/L", low: 7, high: 56 },
  { id: "ast", name: "AST", category: "Liver Function", unit: "IU/L", low: 10, high: 40 },
  { id: "alp", name: "ALP", category: "Liver Function", unit: "IU/L", low: 44, high: 147 },
  { id: "ggt", name: "GGT", category: "Liver Function", unit: "IU/L", low: 0, high: 45 },
  { id: "bilirubin", name: "Bilirubin, Total", category: "Liver Function", unit: "μmol/L", low: 0, high: 20 },
  { id: "albumin", name: "Albumin", category: "Liver Function", unit: "g/L", low: 35, high: 50 },
  { id: "total-protein", name: "Total Protein", category: "Liver Function", unit: "g/L", low: 60, high: 80 },
  { id: "globulin", name: "Globulin", category: "Liver Function", unit: "g/L", low: 20, high: 35 },

  // Kidney Function
  { id: "creatinine", name: "Creatinine", category: "Kidney Function", unit: "μmol/L", low: 45, high: 90 },
  { id: "urea", name: "Urea", category: "Kidney Function", unit: "mmol/L", low: 2.5, high: 7.8 },
  { id: "egfr", name: "eGFR", category: "Kidney Function", unit: "mL/min", low: 90, high: 999 },
  { id: "uric-acid", name: "Uric Acid", category: "Kidney Function", unit: "μmol/L", low: 140, high: 360 },

  // Metabolic Panel
  { id: "sodium", name: "Sodium", category: "Metabolic Panel", unit: "mmol/L", low: 136, high: 145 },
  { id: "potassium", name: "Potassium", category: "Metabolic Panel", unit: "mmol/L", low: 3.5, high: 5.1 },
  { id: "chloride", name: "Chloride", category: "Metabolic Panel", unit: "mmol/L", low: 98, high: 106 },
  { id: "bicarbonate", name: "Bicarbonate", category: "Metabolic Panel", unit: "mmol/L", low: 22, high: 29 },
  { id: "calcium", name: "Calcium", category: "Metabolic Panel", unit: "mmol/L", low: 2.1, high: 2.6 },
  { id: "phosphate", name: "Phosphate", category: "Metabolic Panel", unit: "mmol/L", low: 0.8, high: 1.5 },
  { id: "magnesium", name: "Magnesium", category: "Metabolic Panel", unit: "mmol/L", low: 0.7, high: 1.0 },

  // Lipid Panel
  { id: "total-cholesterol", name: "Total Cholesterol", category: "Lipid Panel", unit: "mmol/L", low: 0, high: 5.5 },
  { id: "ldl", name: "LDL Cholesterol", category: "Lipid Panel", unit: "mmol/L", low: 0, high: 3.4 },
  { id: "hdl", name: "HDL Cholesterol", category: "Lipid Panel", unit: "mmol/L", low: 1.0, high: 999 },
  { id: "triglycerides", name: "Triglycerides", category: "Lipid Panel", unit: "mmol/L", low: 0, high: 1.7 },

  // Thyroid
  { id: "tsh", name: "TSH", category: "Thyroid", unit: "mIU/L", low: 0.4, high: 4.0 },
  { id: "free-t4", name: "Free T4", category: "Thyroid", unit: "pmol/L", low: 12, high: 22 },
  { id: "free-t3", name: "Free T3", category: "Thyroid", unit: "pmol/L", low: 3.1, high: 6.8 },

  // Iron Studies
  { id: "iron", name: "Iron", category: "Iron Studies", unit: "μmol/L", low: 9, high: 30 },
  { id: "ferritin", name: "Ferritin", category: "Iron Studies", unit: "μg/L", low: 30, high: 300 },
  { id: "transferrin", name: "Transferrin", category: "Iron Studies", unit: "g/L", low: 2.0, high: 3.6 },
  { id: "tibc", name: "TIBC", category: "Iron Studies", unit: "μmol/L", low: 45, high: 72 },
  { id: "transferrin-sat", name: "Transferrin Saturation", category: "Iron Studies", unit: "%", low: 15, high: 45 },

  // Inflammatory
  { id: "crp", name: "CRP", category: "Inflammatory", unit: "mg/L", low: 0, high: 5 },
  { id: "esr", name: "ESR", category: "Inflammatory", unit: "mm/hr", low: 0, high: 20 },

  // Vitamins & Minerals
  { id: "vitamin-d", name: "Vitamin D", category: "Vitamins & Minerals", unit: "nmol/L", low: 50, high: 250 },
  { id: "vitamin-b12", name: "Vitamin B12", category: "Vitamins & Minerals", unit: "pmol/L", low: 150, high: 750 },
  { id: "folate", name: "Folate", category: "Vitamins & Minerals", unit: "nmol/L", low: 7, high: 45 },
  { id: "zinc", name: "Zinc", category: "Vitamins & Minerals", unit: "μmol/L", low: 10, high: 18 },

  // Diabetes
  { id: "glucose", name: "Glucose (Fasting)", category: "Diabetes", unit: "mmol/L", low: 3.9, high: 5.5 },
  { id: "hba1c", name: "HbA1c", category: "Diabetes", unit: "%", low: 4.0, high: 5.6 },
  { id: "insulin", name: "Insulin (Fasting)", category: "Diabetes", unit: "mIU/L", low: 2, high: 25 },

  // Hormones
  { id: "cortisol", name: "Cortisol (AM)", category: "Hormones", unit: "nmol/L", low: 170, high: 540 },
  { id: "testosterone", name: "Testosterone", category: "Hormones", unit: "nmol/L", low: 0.5, high: 2.6 },
  { id: "oestradiol", name: "Oestradiol", category: "Hormones", unit: "pmol/L", low: 0, high: 587 },
  { id: "progesterone", name: "Progesterone", category: "Hormones", unit: "nmol/L", low: 0, high: 89 },
];

export function getStatus(def: BloodMarkerDef, value: number): "normal" | "low" | "high" {
  if (value < def.low) return "low";
  if (value > def.high) return "high";
  return "normal";
}

export function findMarkerDef(name: string): BloodMarkerDef | undefined {
  const lower = name.toLowerCase().trim();
  return BLOOD_MARKER_DEFS.find((d) =>
    d.name.toLowerCase() === lower || d.id === lower
  );
}
