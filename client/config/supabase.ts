import { createClient } from '@supabase/supabase-js';

// Supabase configuration for client-side
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hyhmvmqvmmaiajhjmtkk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
