import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface AppSettings {
  // Units
  defaultWeightUnit: 'kg' | 'lbs'
  defaultHeightUnit: 'cm' | 'inches'
  defaultTemperatureUnit: 'celsius' | 'fahrenheit'
  
  // Display
  theme: 'light' | 'dark' | 'auto'
  fontSize: 'small' | 'medium' | 'large'
  highContrast: boolean
  
  // Behavior
  showDecimalPlaces: number
  confirmCalculations: boolean
  hapticFeedback: boolean
  soundAlerts: boolean
  
  // Privacy
  saveHistory: boolean
  analyticsEnabled: boolean
  
  // Notifications
  updateNotifications: boolean
  reminderNotifications: boolean
  
  // Professional
  displayName: string
  institution: string
  licenseNumber: string
}

const defaultSettings: AppSettings = {
  defaultWeightUnit: 'kg',
  defaultHeightUnit: 'cm',
  defaultTemperatureUnit: 'celsius',
  theme: 'light',
  fontSize: 'medium',
  highContrast: false,
  showDecimalPlaces: 1,
  confirmCalculations: true,
  hapticFeedback: true,
  soundAlerts: false,
  saveHistory: true,
  analyticsEnabled: true,
  updateNotifications: true,
  reminderNotifications: false,
  displayName: '',
  institution: '',
  licenseNumber: ''
}

interface SettingsContextType {
  settings: AppSettings
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  resetSettings: () => void
  exportSettings: () => string
  importSettings: (data: string) => boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('pedicalc-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pedicalc-settings', JSON.stringify(settings))
  }, [settings])

  // Apply theme to document with smooth transitions
  useEffect(() => {
    const root = document.documentElement
    
    // Add transition class for smooth theme changes
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease'
    
    if (settings.theme === 'dark') {
      root.classList.add('dark')
    } else if (settings.theme === 'light') {
      root.classList.remove('dark')
    } else {
      // Auto theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        if (settings.theme === 'auto') {
          if (e.matches) {
            root.classList.add('dark')
          } else {
            root.classList.remove('dark')
          }
        }
      }
      
      if (mediaQuery.matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [settings.theme])

  // Apply font size with smooth transitions
  useEffect(() => {
    const root = document.documentElement
    root.style.transition = 'font-size 0.3s ease'
    root.classList.remove('text-small', 'text-medium', 'text-large')
    root.classList.add(`text-${settings.fontSize}`)
  }, [settings.fontSize])

  // Apply high contrast
  useEffect(() => {
    const root = document.documentElement
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
  }, [settings.highContrast])

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('pedicalc-settings')
  }

  const exportSettings = () => {
    return JSON.stringify(settings, null, 2)
  }

  const importSettings = (data: string): boolean => {
    try {
      const parsed = JSON.parse(data)
      setSettings({ ...defaultSettings, ...parsed })
      return true
    } catch (error) {
      console.error('Error importing settings:', error)
      return false
    }
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      resetSettings,
      exportSettings,
      importSettings
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}