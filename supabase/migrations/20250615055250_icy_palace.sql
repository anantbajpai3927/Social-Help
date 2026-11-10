/*
  # Create User Data Management Tables

  1. New Tables
    - `user_profiles` - Extended user profile information
    - `user_settings` - User application settings and preferences
    - `user_health_data` - Health information and medical data
    - `user_emergency_contacts` - Emergency contact information
    - `user_errors` - Error logs and issues faced by users
    - `user_personalization` - Personalization preferences and data

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data
    - Ensure proper foreign key relationships with auth.users
*/

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text,
  avatar_url text,
  country_code text DEFAULT 'US',
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  language_preference text DEFAULT 'en-US',
  microphone_permission boolean DEFAULT false,
  location_permission boolean DEFAULT false,
  notifications_enabled boolean DEFAULT true,
  emergency_alerts_enabled boolean DEFAULT true,
  voice_commands_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- User Health Data Table
CREATE TABLE IF NOT EXISTS user_health_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medical_conditions jsonb DEFAULT '[]',
  medications jsonb DEFAULT '[]',
  allergies jsonb DEFAULT '[]',
  physical_limitations jsonb DEFAULT '[]',
  mood_factors jsonb DEFAULT '[]',
  stress_level integer DEFAULT 5 CHECK (stress_level >= 1 AND stress_level <= 10),
  sleep_hours integer DEFAULT 8 CHECK (sleep_hours >= 4 AND sleep_hours <= 12),
  sleep_quality integer DEFAULT 7 CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  anxiety_level integer DEFAULT 3 CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
  dietary_restrictions jsonb DEFAULT '[]',
  exercise_frequency integer DEFAULT 3 CHECK (exercise_frequency >= 0 AND exercise_frequency <= 7),
  exercise_types jsonb DEFAULT '[]',
  substance_use jsonb DEFAULT '[]',
  wake_up_time time DEFAULT '07:00',
  bed_time time DEFAULT '23:00',
  meal_times jsonb DEFAULT '{"breakfast": "08:00", "lunch": "13:00", "dinner": "19:00"}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- User Emergency Contacts Table
CREATE TABLE IF NOT EXISTS user_emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_name text NOT NULL,
  contact_email text,
  contact_phone text,
  relationship text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Errors Table
CREATE TABLE IF NOT EXISTS user_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  error_type text NOT NULL,
  error_message text NOT NULL,
  error_stack text,
  page_url text,
  user_agent text,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- User Personalization Table
CREATE TABLE IF NOT EXISTS user_personalization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  theme_preference text DEFAULT 'light',
  color_scheme text DEFAULT 'blue',
  font_size text DEFAULT 'medium',
  accessibility_features jsonb DEFAULT '{}',
  dashboard_layout jsonb DEFAULT '{}',
  quick_actions jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personalization ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Settings Policies
CREATE POLICY "Users can view own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Health Data Policies
CREATE POLICY "Users can view own health data"
  ON user_health_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health data"
  ON user_health_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health data"
  ON user_health_data
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Emergency Contacts Policies
CREATE POLICY "Users can view own emergency contacts"
  ON user_emergency_contacts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency contacts"
  ON user_emergency_contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency contacts"
  ON user_emergency_contacts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own emergency contacts"
  ON user_emergency_contacts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User Errors Policies
CREATE POLICY "Users can view own errors"
  ON user_errors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own errors"
  ON user_errors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User Personalization Policies
CREATE POLICY "Users can view own personalization"
  ON user_personalization
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personalization"
  ON user_personalization
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personalization"
  ON user_personalization
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_health_data_user_id ON user_health_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_emergency_contacts_user_id ON user_emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_errors_user_id ON user_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_user_personalization_user_id ON user_personalization(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_health_data_updated_at BEFORE UPDATE ON user_health_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_personalization_updated_at BEFORE UPDATE ON user_personalization FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();