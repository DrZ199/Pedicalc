// Medical Input Validation Library
// Comprehensive validation for pediatric medical calculations

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  normalizedValue?: number
  safetyLevel: 'safe' | 'caution' | 'danger'
}

// Age validation ranges (in months)
export const AGE_LIMITS = {
  MIN_NEONATE: 0, // Birth
  MAX_NEONATE: 1, // 1 month
  MIN_INFANT: 0,
  MAX_INFANT: 12, // 12 months
  MIN_TODDLER: 12,
  MAX_TODDLER: 36, // 3 years
  MIN_CHILD: 36,
  MAX_CHILD: 216, // 18 years
  ABSOLUTE_MAX: 216 // 18 years maximum
} as const

// Weight validation ranges (in kg)
export const WEIGHT_LIMITS = {
  MIN_NEONATE: 0.5, // 500g minimum viable
  MAX_NEONATE: 6,   // Large neonate
  MIN_INFANT: 2,    // Small infant
  MAX_INFANT: 15,   // Large 1-year-old
  MIN_CHILD: 8,     // Small toddler
  MAX_CHILD: 100,   // Large adolescent
  ABSOLUTE_MIN: 0.5,
  ABSOLUTE_MAX: 100
} as const

// Height validation ranges (in cm)
export const HEIGHT_LIMITS = {
  MIN_NEONATE: 30,  // Very premature
  MAX_NEONATE: 55,  // Large term baby
  MIN_INFANT: 45,   // Small infant
  MAX_INFANT: 80,   // Large 1-year-old
  MIN_CHILD: 70,    // Small toddler
  MAX_CHILD: 200,   // Tall adolescent
  ABSOLUTE_MIN: 30,
  ABSOLUTE_MAX: 200
} as const

// Dosage validation ranges (mg/kg)
export const DOSAGE_LIMITS = {
  MIN_DOSE: 0.001,    // 1 microgram per kg
  MAX_DOSE: 100,      // 100 mg per kg (very high)
  TYPICAL_MAX: 50,    // Typical maximum
  DANGER_THRESHOLD: 75 // Above this is dangerous
} as const

/**
 * Convert age to months for consistent calculations
 */
export function convertAgeToMonths(age: number, unit: 'years' | 'months' | 'days'): number {
  switch (unit) {
    case 'years': return age * 12
    case 'days': return age / 30.44 // Average days per month
    default: return age
  }
}

/**
 * Convert weight to kg for consistent calculations
 */
export function convertWeightToKg(weight: number, unit: 'kg' | 'lbs'): number {
  return unit === 'lbs' ? weight * 0.453592 : weight
}

/**
 * Validate age input with pediatric-specific ranges
 */
export function validateAge(age: string, ageUnit: 'years' | 'months' | 'days'): ValidationResult {
  const result: ValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    safetyLevel: 'safe'
  }

  // Check if empty or invalid
  if (!age || age.trim() === '') {
    result.errors.push('Age is required')
    result.safetyLevel = 'danger'
    return result
  }

  const ageNum = parseFloat(age.trim())
  
  // Check if numeric
  if (isNaN(ageNum)) {
    result.errors.push('Age must be a valid number')
    result.safetyLevel = 'danger'
    return result
  }

  // Check for negative values
  if (ageNum <= 0) {
    result.errors.push('Age must be greater than zero')
    result.safetyLevel = 'danger'
    return result
  }

  // Check for decimal precision issues
  const decimalPart = ageNum.toString().split('.')[1]
  if (decimalPart && decimalPart.length > 2) {
    result.warnings.push('Age should not have more than 2 decimal places for accuracy')
  }

  // Convert to months for validation
  const ageInMonths = convertAgeToMonths(ageNum, ageUnit)
  result.normalizedValue = ageInMonths

  // Validate against pediatric ranges
  if (ageInMonths > AGE_LIMITS.ABSOLUTE_MAX) {
    result.errors.push(`Patient age exceeds pediatric range (maximum 18 years)`)
    result.safetyLevel = 'danger'
    return result
  }

  // Age-specific warnings and checks
  if (ageInMonths <= AGE_LIMITS.MAX_NEONATE) {
    result.warnings.push('Neonate detected: Use extreme caution with dosing. Consider neonatal-specific guidelines.')
    result.safetyLevel = 'caution'
  } else if (ageInMonths <= AGE_LIMITS.MAX_INFANT) {
    result.warnings.push('Infant detected: Verify weight-based dosing is appropriate.')
  }

  // Unit-specific validation
  if (ageUnit === 'years' && ageNum > 18) {
    result.errors.push('Maximum age for pediatric calculations is 18 years')
    result.safetyLevel = 'danger'
    return result
  }

  if (ageUnit === 'days' && ageNum > 6570) { // 18 years in days
    result.errors.push('Age in days exceeds pediatric range')
    result.safetyLevel = 'danger'
    return result
  }

  if (ageUnit === 'days' && ageNum < 1) {
    result.errors.push('Age must be at least 1 day')
    result.safetyLevel = 'danger'
    return result
  }

  result.isValid = true
  return result
}

