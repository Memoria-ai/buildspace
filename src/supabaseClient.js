import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_PUBLIC_KEY_ANON

export const supabase = createClient(supabaseUrl, supabaseAnonKey)