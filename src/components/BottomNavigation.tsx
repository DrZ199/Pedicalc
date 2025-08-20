import { Button } from '@/components/ui/button'
import { 
  Calculator, 
  Home,
  Settings
} from 'lucide-react'

interface BottomNavigationProps {
  active: string
  onNavigate: (screen: 'patient' | 'calculators' | 'settings') => void
}

export function BottomNavigation({ active, onNavigate }: BottomNavigationProps) {
  return (
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
          onClick={() => onNavigate('calculators')}
        >
          <Calculator className="h-5 w-5" />
          <span className="text-xs">Calculators</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex h-12 w-12 flex-col items-center justify-center gap-1 p-0 haptic-tap ${
            active === 'settings' ? 'text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => onNavigate('settings')}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </div>
  )
}