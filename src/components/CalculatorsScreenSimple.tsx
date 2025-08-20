import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calculator, Heart, Activity, Droplets } from 'lucide-react'

interface CalculatorsScreenProps {
  onBack: () => void
}

type CalculatorType = 'main' | 'bmi' | 'bsa' | 'fluid'

export function CalculatorsScreenSimple({ onBack }: CalculatorsScreenProps) {
  const [currentCalculator, setCurrentCalculator] = useState<CalculatorType>('main')
  const [bmiData, setBmiData] = useState({ height: '', weight: '', heightUnit: 'cm', weightUnit: 'kg' })
  const [bsaData, setBsaData] = useState({ height: '', weight: '', heightUnit: 'cm', weightUnit: 'kg' })
  const [fluidData, setFluidData] = useState({ weight: '', weightUnit: 'kg' })

  const calculateBMI = () => {
    const height = parseFloat(bmiData.height)
    const weight = parseFloat(bmiData.weight)
    
    if (!height || !weight) return null
    
    // Convert to metric if needed
    const heightCm = bmiData.heightUnit === 'inches' ? height * 2.54 : height
    const weightKg = bmiData.weightUnit === 'lbs' ? weight * 0.453592 : weight
    
    const heightM = heightCm / 100
    const bmi = weightKg / (heightM * heightM)
    
    return {
      bmi: bmi.toFixed(1),
      category: bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
    }
  }

  const calculateBSA = () => {
    const height = parseFloat(bsaData.height)
    const weight = parseFloat(bsaData.weight)
    
    if (!height || !weight) return null
    
    // Convert to metric if needed
    const heightCm = bsaData.heightUnit === 'inches' ? height * 2.54 : height
    const weightKg = bsaData.weightUnit === 'lbs' ? weight * 0.453592 : weight
    
    // Mosteller formula: BSA = √((height × weight) / 3600)
    const bsa = Math.sqrt((heightCm * weightKg) / 3600)
    
    return {
      bsa: bsa.toFixed(2),
      formula: 'Mosteller Formula'
    }
  }

  const calculateFluid = () => {
    const weight = parseFloat(fluidData.weight)
    
    if (!weight) return null
    
    // Convert to kg if needed
    const weightKg = fluidData.weightUnit === 'lbs' ? weight * 0.453592 : weight
    
    // Holiday-Segar method
    let dailyFluid = 0
    if (weightKg <= 10) {
      dailyFluid = weightKg * 100
    } else if (weightKg <= 20) {
      dailyFluid = 1000 + (weightKg - 10) * 50
    } else {
      dailyFluid = 1500 + (weightKg - 20) * 20
    }
    
    const hourlyFluid = dailyFluid / 24
    
    return {
      daily: Math.round(dailyFluid),
      hourly: Math.round(hourlyFluid * 10) / 10,
      formula: 'Holiday-Segar Method'
    }
  }

  if (currentCalculator === 'bmi') {
    const bmiResult = calculateBMI()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 safe-area-inset pb-24">
        <div className="mx-auto max-w-md px-6 py-6">
          <div className="mb-6 flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCurrentCalculator('main')}
              className="mr-3 h-10 w-10 rounded-full p-0 haptic-tap"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">BMI Calculator</h2>
              <p className="text-sm text-muted-foreground">Body Mass Index</p>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="mb-2 block text-base font-medium">Height</Label>
                  <div className="flex gap-3">
                    <Input
                      placeholder="170"
                      value={bmiData.height}
                      onChange={(e) => setBmiData({...bmiData, height: e.target.value})}
                      className="flex-1 h-12 text-center border-2 border-primary/20 focus:border-primary"
                    />
                    <Select value={bmiData.heightUnit} onValueChange={(value) => setBmiData({...bmiData, heightUnit: value})}>
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
                  <Label className="mb-2 block text-base font-medium">Weight</Label>
                  <div className="flex gap-3">
                    <Input
                      placeholder="70"
                      value={bmiData.weight}
                      onChange={(e) => setBmiData({...bmiData, weight: e.target.value})}
                      className="flex-1 h-12 text-center border-2 border-primary/20 focus:border-primary"
                    />
                    <Select value={bmiData.weightUnit} onValueChange={(value) => setBmiData({...bmiData, weightUnit: value})}>
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
              <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {bmiResult.bmi}
                    </div>
                    <Badge variant={bmiResult.category === 'Normal' ? 'default' : 'secondary'}>
                      {bmiResult.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Body Mass Index (BMI)
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (currentCalculator === 'bsa') {
    const bsaResult = calculateBSA()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 safe-area-inset pb-24">
        <div className="mx-auto max-w-md px-6 py-6">
          <div className="mb-6 flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCurrentCalculator('main')}
              className="mr-3 h-10 w-10 rounded-full p-0 haptic-tap"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">BSA Calculator</h2>
              <p className="text-sm text-muted-foreground">Body Surface Area</p>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="mb-2 block text-base font-medium">Height</Label>
                  <div className="flex gap-3">
                    <Input
                      placeholder="170"
                      value={bsaData.height}
                      onChange={(e) => setBsaData({...bsaData, height: e.target.value})}
                      className="flex-1 h-12 text-center border-2 border-primary/20 focus:border-primary"
                    />
                    <Select value={bsaData.heightUnit} onValueChange={(value) => setBsaData({...bsaData, heightUnit: value})}>
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
                  <Label className="mb-2 block text-base font-medium">Weight</Label>
                  <div className="flex gap-3">
                    <Input
                      placeholder="70"
                      value={bsaData.weight}
                      onChange={(e) => setBsaData({...bsaData, weight: e.target.value})}
                      className="flex-1 h-12 text-center border-2 border-primary/20 focus:border-primary"
                    />
                    <Select value={bsaData.weightUnit} onValueChange={(value) => setBsaData({...bsaData, weightUnit: value})}>
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
              <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {bsaResult.bsa} m²
                    </div>
                    <Badge variant="outline">
                      {bsaResult.formula}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Body Surface Area
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (currentCalculator === 'fluid') {
    const fluidResult = calculateFluid()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 safe-area-inset pb-24">
        <div className="mx-auto max-w-md px-6 py-6">
          <div className="mb-6 flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCurrentCalculator('main')}
              className="mr-3 h-10 w-10 rounded-full p-0 haptic-tap"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Fluid Calculator</h2>
              <p className="text-sm text-muted-foreground">Maintenance Fluids</p>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="mb-2 block text-base font-medium">Weight</Label>
                  <div className="flex gap-3">
                    <Input
                      placeholder="70"
                      value={fluidData.weight}
                      onChange={(e) => setFluidData({...fluidData, weight: e.target.value})}
                      className="flex-1 h-12 text-center border-2 border-primary/20 focus:border-primary"
                    />
                    <Select value={fluidData.weightUnit} onValueChange={(value) => setFluidData({...fluidData, weightUnit: value})}>
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
              <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-600 mb-1">
                        {fluidResult.daily} mL/day
                      </div>
                      <div className="text-xl font-semibold text-cyan-500 mb-2">
                        {fluidResult.hourly} mL/hr
                      </div>
                      <Badge variant="outline">
                        {fluidResult.formula}
                      </Badge>
                    </div>
                    
                    <div className="pt-4 border-t text-center">
                      <p className="text-sm text-muted-foreground">
                        Maintenance Fluid Requirements
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
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
            <h2 className="text-xl font-bold text-gray-900">Medical Calculators</h2>
            <p className="text-sm text-muted-foreground">Choose a calculator</p>
          </div>
        </div>

        <div className="space-y-4">
          <Card 
            className="border-0 bg-white/80 shadow-lg backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 haptic-tap"
            onClick={() => setCurrentCalculator('bmi')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Heart className="h-6 w-6 text-blue-600" />
                BMI Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Calculate Body Mass Index for children and adults
              </p>
              <Button className="w-full">
                Calculate BMI
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="border-0 bg-white/80 shadow-lg backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 haptic-tap"
            onClick={() => setCurrentCalculator('bsa')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-green-600" />
                Body Surface Area
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Calculate BSA using Mosteller formula
              </p>
              <Button className="w-full">
                Calculate BSA
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="border-0 bg-white/80 shadow-lg backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 haptic-tap"
            onClick={() => setCurrentCalculator('fluid')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Droplets className="h-6 w-6 text-cyan-600" />
                Fluid Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Maintenance fluid calculations (Holiday-Segar)
              </p>
              <Button className="w-full">
                Calculate Fluids
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}