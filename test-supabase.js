import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables')
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // First, let's try to get table information
    console.log('Checking available tables...')
    
    // Try different possible table names
    const possibleTables = ['nelson_drugs', 'drugs', 'medications', 'pediatric_drugs', 'drug_data']
    
    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (!error && data) {
          console.log(`✅ Found table: ${tableName}`)
          console.log('Sample data:')
          console.log(JSON.stringify(data, null, 2))
          
          // Get total count
          const { count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })
          
          console.log(`Total records: ${count}`)
          break
        }
      } catch (err) {
        // Continue to next table
      }
    }
    
  } catch (error) {
    console.error('Connection failed:', error)
  }
}

testSupabaseConnection()