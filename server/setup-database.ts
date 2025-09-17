import { supabase } from './services/supabase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log('Setting up Supabase database tables...');
  
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'database', 'supabase-functions.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL commands directly
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('Error executing SQL:', error);
      console.log('Attempting to create tables directly...');
      
      // Create users table directly
      const createUsersQuery = `
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          email_verified BOOLEAN DEFAULT FALSE,
          subscription_tier TEXT DEFAULT 'free',
          credits_remaining INTEGER DEFAULT 3,
          credits_reset_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
          is_admin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      const { error: usersError } = await supabase.rpc('exec_sql', { sql: createUsersQuery });
      console.log(usersError ? 'Failed to create users table' : 'Users table created successfully');
      
      // Create itineraries table directly
      const createItinerariesQuery = `
        CREATE TABLE IF NOT EXISTS public.itineraries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          input_payload JSONB NOT NULL,
          output_json JSONB NOT NULL,
          cached_key TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      const { error: itinerariesError } = await supabase.rpc('exec_sql', { sql: createItinerariesQuery });
      console.log(itinerariesError ? 'Failed to create itineraries table' : 'Itineraries table created successfully');
      
      // Create magic_tokens table directly
      const createTokensQuery = `
        CREATE TABLE IF NOT EXISTS public.magic_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          token TEXT UNIQUE NOT NULL,
          user_id UUID NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      const { error: tokensError } = await supabase.rpc('exec_sql', { sql: createTokensQuery });
      console.log(tokensError ? 'Failed to create magic_tokens table' : 'Magic tokens table created successfully');

      // Create search_history table directly
      const createHistoryQuery = `
        CREATE TABLE IF NOT EXISTS public.search_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          itinerary_data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      const { error: historyError } = await supabase.rpc('exec_sql', { sql: createHistoryQuery });
      console.log(historyError ? 'Failed to create search_history table' : 'Search history table created successfully');
    } else {
      console.log('Database setup completed successfully');
    }
  } catch (error) {
    console.error('Failed to set up database:', error);
    console.log('Please run the SQL setup manually in the Supabase dashboard');
    console.log('Instructions:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Copy and paste the contents of server/database/supabase-functions.sql');
    console.log('4. Run the SQL commands');
  }
}

setupDatabase();