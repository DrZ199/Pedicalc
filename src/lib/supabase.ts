import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nrtaztkewvbtzhbtkffc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ydGF6dGtld3ZidHpoYnRrZmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNTYzNzUsImV4cCI6MjA2OTgzMjM3NX0.vW4SpQRHuUppUbTcbgpTOjqE6lQMmPBl7E6uEIgd1z4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on actual Supabase table structure
export interface PediatricDrug {
  System: string
  Drug: string
  Class: string
  Indication: string
  Pediatric_Dose: string
  Max_Dose: string
  Dosage_Form: string
  Route: string
  Frequency: string
  Contraindications: string
  Major_Side_Effects: string
  Special_Notes: string
}

// Fetch all drugs from pediatric_drugs table
export async function fetchAllDrugs(): Promise<PediatricDrug[]> {
  try {
    const { data, error } = await supabase
      .from('pediatric_drugs')
      .select('*')
      .order('Drug', { ascending: true })

    if (error) {
      console.error('Error fetching drugs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching drugs:', error)
    return []
  }
}

// Search drugs by name or indication
export async function searchDrugs(query: string): Promise<PediatricDrug[]> {
  try {
    const { data, error } = await supabase
      .from('pediatric_drugs')
      .select('*')
      .or(`Drug.ilike.%${query}%,Indication.ilike.%${query}%,Class.ilike.%${query}%`)
      .order('Drug', { ascending: true })

    if (error) {
      console.error('Error searching drugs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error searching drugs:', error)
    return []
  }
}

// Get drugs by system
export async function getDrugsBySystem(system: string): Promise<PediatricDrug[]> {
  try {
    const { data, error } = await supabase
      .from('pediatric_drugs')
      .select('*')
      .eq('System', system)
      .order('Drug', { ascending: true })

    if (error) {
      console.error('Error fetching drugs by system:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching drugs by system:', error)
    return []
  }
}

// Get unique systems
export async function getSystems(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('pediatric_drugs')
      .select('System')
      .not('System', 'is', null)

    if (error) {
      console.error('Error fetching systems:', error)
      return []
    }

    const systems = [...new Set(data?.map(item => item.System).filter(Boolean))]
    return systems.sort()
  } catch (error) {
    console.error('Error fetching systems:', error)
    return []
  }
}

// Get unique classes for categorization
export async function getClasses(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('pediatric_drugs')
      .select('Class')
      .not('Class', 'is', null)

    if (error) {
      console.error('Error fetching classes:', error)
      return []
    }

    const classes = [...new Set(data?.map(item => item.Class).filter(Boolean))]
    return classes.sort()
  } catch (error) {
    console.error('Error fetching classes:', error)
    return []
  }
}