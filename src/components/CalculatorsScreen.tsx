import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calculator, Ruler, Droplets, Zap, ArrowRightLeft } from 'lucide-react'
import { 
  calculatePediatricBMI, 
  calculateBSA, 
  calculateFluidRequirements, 
  getEmergencyDrugs,
  conversions,
  type PatientData 
} from '@/lib/medical-calculations'
import { useSettings } from '@/contexts/SettingsContext'

type CalculatorType = 'bmi' | 'bsa' | 'fluid' | 'emergency' | 'converter'

interface CalculatorsScreenProps {
  onBack: () => void
}

export function CalculatorsScreen({ onBack }: CalculatorsScreenProps) {
  const [selectedCalculator, setSelectedCalculator] = useState<CalculatorType | null>(null)

  const calculators = [
    {
      id: 'bmi' as CalculatorType,
      name: 'BMI Calculator',
      description: 'Calculate pediatric BMI and percentiles',
      icon: Ruler,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'bsa' as CalculatorType,
      name: 'Body Surface Area',
      description: 'Calculate BSA using Mosteller formula',
      icon: Calculator,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'fluid' as CalculatorType,
      name: 'Fluid Requirements',
      description: 'Maintenance fluid calculations',
      icon: Droplets,
      color: 'bg-cyan-100 text-cyan-600'
    },
    {
      id: 'emergency' as CalculatorType,
      name: 'Emergency Drugs',
      description: 'PALS emergency drug dosing',
      icon: Zap,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'converter' as CalculatorType,
      name: 'Unit Converter',
      description: 'Convert medical units',
      icon: ArrowRightLeft,
      color: 'bg-purple-100 text-purple-600'
    }
  ]

  if (selectedCalculator) {
    return (
      <CalculatorDetail 
        type={selectedCalculator} 
        onBack={() => setSelectedCalculator(null)} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 safe-area-inset">
      <div className="mx-auto max-w-md px-6 py-6">
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
            <h2 className="text-xl font-bold text-gray-900">Medical Calculators</h2>
            <p className="text-sm text-muted-foreground">Choose a calculator type</p>
          </div>
        </div>

        <div className="space-y-4">
          {calculators.map((calc) => {
            const IconComponent = calc.icon
            return (
              <Card 
                key={calc.id}
                className="cursor-pointer border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 haptic-tap"
                onClick={() => setSelectedCalculator(calc.id)}
              >
                <CardContent className="flex items-center p-6">
                  <div className={`mr-4 rounded-full p-3 ${calc.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{calc.name}</h3>
                    <p className="text-sm text-muted-foreground">{calc.description}</p>
                  </div>
                  <div className="rounded-full bg-primary/5 p-2">
                    <Calculator className="h-4 w-4 text-primary" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 rounded-2xl bg-white/50 p-6 backdrop-blur-sm">
          <h4 className="mb-4 font-semibold text-gray-900">Calculator Stats</h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{calculators.length}</div>
              <div className="text-xs text-muted-foreground">Calculators</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">24/7</div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CalculatorDetailProps {
  type: CalculatorType
  onBack: () => void
}

function CalculatorDetail({ type, onBack }: CalculatorDetailProps) {
  const { settings } = useSettings()
  const [patientData, setPatientData] = useState<PatientData>({
    age: '',
    ageUnit: 'years',
    weight: '',
    weightUnit: settings.defaultWeightUnit,
    height: '',
    heightUnit: settings.defaultHeightUnit
  })

  const getTitle = () => {
    switch (type) {
      case 'bmi': return 'BMI Calculator'
      case 'bsa': return 'Body Surface Area'
      case 'fluid': return 'Fluid Requirements'
      case 'emergency': return 'Emergency Drugs'
      case 'converter': return 'Unit Converter'
    }
  }

  const renderCalculator = () => {
    switch (type) {
      case 'bmi': return <BMICalculator patientData={patientData} setPatientData={setPatientData} />
      case 'bsa': return <BSACalculator patientData={patientData} setPatientData={setPatientData} />
      case 'fluid': return <FluidCalculator patientData={patientData} setPatientData={setPatientData} />
      case 'emergency': return <EmergencyCalculator patientData={patientData} setPatientData={setPatientData} />
      case 'converter': return <UnitConverter />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 safe-area-inset pb-24">
      <div className="mx-auto max-w-md px-6 py-6">
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
            <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
            <p className="text-sm text-muted-foreground">Enter patient information</p>
          </div>
        </div>

        {renderCalculator()}
      </div>
    </div>
  )
}

function BMICalculator({ 
  patientData, 
  setPatientData 
}: { 
  patientData: PatientData
  setPatientData: (data: PatientData) => void 
}) {
  const bmiResult = calculatePediatricBMI(patientData)
  const { settings } = useSettings()

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="height" className="mb-2 block text-base font-medium">Height</Label>
            <div className="flex gap-3">
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="120"
                value={patientData.height}
                onChange={(e) => setPatientData({...patientData, height: e.target.value})}
                className="flex-1 h-12 text-center border-2 border-primary/20 focus:border-primary"
              />
              <Select 
                value={patientData.heightUnit} 
                onValueChange={(value: 'cm' | 'inches') => 
                  setPatientData({...patientData, heightUnit: value})
                }
              >
                <SelectTrigger className="w-20 h-12 border-2 border-primary/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="inches">in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="weight" className="mb-2 block text-base font-medium">Weight</Label>
            <div className="flex gap-3">
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="25.0"
                value={patientData.weight}
                onChange={(e) => setPatientData({...patientData, weight: e.target.value})}
                className="flex-1 h-12 text-center border-2 border-primary/20 focus:border-primary"
              />
              <Select 
                value={patientData.weightUnit} 
                onValueChange={(value: 'kg' | 'lbs') => 
                  setPatientData({...patientData, weightUnit: value})
                }
              >
                <SelectTrigger className="w-20 h-12 border-2 border-primary/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {bmiResult && (
        <Card className={`border-2 ${
          bmiResult.color === 'green' ? 'bg-green-50 border-green-200' :
          bmiResult.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
          'bg-red-50 border-red-200'
        }`}>
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {bmiResult.bmi.toFixed(settings.showDecimalPlaces)}
              </div>
              <div className="text-lg text-muted-foreground">BMI</div>
            </div>
            <Badge 
              variant="secondary" 
              className={`text-sm ${
                bmiResult.color === 'green' ? 'bg-green-100 text-green-800' :
                bmiResult.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}
            >
              {bmiResult.category}
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function BSACalculator({ 
  patientData, 
  setPatientData 
}: { 
  patientData: PatientData
  setPatientData: (data: PatientData) => void 
}) {
  const bsaResult = calculateBSA(patientData)
  const { settings } = useSettings()

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="height" className="mb-2 block text-base font-medium">Height</Label>
            <div className="flex gap-3">
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="120"
                value={patientData.height}
                onChange={(e) => setPatientData({...patientData, height: e.target.value})}
                className="flex-1 h-12 text-center border-2 border-primary/20 focus:border-primary"
              />
              <Select 
                value={patientData.heightUnit} 
                onValueChange={(value: 'cm' | 'inches') => 
                  setPatientData({...patientData, heightUnit: value})
                }
              >
                <SelectTrigger className="w-20 h-12 border-2 border-primary/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="inches">in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="weight" className="mb-2 block text-base font-medium">Weight</Label>
            <div className="flex gap-3">
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="25.0"
                value={patientData.weight}
                onChange={(e) => setPatientData({...patientData, weight: e.target.value})}
                className="flex-1 h-12 text-center border-2 border-primary/20 focus:border-primary"
              />
              <Select 
                value={patientData.weightUnit} 
                onValueChange={(value: 'kg' | 'lbs') => 
                  setPatientData({...patientData, weightUnit: value})
                }
              >
                <SelectTrigger className="w-20 h-12 border-2 border-primary/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {bsaResult && (
        <Card className="border-2 bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {bsaResult.bsa.toFixed(settings.showDecimalPlaces + 1)}
                <span className="text-2xl text-muted-foreground ml-1">m²</span>
              </div>
              <div className="text-lg text-muted-foreground">Body Surface Area</div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {bsaResult.method}
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function FluidCalculator({ 
  patientData, 
  setPatientData 
}: { 
  patientData: PatientData
  setPatientData: (data: PatientData) => void 
}) {
  const fluidResult = calculateFluidRequirements(patientData)

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
        <CardContent className="p-6">
          <div>
            <Label htmlFor="weight" className="mb-2 block text-base font-medium">Weight</Label>
            <div className="flex gap-3">
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="25.0"
                value={patientData.weight}
                onChange={(e) => setPatientData({...patientData, weight: e.target.value})}
                className="flex-1 h-12 text-center border-2 border-primary/20 focus:border-primary"
              />
              <Select 
                value={patientData.weightUnit} 
                onValueChange={(value: 'kg' | 'lbs') => 
                  setPatientData({...patientData, weightUnit: value})
                }
              >
                <SelectTrigger className="w-20 h-12 border-2 border-primary/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {fluidResult && (
        <div className="space-y-4">
          <Card className="border-2 bg-cyan-50 border-cyan-200">
            <CardHeader>
              <CardTitle className="text-lg text-center">Maintenance Fluids</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {fluidResult.total24h} <span className="text-lg text-muted-foreground">mL/day</span>
                </div>
                <div className="text-sm text-muted-foreground">24-hour total</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {fluidResult.hourly} <span className="text-base text-muted-foreground">mL/hr</span>
                </div>
                <div className="text-sm text-muted-foreground">Hourly rate</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground text-center">
                <strong>Holliday-Segar Method:</strong><br />
                First 10 kg: 100 mL/kg/day<br />
                Next 10 kg: 50 mL/kg/day<br />
                Each additional kg: 20 mL/kg/day
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function EmergencyCalculator({ 
  patientData, 
  setPatientData 
}: { 
  patientData: PatientData
  setPatientData: (data: PatientData) => void 
}) {
  const weight = parseFloat(patientData.weight)
  const weightKg = patientData.weightUnit === 'lbs' ? weight * 0.453592 : weight
  const emergencyDrugs = weight ? getEmergencyDrugs(weightKg) : []

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
        <CardContent className="p-6">
          <div>
            <Label htmlFor="weight" className="mb-2 block text-base font-medium">Weight</Label>
            <div className="flex gap-3">
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="25.0"
                value={patientData.weight}
                onChange={(e) => setPatientData({...patientData, weight: e.target.value})}
                className="flex-1 h-12 text-center border-2 border-primary/20 focus:border-primary"
              />
              <Select 
                value={patientData.weightUnit} 
                onValueChange={(value: 'kg' | 'lbs') => 
                  setPatientData({...patientData, weightUnit: value})
                }
              >
                <SelectTrigger className="w-20 h-12 border-2 border-primary/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {emergencyDrugs.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">PALS Emergency Drugs</h3>
          {emergencyDrugs.map((drug, index) => (
            <Card key={index} className="border-2 bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{drug.name}</h4>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                    {drug.indication}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div><strong>Dose:</strong> {drug.dose}</div>
                  <div><strong>Route:</strong> {drug.route}</div>
                  {drug.notes && (
                    <div className="text-muted-foreground"><strong>Notes:</strong> {drug.notes}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground text-center">
                <strong>⚠️ Emergency Use Only</strong><br />
                Follow current PALS guidelines. Verify all calculations before administration.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function UnitConverter() {
  const [fromValue, setFromValue] = useState('')
  const [fromUnit, setFromUnit] = useState('kg')
  const [toUnit, setToUnit] = useState('lbs')
  const [category, setCategory] = useState('weight')
  const { settings } = useSettings()

  const unitCategories = {
    weight: { kg: 'Kilograms', lbs: 'Pounds' },
    height: { cm: 'Centimeters', inches: 'Inches' },
    temperature: { celsius: 'Celsius', fahrenheit: 'Fahrenheit' }
  }

  const convertValue = () => {
    const value = parseFloat(fromValue)
    if (!value) return ''

    switch (category) {
      case 'weight':
        if (fromUnit === 'kg' && toUnit === 'lbs') {
          return conversions.weight.kgToLbs(value).toFixed(settings.showDecimalPlaces)
        } else if (fromUnit === 'lbs' && toUnit === 'kg') {
          return conversions.weight.lbsToKg(value).toFixed(settings.showDecimalPlaces)
        }
        break
      case 'height':
        if (fromUnit === 'cm' && toUnit === 'inches') {
          return conversions.height.cmToInches(value).toFixed(settings.showDecimalPlaces)
        } else if (fromUnit === 'inches' && toUnit === 'cm') {
          return conversions.height.inchesToCm(value).toFixed(settings.showDecimalPlaces)
        }
        break
      case 'temperature':
        if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
          return conversions.temperature.celsiusToFahrenheit(value).toFixed(settings.showDecimalPlaces)
        } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
          return conversions.temperature.fahrenheitToCelsius(value).toFixed(settings.showDecimalPlaces)
        }
        break
    }
    return fromValue
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
        <CardContent className="p-6">
          <Label className="mb-2 block text-base font-medium">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-12 border-2 border-primary/20 focus:border-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weight">Weight</SelectItem>
              <SelectItem value="height">Height</SelectItem>
              <SelectItem value="temperature">Temperature</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
        <CardContent className="p-6 space-y-4">
          <div>
            <Label className="mb-2 block text-base font-medium">From</Label>
            <div className="flex gap-3">
              <Input
                type="number"
                step="0.1"
                placeholder="Enter value"
                value={fromValue}
                onChange={(e) => setFromValue(e.target.value)}
                className="flex-1 h-12 text-center border-2 border-primary/20 focus:border-primary"
              />
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger className="w-32 h-12 border-2 border-primary/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(unitCategories[category as keyof typeof unitCategories]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-base font-medium">To</Label>
            <div className="flex gap-3">
              <Input
                type="text"
                value={convertValue()}
                readOnly
                className="flex-1 h-12 text-center border-2 border-green-200 bg-green-50"
              />
              <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger className="w-32 h-12 border-2 border-primary/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(unitCategories[category as keyof typeof unitCategories]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}