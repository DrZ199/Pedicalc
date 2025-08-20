// Medical calculation utilities

export interface PatientData {
  age: string
  ageUnit: 'years' | 'months' | 'days'
  weight: string
  weightUnit: 'kg' | 'lbs'
  height?: string
  heightUnit?: 'cm' | 'inches'
}

export interface BMIResult {
  bmi: number
  category: string
  percentile?: number
  color: 'green' | 'yellow' | 'red'
}

export interface BSAResult {
  bsa: number
  method: string
}

export interface FluidResult {
  maintenance: number
  total24h: number
  hourly: number
}

// Convert weight to kg
export function convertToKg(weight: number, unit: 'kg' | 'lbs'): number {
  return unit === 'lbs' ? weight * 0.453592 : weight
}

// Convert height to cm
export function convertToCm(height: number, unit: 'cm' | 'inches'): number {
  return unit === 'inches' ? height * 2.54 : height
}

// Convert age to months for percentile calculations
export function convertToMonths(age: number, unit: 'years' | 'months' | 'days'): number {
  switch (unit) {
    case 'years': return age * 12
    case 'days': return age / 30.44
    default: return age
  }
}

// Calculate BMI for pediatric patients
export function calculatePediatricBMI(patientData: PatientData): BMIResult | null {
  const weight = parseFloat(patientData.weight)
  const height = parseFloat(patientData.height || '0')
  
  if (!weight || !height) return null
  
  const weightKg = convertToKg(weight, patientData.weightUnit)
  const heightCm = convertToCm(height, patientData.heightUnit || 'cm')
  const heightM = heightCm / 100
  
  const bmi = weightKg / (heightM * heightM)
  
  // Pediatric BMI categories (simplified)
  let category: string
  let color: 'green' | 'yellow' | 'red'
  
  if (bmi < 5) {
    category = 'Underweight'
    color = 'yellow'
  } else if (bmi < 85) {
    category = 'Normal weight'
    color = 'green'
  } else if (bmi < 95) {
    category = 'Overweight'
    color = 'yellow'
  } else {
    category = 'Obese'
    color = 'red'
  }
  
  return { bmi: Math.round(bmi * 10) / 10, category, color }
}

// Calculate Body Surface Area using Mosteller formula
export function calculateBSA(patientData: PatientData): BSAResult | null {
  const weight = parseFloat(patientData.weight)
  const height = parseFloat(patientData.height || '0')
  
  if (!weight || !height) return null
  
  const weightKg = convertToKg(weight, patientData.weightUnit)
  const heightCm = convertToCm(height, patientData.heightUnit || 'cm')
  
  // Mosteller formula: BSA (m²) = √[(height cm × weight kg) / 3600]
  const bsa = Math.sqrt((heightCm * weightKg) / 3600)
  
  return {
    bsa: Math.round(bsa * 100) / 100,
    method: 'Mosteller formula'
  }
}

// Calculate maintenance fluid requirements (Holliday-Segar method)
export function calculateFluidRequirements(patientData: PatientData): FluidResult | null {
  const weight = parseFloat(patientData.weight)
  if (!weight) return null
  
  const weightKg = convertToKg(weight, patientData.weightUnit)
  
  let maintenance: number
  
  if (weightKg <= 10) {
    // First 10 kg: 100 mL/kg/day
    maintenance = weightKg * 100
  } else if (weightKg <= 20) {
    // First 10 kg: 1000 mL, next 10 kg: 50 mL/kg/day
    maintenance = 1000 + (weightKg - 10) * 50
  } else {
    // First 10 kg: 1000 mL, next 10 kg: 500 mL, remaining: 20 mL/kg/day
    maintenance = 1500 + (weightKg - 20) * 20
  }
  
  return {
    maintenance: Math.round(maintenance),
    total24h: Math.round(maintenance),
    hourly: Math.round(maintenance / 24)
  }
}

// Emergency drug calculations
export interface EmergencyDrug {
  name: string
  indication: string
  dose: string
  route: string
  notes?: string
}

export function getEmergencyDrugs(weightKg: number): EmergencyDrug[] {
  return [
    {
      name: 'Epinephrine',
      indication: 'Cardiac arrest',
      dose: `${(weightKg * 0.01).toFixed(2)} mg (${(weightKg * 0.1).toFixed(1)} mL of 1:10,000)`,
      route: 'IV/IO',
      notes: 'Repeat every 3-5 minutes'
    },
    {
      name: 'Adenosine',
      indication: 'SVT',
      dose: `${(weightKg * 0.1).toFixed(1)} mg (first dose), ${(weightKg * 0.2).toFixed(1)} mg (second dose)`,
      route: 'IV/IO rapid push',
      notes: 'Follow with rapid saline flush'
    },
    {
      name: 'Atropine',
      indication: 'Bradycardia',
      dose: `${Math.max(0.1, Math.min(weightKg * 0.02, 0.5)).toFixed(2)} mg`,
      route: 'IV/IO',
      notes: 'Minimum 0.1 mg, maximum 0.5 mg'
    },
    {
      name: 'Amiodarone',
      indication: 'VT/VF',
      dose: `${(weightKg * 5).toFixed(1)} mg`,
      route: 'IV/IO',
      notes: 'May repeat once'
    }
  ]
}

// Unit conversion utilities
export const conversions = {
  weight: {
    kgToLbs: (kg: number) => kg * 2.20462,
    lbsToKg: (lbs: number) => lbs * 0.453592
  },
  height: {
    cmToInches: (cm: number) => cm * 0.393701,
    inchesToCm: (inches: number) => inches * 2.54,
    cmToFeet: (cm: number) => Math.floor(cm * 0.0328084),
    cmToInchesRemainder: (cm: number) => Math.round((cm * 0.393701) % 12)
  },
  temperature: {
    celsiusToFahrenheit: (c: number) => (c * 9/5) + 32,
    fahrenheitToCelsius: (f: number) => (f - 32) * 5/9
  }
}