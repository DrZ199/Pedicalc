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
    <div className="fixed bottom-0 left-0 right-0 glass border-t-0 safe-area-inset">
      <div className="mx-auto flex max-w-md justify-around py-4 px-2">
        <Button 
          variant="ghost" 
          className={`flex h-16 w-20 flex-col items-center justify-center gap-1 p-0 haptic-tap rounded-2xl transition-all duration-300 ${
            active === 'home' 
              ? 'text-primary bg-primary/10 shadow-lg' 
              : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
          }`}
        >
          <Home className={`h-6 w-6 transition-transform duration-200 ${
            active === 'home' ? 'scale-110' : 'group-hover:scale-105'
          }`} />
          <span className="text-xs font-medium">Home</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex h-16 w-20 flex-col items-center justify-center gap-1 p-0 haptic-tap rounded-2xl transition-all duration-300 ${
            active === 'calculators' 
              ? 'text-primary bg-primary/10 shadow-lg' 
              : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
          }`}
          onClick={() => onNavigate('calculators')}
        >
          <Calculator className={`h-6 w-6 transition-transform duration-200 ${
            active === 'calculators' ? 'scale-110' : 'group-hover:scale-105'
          }`} />
          <span className="text-xs font-medium">Calculators</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex h-16 w-20 flex-col items-center justify-center gap-1 p-0 haptic-tap rounded-2xl transition-all duration-300 ${
            active === 'settings' 
              ? 'text-primary bg-primary/10 shadow-lg' 
              : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
          }`}
          onClick={() => onNavigate('settings')}
        >
          <Settings className={`h-6 w-6 transition-transform duration-200 ${
            active === 'settings' ? 'scale-110' : 'group-hover:scale-105'
          }`} />
          <span className="text-xs font-medium">Settings</span>
        </Button>
      </div>
    </div>
  )
}