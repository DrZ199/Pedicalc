import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  User, 
  Palette, 
  Globe, 
  Shield, 
  Bell, 
  Trash2, 
  Download,
  Upload,
  RotateCcw,
  Info,
  Zap,
  Eye
} from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'

type SettingsSection = 'main' | 'profile' | 'display' | 'units' | 'privacy' | 'notifications' | 'data' | 'about'

interface SettingsScreenProps {
  onBack: () => void
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [selectedSection, setSelectedSection] = useState<SettingsSection | null>(null)

  const sections = [
    {
      id: 'profile' as SettingsSection,
      name: 'Professional Profile',
      description: 'Manage your healthcare provider information',
      icon: User,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'display' as SettingsSection,
      name: 'Display & Accessibility',
      description: 'Theme, font size, and accessibility options',
      icon: Eye,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'units' as SettingsSection,
      name: 'Default Units',
      description: 'Set preferred measurement units',
      icon: Globe,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'privacy' as SettingsSection,
      name: 'Privacy & Security',
      description: 'Data handling and privacy preferences',
      icon: Shield,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'notifications' as SettingsSection,
      name: 'Notifications',
      description: 'Manage app notifications and alerts',
      icon: Bell,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 'data' as SettingsSection,
      name: 'Data Management',
      description: 'Export, import, and clear app data',
      icon: Download,
      color: 'bg-cyan-100 text-cyan-600'
    },
    {
      id: 'about' as SettingsSection,
      name: 'About PediCalc',
      description: 'App information and support',
      icon: Info,
      color: 'bg-gray-100 text-gray-600'
    }
  ]

