export async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // For development, we're using in-memory storage
    // In production, uncomment the Supabase initialization below

    // await SupabaseService.initializeDatabase();

    console.log('Database initialization completed (using in-memory storage for development)');
  } catch (error) {
    console.error('Database initialization failed:', error);
    console.log('Continuing with in-memory storage...');
    // Don't throw error - allow app to continue with fallback storage
  }
}
