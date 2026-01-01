import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://msgtkpbtxfvofdeheden.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZ3RrcGJ0eGZ2b2ZkZWhlZGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NDYxNzYsImV4cCI6MjA4MjUyMjE3Nn0.O4cj6sdlW2hhUDyU2py5UEI1DKP5TWTzQw44OePmru0'

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
