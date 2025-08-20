// Comprehensive Error Handling Utilities
// Provides consistent error handling across the PediCalc application

export interface ErrorInfo {
  message: string
  code?: string | number
  context: string
  timestamp: Date
  userAgent?: string
  url?: string
}

export interface ErrorResponse {
  success: false
  error: ErrorInfo
  userMessage: string
  shouldRetry: boolean
  retryAfter?: number
}

export interface SuccessResponse<T = any> {
  success: true
  data: T
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse

// Error types for categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  MEDICAL_CALCULATION = 'MEDICAL_CALCULATION',
  DATABASE = 'DATABASE',
  AUTHENTICATION = 'AUTHENTICATION',
  PERMISSION = 'PERMISSION',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Medical safety error classification
export enum MedicalSafetyLevel {
  SAFE = 'SAFE',
  CAUTION = 'CAUTION',
  DANGER = 'DANGER',
  CRITICAL = 'CRITICAL'
}

export interface ClassifiedError extends ErrorInfo {
  type: ErrorType
  severity: ErrorSeverity
  medicalSafety?: MedicalSafetyLevel
  isRetryable: boolean
  requiresUserAction: boolean
}

/**
 * Classify an error based on its characteristics
 */
export function classifyError(error: unknown, context: string): ClassifiedError {
  const baseError: ErrorInfo = {
    message: 'Unknown error occurred',
    context,
    timestamp: new Date(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined
  }

  let type = ErrorType.UNKNOWN
  let severity = ErrorSeverity.MEDIUM
  let medicalSafety: MedicalSafetyLevel | undefined
  let isRetryable = false
  let requiresUserAction = true

  if (error instanceof Error) {
    baseError.message = error.message

    // Network errors
    if (error.message.includes('fetch') || 
        error.message.includes('network') || 
        error.message.includes('connection') ||
        error.message.includes('timeout')) {
      type = ErrorType.NETWORK
      severity = ErrorSeverity.HIGH
      isRetryable = true
      requiresUserAction = false
    }
    
    // Database errors
    else if (error.message.includes('database') || 
             error.message.includes('supabase') ||
             error.message.includes('query') ||
             error.message.includes('table')) {
      type = ErrorType.DATABASE
      severity = ErrorSeverity.HIGH
      isRetryable = true
    }
    
    // Medical calculation errors
    else if (context.includes('calculation') || 
             context.includes('dosage') || 
             context.includes('medical') ||
             error.message.includes('dose') ||
             error.message.includes('calculation')) {
      type = ErrorType.MEDICAL_CALCULATION
      severity = ErrorSeverity.CRITICAL
      medicalSafety = MedicalSafetyLevel.DANGER
      isRetryable = false
      requiresUserAction = true
    }
    
    // Validation errors
    else if (error.message.includes('validation') || 
             error.message.includes('invalid') ||
             error.message.includes('required') ||
             context.includes('validation')) {
      type = ErrorType.VALIDATION
      severity = ErrorSeverity.MEDIUM
      medicalSafety = MedicalSafetyLevel.CAUTION
      isRetryable = false
      requiresUserAction = true
    }
    
    // Authentication/permission errors
    else if (error.message.includes('auth') || 
             error.message.includes('unauthorized') ||
             error.message.includes('permission')) {
      type = ErrorType.AUTHENTICATION
      severity = ErrorSeverity.HIGH
      isRetryable = false
      requiresUserAction = true
    }
    
    // Rate limiting
    else if (error.message.includes('rate limit') || 
             error.message.includes('too many requests')) {
      type = ErrorType.RATE_LIMIT
      severity = ErrorSeverity.MEDIUM
      isRetryable = true
      requiresUserAction = false
    }
  }
  
  // Handle non-Error objects
  else if (typeof error === 'string') {
    baseError.message = error
  } else if (error && typeof error === 'object') {
    baseError.message = JSON.stringify(error)
  }

  return {
    ...baseError,
    type,
    severity,
    medicalSafety,
    isRetryable,
    requiresUserAction
  }
}

/**
 * Generate user-friendly error message
 */
export function getUserFriendlyMessage(classifiedError: ClassifiedError): string {
  switch (classifiedError.type) {
    case ErrorType.NETWORK:
      return 'Network connection issue. Please check your internet connection and try again.'
    
    case ErrorType.DATABASE:
      return 'Unable to access medication database. Please try again in a moment.'
    
    case ErrorType.MEDICAL_CALCULATION:
      return 'Error in medical calculation. Please verify patient data and medication selection.'
    
    case ErrorType.VALIDATION:
      return 'Please check your input values and correct any errors highlighted.'
    
    case ErrorType.AUTHENTICATION:
      return 'Authentication required. Please sign in to continue.'
    
    case ErrorType.RATE_LIMIT:
      return 'Too many requests. Please wait a moment before trying again.'
    
    case ErrorType.SERVER:
      return 'Server error occurred. Please try again later.'
    
    default:
      return classifiedError.message || 'An unexpected error occurred. Please try again.'
  }
}

/**
 * Handle async operations with comprehensive error handling
 */
export async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  context: string,
  retries: number = 0
): Promise<ApiResponse<T>> {
  try {
    const result = await operation()
    return {
      success: true,
      data: result
    }
  } catch (error) {
    const classifiedError = classifyError(error, context)
    const userMessage = getUserFriendlyMessage(classifiedError)
    
    // Log error for debugging
    console.error(`Error in ${context}:`, classifiedError)
    
    // Determine if retry is appropriate
    const shouldRetry = classifiedError.isRetryable && retries > 0
    const retryAfter = classifiedError.type === ErrorType.RATE_LIMIT ? 1000 : 500
    
    // Send to error reporting service in production
    if (import.meta.env.PROD) {
      reportError(classifiedError)
    }
    
    return {
      success: false,
      error: classifiedError,
      userMessage,
      shouldRetry,
      retryAfter: shouldRetry ? retryAfter : undefined
    }
  }
}

/**
 * Retry mechanism for failed operations
 */
export async function retryAsyncOperation<T>(
  operation: () => Promise<T>,
  context: string,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<ApiResponse<T>> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await safeAsyncOperation(operation, context, maxRetries - attempt)
    
    if (result.success || !result.shouldRetry) {
      return result
    }
    
    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries) {
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // All retries failed
  return safeAsyncOperation(operation, context, 0)
}

/**
 * Error reporting function (placeholder for production logging service)
 */
function reportError(error: ClassifiedError) {
  // In production, send to error reporting service like Sentry, LogRocket, etc.
  console.warn('Error would be reported to logging service:', error)
  
  // Example integration:
  // Sentry.captureException(error, {
  //   tags: {
  //     type: error.type,
  //     severity: error.severity,
  //     context: error.context
  //   }
  // })
}

/**
 * Medical calculation error handler with enhanced safety checks
 */
export function handleMedicalError(
  error: unknown,
  patientData: any,
  medication: any
): ApiResponse<never> {
  const classifiedError = classifyError(error, 'medical_calculation')
  
  // Enhanced error message for medical calculations
  let userMessage = getUserFriendlyMessage(classifiedError)
  
  // Add medical safety context
  if (classifiedError.medicalSafety === MedicalSafetyLevel.DANGER || 
      classifiedError.medicalSafety === MedicalSafetyLevel.CRITICAL) {
    userMessage += ' For patient safety, please double-check all inputs and consult appropriate medical references.'
  }
  
  // Log critical medical errors with additional context
  console.error('Medical calculation error:', {
    error: classifiedError,
    patientData: {
      age: patientData?.age,
      ageUnit: patientData?.ageUnit,
      weight: patientData?.weight,
      weightUnit: patientData?.weightUnit
    },
    medication: {
      name: medication?.name,
      id: medication?.id
    },
    timestamp: new Date().toISOString()
  })
  
  return {
    success: false,
    error: {
      ...classifiedError,
      medicalSafety: MedicalSafetyLevel.CRITICAL
    },
    userMessage,
    shouldRetry: false
  }
}

/**
 * React error boundary error handler
 */
export function handleReactError(error: Error, errorInfo: any): ClassifiedError {
  const classifiedError = classifyError(error, 'react_component')
  
  // Add component stack information
  const enhancedError: ClassifiedError = {
    ...classifiedError,
    message: `React Error: ${error.message}`,
    code: 'REACT_ERROR',
    severity: ErrorSeverity.HIGH,
    type: ErrorType.CLIENT
  }
  
  // Log React errors with component stack
  console.error('React component error:', {
    error: enhancedError,
    componentStack: errorInfo?.componentStack,
    errorBoundary: true
  })
  
  return enhancedError
}

/**
 * Network request error handler
 */
export function handleNetworkError(error: unknown, endpoint: string): ApiResponse<never> {
  const classifiedError = classifyError(error, `network_request_${endpoint}`)
  classifiedError.code = 'NETWORK_ERROR'
  
  const userMessage = navigator.onLine 
    ? 'Unable to connect to server. Please try again.'
    : 'You appear to be offline. Please check your internet connection.'
  
  return {
    success: false,
    error: classifiedError,
    userMessage,
    shouldRetry: navigator.onLine
  }
}

/**
 * Form validation error handler
 */
export function handleValidationError(
  fieldErrors: { field: string; message: string }[]
): ApiResponse<never> {
  const primaryError = fieldErrors[0] || { field: 'unknown', message: 'Validation failed' }
  
  const classifiedError = classifyError(
    new Error(primaryError.message),
    `form_validation_${primaryError.field}`
  )
  
  const userMessage = fieldErrors.length === 1 
    ? `${primaryError.field}: ${primaryError.message}`
    : `Please correct ${fieldErrors.length} form errors.`
  
  return {
    success: false,
    error: classifiedError,
    userMessage,
    shouldRetry: false
  }
}