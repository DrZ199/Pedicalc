import { createClient } from '@supabase/supabase-js'
import { safeAsyncOperation, retryAsyncOperation, handleNetworkError, type ApiResponse } from './error-handler'

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required Supabase environment variables. ' +
    'Please check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Disable session persistence for medical app security
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'pedicalc-app'
    }
  }
})

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

// Fetch all drugs from pediatric_drugs table with enhanced error handling
export async function fetchAllDrugs(): Promise<PediatricDrug[]> {
  const result = await retryAsyncOperation(async () => {
    const { data, error } = await supabase
      .from('pediatric_drugs')
      .select('*')
      .order('Drug', { ascending: true })

    if (error) {
      throw new Error(`Database error: ${error.message} (Code: ${error.code || 'Unknown'})`);
    }

    if (!data) {
      throw new Error('No data returned from pediatric_drugs table');
    }

    return data;
  }, 'fetchAllDrugs', 2, 1000);

  if (result.success) {
    console.log(`Successfully fetched ${result.data.length} medications from database`);
    return result.data;
  } else {
    console.error('Failed to fetch drugs after retries:', result.error);
    throw new Error(result.userMessage);
  }
}

// Alternative function that returns ApiResponse instead of throwing
export async function fetchAllDrugsWithResponse(): Promise<ApiResponse<PediatricDrug[]>> {
  return retryAsyncOperation(async () => {
    const { data, error } = await supabase
      .from('pediatric_drugs')
      .select('*')
      .order('Drug', { ascending: true })

    if (error) {
      throw new Error(`Database error: ${error.message} (Code: ${error.code || 'Unknown'})`);
    }

    if (!data) {
      throw new Error('No data returned from pediatric_drugs table');
    }

    return data;
  }, 'fetchAllDrugs', 2, 1000);
}

// Search drugs by name or indication with enhanced error handling
export async function searchDrugs(query: string): Promise<PediatricDrug[]> {
  if (!query || query.trim().length === 0) {
    throw new Error('Search query cannot be empty');
  }

  const sanitizedQuery = query.trim().replace(/[%]/g, '\\%'); // Escape SQL wildcards
  
  const result = await safeAsyncOperation(async () => {
    const { data, error } = await supabase
      .from('pediatric_drugs')
      .select('*')
      .or(`Drug.ilike.%${sanitizedQuery}%,Indication.ilike.%${sanitizedQuery}%,Class.ilike.%${sanitizedQuery}%`)
      .order('Drug', { ascending: true })
      .limit(100) // Limit results for performance

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    return data || [];
  }, `searchDrugs(${query.substring(0, 20)})`);

  if (result.success) {
    console.log(`Search for "${query}" returned ${result.data.length} results`);
    return result.data;
  } else {
    console.error('Drug search failed:', result.error);
    throw new Error(result.userMessage);
  }
}

// Get drugs by system with enhanced error handling
export async function getDrugsBySystem(system: string): Promise<PediatricDrug[]> {
  if (!system || system.trim().length === 0) {
    throw new Error('System parameter cannot be empty');
  }

  const result = await safeAsyncOperation(async () => {
    const { data, error } = await supabase
      .from('pediatric_drugs')
      .select('*')
      .eq('System', system.trim())
      .order('Drug', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch drugs for system "${system}": ${error.message}`);
    }

    return data || [];
  }, `getDrugsBySystem(${system})`);

  if (result.success) {
    console.log(`Fetched ${result.data.length} drugs for system "${system}"`);
    return result.data;
  } else {
    console.error('Failed to fetch drugs by system:', result.error);
    throw new Error(result.userMessage);
  }
}

// Get unique systems with enhanced error handling
export async function getSystems(): Promise<string[]> {
  const result = await safeAsyncOperation(async () => {
    const { data, error } = await supabase
      .from('pediatric_drugs')
      .select('System')
      .not('System', 'is', null)

    if (error) {
      throw new Error(`Failed to fetch systems: ${error.message}`);
    }

    if (!data) {
      throw new Error('No systems data returned');
    }

    const systems = [...new Set(data.map(item => item.System).filter(Boolean))];
    return systems.sort();
  }, 'getSystems');

  if (result.success) {
    console.log(`Fetched ${result.data.length} unique systems`);
    return result.data;
  } else {
    console.error('Failed to fetch systems:', result.error);
    throw new Error(result.userMessage);
  }
}

// Get unique classes for categorization with enhanced error handling
export async function getClasses(): Promise<string[]> {
  const result = await safeAsyncOperation(async () => {
    const { data, error } = await supabase
      .from('pediatric_drugs')
      .select('Class')
      .not('Class', 'is', null)

    if (error) {
      throw new Error(`Failed to fetch drug classes: ${error.message}`);
    }

    if (!data) {
      throw new Error('No drug classes data returned');
    }

    const classes = [...new Set(data.map(item => item.Class).filter(Boolean))];
    return classes.sort();
  }, 'getClasses');

  if (result.success) {
    console.log(`Fetched ${result.data.length} unique drug classes`);
    return result.data;
  } else {
    console.error('Failed to fetch drug classes:', result.error);
    throw new Error(result.userMessage);
  }
}

// Connection health check
export async function checkDatabaseConnection(): Promise<ApiResponse<boolean>> {
  return safeAsyncOperation(async () => {
    const { data, error } = await supabase
      .from('pediatric_drugs')
      .select('count', { count: 'exact', head: true })
      .limit(1)

    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    return true;
  }, 'checkDatabaseConnection');
}

// Get database statistics
export async function getDatabaseStats(): Promise<ApiResponse<{ totalDrugs: number; lastUpdated?: string }>> {
  return safeAsyncOperation(async () => {
    const { count, error } = await supabase
      .from('pediatric_drugs')
      .select('*', { count: 'exact', head: true })

    if (error) {
      throw new Error(`Failed to get database stats: ${error.message}`);
    }

    return {
      totalDrugs: count || 0,
      lastUpdated: new Date().toISOString()
    };
  }, 'getDatabaseStats');
}