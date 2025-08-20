// React Error Boundary for catching and handling React component errors
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('React Error Boundary caught an error:', error, errorInfo)
    
    // Store error info in state
    this.setState({
      error,
      errorInfo
    })

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report error in development
    if (import.meta.env.DEV) {
      console.group('🚨 React Error Boundary')
      console.error('Error:', error.message)
      console.error('Stack:', error.stack)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }

    // In production, you might want to send errors to a logging service
    // Example: logErrorToService(error, errorInfo, this.state.errorId)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    })
  }

  handleGoHome = () => {
    // Reset error and navigate home
    this.handleReset()
    // In a router setup, you would navigate programmatically
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isNetworkError = this.state.error.message.includes('fetch') || 
                           this.state.error.message.includes('network') ||
                           this.state.error.message.includes('connection')

      const isMedicalCalculationError = this.state.error.message.includes('calculation') ||
                                       this.state.error.message.includes('dosage') ||
                                       this.state.error.message.includes('validation')

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            {/* Error Icon */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                {isNetworkError ? 'Connection error occurred' : 
                 isMedicalCalculationError ? 'Calculation error occurred' :
                 'An unexpected error occurred'}
              </p>
            </div>

            {/* Error Details Card */}
            <Card className="mb-6 border-red-200 bg-red-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bug className="w-5 h-5 text-red-600" />
                  Error Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Error message */}
                <Alert className="border-red-300 bg-red-50">
                  <AlertDescription className="text-sm">
                    <strong>Error:</strong> {this.state.error.message}
                  </AlertDescription>
                </Alert>

                {/* Error ID for support */}
                <div className="text-xs text-muted-foreground">
                  Error ID: <code className="bg-gray-100 px-1 rounded">{this.state.errorId}</code>
                </div>

                {/* Development mode details */}
                {import.meta.env.DEV && this.state.errorInfo && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-gray-900">
                      Technical Details (Development)
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Primary action based on error type */}
              {isNetworkError ? (
                <Button 
                  onClick={this.handleReload} 
                  className="w-full h-12 bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </Button>
              ) : isMedicalCalculationError ? (
                <Button 
                  onClick={this.handleReset} 
                  className="w-full h-12 bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Calculation
                </Button>
              ) : (
                <Button 
                  onClick={this.handleReload} 
                  className="w-full h-12 bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Application
                </Button>
              )}

              {/* Secondary actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={this.handleReset}
                  className="h-10"
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="h-10"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </div>
            </div>

            {/* Medical Safety Notice */}
            {isMedicalCalculationError && (
              <Alert className="mt-4 border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 text-sm">
                  <strong>Medical Safety:</strong> Please double-check all calculations manually 
                  and consult appropriate medical references before administering any medication.
                </AlertDescription>
              </Alert>
            )}

            {/* Contact Support */}
            <div className="mt-6 text-center text-xs text-muted-foreground">
              If this problem persists, please contact support with Error ID: {this.state.errorId}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Simplified Error Boundary for specific components
export function SimpleErrorBoundary({ children, message = "Component failed to load" }: {
  children: ReactNode
  message?: string
}) {
  return (
    <ErrorBoundary fallback={
      <div className="p-4 text-center">
        <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button size="sm" onClick={() => window.location.reload()} className="mt-2">
          Reload
        </Button>
      </div>
    }>
      {children}
    </ErrorBoundary>
  )
}

// Hook for programmatic error handling
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Application Error:', error, errorInfo)
    
    // You could dispatch to a global error state or send to logging service
    // Example: dispatch({ type: 'SET_ERROR', error, errorInfo })
  }
}

// Async error handler for promises
export function handleAsyncError(error: unknown, context: string = 'Unknown') {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorObject = error instanceof Error ? error : new Error(errorMessage)
  
  console.error(`Async error in ${context}:`, errorObject)
  
  // In production, send to error reporting service
  // Example: reportError(errorObject, { context, timestamp: new Date().toISOString() })
  
  return {
    success: false,
    error: errorMessage,
    context
  }
}