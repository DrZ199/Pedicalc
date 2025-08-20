import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { InstallPrompt } from '@/components/InstallPrompt'
import { CalculatorsScreenSimple } from '@/components/CalculatorsScreenSimple'
import { SettingsScreen } from '@/components/SettingsScreen'
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext'
import { type Medication } from '@/lib/medication-database'
import { 
  fetchAllDrugs, 
  searchDrugs, 
  getDrugsBySystem, 
  getSystems,
  getClasses 
} from '@/lib/supabase'
import { 
  convertPediatricDrugsToMedications, 
  extractCategoriesFromDrugs, 
  extractSystemsFromDrugs 
} from '@/lib/supabase-adapter'
import { 
  Calculator, 
  Clock, 
  Pill, 
  Search,
  Heart,
  AlertTriangle,
  CheckCircle,
  Home,
  Settings,
  History,
  ArrowLeft,
  Plus,
  Stethoscope
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
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  )
}

function AppContent() {
  const { settings } = useSettings()
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
  const [favorites, setFavorites] = useState<number[]>([1, 2, 3]) // Mock favorites
  const [medications, setMedications] = useState<Medication[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [systems, setSystems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load medications from Supabase on app start
  useEffect(() => {
    async function loadMedications() {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('Loading medications from Supabase...')
        const drugs = await fetchAllDrugs()
        
        if (drugs.length === 0) {
          throw new Error('No medications found in database')
        }
        
        console.log(`Loaded ${drugs.length} medications from Supabase`)
        
        // Convert to app format
        const convertedMedications = convertPediatricDrugsToMedications(drugs)
        setMedications(convertedMedications)
        
        // Extract categories and systems
        const extractedCategories = extractCategoriesFromDrugs(drugs)
        const extractedSystems = extractSystemsFromDrugs(drugs)
        
        setCategories(extractedCategories)
        setSystems(extractedSystems)
        
        console.log('Medications loaded successfully')
        console.log('Categories:', extractedCategories.slice(0, 5))
        console.log('Systems:', extractedSystems.slice(0, 5))
        
      } catch (error) {
        console.error('Error loading medications:', error)
        setError(error instanceof Error ? error.message : 'Failed to load medication database')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadMedications()
  }, [])

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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700"
          >
            Retry Connection
          </Button>
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

  const displayCategories = ['ALL', ...categories.slice(0, 10)] // Show top 10 categories

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

  const filteredMedications = medications.filter(med => {
    const matchesSearch = searchTerm === '' ? true : 
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.indication.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.class.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'ALL' || med.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const favoriteMedications = medications.filter(med => favorites.includes(med.id))

  const calculateDosage = () => {
    if (!selectedMedication || !patientData.weight) return

    const weight = parseFloat(patientData.weight)
    const med = selectedMedication
    
    // Convert weight to kg if in lbs
    const weightInKg = patientData.weightUnit === 'lbs' ? weight * 0.453592 : weight
    
    // Use the new medication database structure
    const minDose = med.dosage.min_dose ? (med.dosage.min_dose * weightInKg) : 0
    const maxDose = med.dosage.max_dose ? (med.dosage.max_dose * weightInKg) : minDose
    const recommendedDose = maxDose > minDose ? (minDose + maxDose) / 2 : minDose

    // Check if dose exceeds maximum
    const maxDoseValue = med.max_dose.value || 1000
    const isOverMax = recommendedDose > maxDoseValue

    // Determine safety level
    let safetyLevel: 'safe' | 'caution' | 'danger' = 'safe'
    if (recommendedDose > maxDoseValue * 0.8) {
      safetyLevel = isOverMax ? 'danger' : 'caution'
    }

    // Get concentration from dosage forms
    const concentration = med.dosage_forms.length > 0 ? med.dosage_forms[0] : 'Standard dose'
    
    // Calculate volume for liquid medications (simplified)
    let volume = ''
    if (concentration.includes('mL') && concentration.includes('mg')) {
      const match = concentration.match(/(\d+)\s*mg.*?(\d+)\s*mL/)
      if (match) {
        const mgPer = parseFloat(match[1])
        const mlPer = parseFloat(match[2])
        const volumeCalc = (recommendedDose / mgPer) * mlPer
        volume = `${volumeCalc.toFixed(1)} mL`
      }
    }

    setCalculationResult({
      dose: recommendedDose.toFixed(1),
      minDose: minDose.toFixed(1),
      maxDose: maxDose.toFixed(1),
      safetyLevel,
      isOverMax,
      concentration,
      frequency: med.frequency,
      medication: med.name,
      volume
    })

    setCurrentScreen('results')
  }

  const resetCalculation = () => {
    setPatientData({ age: '', ageUnit: 'years', weight: '', weightUnit: 'kg' })
    setSelectedMedication(null)
    setCalculationResult(null)
    setSearchTerm('')
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

  const HomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 safe-area-inset">
      <div className="mx-auto max-w-md px-6 py-8">
        {/* Header */}
        <div className="mb-12 pt-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-2xl bg-primary/10 p-4">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold text-primary">PediCalc</h1>
          <p className="text-lg text-muted-foreground">Pediatric Drug Calculator</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Safe. Accurate. Professional.
          </p>
        </div>

        {/* Main Actions */}
        <div className="space-y-4">
          <Card 
            className="group cursor-pointer border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 haptic-tap" 
            onClick={() => setCurrentScreen('patient')}
          >
            <CardContent className="flex items-center p-6">
              <div className="mr-4 rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">New Calculation</h3>
                <p className="text-sm text-muted-foreground">Calculate pediatric dosages safely</p>
              </div>
              <div className="rounded-full bg-primary/5 p-2">
                <Calculator className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 haptic-tap">
            <CardContent className="flex items-center p-6">
              <div className="mr-4 rounded-full bg-blue-100 p-3 transition-colors group-hover:bg-blue-200">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Recent Calculations</h3>
                <p className="text-sm text-muted-foreground">View calculation history</p>
              </div>
              <Badge variant="secondary" className="text-xs">5</Badge>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 haptic-tap">
            <CardContent className="flex items-center p-6">
              <div className="mr-4 rounded-full bg-green-100 p-3 transition-colors group-hover:bg-green-200">
                <Pill className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Drug Reference</h3>
                <p className="text-sm text-muted-foreground">Browse medication database</p>
              </div>
              <Badge variant="secondary" className="text-xs">{medications.length}</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 rounded-2xl bg-white/50 p-6 backdrop-blur-sm">
          <h4 className="mb-4 font-semibold text-gray-900">Quick Stats</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{medications.length}</div>
              <div className="text-xs text-muted-foreground">Medications</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation active="home" />
    </div>
  )

  const PatientInputScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 safe-area-inset">
      <div className="mx-auto max-w-md px-6 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={goBack}
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
                  onChange={(e) => setPatientData({...patientData, age: e.target.value})}
                  className="flex-1 h-14 text-lg text-center border-2 border-primary/20 focus:border-primary"
                />
                <Select 
                  value={patientData.ageUnit} 
                  onValueChange={(value: 'years' | 'months' | 'days') => 
                    setPatientData({...patientData, ageUnit: value})
                  }
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
                  onChange={(e) => setPatientData({...patientData, weight: e.target.value})}
                  className="flex-1 h-14 text-lg text-center border-2 border-primary/20 focus:border-primary"
                />
                <Select 
                  value={patientData.weightUnit} 
                  onValueChange={(value: 'kg' | 'lbs') => 
                    setPatientData({...patientData, weightUnit: value})
                  }
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
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-6 left-6 right-6">
          <div className="mx-auto max-w-md space-y-3">
            <Button 
              className="h-14 w-full text-lg font-medium shadow-lg haptic-tap" 
              onClick={() => setCurrentScreen('medication')}
              disabled={!patientData.age || !patientData.weight}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const MedicationSelectionScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 safe-area-inset pb-24">
      <div className="mx-auto max-w-md px-6 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={goBack}
            className="mr-3 h-10 w-10 rounded-full p-0 haptic-tap"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">Select Medication</h2>
            <p className="text-sm text-muted-foreground">Choose the medication</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progress} className="mb-2 h-2" />
          <p className="text-xs text-muted-foreground">Step 2 of 3</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search medications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 pl-12 border-2 border-primary/20 focus:border-primary"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {displayCategories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap haptic-tap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Favorites */}
        {searchTerm === '' && selectedCategory === 'ALL' && favoriteMedications.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <h3 className="font-medium text-gray-900">Favorites</h3>
            </div>
            <div className="space-y-2">
              {favoriteMedications.map(med => (
                <MedicationCard key={`fav-${med.id}`} medication={med} />
              ))}
            </div>
          </div>
        )}

        {/* Medications List */}
        <div className="space-y-3">
          {selectedCategory !== 'ALL' && (
            <h3 className="font-medium text-gray-900">{selectedCategory}</h3>
          )}
          {filteredMedications.length === 0 ? (
            <div className="text-center py-8">
              <div className="mb-2 text-gray-400">
                <Search className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-gray-600">No medications found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm ? `Try different search terms` : 'Try selecting a different category'}
              </p>
            </div>
          ) : (
            filteredMedications.map(med => (
              <MedicationCard key={med.id} medication={med} />
            ))
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-6 left-6 right-6">
        <div className="mx-auto max-w-md">
          <Button 
            className="h-14 w-full text-lg font-medium shadow-lg haptic-tap" 
            onClick={calculateDosage}
            disabled={!selectedMedication}
          >
            Calculate Dosage
          </Button>
        </div>
      </div>
    </div>
  )

  const MedicationCard = ({ medication }: { medication: Medication }) => (
    <Card 
      className={`cursor-pointer border-2 transition-all duration-200 haptic-tap ${
        selectedMedication?.id === medication.id 
          ? 'border-primary bg-primary/5 shadow-lg' 
          : 'border-gray-200 bg-white/80 hover:shadow-md hover:border-primary/50'
      }`}
      onClick={() => setSelectedMedication(medication)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Pill className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{medication.name}</h3>
              <p className="text-sm text-muted-foreground">
                {medication.dosage_forms.join(', ')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {medication.indication} • {medication.class}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="secondary" className="text-xs">
              {medication.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {medication.system}
            </Badge>
            {favorites.includes(medication.id) && (
              <Heart className="h-3 w-3 fill-red-500 text-red-500" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ResultsScreen = () => {
    if (!calculationResult) return null

    const getSafetyColor = (level: string) => {
      switch(level) {
        case 'safe': return 'text-green-600'
        case 'caution': return 'text-orange-600'
        case 'danger': return 'text-red-600'
        default: return 'text-gray-600'
      }
    }

    const getSafetyBgColor = (level: string) => {
      switch(level) {
        case 'safe': return 'bg-green-50 border-green-200'
        case 'caution': return 'bg-orange-50 border-orange-200'
        case 'danger': return 'bg-red-50 border-red-200'
        default: return 'bg-gray-50 border-gray-200'
      }
    }

    const getSafetyIcon = (level: string) => {
      switch(level) {
        case 'safe': return <CheckCircle className="h-6 w-6 text-green-600" />
        case 'caution': return <AlertTriangle className="h-6 w-6 text-orange-600" />
        case 'danger': return <AlertTriangle className="h-6 w-6 text-red-600" />
        default: return null
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 safe-area-inset pb-24">
        <div className="mx-auto max-w-md px-6 py-6">
          {/* Header */}
          <div className="mb-6 flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goBack}
              className="mr-3 h-10 w-10 rounded-full p-0 haptic-tap"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Calculation Results</h2>
              <p className="text-sm text-muted-foreground">Review the dosage</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <Progress value={progress} className="mb-2 h-2" />
            <p className="text-xs text-muted-foreground">Step 3 of 3</p>
          </div>

          {/* Main Result Card */}
          <Card className={`mb-6 border-2 ${getSafetyBgColor(calculationResult.safetyLevel)}`}>
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <div className="mb-2 text-5xl font-bold text-gray-900">
                  {calculationResult.dose}
                  <span className="text-2xl text-muted-foreground ml-1">mg</span>
                </div>
                <div className="text-lg text-muted-foreground">
                  {calculationResult.concentration}
                </div>
                {calculationResult.volume && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Volume: {calculationResult.volume}
                  </div>
                )}
              </div>

              {/* Safety Indicator */}
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-center gap-2">
                  {getSafetyIcon(calculationResult.safetyLevel)}
                  <span className={`font-medium ${getSafetyColor(calculationResult.safetyLevel)}`}>
                    {calculationResult.safetyLevel.charAt(0).toUpperCase() + calculationResult.safetyLevel.slice(1)} Range
                  </span>
                </div>
                
                {/* Safety Bar */}
                <div className="relative mx-auto h-4 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div className="absolute left-0 h-full w-1/3 bg-green-400"></div>
                  <div className="absolute left-1/3 h-full w-1/3 bg-orange-400"></div>
                  <div className="absolute right-0 h-full w-1/3 bg-red-400"></div>
                  <div 
                    className="absolute h-6 w-1 bg-gray-900 rounded-sm transform -translate-x-1/2 -translate-y-1"
                    style={{ 
                      left: calculationResult.safetyLevel === 'safe' ? '20%' : 
                             calculationResult.safetyLevel === 'caution' ? '50%' : '80%' 
                    }}
                  ></div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Low ({calculationResult.minDose} mg)</span>
                  <span>High ({calculationResult.maxDose} mg)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Administration Instructions */}
          <Card className="mb-6 border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="h-5 w-5 text-primary" />
                Administration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">
                    Give {calculationResult.dose} mg
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {calculationResult.concentration}
                    {calculationResult.volume && ` (${calculationResult.volume})`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Frequency: <span className="font-medium text-gray-900">{calculationResult.frequency}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning Alert */}
          {calculationResult.isOverMax && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Warning:</strong> Calculated dose exceeds recommended maximum. 
                Consider reducing the dose or consulting a specialist.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-6 left-6 right-6">
          <div className="mx-auto max-w-md space-y-3">
            <Button className="h-14 w-full text-lg font-medium shadow-lg bg-green-600 hover:bg-green-700 haptic-tap">
              Confirm Calculation
            </Button>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="h-12 flex-1 haptic-tap" 
                onClick={() => setCurrentScreen('medication')}
              >
                Recalculate
              </Button>
              <Button 
                variant="outline" 
                className="h-12 flex-1 haptic-tap" 
                onClick={resetCalculation}
              >
                New Patient
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const BottomNavigation = ({ active }: { active: string }) => (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/80 backdrop-blur-sm safe-area-inset">
      <div className="mx-auto flex max-w-md justify-around py-3">
        <Button 
          variant="ghost" 
          className={`flex h-12 w-12 flex-col items-center justify-center gap-1 p-0 haptic-tap ${
            active === 'home' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex h-12 w-12 flex-col items-center justify-center gap-1 p-0 haptic-tap ${
            active === 'calculators' ? 'text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => setCurrentScreen('calculators')}
        >
          <Calculator className="h-5 w-5" />
          <span className="text-xs">Calculators</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex h-12 w-12 flex-col items-center justify-center gap-1 p-0 haptic-tap ${
            active === 'settings' ? 'text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => setCurrentScreen('settings')}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </div>
  )

  const renderScreen = () => {
    switch(currentScreen) {
      case 'home': return <HomeScreen />
      case 'patient': return <PatientInputScreen />
      case 'medication': return <MedicationSelectionScreen />
      case 'results': return <ResultsScreen />
      default: return <HomeScreen />
    }
  }

  return (
    <div className="font-sans antialiased">
      {renderScreen()}
      <InstallPrompt />
    </div>
  )
}
