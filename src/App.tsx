import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { InstallPrompt } from '@/components/InstallPrompt'
import { CalculatorsScreenSimple } from '@/components/CalculatorsScreenSimple'
import { SettingsScreen } from '@/components/SettingsScreen'
import { MedicalDisclaimer, useMedicalDisclaimer } from '@/components/MedicalDisclaimer'
import { HomeScreen } from '@/components/HomeScreen'
import { PatientInputScreen } from '@/components/PatientInputScreen'
import { MedicationSelectionScreen } from '@/components/MedicationSelectionScreen'
import { ResultsScreen } from '@/components/ResultsScreen'
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext'
import { ErrorBoundary, SimpleErrorBoundary, handleAsyncError } from '@/components/ErrorBoundary'
import { type Medication } from '@/lib/medication-database'
import { 
  fetchAllDrugs
} from '@/lib/supabase'
import { 
  convertPediatricDrugsToMedications, 
  extractCategoriesFromDrugs
} from '@/lib/supabase-adapter'
import {
  validatePatientData,
  type ValidationResult
} from '@/lib/medical-validation'
import {
  calculateSafeDosage
} from '@/lib/medical-calculations'
import { 
  Stethoscope,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react'



type Screen = 'home' | 'patient' | 'medication' | 'results' | 'calculators' | 'settings'

interface PatientData {
  age: string
  ageUnit: 'years' | 'months' | 'days'
  weight: string
  weightUnit: 'kg' | 'lbs'
}

interface CalculationResult {
  dose: string
  minDose: string
  maxDose: string
  safetyLevel: 'safe' | 'caution' | 'danger'
  isOverMax: boolean
  concentration: string
  frequency: string
  medication: string
  volume?: string
  validationErrors?: string[]
  validationWarnings?: string[]
  isRecommended?: boolean
}

export default function App() {
  return (
    <ErrorBoundary onError={(error, errorInfo) => {
      console.error('App-level error:', error, errorInfo)
      // In production, send to error reporting service
    }}>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </ErrorBoundary>
  )
}

function AppContent() {
  const { settings } = useSettings()
  const { needsDisclaimer, acceptDisclaimer, declineDisclaimer } = useMedicalDisclaimer()
  const [currentScreen, setCurrentScreen] = useState<Screen>('home')
  const [patientData, setPatientData] = useState<PatientData>({
    age: '',
    ageUnit: 'years',
    weight: '',
    weightUnit: settings.defaultWeightUnit
  })
  const [selectedMedication, setSelectedMedication] = useState<typeof medications[0] | null>(null)
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [progress, setProgress] = useState(0)
  const [favorites] = useState<number[]>([1, 2, 3]) // Mock favorites
  const [patientValidation, setPatientValidation] = useState<ValidationResult | null>(null)
  const [medications, setMedications] = useState<Medication[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [retryCount, setRetryCount] = useState(0)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setError(null)
      // Retry loading medications if we were offline
      if (!medications.length && retryCount < 3) {
        loadMedications()
      }
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setError('No internet connection. Some features may be limited.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [medications.length, retryCount])

  // Load medications from Supabase on app start
  const loadMedications = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Check online status first
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.')
      }
      
      console.log(`Loading medications from Supabase... (attempt ${retryCount + 1})`)
      
      const drugs = await fetchAllDrugs()
      
      if (!drugs || drugs.length === 0) {
        throw new Error('No medications found in database. Please contact support if this persists.')
      }
      
      console.log(`Successfully loaded ${drugs.length} medications from Supabase`)
      
      // Convert to app format with error handling
      try {
        const convertedMedications = convertPediatricDrugsToMedications(drugs)
        setMedications(convertedMedications)
        
        // Extract categories with error handling
        const extractedCategories = extractCategoriesFromDrugs(drugs)
        setCategories(extractedCategories)
        
        console.log('Medications processed successfully')
        console.log('Available categories:', extractedCategories.slice(0, 5))
        
        // Reset retry count on success
        setRetryCount(0)
        
      } catch (processingError) {
        throw new Error('Failed to process medication data. The database may contain invalid entries.')
      }
      
    } catch (error) {
      const result = handleAsyncError(error, 'loadMedications')
      console.error('Error loading medications:', result)
      
      // Set user-friendly error message
      let errorMessage = 'Failed to load medication database'
      
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage = 'Network error: Unable to connect to medication database. Please check your internet connection.'
        } else if (error.message.includes('No medications found')) {
          errorMessage = 'Medication database is empty. Please contact support.'
        } else if (error.message.includes('process')) {
          errorMessage = 'Database error: Unable to process medication data. Please try again or contact support.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
      setRetryCount(prev => prev + 1)
      
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMedications()
  }, [])

  // Progress calculation based on current screen
  useEffect(() => {
    const progressMap: Record<Screen, number> = {
      home: 0,
      patient: 25,
      medication: 50,
      results: 100,
      calculators: 0,
      settings: 0
    }
    setProgress(progressMap[currentScreen] || 0)
  }, [currentScreen])

  // Show loading screen while data loads
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-2xl bg-primary/10 p-4">
              <Stethoscope className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading PediCalc</h2>
          <p className="text-muted-foreground mb-4">Loading comprehensive drug database...</p>
          <div className="w-48 mx-auto">
            <Progress value={75} className="h-2" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">510 medications ready</p>
        </div>
      </div>
    )
  }

  // Show error screen if loading failed
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mb-4 flex justify-center">
            <div className="rounded-2xl bg-red-100 p-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {!isOnline ? 'No Internet Connection' : 'Connection Error'}
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex items-center justify-center mb-4">
            {isOnline ? <Wifi className="h-5 w-5 text-green-600 mr-2" /> : <WifiOff className="h-5 w-5 text-red-600 mr-2" />}
            <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline ? 'Connected' : 'Offline'}
            </span>
          </div>
          <div className="space-y-2">
            <Button 
              onClick={() => loadMedications()} 
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={!isOnline}
            >
              {!isOnline ? 'Waiting for Connection...' : retryCount > 0 ? `Retry (${retryCount + 1})` : 'Retry Connection'}
            </Button>
            {retryCount >= 3 && (
              <Button 
                variant="outline"
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Reload Application
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show specific screens
  if (currentScreen === 'calculators') {
    return <CalculatorsScreenSimple onBack={() => setCurrentScreen('home')} />
  }
  
  if (currentScreen === 'settings') {
    return <SettingsScreen onBack={() => setCurrentScreen('home')} />
  }

  const calculateDosage = () => {
    try {
      if (!selectedMedication || !patientData.weight || !patientData.age) {
        setError('Missing required data for calculation. Please ensure patient age, weight, and medication are selected.')
        return
      }

      const med = selectedMedication
      
      // Validate patient data first
      const validation = validatePatientData(
        patientData.age,
        patientData.ageUnit,
        patientData.weight,
        patientData.weightUnit
      )
      
      setPatientValidation(validation)
      
      // If validation fails with errors, don't proceed
      if (!validation.isValid) {
        const errorMessage = `Patient data validation failed: ${validation.errors.join(', ')}`
        setError(errorMessage)
        console.error('Validation failed:', validation)
        return
      }
      
      // Validate medication data
      if (!med.dosage || (!med.dosage.min_dose && !med.dosage.max_dose)) {
        setError(`No dosage information available for ${med.name}. Please select a different medication or consult medical references.`)
        return
      }
      
      // Calculate dosage using safe calculation function
      const dosePerKg = med.dosage.min_dose || med.dosage.max_dose || 10 // Fallback to 10mg/kg
      const maxDoseValue = med.max_dose.value
      
      const safeCalculation = calculateSafeDosage(
        {
          age: patientData.age,
          ageUnit: patientData.ageUnit,
          weight: patientData.weight,
          weightUnit: patientData.weightUnit
        },
        dosePerKg,
        maxDoseValue,
        med.name
      )
      
      // Check if calculation succeeded
      if (!safeCalculation.result || isNaN(safeCalculation.result)) {
        throw new Error('Calculation failed to produce a valid result. Please check input values and try again.')
      }
      
      // Calculate min and max doses with error handling
      const weight = parseFloat(patientData.weight)
      const weightInKg = patientData.weightUnit === 'lbs' ? weight * 0.453592 : weight
      
      if (weightInKg <= 0 || !isFinite(weightInKg)) {
        throw new Error('Invalid weight value detected during calculation.')
      }
      
      const minDose = med.dosage.min_dose ? (med.dosage.min_dose * weightInKg) : 0
      const maxDose = med.dosage.max_dose ? (med.dosage.max_dose * weightInKg) : safeCalculation.result
      
      // Get concentration from dosage forms
      const concentration = med.dosage_forms.length > 0 ? med.dosage_forms[0] : 'Standard dose'
      
      // Calculate volume for liquid medications (simplified)
      let volume = ''
      try {
        if (concentration && concentration.includes('mL') && concentration.includes('mg')) {
          const match = concentration.match(/(\d+)\s*mg.*?(\d+)\s*mL/)
          if (match && match[1] && match[2]) {
            const mgPer = parseFloat(match[1])
            const mlPer = parseFloat(match[2])
            
            if (mgPer > 0 && mlPer > 0) {
              const volumeCalc = (safeCalculation.result / mgPer) * mlPer
              if (isFinite(volumeCalc) && volumeCalc > 0) {
                volume = `${volumeCalc.toFixed(1)} mL`
              }
            }
          }
        }
      } catch (volumeError) {
        console.warn('Error calculating volume:', volumeError)
        // Volume calculation error is non-critical, continue without volume
      }
      
      // Determine if dose exceeds maximum
      const isOverMax = maxDoseValue ? safeCalculation.result > maxDoseValue : false
      
      setCalculationResult({
        dose: safeCalculation.result.toFixed(1),
        minDose: minDose.toFixed(1),
        maxDose: maxDose.toFixed(1),
        safetyLevel: safeCalculation.validation.safetyLevel,
        isOverMax,
        concentration: concentration || 'Standard dose',
        frequency: med.frequency,
        medication: med.name,
        volume,
        validationErrors: safeCalculation.validation.errors,
        validationWarnings: safeCalculation.warnings,
        isRecommended: safeCalculation.isRecommended
      })

      // Clear any previous errors
      setError(null)
      setCurrentScreen('results')
      
    } catch (calculationError) {
      const result = handleAsyncError(calculationError, 'calculateDosage')
      const errorMessage = calculationError instanceof Error 
        ? `Calculation error: ${calculationError.message}` 
        : 'An unexpected error occurred during calculation. Please try again.'
      
      setError(errorMessage)
      console.error('Dosage calculation failed:', result)
    }
  }

  const resetCalculation = () => {
    setPatientData({ age: '', ageUnit: 'years', weight: '', weightUnit: 'kg' })
    setSelectedMedication(null)
    setCalculationResult(null)
    setSearchTerm('')
    setPatientValidation(null)
    setCurrentScreen('home')
  }

  const goBack = () => {
    const screenFlow: Record<Screen, Screen> = {
      home: 'home',
      patient: 'home',
      medication: 'patient',
      results: 'medication',
      calculators: 'home',
      settings: 'home'
    }
    setCurrentScreen(screenFlow[currentScreen])
  }













  const handleNavigate = (screen: 'patient' | 'calculators' | 'settings') => {
    if (screen === 'patient') {
      setCurrentScreen('patient')
    } else {
      setCurrentScreen(screen)
    }
  }

  const renderScreen = () => {
    switch(currentScreen) {
      case 'home': 
        return (
          <HomeScreen 
            medicationsCount={medications.length}
            onNavigate={handleNavigate}
          />
        )
      case 'patient': 
        return (
          <PatientInputScreen 
            patientData={patientData}
            progress={progress}
            patientValidation={patientValidation}
            onPatientDataChange={setPatientData}
            onValidationChange={setPatientValidation}
            onNext={() => setCurrentScreen('medication')}
            onBack={goBack}
          />
        )
      case 'medication': 
        return (
          <MedicationSelectionScreen 
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            selectedMedication={selectedMedication}
            progress={progress}
            categories={categories}
            medications={medications}
            favorites={favorites}
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
            onMedicationSelect={setSelectedMedication}
            onCalculate={calculateDosage}
            onBack={goBack}
          />
        )
      case 'results': 
        return calculationResult ? (
          <ResultsScreen 
            calculationResult={calculationResult}
            progress={progress}
            onBack={goBack}
            onRecalculate={() => setCurrentScreen('medication')}
            onNewPatient={resetCalculation}
          />
        ) : null
      default: 
        return (
          <HomeScreen 
            medicationsCount={medications.length}
            onNavigate={handleNavigate}
          />
        )
    }
  }

  return (
    <ErrorBoundary>
      <div className="font-sans antialiased">
        <SimpleErrorBoundary message="Failed to load screen">
          {renderScreen()}
        </SimpleErrorBoundary>
        
        <SimpleErrorBoundary message="Install prompt failed">
          <InstallPrompt />
        </SimpleErrorBoundary>
        
        <SimpleErrorBoundary message="Medical disclaimer failed">
          <MedicalDisclaimer 
            isOpen={needsDisclaimer}
            onAccept={acceptDisclaimer}
            onDecline={declineDisclaimer}
          />
        </SimpleErrorBoundary>
      </div>
    </ErrorBoundary>
  )
}
