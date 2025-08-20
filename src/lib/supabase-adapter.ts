// Supabase Data Adapter
// Converts Supabase PediatricDrug format to app Medication format

import { PediatricDrug } from './supabase'
import { Medication, MedicationDosage, MaxDose } from './medication-database'

// Parse pediatric dose string to extract dosage values
function parsePediatricDose(doseString: string): MedicationDosage {
  // Examples of dose formats:
  // "5-15 mcg/kg/day ÷ BID"
  // "10-20 mg/kg/day"
  // "0.1-0.2 mg/kg q8h"
  // "5 mg/kg/dose"
  
  const dosage: MedicationDosage = {
    unit: 'mg/kg',
    frequency: '',
    route: '',
    notes: '',
    original: doseString
  }

  try {
    // Extract dose range (min-max mg/kg)
    const doseMatch = doseString.match(/(\d+(?:\.\d+)?)\s*-?\s*(\d+(?:\.\d+)?)?\s*(mcg|mg|g)\/kg/i)
    if (doseMatch) {
      const unit = doseMatch[3].toLowerCase()
      let minDose = parseFloat(doseMatch[1])
      let maxDose = doseMatch[2] ? parseFloat(doseMatch[2]) : minDose
      
      // Convert mcg to mg if needed
      if (unit === 'mcg') {
        minDose = minDose / 1000
        maxDose = maxDose / 1000
        dosage.unit = 'mg/kg'
      } else if (unit === 'g') {
        minDose = minDose * 1000
        maxDose = maxDose * 1000
        dosage.unit = 'mg/kg'
      } else {
        dosage.unit = `${unit}/kg`
      }
      
      dosage.min_dose = minDose
      dosage.max_dose = maxDose
    } else {
      // Try to extract single dose
      const singleDoseMatch = doseString.match(/(\d+(?:\.\d+)?)\s*(mcg|mg|g)\/kg/i)
      if (singleDoseMatch) {
        const unit = singleDoseMatch[2].toLowerCase()
        let dose = parseFloat(singleDoseMatch[1])
        
        if (unit === 'mcg') {
          dose = dose / 1000
          dosage.unit = 'mg/kg'
        } else if (unit === 'g') {
          dose = dose * 1000
          dosage.unit = 'mg/kg'
        } else {
          dosage.unit = `${unit}/kg`
        }
        
        dosage.min_dose = dose
        dosage.max_dose = dose
      }
    }

    // Extract frequency information
    const freqPatterns = [
      { pattern: /÷\s*(BID|TID|QID)/i, map: { 'BID': 'q12h', 'TID': 'q8h', 'QID': 'q6h' }},
      { pattern: /q(\d+)h/i, map: null },
      { pattern: /(once|daily)/i, map: { 'ONCE': 'daily', 'DAILY': 'daily' }},
      { pattern: /(BID|TID|QID)/i, map: { 'BID': 'twice daily', 'TID': 'three times daily', 'QID': 'four times daily' }}
    ]

    for (const freqPattern of freqPatterns) {
      const match = doseString.match(freqPattern.pattern)
      if (match) {
        if (freqPattern.map) {
          dosage.frequency = freqPattern.map[match[1].toUpperCase()] || match[1]
        } else {
          dosage.frequency = match[0]
        }
        break
      }
    }

    if (!dosage.frequency) {
      // Default frequency patterns
      if (doseString.includes('/day')) {
        dosage.frequency = 'daily'
      } else if (doseString.includes('dose')) {
        dosage.frequency = 'per dose'
      }
    }

  } catch (error) {
    console.warn('Error parsing dose string:', doseString, error)
  }

  return dosage
}

// Parse max dose string
function parseMaxDose(maxDoseString: string): MaxDose {
  const maxDose: MaxDose = {
    original: maxDoseString
  }

  try {
    // Extract numeric value and unit
    const match = maxDoseString.match(/(\d+(?:\.\d+)?)\s*(mcg|mg|g)(?:\/day|\/dose)?/i)
    if (match) {
      let value = parseFloat(match[1])
      const unit = match[2].toLowerCase()
      
      // Convert to mg for consistency
      if (unit === 'mcg') {
        value = value / 1000
        maxDose.unit = 'mg'
      } else if (unit === 'g') {
        value = value * 1000
        maxDose.unit = 'mg'
      } else {
        maxDose.unit = unit
      }
      
      maxDose.value = value
    }
  } catch (error) {
    console.warn('Error parsing max dose string:', maxDoseString, error)
  }

  return maxDose
}

