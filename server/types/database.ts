export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          email_verified: boolean;
          subscription_tier: 'free' | 'pro';
          credits_remaining: number;
          credits_reset_date: string;
          is_admin: boolean;
          created_at: string;
          updated_at?: string;
        };
        Insert: {
          id: string;
          email: string;
          email_verified?: boolean;
          subscription_tier?: 'free' | 'pro';
          credits_remaining?: number;
          credits_reset_date?: string;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          email_verified?: boolean;
          subscription_tier?: 'free' | 'pro';
          credits_remaining?: number;
          credits_reset_date?: string;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      magic_tokens: {
        Row: {
          id: string;
          token: string;
          user_id: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          token: string;
          user_id: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          token?: string;
          user_id?: string;
          expires_at?: string;
          created_at?: string;
        };
      };
      itineraries: {
        Row: {
          id: string;
          user_id?: string;
          input_payload: any;
          output_json: any;
          cached_key?: string;
          created_at: string;
          updated_at?: string;
        };
        Insert: {
          id: string;
          user_id?: string;
          input_payload: any;
          output_json: any;
          cached_key?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          input_payload?: any;
          output_json?: any;
          cached_key?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      search_history: {
        Row: {
          id: string;
          user_id?: string;
          itinerary_data: any; // Store as JSONB in Supabase
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          itinerary_data: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          itinerary_data?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_users_table_if_not_exists: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      create_itineraries_table_if_not_exists: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      create_magic_tokens_table_if_not_exists: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
