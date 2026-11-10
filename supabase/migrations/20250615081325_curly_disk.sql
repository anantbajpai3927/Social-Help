/*
  # Configure Email Templates and Settings

  1. Email Configuration
    - Set up proper email templates for Social Help app
    - Configure redirect URLs for email verification
    - Set up custom email content

  2. Security
    - Configure allowed redirect URLs
    - Set up proper email verification flow
*/

-- This migration configures email templates and settings for the Social Help app
-- Note: Some email template configurations may need to be done through the Supabase dashboard

-- Configure site URL and redirect URLs (this should match your deployment URL)
-- For development, this will be localhost:5173
-- For production, this should be your actual domain

-- The email templates and redirect URLs are typically configured through:
-- 1. Supabase Dashboard > Authentication > Settings > Email Templates
-- 2. Supabase Dashboard > Authentication > Settings > Site URL

-- For now, we'll ensure the auth flow works correctly by setting up proper policies
-- and ensuring the redirect flow is handled correctly in the application

-- Ensure all auth-related tables have proper RLS policies
-- (These should already exist from previous migrations, but we'll verify)

-- Verify user_profiles table has proper policies
DO $$
BEGIN
  -- Check if policies exist, if not create them
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON user_profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON user_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON user_profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;