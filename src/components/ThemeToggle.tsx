import { Button } from '@/components/ui/button'
import { useSettings } from '@/contexts/SettingsContext'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { settings, updateSetting } = useSettings()

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'auto'] as const
    const currentIndex = themes.indexOf(settings.theme)
    const nextIndex = (currentIndex + 1) % themes.length
    updateSetting('theme', themes[nextIndex])
  }

  const getIcon = () => {
    switch (settings.theme) {
      case 'light':
        return <Sun className="h-5 w-5" />
      case 'dark':
        return <Moon className="h-5 w-5" />
      case 'auto':
        return <Monitor className="h-5 w-5" />
    }
  }

  const getLabel = () => {
    switch (settings.theme) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'auto':
        return 'Auto'
    }
  }

  return (
    <Button
      variant="glass"
      size="sm"
      onClick={cycleTheme}
      className="glass-card gap-2 px-4 py-2 transition-all duration-300 hover:scale-105"
      title={`Current theme: ${getLabel()}. Click to cycle themes.`}
    >
      <div className="transition-all duration-300 hover:rotate-12">
        {getIcon()}
      </div>
      <span className="text-xs font-medium">{getLabel()}</span>
    </Button>
  )
}

export function ThemeToggleIcon() {
  const { settings, updateSetting } = useSettings()

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'auto'] as const
    const currentIndex = themes.indexOf(settings.theme)
    const nextIndex = (currentIndex + 1) % themes.length
    updateSetting('theme', themes[nextIndex])
  }

  const getIcon = () => {
    switch (settings.theme) {
      case 'light':
        return <Sun className="h-5 w-5" />
      case 'dark':
        return <Moon className="h-5 w-5" />
      case 'auto':
        return <Monitor className="h-5 w-5" />
    }
  }

  const getLabel = () => {
    switch (settings.theme) {
      case 'light':
        return 'Light Mode'
      case 'dark':
        return 'Dark Mode'
      case 'auto':
        return 'Auto Mode'
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="rounded-full glass-card w-10 h-10 transition-all duration-300 hover:scale-110 group"
      title={`Current theme: ${getLabel()}. Click to cycle themes.`}
    >
      <div className="transition-all duration-300 group-hover:rotate-12">
        {getIcon()}
      </div>
    </Button>
  )
}