/**
 * Validate weight input with pediatric-specific ranges
 */
export function validateWeight(weight: string, weightUnit: 'kg' | 'lbs', ageInMonths?: number): ValidationResult {
  const result: ValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    safetyLevel: 'safe'
  }

  // Check if empty or invalid
  if (!weight || weight.trim() === '') {
    result.errors.push('Weight is required')
    result.safetyLevel = 'danger'
    return result
  }

  const weightNum = parseFloat(weight.trim())
  
  // Check if numeric
  if (isNaN(weightNum)) {
    result.errors.push('Weight must be a valid number')
    result.safetyLevel = 'danger'
    return result
  }

  // Check for negative values
  if (weightNum <= 0) {
    result.errors.push('Weight must be greater than zero')
    result.safetyLevel = 'danger'
    return result
  }

  // Convert to kg for validation
  const weightInKg = convertWeightToKg(weightNum, weightUnit)
  result.normalizedValue = weightInKg

  // Check absolute limits
  if (weightInKg < WEIGHT_LIMITS.ABSOLUTE_MIN) {
    result.errors.push(`Weight too low for safe calculations (minimum ${WEIGHT_LIMITS.ABSOLUTE_MIN}kg)`)
    result.safetyLevel = 'danger'
    return result
  }

  if (weightInKg > WEIGHT_LIMITS.ABSOLUTE_MAX) {
    result.errors.push(`Weight exceeds pediatric range (maximum ${WEIGHT_LIMITS.ABSOLUTE_MAX}kg)`)
    result.safetyLevel = 'danger'
    return result
  }

  // Age-based weight validation if age is provided
  if (ageInMonths !== undefined) {
    if (ageInMonths <= AGE_LIMITS.MAX_NEONATE) {
      if (weightInKg < WEIGHT_LIMITS.MIN_NEONATE || weightInKg > WEIGHT_LIMITS.MAX_NEONATE) {
        result.warnings.push(`Weight unusual for neonate (typical range: ${WEIGHT_LIMITS.MIN_NEONATE}-${WEIGHT_LIMITS.MAX_NEONATE}kg)`)
        result.safetyLevel = 'caution'
      }
    } else if (ageInMonths <= AGE_LIMITS.MAX_INFANT) {
      if (weightInKg < WEIGHT_LIMITS.MIN_INFANT || weightInKg > WEIGHT_LIMITS.MAX_INFANT) {
        result.warnings.push(`Weight unusual for infant age (typical range: ${WEIGHT_LIMITS.MIN_INFANT}-${WEIGHT_LIMITS.MAX_INFANT}kg)`)
        result.safetyLevel = 'caution'
      }
    }
  }

  // Precision warnings
  const weightDecimalPart = weightNum.toString().split('.')[1]
  if (weightInKg < 1 && weightDecimalPart && weightDecimalPart.length > 3) {
    result.warnings.push('For weights under 1kg, consider using grams for better precision')
  }

  // Very low weight warning
  if (weightInKg < 2.5) {
    result.warnings.push('Very low birth weight detected: Consider specialized neonatal guidelines')
    result.safetyLevel = 'caution'
  }

  result.isValid = true
  return result
}

/**
 * Validate calculated dosage against safety limits
 */
