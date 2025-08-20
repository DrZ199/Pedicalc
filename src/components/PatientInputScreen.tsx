import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react'
import {
  validatePatientData,
  formatValidationMessages,
  type ValidationResult
} from '@/lib/medical-validation'
import { SimpleErrorBoundary } from '@/components/ErrorBoundary'

interface PatientData {
  age: string
  ageUnit: 'years' | 'months' | 'days'
  weight: string
  weightUnit: 'kg' | 'lbs'
}

interface PatientInputScreenProps {
  patientData: PatientData
  progress: number
  patientValidation: ValidationResult | null
  onPatientDataChange: (data: PatientData) => void
  onValidationChange: (validation: ValidationResult | null) => void
  onNext: () => void
  onBack: () => void
}

interface InputError {
  field: string
  message: string
}

interface FormState {
  errors: InputError[]
  touched: { [key: string]: boolean }
  isSubmitting: boolean
}

export function PatientInputScreen({ 
  patientData, 
  progress,
  patientValidation,
  onPatientDataChange, 
  onValidationChange,
  onNext, 
  onBack 
}: PatientInputScreenProps) {
  const [formState, setFormState] = useState<FormState>({
    errors: [],
    touched: {},
    isSubmitting: false
  })
  
  // Real-time input validation
  const validateInput = (field: string, value: string) => {
    const errors: InputError[] = []
    
    if (field === 'age') {
      if (!value || value.trim() === '') {
        errors.push({ field: 'age', message: 'Age is required' })
      } else if (isNaN(parseFloat(value))) {
        errors.push({ field: 'age', message: 'Age must be a valid number' })
      } else if (parseFloat(value) <= 0) {
        errors.push({ field: 'age', message: 'Age must be greater than zero' })
      }
    }
    
    if (field === 'weight') {
      if (!value || value.trim() === '') {
        errors.push({ field: 'weight', message: 'Weight is required' })
      } else if (isNaN(parseFloat(value))) {
        errors.push({ field: 'weight', message: 'Weight must be a valid number' })
      } else if (parseFloat(value) <= 0) {
        errors.push({ field: 'weight', message: 'Weight must be greater than zero' })
      }
    }
    
    return errors
  }
  
  // Update form state errors
  const updateFieldErrors = (field: string, value: string) => {
    const fieldErrors = validateInput(field, value)
    
    setFormState(prev => ({
      ...prev,
      errors: [
        ...prev.errors.filter(error => error.field !== field),
        ...fieldErrors
      ]
    }))
  }
  
  // Handle input changes with validation
  const handleInputChange = (field: keyof PatientData, value: string | 'years' | 'months' | 'days' | 'kg' | 'lbs') => {
    try {
      // Update patient data
      onPatientDataChange({ ...patientData, [field]: value })
      
      // Mark field as touched
      setFormState(prev => ({
        ...prev,
        touched: { ...prev.touched, [field]: true }
      }))
      
      // Clear validation when user changes input
      if (patientValidation) onValidationChange(null)
      
      // Validate input if it's age or weight
      if ((field === 'age' || field === 'weight') && typeof value === 'string') {
        updateFieldErrors(field, value)
      }
      
    } catch (error) {
      console.error(`Error updating ${field}:`, error)
      setFormState(prev => ({
        ...prev,
        errors: [...prev.errors, { field, message: 'Failed to update field' }]
      }))
    }
  }
  
  // Get field error message
  const getFieldError = (field: string): string | undefined => {
    const error = formState.errors.find(err => err.field === field)
    return error?.message
  }
  
  // Check if field has error
  const hasFieldError = (field: string): boolean => {
    return formState.errors.some(err => err.field === field)
  }
  
  const ValidationAlert = ({ age, ageUnit, weight, weightUnit }: {
    age: string
    ageUnit: 'years' | 'months' | 'days'
    weight: string
    weightUnit: 'kg' | 'lbs'
  }) => {
    const validation = validatePatientData(age, ageUnit, weight, weightUnit)
    const { errorMessage, warningMessage } = formatValidationMessages(validation)
    
    if (!errorMessage && !warningMessage) return null
    
    return (
      <div className="mt-4">
        {errorMessage && (
          <Alert className="mb-3 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Error:</strong> {errorMessage}
            </AlertDescription>
          </Alert>
        )}
        {warningMessage && (
          <Alert className="mb-3 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Caution:</strong> {warningMessage}
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  const handleNext = () => {
    try {
      setFormState(prev => ({ ...prev, isSubmitting: true, errors: [] }))
      
      // Basic form validation first
      const basicErrors: InputError[] = []
      
      if (!patientData.age || patientData.age.trim() === '') {
        basicErrors.push({ field: 'age', message: 'Age is required' })
      }
      
      if (!patientData.weight || patientData.weight.trim() === '') {
        basicErrors.push({ field: 'weight', message: 'Weight is required' })
      }
      
      if (basicErrors.length > 0) {
        setFormState(prev => ({ 
          ...prev, 
          errors: basicErrors,
          isSubmitting: false,
          touched: { age: true, weight: true }
        }))
        return
      }
      
      // Comprehensive medical validation
      const validation = validatePatientData(
        patientData.age,
        patientData.ageUnit,
        patientData.weight,
        patientData.weightUnit
      )
      
      if (validation.isValid) {
        onNext()
      } else {
        // Show validation errors
        onValidationChange(validation)
        
        // Also set form-level errors if applicable
        const formErrors: InputError[] = validation.errors.map((error, index) => ({
          field: index === 0 ? 'age' : 'weight',
          message: error
        }))
        
        setFormState(prev => ({
          ...prev,
          errors: formErrors,
          touched: { age: true, weight: true }
        }))
      }
      
    } catch (error) {
      console.error('Error during form submission:', error)
      setFormState(prev => ({
        ...prev,
        errors: [{ field: 'general', message: 'An error occurred while processing your input. Please try again.' }],
        isSubmitting: false
      }))
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 safe-area-inset">
      <div className="mx-auto max-w-md px-6 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="mr-3 h-10 w-10 rounded-full p-0 haptic-tap"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">Patient Information</h2>
            <p className="text-sm text-muted-foreground">Enter patient details</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="mb-2 h-2" />
          <p className="text-xs text-muted-foreground">Step 1 of 3</p>
        </div>

        {/* Form */}
        <div className="space-y-8">
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardContent className="p-6">
              <Label htmlFor="age" className="mb-4 block text-base font-medium">Patient Age</Label>
              <div className="flex gap-3">
                <Input
                  id="age"
                  type="number"
                  placeholder="5"
                  value={patientData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  onBlur={() => setFormState(prev => ({ ...prev, touched: { ...prev.touched, age: true } }))}
                  className={`flex-1 h-14 text-lg text-center border-2 focus:border-primary ${
                    hasFieldError('age') && formState.touched.age
                      ? 'border-red-500 bg-red-50'
                      : 'border-primary/20'
                  }`}
                />
                <Select 
                  value={patientData.ageUnit} 
                  onValueChange={(value: 'years' | 'months' | 'days') => handleInputChange('ageUnit', value)}
                >
                  <SelectTrigger className="w-28 h-14 border-2 border-primary/20 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="years">years</SelectItem>
                    <SelectItem value="months">months</SelectItem>
                    <SelectItem value="days">days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardContent className="p-6">
              <Label htmlFor="weight" className="mb-4 block text-base font-medium">Patient Weight</Label>
              <div className="flex gap-3">
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="18.0"
                  value={patientData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  onBlur={() => setFormState(prev => ({ ...prev, touched: { ...prev.touched, weight: true } }))}
                  className={`flex-1 h-14 text-lg text-center border-2 focus:border-primary ${
                    hasFieldError('weight') && formState.touched.weight
                      ? 'border-red-500 bg-red-50'
                      : 'border-primary/20'
                  }`}
                />
                <Select 
                  value={patientData.weightUnit} 
                  onValueChange={(value: 'kg' | 'lbs') => handleInputChange('weightUnit', value)}
                >
                  <SelectTrigger className="w-20 h-14 border-2 border-primary/20 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Field-level error messages */}
          {(hasFieldError('age') && formState.touched.age) && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Age Error:</strong> {getFieldError('age')}
              </AlertDescription>
            </Alert>
          )}
          
          {(hasFieldError('weight') && formState.touched.weight) && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Weight Error:</strong> {getFieldError('weight')}
              </AlertDescription>
            </Alert>
          )}
          
          {/* General form errors */}
          {formState.errors.some(err => err.field === 'general') && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Error:</strong> {getFieldError('general')}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Real-time validation feedback */}
          <SimpleErrorBoundary message="Validation component failed">
            {patientData.age && patientData.weight && !formState.errors.length && (
              <ValidationAlert 
                age={patientData.age}
                ageUnit={patientData.ageUnit}
                weight={patientData.weight}
                weightUnit={patientData.weightUnit}
              />
            )}
          </SimpleErrorBoundary>
          
          {/* Success indicator */}
          {patientData.age && patientData.weight && !formState.errors.length && !patientValidation?.warnings.length && patientValidation?.isValid && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Ready:</strong> Patient data looks good. You can proceed to medication selection.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-6 left-6 right-6">
          <div className="mx-auto max-w-md space-y-3">
            <Button 
              className="h-14 w-full text-lg font-medium shadow-lg haptic-tap" 
              onClick={handleNext}
              disabled={!patientData.age || !patientData.weight || formState.isSubmitting || formState.errors.length > 0}
            >
              {formState.isSubmitting ? 'Validating...' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}