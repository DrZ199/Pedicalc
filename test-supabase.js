import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nrtaztkewvbtzhbtkffc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ydGF6dGtld3ZidHpoYnRrZmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNTYzNzUsImV4cCI6MjA2OTgzMjM3NX0.vW4SpQRHuUppUbTcbgpTOjqE6lQMmPBl7E6uEIgd1z4'

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