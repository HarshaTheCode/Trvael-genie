-- Function to create users table if it doesn't exist
CREATE OR REPLACE FUNCTION create_users_table_if_not_exists()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
    credits_remaining INTEGER DEFAULT 3,
    credits_reset_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create index on email for faster lookups
  CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
  
  -- Create index on user_id for faster lookups
  CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
END;
$$ LANGUAGE plpgsql;

-- Function to create itineraries table if it doesn't exist
CREATE OR REPLACE FUNCTION create_itineraries_table_if_not_exists()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    input_payload JSONB NOT NULL,
    output_json JSONB NOT NULL,
    cached_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON public.itineraries(user_id);
  CREATE INDEX IF NOT EXISTS idx_itineraries_created_at ON public.itineraries(created_at);
  CREATE INDEX IF NOT EXISTS idx_itineraries_cached_key ON public.itineraries(cached_key);
END;
$$ LANGUAGE plpgsql;

-- Function to create magic_tokens table if it doesn't exist
CREATE OR REPLACE FUNCTION create_magic_tokens_table_if_not_exists()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.magic_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_magic_tokens_token ON public.magic_tokens(token);
  CREATE INDEX IF NOT EXISTS idx_magic_tokens_user_id ON public.magic_tokens(user_id);
  CREATE INDEX IF NOT EXISTS idx_magic_tokens_expires_at ON public.magic_tokens(expires_at);
  
  -- Create a function to clean up expired tokens
  CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
  RETURNS void AS $$
  BEGIN
    DELETE FROM public.magic_tokens WHERE expires_at < NOW();
  END;
  $$ LANGUAGE plpgsql;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magic_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- RLS Policies for itineraries table
CREATE POLICY "Users can view their own itineraries" ON public.itineraries
  FOR SELECT USING (user_id IS NULL OR auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own itineraries" ON public.itineraries
  FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own itineraries" ON public.itineraries
  FOR UPDATE USING (user_id IS NULL OR auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own itineraries" ON public.itineraries
  FOR DELETE USING (user_id IS NULL OR auth.uid()::text = user_id::text);

-- RLS Policies for magic_tokens table
CREATE POLICY "Users can manage their own magic tokens" ON public.magic_tokens
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Create a scheduled job to clean up expired tokens (runs every hour)
SELECT cron.schedule(
  'cleanup-expired-tokens',
  '0 * * * *',
  'SELECT cleanup_expired_tokens();'
);
