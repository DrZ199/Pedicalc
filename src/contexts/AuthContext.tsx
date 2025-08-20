// Basic Authentication Context for PediCalc
// Provides healthcare professional authentication and role management

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { SimpleErrorBoundary } from '@/components/ErrorBoundary'
import { safeAsyncOperation } from '@/lib/error-handler'

export interface User {
  id: string
  email: string
  name: string
  role: 'healthcare_professional' | 'nurse' | 'pharmacist' | 'student' | 'admin'
  license?: string
  organization?: string
  verified: boolean
  acceptedDisclaimer: boolean
  createdAt: Date
  lastLogin: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  verifyCredentials: (licenseNumber: string, organization: string) => Promise<boolean>
  updateProfile: (updates: Partial<User>) => Promise<void>
  acceptDisclaimer: () => Promise<void>
  clearError: () => void
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: User['role']
  license?: string
  organization?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock authentication service (replace with real authentication)
class AuthService {
  private static users: Map<string, User & { password: string }> = new Map([
    ['demo@pedicalc.com', {
      id: '1',
      email: 'demo@pedicalc.com',
      password: 'demo123',
      name: 'Dr. Demo User',
      role: 'healthcare_professional',
      license: 'MD12345',
      organization: 'Demo Medical Center',
      verified: true,
      acceptedDisclaimer: true,
      createdAt: new Date(),
      lastLogin: new Date()
    }]
  ])

  static async login(email: string, password: string): Promise<User> {
    const user = this.users.get(email.toLowerCase())
    
    if (!user) {
      throw new Error('Invalid email or password')
    }
    
    if (user.password !== password) {
      throw new Error('Invalid email or password')
    }
    
    // Update last login
    user.lastLogin = new Date()
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  static async register(userData: RegisterData): Promise<User> {
    const existingUser = this.users.get(userData.email.toLowerCase())
    
    if (existingUser) {
      throw new Error('User already exists with this email')
    }

    // Validate healthcare credentials
    if (userData.role === 'healthcare_professional' && !userData.license) {
      throw new Error('Medical license is required for healthcare professionals')
    }

    const newUser: User & { password: string } = {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email.toLowerCase(),
      password: userData.password,
      name: userData.name,
      role: userData.role,
      license: userData.license,
      organization: userData.organization,
      verified: userData.role !== 'healthcare_professional', // Healthcare professionals need manual verification
      acceptedDisclaimer: false,
      createdAt: new Date(),
      lastLogin: new Date()
    }

    this.users.set(userData.email.toLowerCase(), newUser)

    const { password: _, ...userWithoutPassword } = newUser
    return userWithoutPassword
  }

  static async verifyCredentials(licenseNumber: string, organization: string): Promise<boolean> {
    // Mock credential verification
    // In production, this would check against medical license databases
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
    
    // Simple mock validation
    return licenseNumber.length >= 5 && organization.length >= 3
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    const result = await safeAsyncOperation(async () => {
      // Check localStorage for session (in production, use secure session management)
      const savedUser = localStorage.getItem('pedicalc_user')
      if (savedUser) {
        const user = JSON.parse(savedUser)
        // Validate session is still valid
        if (new Date().getTime() - new Date(user.lastLogin).getTime() < 24 * 60 * 60 * 1000) {
          return user
        } else {
          localStorage.removeItem('pedicalc_user')
        }
      }
      return null
    }, 'checkExistingSession')

    if (result.success && result.data) {
      setAuthState({
        user: result.data,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
    } else {
      setAuthState(prev => ({
        ...prev,
        isLoading: false
      }))
    }
  }

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    const result = await safeAsyncOperation(async () => {
      return AuthService.login(email, password)
    }, 'login')

    if (result.success) {
      // Save session (in production, use secure session management)
      localStorage.setItem('pedicalc_user', JSON.stringify(result.data))
      
      setAuthState({
        user: result.data,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
    } else {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: result.userMessage
      }))
    }
  }

  const logout = async () => {
    const result = await safeAsyncOperation(async () => {
      localStorage.removeItem('pedicalc_user')
      return true
    }, 'logout')

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
  }

  const register = async (userData: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    const result = await safeAsyncOperation(async () => {
      return AuthService.register(userData)
    }, 'register')

    if (result.success) {
      // Auto-login after registration
      localStorage.setItem('pedicalc_user', JSON.stringify(result.data))
      
      setAuthState({
        user: result.data,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
    } else {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: result.userMessage
      }))
    }
  }

  const verifyCredentials = async (licenseNumber: string, organization: string): Promise<boolean> => {
    const result = await safeAsyncOperation(async () => {
      return AuthService.verifyCredentials(licenseNumber, organization)
    }, 'verifyCredentials')

    return result.success ? result.data : false
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!authState.user) return

    const result = await safeAsyncOperation(async () => {
      const updatedUser = { ...authState.user!, ...updates }
      localStorage.setItem('pedicalc_user', JSON.stringify(updatedUser))
      return updatedUser
    }, 'updateProfile')

    if (result.success) {
      setAuthState(prev => ({
        ...prev,
        user: result.data
      }))
    }
  }

  const acceptDisclaimer = async () => {
    if (!authState.user) return

    await updateProfile({ acceptedDisclaimer: true })
  }

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }))
  }

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
    verifyCredentials,
    updateProfile,
    acceptDisclaimer,
    clearError
  }

  return (
    <SimpleErrorBoundary message="Authentication system failed">
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    </SimpleErrorBoundary>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()
    
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      )
    }
    
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to access medical calculation tools.
            </p>
            <p className="text-sm text-orange-600">
              This application requires verification of healthcare credentials.
            </p>
          </div>
        </div>
      )
    }
    
    return <Component {...props} />
  }
}

// Role-based access control
export function hasPermission(user: User | null, requiredRole: User['role'] | User['role'][]): boolean {
  if (!user) return false
  
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return roles.includes(user.role)
}

// Medical license validation
export function requiresMedicalLicense(role: User['role']): boolean {
  return ['healthcare_professional', 'pharmacist'].includes(role)
}