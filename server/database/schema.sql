-- Travel Itinerary Planner Database Schema
-- PostgreSQL/Supabase compatible

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itineraries table
CREATE TABLE IF NOT EXISTS itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    input_payload JSONB NOT NULL,
    output_json JSONB NOT NULL,
    cached_key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations table
CREATE TABLE IF NOT EXISTS destinations (
    slug VARCHAR(100) PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    top_attractions JSONB NOT NULL,
    best_time TEXT NOT NULL,
    transport_summary TEXT NOT NULL,
    local_foods JSONB NOT NULL,
    seed_image_url TEXT
);

-- Rate limits table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_or_ip VARCHAR(255) NOT NULL UNIQUE,
    credits_left INTEGER NOT NULL DEFAULT 3,
    last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_cached_key ON itineraries(cached_key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_ip ON rate_limits(user_id_or_ip);
CREATE INDEX IF NOT EXISTS idx_destinations_city_state ON destinations(city, state);

-- Search History table
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    itinerary_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);

