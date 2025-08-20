// Simplified Pediatric Drug Database
// Common pediatric medications for testing

export interface MedicationDosage {
  min_dose?: number
  max_dose?: number
  unit: string
  frequency?: string
  route?: string
  notes?: string
  original: string
}

export interface MaxDose {
  value?: number
  unit?: string
  original: string
}

export interface Medication {
  id: number
  name: string
  system: string
  class: string
  category: string
  indication: string
  dosage: MedicationDosage
  max_dose: MaxDose
  dosage_forms: string[]
  routes: string[]
  frequency: string
  contraindications: string
  side_effects: string
  special_notes: string
  original_dose_text: string
  original_max_dose_text: string
}

export const medicationDatabase: Medication[] = [
  {
    id: 1,
    name: "Acetaminophen",
    system: "Pain_Management",
    class: "Analgesic",
    category: "Pain Management",
    indication: "Pain and fever",
    dosage: {
      min_dose: 10,
      max_dose: 15,
      unit: "mg/kg",
      frequency: "q4-6h",
      route: "PO",
      notes: "",
      original: "10-15 mg/kg q4-6h"
    },
    max_dose: {
      value: 650,
      unit: "mg",
      original: "650 mg/dose"
    },
    dosage_forms: ["Tab", "Liquid", "Suspension"],
    routes: ["PO"],
    frequency: "Every 4-6 hours",
    contraindications: "Hepatic failure",
    side_effects: "Hepatotoxicity (overdose)",
    special_notes: "Monitor total daily dose",
    original_dose_text: "10-15 mg/kg q4-6h",
    original_max_dose_text: "650 mg/dose"
  },
  {
    id: 2,
    name: "Ibuprofen",
    system: "Pain_Management",
    class: "NSAID",
    category: "Pain Management",
    indication: "Pain and fever",
    dosage: {
      min_dose: 5,
      max_dose: 10,
      unit: "mg/kg",
      frequency: "q6-8h",
      route: "PO",
      notes: "",
      original: "5-10 mg/kg q6-8h"
    },
    max_dose: {
      value: 400,
      unit: "mg",
      original: "400 mg/dose"
    },
    dosage_forms: ["Tab", "Suspension"],
    routes: ["PO"],
    frequency: "Every 6-8 hours",
    contraindications: "GI bleeding, renal disease",
    side_effects: "GI upset, renal toxicity",
    special_notes: "Take with food",
    original_dose_text: "5-10 mg/kg q6-8h",
    original_max_dose_text: "400 mg/dose"
  },
  {
    id: 3,
    name: "Amoxicillin",
    system: "Infectious_Diseases",
    class: "Penicillin",
    category: "Antibiotics",
    indication: "Bacterial infections",
    dosage: {
      min_dose: 20,
      max_dose: 40,
      unit: "mg/kg",
      frequency: "q8h",
      route: "PO",
      notes: "",
      original: "20-40 mg/kg/day divided q8h"
    },
    max_dose: {
      value: 1000,
      unit: "mg",
      original: "1000 mg/dose"
    },
    dosage_forms: ["Cap", "Suspension"],
    routes: ["PO"],
    frequency: "Every 8 hours",
    contraindications: "Penicillin allergy",
    side_effects: "GI upset, rash",
    special_notes: "Complete full course",
    original_dose_text: "20-40 mg/kg/day divided q8h",
    original_max_dose_text: "1000 mg/dose"
  },
  {
    id: 4,
    name: "Azithromycin",
    system: "Infectious_Diseases",
    class: "Macrolide",
    category: "Antibiotics",
    indication: "Respiratory infections",
    dosage: {
      min_dose: 10,
      max_dose: 12,
      unit: "mg/kg",
      frequency: "once daily",
      route: "PO",
      notes: "",
      original: "10-12 mg/kg once daily"
    },
    max_dose: {
      value: 500,
      unit: "mg",
      original: "500 mg/dose"
    },
    dosage_forms: ["Tab", "Suspension"],
    routes: ["PO"],
    frequency: "Once daily",
    contraindications: "Macrolide allergy",
    side_effects: "GI upset, QT prolongation",
    special_notes: "5-day course typical",
    original_dose_text: "10-12 mg/kg once daily",
    original_max_dose_text: "500 mg/dose"
  },
  {
    id: 5,
    name: "Prednisolone",
    system: "Endocrine",
    class: "Corticosteroid",
    category: "Anti-inflammatory",
    indication: "Asthma, allergic reactions",
    dosage: {
      min_dose: 1,
      max_dose: 2,
      unit: "mg/kg",
      frequency: "daily",
      route: "PO",
      notes: "",
      original: "1-2 mg/kg/day"
    },
    max_dose: {
      value: 40,
      unit: "mg",
      original: "40 mg/dose"
    },
    dosage_forms: ["Tab", "Liquid"],
    routes: ["PO"],
    frequency: "Once or twice daily",
    contraindications: "Systemic infections",
    side_effects: "Mood changes, appetite increase",
    special_notes: "Taper gradually",
    original_dose_text: "1-2 mg/kg/day",
    original_max_dose_text: "40 mg/dose"
  },
  {
    id: 6,
    name: "Albuterol",
    system: "Respiratory",
    class: "Beta2-agonist",
    category: "Respiratory",
    indication: "Asthma, bronchospasm",
    dosage: {
      min_dose: 2.5,
      max_dose: 5,
      unit: "mg",
      frequency: "q4-6h",
      route: "Nebulizer",
      notes: "",
      original: "2.5-5 mg via nebulizer q4-6h"
    },
    max_dose: {
      value: 5,
      unit: "mg",
      original: "5 mg/dose"
    },
    dosage_forms: ["Nebulizer", "MDI"],
    routes: ["Inhalation"],
    frequency: "Every 4-6 hours PRN",
    contraindications: "Hypersensitivity",
    side_effects: "Tachycardia, tremor",
    special_notes: "Rinse mouth after use",
    original_dose_text: "2.5-5 mg via nebulizer q4-6h",
    original_max_dose_text: "5 mg/dose"
  },
  {
    id: 7,
    name: "Ondansetron",
    system: "Gastroenterology",
    class: "5-HT3 antagonist",
    category: "Gastroenterology",
    indication: "Nausea and vomiting",
    dosage: {
      min_dose: 0.1,
      max_dose: 0.15,
      unit: "mg/kg",
      frequency: "q8h",
      route: "PO/IV",
      notes: "",
      original: "0.1-0.15 mg/kg q8h"
    },
    max_dose: {
      value: 8,
      unit: "mg",
      original: "8 mg/dose"
    },
    dosage_forms: ["Tab", "ODT", "IV"],
    routes: ["PO", "IV"],
    frequency: "Every 8 hours",
    contraindications: "QT prolongation",
    side_effects: "Headache, constipation",
    special_notes: "Monitor QT interval",
    original_dose_text: "0.1-0.15 mg/kg q8h",
    original_max_dose_text: "8 mg/dose"
  },
  {
    id: 8,
    name: "Ceftriaxone",
    system: "Infectious_Diseases",
    class: "Cephalosporin",
    category: "Antibiotics",
    indication: "Serious bacterial infections",
    dosage: {
      min_dose: 50,
      max_dose: 100,
      unit: "mg/kg",
      frequency: "daily",
      route: "IV",
      notes: "",
      original: "50-100 mg/kg/day"
    },
    max_dose: {
      value: 2000,
      unit: "mg",
      original: "2000 mg/dose"
    },
    dosage_forms: ["IV"],
    routes: ["IV", "IM"],
    frequency: "Once daily",
    contraindications: "Cephalosporin allergy",
    side_effects: "Diarrhea, rash",
    special_notes: "Avoid calcium-containing solutions",
    original_dose_text: "50-100 mg/kg/day",
    original_max_dose_text: "2000 mg/dose"
  },
  {
    id: 9,
    name: "Epinephrine",
    system: "Emergency",
    class: "Sympathomimetic",
    category: "Emergency",
    indication: "Anaphylaxis, cardiac arrest",
    dosage: {
      min_dose: 0.01,
      max_dose: 0.01,
      unit: "mg/kg",
      frequency: "q3-5min",
      route: "IV",
      notes: "",
      original: "0.01 mg/kg IV (1:10,000)"
    },
    max_dose: {
      value: 1,
      unit: "mg",
      original: "1 mg/dose"
    },
    dosage_forms: ["Injection"],
    routes: ["IV", "IM", "SC"],
    frequency: "Every 3-5 minutes",
    contraindications: "None in emergency",
    side_effects: "Tachycardia, hypertension",
    special_notes: "For anaphylaxis: 0.3-0.5 mg IM",
    original_dose_text: "0.01 mg/kg IV (1:10,000)",
    original_max_dose_text: "1 mg/dose"
  },
  {
    id: 10,
    name: "Lorazepam",
    system: "Neurological",
    class: "Benzodiazepine",
    category: "Neurological",
    indication: "Seizures, anxiety",
    dosage: {
      min_dose: 0.05,
      max_dose: 0.1,
      unit: "mg/kg",
      frequency: "q6-8h",
      route: "IV/PO",
      notes: "",
      original: "0.05-0.1 mg/kg q6-8h"
    },
    max_dose: {
      value: 4,
      unit: "mg",
      original: "4 mg/dose"
    },
    dosage_forms: ["Tab", "IV"],
    routes: ["PO", "IV"],
    frequency: "Every 6-8 hours",
    contraindications: "Respiratory depression",
    side_effects: "Sedation, respiratory depression",
    special_notes: "Monitor respiratory status",
    original_dose_text: "0.05-0.1 mg/kg q6-8h",
    original_max_dose_text: "4 mg/dose"
  },
]

// Export categories for filtering
export const medicationCategories = [
  "Pain Management",
  "Antibiotics", 
  "Anti-inflammatory",
  "Respiratory",
  "Gastroenterology",
  "Emergency",
  "Neurological"
]

// Export systems for organization
export const medicationSystems = [
  "Pain_Management",
  "Infectious_Diseases",
  "Endocrine", 
  "Respiratory",
  "Gastroenterology",
  "Emergency",
  "Neurological"
]

// Helper function to get medications by category
export function getMedicationsByCategory(category: string): Medication[] {
  return medicationDatabase.filter(med => med.category === category)
}

// Helper function to get medications by system
export function getMedicationsBySystem(system: string): Medication[] {
  return medicationDatabase.filter(med => med.system === system)
}

// Helper function to search medications
export function searchMedications(query: string): Medication[] {
  const lowercaseQuery = query.toLowerCase()
  return medicationDatabase.filter(med => 
    med.name.toLowerCase().includes(lowercaseQuery) ||
    med.indication.toLowerCase().includes(lowercaseQuery) ||
    med.class.toLowerCase().includes(lowercaseQuery)
  )
}
