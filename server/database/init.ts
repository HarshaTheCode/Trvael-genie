import { SupabaseService } from '../services/supabase';

export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Initialize Supabase tables
    await SupabaseService.initializeDatabase();
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    // Don't throw error - allow app to continue with fallback storage
  }
}
