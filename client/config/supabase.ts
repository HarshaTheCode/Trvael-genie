import { createClient } from '@supabase/supabase-js';

// Supabase configuration for client-side
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hyhmvmqvmmaiajhjmtkk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5aG12bXF2bW1haWFqaGptdGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc0MzA4MDAsImV4cCI6MjAzMzAwNjgwMH0.Nh0fPXLQnpZ-5oULQQVXCmXHk2D9gNCRUlMvWAzEI-I';

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
