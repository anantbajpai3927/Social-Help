import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  country_code?: string;
  timezone?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  language_preference: string;
  microphone_permission: boolean;
  location_permission: boolean;
  notifications_enabled: boolean;
  emergency_alerts_enabled: boolean;
  voice_commands_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserHealthData {
  id: string;
  user_id: string;
  medical_conditions: string[];
  medications: Array<{ name: string; dosage: string; frequency: string }>;
  allergies: string[];
  physical_limitations: string[];
  mood_factors: string[];
  stress_level: number;
  sleep_hours: number;
  sleep_quality: number;
  anxiety_level: number;
  dietary_restrictions: string[];
  exercise_frequency: number;
  exercise_types: string[];
  substance_use: Array<{ type: string; frequency: string }>;
  wake_up_time: string;
  bed_time: string;
  meal_times: { breakfast: string; lunch: string; dinner: string };
  created_at: string;
  updated_at: string;
}

export interface UserEmergencyContact {
  id: string;
  user_id: string;
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  relationship?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserError {
  id: string;
  user_id: string;
  error_type: string;
  error_message: string;
  error_stack?: string;
  page_url?: string;
  user_agent?: string;
  resolved: boolean;
  created_at: string;
}

export interface UserPersonalization {
  id: string;
  user_id: string;
  theme_preference: string;
  color_scheme: string;
  font_size: string;
  accessibility_features: Record<string, any>;
  dashboard_layout: Record<string, any>;
  quick_actions: string[];
  created_at: string;
  updated_at: string;
}