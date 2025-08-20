# Supabase Integration Setup Guide

## 🚨 **IMPORTANT: Current Status**
The Supabase integration has been implemented but requires manual database setup. The application will work with fallback in-memory storage until the database is properly configured.

## Overview
This guide explains how to set up Supabase authentication and database for the Travel-builder application.

## Prerequisites
- Supabase project created
- PostgreSQL database URI
- Supabase API keys

## Environment Variables
Add these to your `.env` file:

```bash
# Supabase Configuration
SUPABASE_URL=https://hyhmvmqvmmaiajhjmtkk.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
DATABASE_URL=postgresql://postgres:Harsha@0109@db.hyhmvmqvmmaiajhjmtkk.supabase.co:5432/postgres

# Client-side Supabase (Vite environment variables)
VITE_SUPABASE_URL=https://hyhmvmqvmmaiajhjmtkk.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here

# Existing Variables
GEMINI_API_KEY=AIzaSyBHrLQUPYnnIRP9sZw3aTIGNM1tcS2hQHA
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:8080
PING_MESSAGE=Travel-builder is running!

# Email Configuration (for magic links)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@travelgenie.com
```

## Database Setup

### 1. Run SQL Functions
Execute the SQL functions in `server/database/supabase-functions.sql` in your Supabase SQL editor:

```sql
-- This will create the necessary tables and policies
-- Run the entire file in your Supabase SQL editor
```

### 2. Enable Extensions
In your Supabase dashboard, go to Database > Extensions and enable:
- `pgcrypto` (for UUID generation)
- `cron` (for scheduled cleanup jobs)

### 3. Row Level Security
The SQL functions automatically enable RLS and create policies for:
- Users can only access their own data
- Itineraries are accessible to owners and public (if shared)
- Magic tokens are user-specific

## Features Implemented

### ✅ Authentication System
- Magic link authentication via email
- JWT token generation and verification
- User management with Supabase
- Automatic user creation on first login

### ✅ Database Integration
- User profiles with subscription tiers
- Credit system (free: 3 credits, pro: 100 credits)
- Itinerary storage and retrieval
- Magic token management with expiration

### ✅ Backward Compatibility
- All existing functionality preserved
- Fallback to in-memory storage if database fails
- Gradual migration from in-memory to database

### ✅ Security Features
- Row Level Security (RLS) policies
- Automatic token cleanup
- Rate limiting preserved
- Input validation maintained

## API Endpoints

### Authentication
- `POST /api/auth/magic-link` - Send magic link
- `POST /api/auth/verify` - Verify magic link
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Itineraries
- `POST /api/generate-itinerary` - Generate new itinerary
- `GET /api/itineraries/:id` - Get specific itinerary
- `GET /api/itineraries` - Get user's itineraries
- `PATCH /api/itineraries/:id` - Update itinerary
- `DELETE /api/itineraries/:id` - Delete itinerary

## Client Integration

### 1. Wrap Your App
```tsx
import { SupabaseProvider } from './contexts/SupabaseContext';

function App() {
  return (
    <SupabaseProvider>
      {/* Your app components */}
    </SupabaseProvider>
  );
}
```

### 2. Use Authentication
```tsx
import { useSupabase } from './contexts/SupabaseContext';

function Login() {
  const { signIn, user, loading } = useSupabase();
  
  const handleLogin = async (email: string) => {
    const result = await signIn(email);
    if (result.success) {
      // Show success message
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (user) return <div>Welcome, {user.email}!</div>;
  
  return <LoginForm onSubmit={handleLogin} />;
}
```

## Testing

### 1. Start the Server
```bash
npm run dev
```

### 2. Test Authentication
- Try sending a magic link to your email
- Check if user is created in Supabase
- Verify JWT token generation

### 3. Test Itinerary Generation
- Generate a new itinerary
- Check if it's stored in Supabase
- Verify retrieval works

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify Supabase credentials
   - Check if tables exist

2. **Authentication Errors**
   - Verify SUPABASE_URL and keys
   - Check email configuration
   - Review RLS policies

3. **Table Creation Failed**
   - Run SQL functions manually
   - Check database permissions
   - Verify extensions are enabled

### Debug Mode
Enable detailed logging by setting:
```bash
DEBUG=supabase:*
```

## Migration Notes

### From In-Memory to Database
- Existing in-memory data will continue to work
- New data will be stored in Supabase
- Gradual migration as users log in

### Data Structure Changes
- User IDs are now UUIDs
- Timestamps are ISO strings
- Field names use snake_case (Supabase convention)

## Production Considerations

1. **Environment Variables**
   - Use strong JWT secrets
   - Secure Supabase keys
   - Configure proper CORS origins

2. **Database**
   - Enable backups
   - Monitor performance
   - Set up alerts

3. **Security**
   - Review RLS policies
   - Enable audit logging
   - Regular security updates

## Support

If you encounter issues:
1. Check the console logs
2. Verify environment variables
3. Test database connectivity
4. Review Supabase dashboard logs

## Next Steps

1. **Customize Authentication**
   - Add social login providers
   - Implement password-based auth
   - Add 2FA support

2. **Enhance User Management**
   - User profiles
   - Preferences storage
   - Activity tracking

3. **Advanced Features**
   - Real-time updates
   - File uploads
   - Analytics dashboard

## 🔧 **Recent Fixes Applied**

### Fixed Issues:
1. **Missing `userId` variable** in `verifyMagicToken` function
2. **Database initialization errors** - now gracefully handles missing tables
3. **Type mismatches** between Supabase and existing code
4. **Client-side import issues** - separated server and client configurations
5. **Syntax errors** in saved-itineraries route
6. **Error handling** improved with fallback mechanisms

### Current Behavior:
- Application starts without database errors
- Falls back to in-memory storage when database is unavailable
- Provides clear instructions for manual database setup
- All existing functionality preserved
