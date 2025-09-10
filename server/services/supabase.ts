import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Supabase client configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://hyhmvmqvmmaiajhjmtkk.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5aG12bXF2bW1haWFqaGptdGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc0MzA4MDAsImV4cCI6MjAzMzAwNjgwMH0.Nh0fPXLQnpZ-5oULQQVXCmXHk2D9gNCRUlMvWAzEI-I';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5aG12bXF2bW1haWFqaGptdGtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNzQzMDgwMCwiZXhwIjoyMDMzMDA2ODAwfQ.Nh0fPXLQnpZ-5oULQQVXCmXHk2D9gNCRUlMvWAzEI-I';

// Create Supabase client for server-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create Supabase client for client-side operations
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export class SupabaseService {
  /**
   * Initialize database tables if they don't exist
   */
  static async initializeDatabase() {
    try {
      console.log('Checking database tables...');
      
      // Check if tables exist by trying to query them
      const { error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (usersError) {
        console.log('Users table does not exist. Please run the SQL setup manually.');
        console.log('Copy the contents of server/database/supabase-functions.sql to your Supabase SQL editor');
      } else {
        console.log('Users table exists ✓');
      }

      const { error: itinerariesError } = await supabase
        .from('itineraries')
        .select('id')
        .limit(1);
      
      if (itinerariesError) {
        console.log('Itineraries table does not exist. Please run the SQL setup manually.');
      } else {
        console.log('Itineraries table exists ✓');
      }

      const { error: tokensError } = await supabase
        .from('magic_tokens')
        .select('id')
        .limit(1);
      
      if (tokensError) {
        console.log('Magic tokens table does not exist. Please run the SQL setup manually.');
      } else {
        console.log('Magic tokens table exists ✓');
      }

      console.log('Database initialization check completed');
    } catch (error) {
      console.error('Database initialization failed:', error);
      console.log('Please ensure your Supabase tables are created manually');
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserById:', error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error fetching user by email:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      return null;
    }
  }

  /**
   * Create new user
   */
  static async createUser(userData: {
    id?: string;
    email: string;
    password_hash?: string;
    subscriptionTier?: string;
    creditsRemaining?: number;
    isAdmin?: boolean;
  }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          
          email: userData.email,
          password_hash: userData.password_hash,
          subscription_tier: userData.subscriptionTier || 'free',
          credits_remaining: userData.creditsRemaining || 3,
          credits_reset_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          is_admin: userData.isAdmin || false,
          created_at: new Date().toISOString(),
          email_verified: false
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createUser:', error);
      return null;
    }
  }

  /**
   * Update user
   */
  static async updateUser(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateUser:', error);
      return null;
    }
  }

  /**
   * Store magic token
   */
  static async storeMagicToken(token: string, userId: string, expiresAt: Date) {
    try {
      const { error } = await supabase
        .from('magic_tokens')
        .upsert([{
          token,
          user_id: userId,
          expires_at: expiresAt.toISOString()
        }]);

      if (error) {
        console.error('Error storing magic token:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in storeMagicToken:', error);
      return false;
    }
  }

  /**
   * Get magic token
   */
  static async getMagicToken(token: string) {
    try {
      const { data, error } = await supabase
        .from('magic_tokens')
        .select('*')
        .eq('token', token)
        .single();

      if (error) {
        console.error('Error fetching magic token:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getMagicToken:', error);
      return null;
    }
  }

  /**
   * Delete magic token
   */
  static async deleteMagicToken(token: string) {
    try {
      const { error } = await supabase
        .from('magic_tokens')
        .delete()
        .eq('token', token);

      if (error) {
        console.error('Error deleting magic token:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteMagicToken:', error);
      return false;
    }
  }

  /**
   * Store itinerary
   */
  static async storeItinerary(itineraryData: {
    id: string;
    user_id?: string;
    input_payload: any;
    output_json: any;
    cached_key?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('itineraries')
        .insert([{
          id: itineraryData.id,
          user_id: itineraryData.user_id,
          input_payload: itineraryData.input_payload,
          output_json: itineraryData.output_json,
          cached_key: itineraryData.cached_key,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error storing itinerary:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in storeItinerary:', error);
      return null;
    }
  }

  /**
   * Get itinerary by ID
   */
  static async getItineraryById(id: string) {
    try {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching itinerary:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getItineraryById:', error);
      return null;
    }
  }

  /**
   * Get user itineraries
   */
  static async getUserItineraries(userId: string) {
    try {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user itineraries:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserItineraries:', error);
      return [];
    }
  }

  /**
   * Delete itinerary
   */
  static async deleteItinerary(id: string) {
    try {
      const { error } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting itinerary:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteItinerary:', error);
      return false;
    }
  }

  /**
   * Update itinerary
   */
  static async updateItinerary(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('itineraries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating itinerary:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateItinerary:', error);
      return null;
    }
  }
}
