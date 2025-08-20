// Medical calculation utilities with comprehensive validation and error handling

import { 
  validatePatientData, 
  validateDosage, 
  convertWeightToKg,
  type ValidationResult 
} from './medical-validation'
import { 
  safeAsyncOperation, 
  handleMedicalError, 
  classifyError,
  ErrorType,
  MedicalSafetyLevel 
} from './error-handler'

export interface PatientData {
  age: string
  ageUnit: 'years' | 'months' | 'days'
  weight: string
  weightUnit: 'kg' | 'lbs'
  height?: string
  heightUnit?: 'cm' | 'inches'
}

export interface SafeMedicalCalculation {
  result: number
  validation: ValidationResult
  inputValidation: ValidationResult
  isRecommended: boolean
  warnings: string[]
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

/**
 * Enhanced pediatric dose calculation with multiple safety checks and error handling
 */
export function calculatePediatricDose(
  age: number,
  ageUnit: 'years' | 'months' | 'days',
  weight: number,
  weightUnit: 'kg' | 'lbs',
  dosePerKg: number,
  maxDoseValue?: number,
  medicationName: string = 'medication'
): SafeMedicalCalculation {
  try {
    // Input validation
    if (!isFinite(age) || age <= 0) {
      throw new Error(`Invalid age value: ${age}`)
    }
    
    if (!isFinite(weight) || weight <= 0) {
      throw new Error(`Invalid weight value: ${weight}`)
    }
    
    if (!isFinite(dosePerKg) || dosePerKg <= 0) {
      throw new Error(`Invalid dose per kg value: ${dosePerKg}`)
    }
    
    const patientData = { 
      age: age.toString(), 
      ageUnit, 
      weight: weight.toString(), 
      weightUnit 
    }
    
    return calculateSafeDosage(patientData, dosePerKg, maxDoseValue, medicationName)
    
  } catch (error) {
    console.error('Pediatric dose calculation error:', error)
    
    return {
      result: 0,
      validation: {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Calculation failed'],
        warnings: [],
        safetyLevel: 'danger'
      },
      inputValidation: {
        isValid: false,
        errors: ['Invalid input parameters'],
        warnings: [],
        safetyLevel: 'danger'
      },
      isRecommended: false,
      warnings: ['Pediatric dose calculation failed due to invalid input parameters']
    }
  }
}

/**
 * Safe medication dosage calculation with comprehensive validation and error handling
 */
export function calculateSafeDosage(
  patientData: PatientData,
  dosePerKg: number,
  maxDoseValue?: number,
  medicationName: string = 'medication'
): SafeMedicalCalculation {
  try {
    // Input validation
    if (!patientData) {
      throw new Error('Patient data is required for dosage calculation')
    }
    
    if (!dosePerKg || dosePerKg <= 0 || !isFinite(dosePerKg)) {
      throw new Error(`Invalid dose per kg value: ${dosePerKg}`)
    }
    
    if (!medicationName || medicationName.trim().length === 0) {
      medicationName = 'unknown medication'
    }

    // Validate input data first
    const inputValidation = validatePatientData(
      patientData.age,
      patientData.ageUnit,
      patientData.weight,
      patientData.weightUnit
    )

    const result: SafeMedicalCalculation = {
      result: 0,
      validation: inputValidation,
      inputValidation,
      isRecommended: false,
      warnings: []
    }

    // If input validation fails, return early
    if (!inputValidation.isValid) {
      result.warnings.push('Cannot calculate dosage due to invalid patient data')
      return result
    }

    // Convert weight to kg for calculation
    const weightValue = parseFloat(patientData.weight)
    if (isNaN(weightValue) || weightValue <= 0) {
      throw new Error(`Invalid weight value: ${patientData.weight}`)
    }
    
    const weightInKg = convertWeightToKg(weightValue, patientData.weightUnit)
    
    if (!isFinite(weightInKg) || weightInKg <= 0) {
      throw new Error('Weight conversion resulted in invalid value')
    }

    // Calculate dosage with overflow protection
    const calculatedDose = dosePerKg * weightInKg
    
    if (!isFinite(calculatedDose) || calculatedDose <= 0) {
      throw new Error('Dosage calculation resulted in invalid value')
    }
    
    // Check for unreasonably high doses (safety check)
    if (calculatedDose > 10000) { // 10g is unreasonably high for most medications
      throw new Error(`Calculated dose (${calculatedDose.toFixed(1)}mg) is unreasonably high. Please verify inputs.`)
    }
    
    result.result = calculatedDose

    // Validate the calculated dosage
    const dosageValidation = validateDosage(
      calculatedDose,
      weightInKg,
      medicationName,
      maxDoseValue
    )

    result.validation = dosageValidation
    result.isRecommended = dosageValidation.isValid && dosageValidation.safetyLevel === 'safe'
    result.warnings = [...inputValidation.warnings, ...dosageValidation.warnings]

    // Add additional safety warnings for high-risk calculations
    if (dosageValidation.safetyLevel === 'danger') {
      result.warnings.push('High-risk dosage calculated. Double-check all inputs and consult medical references.')
    }

    return result
    
  } catch (error) {
    console.error('Error in calculateSafeDosage:', error)
    
    // Return error state with safe defaults
    return {
      result: 0,
      validation: {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown calculation error'],
        warnings: ['Calculation failed - please verify all inputs'],
        safetyLevel: 'danger'
      },
      inputValidation: {
        isValid: false,
        errors: ['Input validation failed'],
        warnings: [],
        safetyLevel: 'danger'
      },
      isRecommended: false,
      warnings: [
        'Calculation failed due to an error',
        'Please check patient data and medication selection',
        error instanceof Error ? error.message : 'Unknown error occurred'
      ]
    }
  }
}

/**
 * Calculate recommended dose range for safety assessment with error handling
 */
export function calculateDoseRange(
  weightKg: number,
  minDosePerKg: number,
  maxDosePerKg: number,
  absoluteMax?: number
): { minDose: number; maxDose: number; recommendedDose: number; safetyLevel: 'safe' | 'caution' | 'danger' } {
  try {
    // Input validation
    if (!isFinite(weightKg) || weightKg <= 0) {
      throw new Error(`Invalid weight: ${weightKg}`)
    }
    
    if (!isFinite(minDosePerKg) || minDosePerKg < 0) {
      throw new Error(`Invalid minimum dose per kg: ${minDosePerKg}`)
    }
    
    if (!isFinite(maxDosePerKg) || maxDosePerKg < 0) {
      throw new Error(`Invalid maximum dose per kg: ${maxDosePerKg}`)
    }
    
    if (minDosePerKg > maxDosePerKg) {
      throw new Error(`Minimum dose (${minDosePerKg}) cannot be greater than maximum dose (${maxDosePerKg})`)
    }
    
    if (absoluteMax !== undefined && (!isFinite(absoluteMax) || absoluteMax <= 0)) {
      console.warn('Invalid absolute maximum dose, ignoring:', absoluteMax)
      absoluteMax = undefined
    }
    
    const minDose = minDosePerKg * weightKg
    const maxDose = maxDosePerKg * weightKg
    const recommendedDose = (minDose + maxDose) / 2
    
    // Validate calculated doses
    if (!isFinite(minDose) || !isFinite(maxDose) || !isFinite(recommendedDose)) {
      throw new Error('Dose calculation resulted in invalid values')
    }
    
    let safetyLevel: 'safe' | 'caution' | 'danger' = 'safe'
    
    if (absoluteMax) {
      if (recommendedDose > absoluteMax) {
        safetyLevel = 'danger'
      } else if (recommendedDose > absoluteMax * 0.8) {
        safetyLevel = 'caution'
      }
    }
    
    return {
      minDose: Math.round(minDose * 100) / 100,
      maxDose: Math.round(maxDose * 100) / 100,
      recommendedDose: Math.round(recommendedDose * 100) / 100,
      safetyLevel
    }
    
  } catch (error) {
    console.error('Dose range calculation error:', error)
    
    // Return safe defaults
    return {
      minDose: 0,
      maxDose: 0,
      recommendedDose: 0,
      safetyLevel: 'danger'
    }
  }
}

/**
 * Calculate surface area-based dosing for chemotherapy and specialized medications with error handling
 */
export function calculateBSABasedDose(
  patientData: PatientData,
  dosePerM2: number,
  maxDoseValue?: number
): SafeMedicalCalculation {
  try {
    const result: SafeMedicalCalculation = {
      result: 0,
      validation: { isValid: false, errors: [], warnings: [], safetyLevel: 'safe' },
      inputValidation: { isValid: false, errors: [], warnings: [], safetyLevel: 'safe' },
      isRecommended: false,
      warnings: []
    }
    
    // Input validation
    if (!patientData) {
      throw new Error('Patient data is required for BSA calculation')
    }
    
    if (!dosePerM2 || dosePerM2 <= 0 || !isFinite(dosePerM2)) {
      throw new Error('Invalid dose per m² value')
    }
    
    // Require height for BSA calculation
    if (!patientData.height || patientData.height.trim() === '') {
      result.warnings.push('Height required for BSA-based dosing')
      result.validation.errors.push('Height is required for body surface area calculation')
      return result
    }
    
    // Calculate BSA with error handling
    const bsaResult = calculateBSA(patientData)
    if (!bsaResult || bsaResult.bsa <= 0) {
      result.warnings.push('Unable to calculate body surface area from provided measurements')
      result.validation.errors.push('BSA calculation failed')
      return result
    }
    
    // Validate BSA is reasonable (0.1 to 3.0 m² for pediatric patients)
    if (bsaResult.bsa < 0.1 || bsaResult.bsa > 3.0) {
      result.warnings.push(`Unusual BSA calculated (${bsaResult.bsa.toFixed(2)} m²). Please verify height and weight.`)
      result.validation.safetyLevel = 'caution'
    }
    
    // Calculate dose with overflow protection
    const calculatedDose = dosePerM2 * bsaResult.bsa
    
    if (!isFinite(calculatedDose) || calculatedDose <= 0) {
      throw new Error('BSA-based dose calculation resulted in invalid value')
    }
    
    result.result = calculatedDose
    
    // Validate against maximum
    if (maxDoseValue && calculatedDose > maxDoseValue) {
      result.warnings.push(`BSA-based dose (${calculatedDose.toFixed(1)}mg) exceeds maximum dose (${maxDoseValue}mg)`)
      result.validation.safetyLevel = 'caution'
    }
    
    result.validation.isValid = true
    result.inputValidation.isValid = true
    result.isRecommended = result.validation.safetyLevel === 'safe'
    
    return result
    
  } catch (error) {
    console.error('Error in calculateBSABasedDose:', error)
    
    return {
      result: 0,
      validation: {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'BSA calculation failed'],
        warnings: ['BSA-based dosing calculation failed'],
        safetyLevel: 'danger'
      },
      inputValidation: {
        isValid: false,
        errors: ['Input validation failed for BSA calculation'],
        warnings: [],
        safetyLevel: 'danger'
      },
      isRecommended: false,
      warnings: [
        'BSA calculation failed',
        error instanceof Error ? error.message : 'Unknown error in BSA calculation'
      ]
    }
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

// Calculate Body Surface Area using Mosteller formula with error handling
export function calculateBSA(patientData: PatientData): BSAResult | null {
  try {
    if (!patientData) {
      console.error('BSA calculation: Patient data is required')
      return null
    }
    
    const weight = parseFloat(patientData.weight || '0')
    const height = parseFloat(patientData.height || '0')
    
    if (!weight || weight <= 0) {
      console.error('BSA calculation: Invalid weight value:', patientData.weight)
      return null
    }
    
    if (!height || height <= 0) {
      console.error('BSA calculation: Invalid height value:', patientData.height)
      return null
    }
    
    const weightKg = convertToKg(weight, patientData.weightUnit || 'kg')
    const heightCm = convertToCm(height, patientData.heightUnit || 'cm')
    
    // Validate converted values
    if (!isFinite(weightKg) || weightKg <= 0 || weightKg > 200) {
      console.error('BSA calculation: Invalid weight in kg:', weightKg)
      return null
    }
    
    if (!isFinite(heightCm) || heightCm <= 0 || heightCm > 300) {
      console.error('BSA calculation: Invalid height in cm:', heightCm)
      return null
    }
    
    // Mosteller formula: BSA (m²) = √[(height cm × weight kg) / 3600]
    const bsaSquared = (heightCm * weightKg) / 3600
    
    if (bsaSquared <= 0) {
      console.error('BSA calculation: Invalid BSA squared value:', bsaSquared)
      return null
    }
    
    const bsa = Math.sqrt(bsaSquared)
    
    if (!isFinite(bsa) || bsa <= 0) {
      console.error('BSA calculation: Invalid final BSA value:', bsa)
      return null
    }
    
    return {
      bsa: Math.round(bsa * 100) / 100,
      method: 'Mosteller formula'
    }
    
  } catch (error) {
    console.error('BSA calculation error:', error, patientData)
    return null
  }
}

// Calculate maintenance fluid requirements (Holliday-Segar method) with error handling
export function calculateFluidRequirements(patientData: PatientData): FluidResult | null {
  try {
    if (!patientData) {
      console.error('Fluid calculation: Patient data is required')
      return null
    }
    
    const weight = parseFloat(patientData.weight || '0')
    
    if (!weight || weight <= 0) {
      console.error('Fluid calculation: Invalid weight value:', patientData.weight)
      return null
    }
    
    const weightKg = convertToKg(weight, patientData.weightUnit || 'kg')
    
    if (!isFinite(weightKg) || weightKg <= 0) {
      console.error('Fluid calculation: Invalid weight in kg:', weightKg)
      return null
    }
    
    // Validate weight is reasonable for pediatric patients
    if (weightKg > 150) {
      console.warn('Fluid calculation: Weight above typical pediatric range:', weightKg, 'kg')
    }
    
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
    
    if (!isFinite(maintenance) || maintenance <= 0) {
      console.error('Fluid calculation: Invalid maintenance fluid value:', maintenance)
      return null
    }
    
    const hourly = maintenance / 24
    
    if (!isFinite(hourly) || hourly <= 0) {
      console.error('Fluid calculation: Invalid hourly rate:', hourly)
      return null
    }
    
    return {
      maintenance: Math.round(maintenance),
      total24h: Math.round(maintenance),
      hourly: Math.round(hourly * 10) / 10 // Round to 1 decimal place
    }
    
  } catch (error) {
    console.error('Fluid requirements calculation error:', error, patientData)
    return null
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

/**
 * Get age-appropriate emergency drug calculations with error handling
 */
export function getEmergencyDrugs(weightKg: number, ageInMonths?: number): EmergencyDrug[] {
  try {
    // Input validation
    if (!weightKg || weightKg <= 0 || !isFinite(weightKg)) {
      console.error('Emergency drugs calculation: Invalid weight value:', weightKg)
      return []
    }
    
    if (weightKg > 150) {
      console.warn('Emergency drugs calculation: Weight above typical pediatric range:', weightKg, 'kg')
    }
    
    if (ageInMonths !== undefined && (ageInMonths < 0 || !isFinite(ageInMonths))) {
      console.error('Emergency drugs calculation: Invalid age value:', ageInMonths)
      ageInMonths = undefined
    }
    
    const drugs: EmergencyDrug[] = []
    
    // Calculate safe doses with bounds checking
    const epinephrineDose = Math.min(weightKg * 0.01, 1.0) // Cap at 1mg
    const epinephrineVolume = Math.min(weightKg * 0.1, 10.0) // Cap at 10mL
    
    drugs.push({
      name: 'Epinephrine',
      indication: 'Cardiac arrest',
      dose: `${epinephrineDose.toFixed(2)} mg (${epinephrineVolume.toFixed(1)} mL of 1:10,000)`,
      route: 'IV/IO',
      notes: 'Repeat every 3-5 minutes'
    })
    
    const adenosineFirst = Math.min(weightKg * 0.1, 6.0) // Cap at 6mg
    const adenosineSecond = Math.min(weightKg * 0.2, 12.0) // Cap at 12mg
    
    drugs.push({
      name: 'Adenosine',
      indication: 'SVT',
      dose: `${adenosineFirst.toFixed(1)} mg (first dose), ${adenosineSecond.toFixed(1)} mg (second dose)`,
      route: 'IV/IO rapid push',
      notes: 'Follow with rapid saline flush'
    })
    
    const atropineDose = Math.max(0.1, Math.min(weightKg * 0.02, 0.5))
    
    drugs.push({
      name: 'Atropine',
      indication: 'Bradycardia',
      dose: `${atropineDose.toFixed(2)} mg`,
      route: 'IV/IO',
      notes: 'Minimum 0.1 mg, maximum 0.5 mg'
    })
    
    const amiodaroneDose = Math.min(weightKg * 5, 300) // Cap at 300mg
    
    drugs.push({
      name: 'Amiodarone',
      indication: 'VT/VF',
      dose: `${amiodaroneDose.toFixed(1)} mg`,
      route: 'IV/IO',
      notes: 'May repeat once'
    })
    
    // Add age-specific modifications with safety checks
    if (ageInMonths !== undefined) {
      // Neonate modifications
      if (ageInMonths <= 1) {
        const glucoseVolume = Math.min(weightKg * 2, 10) // Cap at 10mL
        const glucoseGrams = glucoseVolume * 0.1 // 10% glucose
        
        drugs.push({
          name: 'Glucose 10%',
          indication: 'Hypoglycemia',
          dose: `${glucoseVolume.toFixed(1)} mL (${glucoseGrams.toFixed(1)} g)`,
          route: 'IV/IO',
          notes: 'Neonatal concentration - avoid 25% glucose'
        })
      }
      
      // Pediatric additions
      if (ageInMonths >= 12) {
        const lidocaineBolus = Math.min(weightKg * 1, 100) // Cap at 100mg
        const lidocaineInfusion = Math.min(weightKg * 20, 4000) // Cap at 4000 mcg/kg/min
        
        drugs.push({
          name: 'Lidocaine',
          indication: 'VT with pulse',
          dose: `${lidocaineBolus.toFixed(1)} mg bolus, then ${lidocaineInfusion.toFixed(0)} mcg/kg/min infusion`,
          route: 'IV/IO',
          notes: 'Loading dose followed by continuous infusion'
        })
      }
    }
    
    return drugs
    
  } catch (error) {
    console.error('Emergency drugs calculation error:', error)
    return []
  }
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
    cmToInchesRemainder: (cm: number) => Math.round((cm * 0.393701) % 12),
    mToFeet: (m: number) => Math.floor(m * 3.28084),
    mToInchesRemainder: (m: number) => Math.round((m * 39.3701) % 12)
  },
  temperature: {
    celsiusToFahrenheit: (c: number) => (c * 9/5) + 32,
    fahrenheitToCelsius: (f: number) => (f - 32) * 5/9
  }
}