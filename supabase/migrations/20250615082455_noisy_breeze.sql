/*
  # Configure Email Verification for Social Help App

  This migration ensures proper email verification setup for the Social Help application.
  
  ## Changes Made:
  1. Email verification configuration
  2. Proper redirect URLs for email confirmation
  3. Custom email templates setup
  4. Site URL configuration
  
  ## Important Notes:
  - Email templates need to be configured in Supabase Dashboard
  - Site URL must be set correctly for your environment
  - SMTP settings should be configured for production
*/

-- Enable email confirmations (this is typically done via dashboard but we'll document it)
-- The following settings need to be configured in Supabase Dashboard:

-- 1. Authentication > Settings > Email Auth
--    - Enable email confirmations: ON
--    - Enable email change confirmations: ON
--    - Secure email change: ON

-- 2. Authentication > Settings > Site URL
--    - For development: http://localhost:5173
--    - For production: https://your-domain.com

-- 3. Authentication > Settings > Redirect URLs
--    - Add: http://localhost:5173/**
--    - Add: https://your-domain.com/** (for production)

-- 4. Authentication > Email Templates > Confirm signup
--    Subject: "Welcome to Social Help - Confirm Your Email"
--    Body: Custom HTML template with proper branding

-- Create a function to handle post-confirmation setup
CREATE OR REPLACE FUNCTION handle_new_user_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- This function runs after email confirmation
  -- Ensure user profile exists
  INSERT INTO public.user_profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Ensure user settings exist
  INSERT INTO public.user_settings (user_id, language_preference)
  VALUES (
    NEW.id,
    'en-US'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Ensure user health data exists
  INSERT INTO public.user_health_data (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Ensure user personalization exists
  INSERT INTO public.user_personalization (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for confirmed users
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user_confirmation();

-- Ensure RLS is properly configured for all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personalization ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_errors ENABLE ROW LEVEL SECURITY;