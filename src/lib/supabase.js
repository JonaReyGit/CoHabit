import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Single shared Supabase client instance for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
