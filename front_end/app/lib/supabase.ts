import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isValidUrl = (url: string | undefined) => {
    try {
        return url && new URL(url)
    } catch {
        return false
    }
}

// Fallback to prevent crash if env vars are missing/invalid (e.g. during setup)
// This allows the app to load so the user can see instructions, even if auth won't work.
const urlToUse = isValidUrl(supabaseUrl) ? supabaseUrl! : 'https://placeholder.supabase.co'
const keyToUse = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient(urlToUse, keyToUse)
