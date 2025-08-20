import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, AlertTriangle, CheckCircle, Stethoscope, Shield, RefreshCw } from 'lucide-react'
import { SimpleErrorBoundary } from '@/components/ErrorBoundary'

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

interface ResultsScreenProps {
  calculationResult: CalculationResult
  progress: number
  onBack: () => void
  onRecalculate: () => void
  onNewPatient: () => void
}

export function ResultsScreen({
  calculationResult,
  progress,
  onBack,
  onRecalculate,
  onNewPatient
}: ResultsScreenProps) {
  
  // Validate calculation result exists
  if (!calculationResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 safe-area-inset flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mb-4 flex justify-center">
            <div className="rounded-2xl bg-red-100 p-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Calculation Results</h2>
          <p className="text-muted-foreground mb-4">The calculation did not complete successfully.</p>
          <div className="space-y-2">
            <Button onClick={onRecalculate} className="w-full bg-red-600 hover:bg-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Recalculate
            </Button>
            <Button variant="outline" onClick={onBack} className="w-full">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  // Validate critical calculation data
  const hasCriticalError = !calculationResult.dose || 
                          isNaN(parseFloat(calculationResult.dose)) || 
                          parseFloat(calculationResult.dose) <= 0
  
  if (hasCriticalError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 safe-area-inset flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mb-4 flex justify-center">
            <div className="rounded-2xl bg-red-100 p-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Calculation</h2>
          <p className="text-muted-foreground mb-4">The calculated dosage appears to be invalid or unsafe.</p>
          <Alert className="mb-4 border-red-200 bg-red-50 text-left">
            <Shield className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Safety Notice:</strong> For patient safety, please verify all inputs and recalculate. 
              If this error persists, consult appropriate medical references.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Button onClick={onRecalculate} className="w-full bg-red-600 hover:bg-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Recalculate
            </Button>
            <Button variant="outline" onClick={onBack} className="w-full">
              Check Patient Data
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
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
            onClick={onBack}
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
        <SimpleErrorBoundary message="Calculation results display failed">
          <Card className={`mb-6 border-2 ${getSafetyBgColor(calculationResult.safetyLevel)}`}>
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <div className="mb-2 text-5xl font-bold text-gray-900">
                  {calculationResult.dose || '0'}
                  <span className="text-2xl text-muted-foreground ml-1">mg</span>
                </div>
                <div className="text-lg text-muted-foreground">
                  {calculationResult.concentration || 'Unknown concentration'}
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
                    {(calculationResult.safetyLevel || 'unknown').charAt(0).toUpperCase() + (calculationResult.safetyLevel || 'unknown').slice(1)} Range
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
                  <span>Low ({calculationResult.minDose || '0'} mg)</span>
                  <span>High ({calculationResult.maxDose || '0'} mg)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </SimpleErrorBoundary>

        {/* Administration Instructions */}
        <SimpleErrorBoundary message="Administration instructions failed">
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
                    Give {calculationResult.dose || '0'} mg
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {calculationResult.concentration || 'Unknown concentration'}
                    {calculationResult.volume && ` (${calculationResult.volume})`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Frequency: <span className="font-medium text-gray-900">{calculationResult.frequency || 'As directed'}</span>
                  </p>
                </div>
                {calculationResult.medication && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Medication: <span className="font-medium text-gray-900">{calculationResult.medication}</span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </SimpleErrorBoundary>

        {/* Validation Warnings and Errors */}
        <SimpleErrorBoundary message="Validation alerts failed">
          {calculationResult.validationWarnings && calculationResult.validationWarnings.length > 0 && (
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Caution:</strong> {calculationResult.validationWarnings.join('. ')}
              </AlertDescription>
            </Alert>
          )}
          
          {calculationResult.validationErrors && calculationResult.validationErrors.length > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Error:</strong> {calculationResult.validationErrors.join('. ')}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Legacy over-max warning */}
          {calculationResult.isOverMax && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Warning:</strong> Calculated dose exceeds recommended maximum. 
                Consider reducing the dose or consulting a specialist.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Medical disclaimer reminder for dangerous calculations */}
          {calculationResult.safetyLevel === 'danger' && (
            <Alert className="mb-6 border-red-300 bg-red-100">
              <Shield className="h-4 w-4 text-red-700" />
              <AlertDescription className="text-red-900">
                <strong>Critical Safety Notice:</strong> This calculation resulted in a potentially 
                dangerous dosage. Please double-check all inputs, verify with medical references, 
                and consider specialist consultation before administration.
              </AlertDescription>
            </Alert>
          )}
        </SimpleErrorBoundary>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-6 left-6 right-6">
        <div className="mx-auto max-w-md space-y-3">
          <SimpleErrorBoundary message="Action buttons failed">
            <Button 
              className={`h-14 w-full text-lg font-medium shadow-lg haptic-tap ${
                calculationResult.isRecommended 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : calculationResult.safetyLevel === 'danger'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
              onClick={() => {
                try {
                  // In a real app, this would save or confirm the calculation
                  console.log('Calculation confirmed:', calculationResult)
                } catch (error) {
                  console.error('Confirmation error:', error)
                }
              }}
            >
              {calculationResult.safetyLevel === 'danger' 
                ? 'Acknowledge High Risk'
                : calculationResult.isRecommended 
                ? 'Confirm Safe Calculation' 
                : 'Confirm with Caution'}
            </Button>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="h-12 flex-1 haptic-tap" 
                onClick={() => {
                  try {
                    onRecalculate()
                  } catch (error) {
                    console.error('Recalculate error:', error)
                  }
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recalculate
              </Button>
              <Button 
                variant="outline" 
                className="h-12 flex-1 haptic-tap" 
                onClick={() => {
                  try {
                    onNewPatient()
                  } catch (error) {
                    console.error('New patient error:', error)
                  }
                }}
              >
                New Patient
              </Button>
            </div>
            
            {/* Additional safety reminder for high-risk calculations */}
            {calculationResult.safetyLevel === 'danger' && (
              <p className="text-center text-xs text-red-600 mt-2">
                ⚠️ High-risk calculation - verify independently
              </p>
            )}
          </SimpleErrorBoundary>
        </div>
      </div>
    </div>
  )
}