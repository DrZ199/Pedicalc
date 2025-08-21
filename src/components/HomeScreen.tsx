import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calculator, 
  Clock, 
  Pill, 
  Plus,
  Stethoscope,
  Activity,
  Shield,
  Award
} from 'lucide-react'
import { BottomNavigation } from './BottomNavigation'
import { ThemeToggleIcon } from './ThemeToggle'

interface HomeScreenProps {
  medicationsCount: number
  onNavigate: (screen: 'patient' | 'calculators' | 'settings') => void
}

export function HomeScreen({ medicationsCount, onNavigate }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-medical-hero relative overflow-hidden safe-area-inset">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl" />
      
      <div className="relative mx-auto max-w-md px-6 py-8">
        {/* Header */}
        <div className="mb-12 pt-8 text-center relative">
          {/* Theme Toggle */}
          <div className="absolute top-0 right-0">
            <ThemeToggleIcon />
          </div>
          
          <div className="mb-6 flex justify-center">
            <div className="glass-card p-6 glow-primary floating">
              <Stethoscope className="h-10 w-10 text-primary pulse-glow" />
            </div>
          </div>
          <h1 className="mb-3 text-5xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            PediCalc
          </h1>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Pediatric Drug Calculator</p>
          <p className="mt-3 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            Safe. Accurate. Professional.
          </p>
        </div>

        {/* Main Actions */}
        <div className="space-y-6">
          <Card 
            className="group cursor-pointer glass-card card-hover haptic-tap shimmer" 
            onClick={() => onNavigate('patient')}
          >
            <CardContent className="flex items-center p-6">
              <div className="mr-4 rounded-full bg-gradient-medical-primary p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                  New Calculation
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Calculate pediatric dosages safely
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer glass-card card-hover haptic-tap">
            <CardContent className="flex items-center p-6">
              <div className="mr-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  Recent Calculations
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  View calculation history
                </p>
              </div>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                5
              </Badge>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer glass-card card-hover haptic-tap">
            <CardContent className="flex items-center p-6">
              <div className="mr-4 rounded-full bg-gradient-medical-secondary p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Pill className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">
                  Drug Reference
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse medication database
                </p>
              </div>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {medicationsCount}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-10 glass-card p-8">
          <h4 className="mb-6 font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Quick Stats
          </h4>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="group">
              <div className="text-3xl font-bold bg-gradient-medical-primary bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                {medicationsCount}
              </div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Medications</div>
            </div>
            <div className="group">
              <div className="text-3xl font-bold bg-gradient-medical-secondary bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                99.9%
              </div>
              <div className="text-xs text-muted-foreground font-medium mt-1 flex items-center justify-center gap-1">
                <Award className="h-3 w-3" />
                Accuracy
              </div>
            </div>
            <div className="group">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                24/7
              </div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation active="home" onNavigate={onNavigate} />
    </div>
  )
}