  if (selectedSection) {
    return (
      <SettingsDetail 
        section={selectedSection} 
        onBack={() => setSelectedSection(null)} 
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
            <h2 className="text-xl font-bold text-gray-900">Settings</h2>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section) => {
            const IconComponent = section.icon
            return (
              <Card 
                key={section.id}
                className="cursor-pointer border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 haptic-tap"
                onClick={() => setSelectedSection(section.id)}
              >
                <CardContent className="flex items-center p-6">
                  <div className={`mr-4 rounded-full p-3 ${section.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 rounded-2xl bg-white/50 p-6 backdrop-blur-sm">
          <h4 className="mb-4 font-semibold text-gray-900">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="h-12 haptic-tap">
              <Zap className="mr-2 h-4 w-4" />
              Reset Defaults
            </Button>
            <Button variant="outline" size="sm" className="h-12 haptic-tap">
              <Download className="mr-2 h-4 w-4" />
              Export Settings
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            PediCalc v1.0.0 • Healthcare Professional Edition
          </p>
        </div>
      </div>
    </div>
  )
}

interface SettingsDetailProps {
  section: SettingsSection
  onBack: () => void
}

function SettingsDetail({ section, onBack }: SettingsDetailProps) {
  const { settings, updateSetting, resetSettings, exportSettings, importSettings } = useSettings()
  const [importData, setImportData] = useState('')
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  const getTitle = () => {
    switch (section) {
      case 'profile': return 'Professional Profile'
      case 'display': return 'Display & Accessibility'
      case 'units': return 'Default Units'
      case 'privacy': return 'Privacy & Security'
      case 'notifications': return 'Notifications'
      case 'data': return 'Data Management'
      case 'about': return 'About PediCalc'
      default: return 'Settings'
    }
  }

  const handleExport = () => {
    const data = exportSettings()
    navigator.clipboard.writeText(data).then(() => {
      setActionMessage('Settings copied to clipboard!')
      setTimeout(() => setActionMessage(''), 3000)
    })
  }

  const handleImport = () => {
    if (importSettings(importData)) {
      setActionMessage('Settings imported successfully!')
      setShowImportDialog(false)
      setImportData('')
      setTimeout(() => setActionMessage(''), 3000)
    } else {
      setActionMessage('Error: Invalid settings data')
      setTimeout(() => setActionMessage(''), 3000)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      resetSettings()
      setActionMessage('Settings reset to defaults')
      setTimeout(() => setActionMessage(''), 3000)
    }
  }

  const renderSection = () => {
    switch (section) {
      case 'profile': return (
        <div className="space-y-6">
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="displayName" className="mb-2 block text-base font-medium">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Dr. Jane Smith"
                  value={settings.displayName}
                  onChange={(e) => updateSetting('displayName', e.target.value)}
                  className="h-12 border-2 border-primary/20 focus:border-primary"
                />
              </div>
              
              <div>
                <Label htmlFor="institution" className="mb-2 block text-base font-medium">Institution</Label>
                <Input
                  id="institution"
                  placeholder="Children's Hospital"
                  value={settings.institution}
                  onChange={(e) => updateSetting('institution', e.target.value)}
                  className="h-12 border-2 border-primary/20 focus:border-primary"
                />
              </div>
              
              <div>
                <Label htmlFor="license" className="mb-2 block text-base font-medium">License Number (Optional)</Label>
                <Input
                  id="license"
                  placeholder="MD123456"
                  value={settings.licenseNumber}
                  onChange={(e) => updateSetting('licenseNumber', e.target.value)}
                  className="h-12 border-2 border-primary/20 focus:border-primary"
                />
              </div>
            </CardContent>
          </Card>
          
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              This information is stored locally on your device and is never transmitted to external servers.
            </AlertDescription>
          </Alert>
        </div>
      )
      
      case 'display': return (
        <div className="space-y-6">
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Theme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block text-base font-medium">Appearance</Label>
                <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value as any)}>
                  <SelectTrigger className="h-12 border-2 border-primary/20 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Accessibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block text-base font-medium">Font Size</Label>
                <Select value={settings.fontSize} onValueChange={(value) => updateSetting('fontSize', value as any)}>
                  <SelectTrigger className="h-12 border-2 border-primary/20 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">High Contrast</Label>
                  <p className="text-sm text-muted-foreground">Improve text readability</p>
                </div>
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )

      case 'units': return (
        <div className="space-y-6">
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Measurement Units</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block text-base font-medium">Weight</Label>
                <Select value={settings.defaultWeightUnit} onValueChange={(value) => updateSetting('defaultWeightUnit', value as any)}>
                  <SelectTrigger className="h-12 border-2 border-primary/20 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="mb-2 block text-base font-medium">Height</Label>
                <Select value={settings.defaultHeightUnit} onValueChange={(value) => updateSetting('defaultHeightUnit', value as any)}>
                  <SelectTrigger className="h-12 border-2 border-primary/20 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">Centimeters (cm)</SelectItem>
                    <SelectItem value="inches">Inches (in)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="mb-2 block text-base font-medium">Temperature</Label>
                <Select value={settings.defaultTemperatureUnit} onValueChange={(value) => updateSetting('defaultTemperatureUnit', value as any)}>
                  <SelectTrigger className="h-12 border-2 border-primary/20 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celsius">Celsius (°C)</SelectItem>
                    <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Display Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="mb-2 block text-base font-medium">Decimal Places</Label>
                <Select value={settings.showDecimalPlaces.toString()} onValueChange={(value) => updateSetting('showDecimalPlaces', parseInt(value))}>
                  <SelectTrigger className="h-12 border-2 border-primary/20 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 (25 mg)</SelectItem>
                    <SelectItem value="1">1 (25.0 mg)</SelectItem>
                    <SelectItem value="2">2 (25.00 mg)</SelectItem>
                    <SelectItem value="3">3 (25.000 mg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      )

      case 'privacy': return (
        <div className="space-y-6">
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Data Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Save Calculation History</Label>
                  <p className="text-sm text-muted-foreground">Store calculations locally</p>
                </div>
                <Switch
                  checked={settings.saveHistory}
                  onCheckedChange={(checked) => updateSetting('saveHistory', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Anonymous Analytics</Label>
                  <p className="text-sm text-muted-foreground">Help improve the app</p>
                </div>
                <Switch
                  checked={settings.analyticsEnabled}
                  onCheckedChange={(checked) => updateSetting('analyticsEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              All data is stored locally on your device. No patient information is ever transmitted to external servers.
            </AlertDescription>
          </Alert>
        </div>
      )

      case 'notifications': return (
        <div className="space-y-6">
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">App Updates</Label>
                  <p className="text-sm text-muted-foreground">New features and improvements</p>
                </div>
                <Switch
                  checked={settings.updateNotifications}
                  onCheckedChange={(checked) => updateSetting('updateNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Calculation Reminders</Label>
                  <p className="text-sm text-muted-foreground">Periodic safety reminders</p>
                </div>
                <Switch
                  checked={settings.reminderNotifications}
                  onCheckedChange={(checked) => updateSetting('reminderNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Sound Alerts</Label>
                  <p className="text-sm text-muted-foreground">Audio feedback for actions</p>
                </div>
                <Switch
                  checked={settings.soundAlerts}
                  onCheckedChange={(checked) => updateSetting('soundAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Haptic Feedback</Label>
                  <p className="text-sm text-muted-foreground">Vibration on touch</p>
                </div>
                <Switch
                  checked={settings.hapticFeedback}
                  onCheckedChange={(checked) => updateSetting('hapticFeedback', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )

      case 'data': return (
        <div className="space-y-6">
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Backup & Restore</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleExport}
                className="w-full h-12 haptic-tap"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Settings
              </Button>
              
              <Button 
                onClick={() => setShowImportDialog(!showImportDialog)}
                className="w-full h-12 haptic-tap"
                variant="outline"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Settings
              </Button>
              
              {showImportDialog && (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Paste exported settings data here..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="min-h-24"
                  />
                  <div className="flex gap-3">
                    <Button onClick={handleImport} className="flex-1 haptic-tap">
                      Import
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowImportDialog(false)
                        setImportData('')
                      }}
                      className="flex-1 haptic-tap"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-red-600">Reset Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleReset}
                className="w-full h-12 haptic-tap"
                variant="destructive"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset All Settings
              </Button>
              
              <Button 
                onClick={() => {
                  if (confirm('Are you sure you want to clear all calculation history?')) {
                    localStorage.removeItem('pedicalc-history')
                    setActionMessage('Calculation history cleared')
                    setTimeout(() => setActionMessage(''), 3000)
                  }
                }}
                className="w-full h-12 haptic-tap"
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear History
              </Button>
            </CardContent>
          </Card>
          
          {actionMessage && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>{actionMessage}</AlertDescription>
            </Alert>
          )}
        </div>
      )

      case 'about': return (
        <div className="space-y-6">
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">PediCalc</h3>
                <p className="text-muted-foreground">Pediatric Drug Calculator</p>
                <Badge variant="secondary" className="mt-2">v1.0.0</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">About This App</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                PediCalc is a professional-grade pediatric drug dosage calculator designed for healthcare providers. 
                It provides accurate, evidence-based dosing calculations for common pediatric medications.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Features:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Weight-based dosage calculations</li>
                  <li>Safety range indicators</li>
                  <li>Comprehensive drug database</li>
                  <li>BMI and BSA calculators</li>
                  <li>Emergency drug dosing</li>
                  <li>Offline functionality</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Safety Notice:</h4>
                <p className="text-xs">
                  This application is designed as a clinical decision support tool for qualified healthcare professionals. 
                  It should not replace clinical judgment, and all calculations should be verified before medication administration.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Support & Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full h-12 haptic-tap">
                📧 Contact Support
              </Button>
              <Button variant="outline" className="w-full h-12 haptic-tap">
                📝 Send Feedback
              </Button>
              <Button variant="outline" className="w-full h-12 haptic-tap">
                📚 User Manual
              </Button>
            </CardContent>
          </Card>
        </div>
      )
      
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
            <p className="text-sm text-muted-foreground">Customize your preferences</p>
          </div>
        </div>

        {renderSection()}
      </div>
    </div>
  )
}