// Extract dosage forms from string
function parseDosageForms(dosageFormString: string): string[] {
  if (!dosageFormString) return ['Standard']
  
  // Common abbreviations and their full forms
  const formMap: { [key: string]: string } = {
    'tab': 'Tablet',
    'tabs': 'Tablet',
    'cap': 'Capsule',
    'caps': 'Capsule',
    'liq': 'Liquid',
    'susp': 'Suspension',
    'sol': 'Solution',
    'inj': 'Injection',
    'elixir': 'Elixir',
    'syr': 'Syrup',
    'cream': 'Cream',
    'oint': 'Ointment',
    'gel': 'Gel',
    'powder': 'Powder',
    'iv': 'IV',
    'im': 'IM',
    'nebulizer': 'Nebulizer',
    'inhaler': 'Inhaler'
  }

  const forms = dosageFormString
    .toLowerCase()
    .split(/[\s,]+/)
    .map(form => form.trim())
    .filter(form => form.length > 0)
    .map(form => formMap[form] || form.charAt(0).toUpperCase() + form.slice(1))

  return forms.length > 0 ? forms : ['Standard']
}

// Extract routes from string
function parseRoutes(routeString: string): string[] {
  if (!routeString) return ['PO']
  
  const routes = routeString
    .toUpperCase()
    .split(/[\/,\s]+/)
    .map(route => route.trim())
    .filter(route => route.length > 0)

  return routes.length > 0 ? routes : ['PO']
}

// Map system to category
function mapSystemToCategory(system: string): string {
  const categoryMap: { [key: string]: string } = {
    'cardiovascular': 'Cardiovascular',
    'respiratory': 'Respiratory', 
    'infectious_diseases': 'Antibiotics',
    'infectious diseases': 'Antibiotics',
    'neurological': 'Neurological',
    'neurology': 'Neurological',
    'endocrine': 'Endocrine',
    'gastroenterology': 'Gastroenterology',
    'gastrointestinal': 'Gastroenterology',
    'pain_management': 'Pain Management',
    'pain management': 'Pain Management',
    'anesthesia': 'Anesthesia',
    'emergency': 'Emergency',
    'dermatology': 'Dermatology',
    'oncology': 'Oncology',
    'hematology': 'Hematology',
    'immunology': 'Immunology',
    'psychiatry': 'Psychiatry',
    'orthopedics': 'Orthopedics',
    'ophthalmology': 'Ophthalmology',
    'otolaryngology': 'ENT'
  }

  const systemLower = system.toLowerCase()
  return categoryMap[systemLower] || system.charAt(0).toUpperCase() + system.slice(1).toLowerCase()
}

// Convert PediatricDrug to Medication format
export function convertPediatricDrugToMedication(drug: PediatricDrug, id: number): Medication {
  const dosage = parsePediatricDose(drug.Pediatric_Dose || '')
  const maxDose = parseMaxDose(drug.Max_Dose || '')
  
  return {
    id,
    name: drug.Drug || 'Unknown Drug',
    system: drug.System || 'General',
    class: drug.Class || 'Unknown',
    category: mapSystemToCategory(drug.System || ''),
    indication: drug.Indication || 'Not specified',
    dosage,
    max_dose: maxDose,
    dosage_forms: parseDosageForms(drug.Dosage_Form || ''),
    routes: parseRoutes(drug.Route || ''),
    frequency: drug.Frequency || dosage.frequency || 'As directed',
    contraindications: drug.Contraindications || 'None specified',
    side_effects: drug.Major_Side_Effects || 'Monitor for adverse effects',
    special_notes: drug.Special_Notes || '',
    original_dose_text: drug.Pediatric_Dose || '',
    original_max_dose_text: drug.Max_Dose || ''
  }
}

// Convert array of PediatricDrugs to Medications
export function convertPediatricDrugsToMedications(drugs: PediatricDrug[]): Medication[] {
  return drugs.map((drug, index) => convertPediatricDrugToMedication(drug, index + 1))
}

// Get unique categories from converted medications
export function extractCategoriesFromDrugs(drugs: PediatricDrug[]): string[] {
  const categories = new Set<string>()
  
  drugs.forEach(drug => {
    const category = mapSystemToCategory(drug.System || '')
    categories.add(category)
  })
  
  return Array.from(categories).sort()
}

// Get unique systems from drugs
export function extractSystemsFromDrugs(drugs: PediatricDrug[]): string[] {
  const systems = new Set<string>()
  
  drugs.forEach(drug => {
    if (drug.System) {
      systems.add(drug.System)
    }
  })
  
  return Array.from(systems).sort()
}