export function validateDosage(
  calculatedDose: number, 
  weightInKg: number, 
  medication: string,
  maxDoseValue?: number
): ValidationResult {
  const result: ValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    normalizedValue: calculatedDose,
    safetyLevel: 'safe'
  }

  // Check for invalid calculations
  if (isNaN(calculatedDose) || !isFinite(calculatedDose)) {
    result.errors.push('Invalid dosage calculation result')
    result.safetyLevel = 'danger'
    return result
  }

  if (calculatedDose <= 0) {
    result.errors.push('Calculated dosage must be greater than zero')
    result.safetyLevel = 'danger'
    return result
  }

  // Calculate dose per kg
  const dosePerKg = calculatedDose / weightInKg

  // Check against absolute dosage limits
  if (dosePerKg > DOSAGE_LIMITS.MAX_DOSE) {
    result.errors.push(`Calculated dose exceeds maximum safe limit (${DOSAGE_LIMITS.MAX_DOSE} mg/kg)`)
    result.safetyLevel = 'danger'
    return result
  }

  if (dosePerKg > DOSAGE_LIMITS.DANGER_THRESHOLD) {
    result.warnings.push(`High dose calculated (${dosePerKg.toFixed(2)} mg/kg). Verify calculation and consider specialist consultation.`)
    result.safetyLevel = 'danger'
  } else if (dosePerKg > DOSAGE_LIMITS.TYPICAL_MAX) {
    result.warnings.push(`Dose above typical range (${dosePerKg.toFixed(2)} mg/kg). Double-check calculation.`)
    result.safetyLevel = 'caution'
  }

  // Check against medication-specific maximum dose
  if (maxDoseValue && calculatedDose > maxDoseValue) {
    result.warnings.push(`Calculated dose (${calculatedDose.toFixed(1)}mg) exceeds maximum recommended dose for ${medication} (${maxDoseValue}mg)`)
    result.safetyLevel = 'caution'
  }

  // Very low dose warning
  if (dosePerKg < DOSAGE_LIMITS.MIN_DOSE) {
    result.warnings.push('Very low dose calculated. Verify medication and calculation.')
    result.safetyLevel = 'caution'
  }

  result.isValid = true
  return result
}

/**
 * Comprehensive validation for complete patient data
 */
export function validatePatientData(
  age: string,
  ageUnit: 'years' | 'months' | 'days',
  weight: string,
  weightUnit: 'kg' | 'lbs'
): ValidationResult {
  const result: ValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    safetyLevel: 'safe'
  }

  // Validate age
  const ageValidation = validateAge(age, ageUnit)
  result.errors.push(...ageValidation.errors)
  result.warnings.push(...ageValidation.warnings)

  if (!ageValidation.isValid) {
    result.safetyLevel = ageValidation.safetyLevel
    return result
  }

  // Validate weight with age context
  const weightValidation = validateWeight(weight, weightUnit, ageValidation.normalizedValue)
  result.errors.push(...weightValidation.errors)
  result.warnings.push(...weightValidation.warnings)

  if (!weightValidation.isValid) {
    result.safetyLevel = weightValidation.safetyLevel
    return result
  }

  // Determine overall safety level
  if (ageValidation.safetyLevel === 'danger' || weightValidation.safetyLevel === 'danger') {
    result.safetyLevel = 'danger'
  } else if (ageValidation.safetyLevel === 'caution' || weightValidation.safetyLevel === 'caution') {
    result.safetyLevel = 'caution'
  }

  result.isValid = ageValidation.isValid && weightValidation.isValid
  return result
}

/**
 * Format validation errors and warnings for display
 */
export function formatValidationMessages(validation: ValidationResult): {
  errorMessage?: string
  warningMessage?: string
  safetyClass: string
} {
  const result: {
    errorMessage?: string
    warningMessage?: string
    safetyClass: string
  } = {
    safetyClass: validation.safetyLevel === 'danger' 
      ? 'text-red-600 bg-red-50 border-red-200'
      : validation.safetyLevel === 'caution'
      ? 'text-orange-600 bg-orange-50 border-orange-200'
      : 'text-green-600 bg-green-50 border-green-200'
  }

  if (validation.errors.length > 0) {
    result.errorMessage = validation.errors.join('. ') + '.'
  }

  if (validation.warnings.length > 0) {
    result.warningMessage = validation.warnings.join('. ') + '.'
  }

  return result
}