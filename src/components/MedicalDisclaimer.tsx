import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle, Shield, Stethoscope, FileText } from 'lucide-react'

interface MedicalDisclaimerProps {
  isOpen: boolean
  onAccept: () => void
  onDecline: () => void
}

export function MedicalDisclaimer({ isOpen, onAccept, onDecline }: MedicalDisclaimerProps) {
  const [hasReadDisclaimer, setHasReadDisclaimer] = useState(false)
  const [acknowledgeRisks, setAcknowledgeRisks] = useState(false)
  const [acknowledgeResponsibility, setAcknowledgeResponsibility] = useState(false)
  const [canAccept, setCanAccept] = useState(false)

  useEffect(() => {
    setCanAccept(hasReadDisclaimer && acknowledgeRisks && acknowledgeResponsibility)
  }, [hasReadDisclaimer, acknowledgeRisks, acknowledgeResponsibility])

  const handleAccept = () => {
    if (canAccept) {
      localStorage.setItem('pedicalc-disclaimer-accepted', Date.now().toString())
      onAccept()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            IMPORTANT MEDICAL DISCLAIMER
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Critical Warning */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              This application is a clinical decision support tool intended for use by qualified healthcare professionals only. 
              It is NOT a substitute for clinical judgment, medical training, or professional medical advice.
            </AlertDescription>
          </Alert>

          {/* Main Disclaimer Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Terms of Use and Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">1. Clinical Decision Support Tool</h4>
                <p className="text-gray-700">
                  PediCalc provides pediatric medication dosage calculations based on established clinical guidelines. 
                  However, all calculations must be independently verified before medication administration. 
                  The software does not replace clinical judgment or professional medical training.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Professional Responsibility</h4>
                <p className="text-gray-700">
                  Healthcare providers using this application remain fully responsible for:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-700">
                  <li>Verifying all dosage calculations independently</li>
                  <li>Considering patient-specific factors and contraindications</li>
                  <li>Following institutional protocols and guidelines</li>
                  <li>Ensuring appropriate clinical monitoring</li>
                  <li>Obtaining necessary approvals and consultations</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Limitations and Accuracy</h4>
                <p className="text-gray-700">
                  While every effort has been made to ensure accuracy, the developers cannot guarantee:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-700">
                  <li>Complete accuracy of all calculations</li>
                  <li>Applicability to all clinical situations</li>
                  <li>Compatibility with all medication formulations</li>
                  <li>Currency of all drug information</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4. No Warranty and Limitation of Liability</h4>
                <p className="text-gray-700">
                  This software is provided "AS IS" without warranty of any kind. The developers, contributors, 
                  and distributors shall not be liable for any direct, indirect, incidental, special, or 
                  consequential damages arising from the use of this application, including but not limited 
                  to patient harm, medical errors, or adverse outcomes.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5. Regulatory Compliance</h4>
                <p className="text-gray-700">
                  Users are responsible for ensuring compliance with local regulations, institutional policies, 
                  and professional standards. This software has not been evaluated by regulatory authorities 
                  as a medical device.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">6. Emergency Situations</h4>
                <p className="text-gray-700">
                  In emergency situations, do not rely solely on this application. Follow established emergency 
                  protocols and consult with appropriate medical personnel immediately.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-yellow-600" />
                  For Healthcare Professionals Only
                </h4>
                <p className="text-sm text-yellow-800">
                  This application is intended exclusively for use by licensed healthcare professionals 
                  with appropriate training in pediatric medicine and pharmacology. Use by unqualified 
                  individuals is strictly prohibited.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Acknowledgment Checkboxes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Required Acknowledgments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="read-disclaimer"
                  checked={hasReadDisclaimer}
                  onCheckedChange={setHasReadDisclaimer}
                />
                <label htmlFor="read-disclaimer" className="text-sm font-medium cursor-pointer">
                  I have read and understand the complete medical disclaimer above
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="acknowledge-risks"
                  checked={acknowledgeRisks}
                  onCheckedChange={setAcknowledgeRisks}
                />
                <label htmlFor="acknowledge-risks" className="text-sm font-medium cursor-pointer">
                  I acknowledge the risks and limitations of this software and will not rely solely on its output for clinical decisions
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="acknowledge-responsibility"
                  checked={acknowledgeResponsibility}
                  onCheckedChange={setAcknowledgeResponsibility}
                />
                <label htmlFor="acknowledge-responsibility" className="text-sm font-medium cursor-pointer">
                  I accept full professional responsibility for all clinical decisions and will independently verify all calculations
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button 
              variant="outline" 
              onClick={onDecline}
              className="px-6"
            >
              Decline - Exit Application
            </Button>
            <Button 
              onClick={handleAccept}
              disabled={!canAccept}
              className="px-6 bg-green-600 hover:bg-green-700"
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Accept - Continue as Healthcare Professional
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for managing disclaimer state
export function useMedicalDisclaimer() {
  const [needsDisclaimer, setNeedsDisclaimer] = useState(true)

  useEffect(() => {
    const disclaimerAccepted = localStorage.getItem('pedicalc-disclaimer-accepted')
    const isEnabled = import.meta.env.VITE_MEDICAL_DISCLAIMER_ENABLED === 'true'
    
    if (!isEnabled || disclaimerAccepted) {
      setNeedsDisclaimer(false)
    }
  }, [])

  const acceptDisclaimer = () => {
    setNeedsDisclaimer(false)
  }

  const declineDisclaimer = () => {
    // Clear any stored data and redirect away from the application
    localStorage.clear()
    window.location.href = 'about:blank'
  }

  return {
    needsDisclaimer,
    acceptDisclaimer,
    declineDisclaimer
  }
}