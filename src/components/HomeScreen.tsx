import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Calculator, 
  Clock, 
  Pill, 
  Plus,
  Stethoscope
} from 'lucide-react'
import { BottomNavigation } from './BottomNavigation'

interface HomeScreenProps {
  medicationsCount: number
  onNavigate: (screen: 'patient' | 'calculators' | 'settings') => void
}

export function HomeScreen({ medicationsCount, onNavigate }: HomeScreenProps) {
  return (
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
            onClick={() => onNavigate('patient')}
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
              <Badge variant="secondary" className="text-xs">{medicationsCount}</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 rounded-2xl bg-white/50 p-6 backdrop-blur-sm">
          <h4 className="mb-4 font-semibold text-gray-900">Quick Stats</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{medicationsCount}</div>
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
      <BottomNavigation active="home" onNavigate={onNavigate} />
    </div>
  )
}