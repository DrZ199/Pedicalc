import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Search, Heart, Pill, AlertTriangle, DatabaseX } from 'lucide-react'
import { type Medication } from '@/lib/medication-database'
import { SimpleErrorBoundary } from '@/components/ErrorBoundary'

interface MedicationSelectionScreenProps {
  searchTerm: string
  selectedCategory: string
  selectedMedication: Medication | null
  progress: number
  categories: string[]
  medications: Medication[]
  favorites: number[]
  onSearchChange: (term: string) => void
  onCategoryChange: (category: string) => void
  onMedicationSelect: (medication: Medication) => void
  onCalculate: () => void
  onBack: () => void
}

export function MedicationSelectionScreen({
  searchTerm,
  selectedCategory,
  selectedMedication,
  progress,
  categories,
  medications,
  favorites,
  onSearchChange,
  onCategoryChange,
  onMedicationSelect,
  onCalculate,
  onBack
}: MedicationSelectionScreenProps) {
  
  // Error handling for medication data
  if (!medications || medications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 safe-area-inset flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mb-4 flex justify-center">
            <div className="rounded-2xl bg-orange-100 p-4">
              <DatabaseX className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Medications Available</h2>
          <p className="text-muted-foreground mb-4">The medication database is empty or failed to load.</p>
          <Button onClick={() => window.location.reload()} className="bg-orange-600 hover:bg-orange-700">
            Reload Database
          </Button>
        </div>
      </div>
    )
  }
  
  const displayCategories = ['ALL', ...(categories || []).slice(0, 10)] // Show top 10 categories

  // Safe filtering with error handling
  const filteredMedications = React.useMemo(() => {
    try {
      if (!medications || medications.length === 0) {
        return []
      }
      
      return medications.filter(med => {
        try {
          if (!med) return false
          
          const searchLower = (searchTerm || '').toLowerCase()
          const matchesSearch = searchTerm === '' || (
            (med.name || '').toLowerCase().includes(searchLower) ||
            (med.indication || '').toLowerCase().includes(searchLower) ||
            (med.class || '').toLowerCase().includes(searchLower)
          )
          
          const matchesCategory = selectedCategory === 'ALL' || med.category === selectedCategory
          
          return matchesSearch && matchesCategory
        } catch (filterError) {
          console.warn('Error filtering medication:', med, filterError)
          return false
        }
      })
    } catch (error) {
      console.error('Error in medication filtering:', error)
      return []
    }
  }, [medications, searchTerm, selectedCategory])

  // Safe favorites filtering
  const favoriteMedications = React.useMemo(() => {
    try {
      if (!medications || !favorites || favorites.length === 0) {
        return []
      }
      
      return medications.filter(med => {
        try {
          return med && favorites.includes(med.id)
        } catch (error) {
          console.warn('Error checking favorite medication:', med, error)
          return false
        }
      })
    } catch (error) {
      console.error('Error filtering favorites:', error)
      return []
    }
  }, [medications, favorites])

  const MedicationCard = ({ medication }: { medication: Medication }) => {
    if (!medication) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-red-800">Invalid medication data</p>
          </CardContent>
        </Card>
      )
    }
    
    return (
    <Card 
      className={`cursor-pointer border-2 transition-all duration-200 haptic-tap ${
        selectedMedication?.id === medication.id 
          ? 'border-primary bg-primary/5 shadow-lg' 
          : 'border-gray-200 bg-white/80 hover:shadow-md hover:border-primary/50'
      }`}
      onClick={() => onMedicationSelect(medication)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Pill className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{medication.name}</h3>
              <p className="text-sm text-muted-foreground">
                {medication.dosage_forms.join(', ')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {medication.indication} • {medication.class}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="secondary" className="text-xs">
              {medication.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {medication.system}
            </Badge>
            {favorites.includes(medication.id) && (
              <Heart className="h-3 w-3 fill-red-500 text-red-500" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )}
  


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
            <h2 className="text-xl font-bold text-gray-900">Select Medication</h2>
            <p className="text-sm text-muted-foreground">Choose the medication</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progress} className="mb-2 h-2" />
          <p className="text-xs text-muted-foreground">Step 2 of 3</p>
        </div>

        {/* Search */}
        <SimpleErrorBoundary message="Search component failed">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => {
                try {
                  onSearchChange(e.target.value)
                } catch (error) {
                  console.error('Search error:', error)
                }
              }}
              className="h-12 pl-12 border-2 border-primary/20 focus:border-primary"
            />
          </div>
        </SimpleErrorBoundary>

        {/* Category Filter */}
        <SimpleErrorBoundary message="Category filter failed">
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {displayCategories.length === 0 ? (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  No categories available. Showing all medications.
                </AlertDescription>
              </Alert>
            ) : (
              displayCategories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    try {
                      onCategoryChange(category)
                    } catch (error) {
                      console.error('Category change error:', error)
                    }
                  }}
                  className="whitespace-nowrap haptic-tap"
                >
                  {category}
                </Button>
              ))
            )}
          </div>
        </SimpleErrorBoundary>

        {/* Favorites */}
        <SimpleErrorBoundary message="Favorites section failed">
          {searchTerm === '' && selectedCategory === 'ALL' && favoriteMedications.length > 0 && (
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <h3 className="font-medium text-gray-900">Favorites</h3>
              </div>
              <div className="space-y-2">
                {favoriteMedications.map(med => (
                  <SimpleErrorBoundary key={`fav-${med?.id || 'unknown'}`} message="Favorite card failed">
                    <MedicationCard medication={med} />
                  </SimpleErrorBoundary>
                ))}
              </div>
            </div>
          )}
        </SimpleErrorBoundary>

        {/* Medications List */}
        <SimpleErrorBoundary message="Medications list failed">
          <div className="space-y-3">
            {selectedCategory !== 'ALL' && (
              <h3 className="font-medium text-gray-900">{selectedCategory}</h3>
            )}
            {filteredMedications.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-2 text-gray-400">
                  <Search className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-gray-600">No medications found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm ? `Try different search terms` : 'Try selecting a different category'}
                </p>
                {medications.length > 0 && filteredMedications.length === 0 && searchTerm && (
                  <Alert className="mt-4 border-blue-200 bg-blue-50">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      <strong>Tip:</strong> Try searching by medication name, indication, or drug class.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              filteredMedications.map(med => (
                <SimpleErrorBoundary key={med?.id || `med-${Math.random()}`} message="Medication card failed">
                  <MedicationCard medication={med} />
                </SimpleErrorBoundary>
              ))
            )}
          </div>
        </SimpleErrorBoundary>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-6 left-6 right-6">
        <div className="mx-auto max-w-md">
          <SimpleErrorBoundary message="Calculate button failed">
            <Button 
              className="h-14 w-full text-lg font-medium shadow-lg haptic-tap" 
              onClick={() => {
                try {
                  if (!selectedMedication) {
                    console.warn('No medication selected for calculation')
                    return
                  }
                  onCalculate()
                } catch (error) {
                  console.error('Calculate button error:', error)
                }
              }}
              disabled={!selectedMedication}
            >
              Calculate Dosage
            </Button>
            
            {!selectedMedication && medications.length > 0 && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Please select a medication to continue
              </p>
            )}
          </SimpleErrorBoundary>
        </div>
      </div>
    </div>
  )
}