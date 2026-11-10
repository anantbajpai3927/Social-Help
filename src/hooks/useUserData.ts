import { useState, useEffect } from 'react';
import { supabase, UserProfile, UserSettings, UserHealthData, UserEmergencyContact, UserPersonalization } from '../lib/supabase';
import { useAuth } from './useAuth';

interface UseUserDataReturn {
  profile: UserProfile | null;
  settings: UserSettings | null;
  healthData: UserHealthData | null;
  emergencyContacts: UserEmergencyContact[];
  personalization: UserPersonalization | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateSettings: (data: Partial<UserSettings>) => Promise<void>;
  updateHealthData: (data: Partial<UserHealthData>) => Promise<void>;
  addEmergencyContact: (contact: Omit<UserEmergencyContact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEmergencyContact: (id: string, data: Partial<UserEmergencyContact>) => Promise<void>;
  deleteEmergencyContact: (id: string) => Promise<void>;
  updatePersonalization: (data: Partial<UserPersonalization>) => Promise<void>;
  logError: (errorType: string, errorMessage: string, errorStack?: string) => Promise<void>;
}

export const useUserData = (): UseUserDataReturn => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [healthData, setHealthData] = useState<UserHealthData | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<UserEmergencyContact[]>([]);
  const [personalization, setPersonalization] = useState<UserPersonalization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      // Clear data when user logs out
      setProfile(null);
      setSettings(null);
      setHealthData(null);
      setEmergencyContacts([]);
      setPersonalization(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch all user data in parallel
      const [
        profileResult,
        settingsResult,
        healthDataResult,
        emergencyContactsResult,
        personalizationResult
      ] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
        supabase.from('user_health_data').select('*').eq('user_id', user.id).single(),
        supabase.from('user_emergency_contacts').select('*').eq('user_id', user.id).order('is_primary', { ascending: false }),
        supabase.from('user_personalization').select('*').eq('user_id', user.id).single()
      ]);

      // Handle profile data
      if (profileResult.error && profileResult.error.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileResult.error);
      } else {
        setProfile(profileResult.data);
      }

      // Handle settings data
      if (settingsResult.error && settingsResult.error.code !== 'PGRST116') {
        console.error('Settings fetch error:', settingsResult.error);
      } else {
        setSettings(settingsResult.data);
      }

      // Handle health data
      if (healthDataResult.error && healthDataResult.error.code !== 'PGRST116') {
        console.error('Health data fetch error:', healthDataResult.error);
      } else {
        setHealthData(healthDataResult.data);
      }

      // Handle emergency contacts
      if (emergencyContactsResult.error) {
        console.error('Emergency contacts fetch error:', emergencyContactsResult.error);
      } else {
        setEmergencyContacts(emergencyContactsResult.data || []);
      }

      // Handle personalization data
      if (personalizationResult.error && personalizationResult.error.code !== 'PGRST116') {
        console.error('Personalization fetch error:', personalizationResult.error);
      } else {
        setPersonalization(personalizationResult.data);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ user_id: user.id, ...data }, { onConflict: 'user_id' });

      if (error) throw error;

      await fetchUserData();
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const updateSettings = async (data: Partial<UserSettings>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, ...data }, { onConflict: 'user_id' });

      if (error) throw error;

      await fetchUserData();
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  const updateHealthData = async (data: Partial<UserHealthData>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('user_health_data')
        .upsert({ user_id: user.id, ...data }, { onConflict: 'user_id' });

      if (error) throw error;

      await fetchUserData();
    } catch (err) {
      console.error('Error updating health data:', err);
      throw err;
    }
  };

  const addEmergencyContact = async (contact: Omit<UserEmergencyContact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('user_emergency_contacts')
        .insert({ user_id: user.id, ...contact });

      if (error) throw error;

      await fetchUserData();
    } catch (err) {
      console.error('Error adding emergency contact:', err);
      throw err;
    }
  };

  const updateEmergencyContact = async (id: string, data: Partial<UserEmergencyContact>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('user_emergency_contacts')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchUserData();
    } catch (err) {
      console.error('Error updating emergency contact:', err);
      throw err;
    }
  };

  const deleteEmergencyContact = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('user_emergency_contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchUserData();
    } catch (err) {
      console.error('Error deleting emergency contact:', err);
      throw err;
    }
  };

  const updatePersonalization = async (data: Partial<UserPersonalization>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('user_personalization')
        .upsert({ user_id: user.id, ...data }, { onConflict: 'user_id' });

      if (error) throw error;

      await fetchUserData();
    } catch (err) {
      console.error('Error updating personalization:', err);
      throw err;
    }
  };

  const logError = async (errorType: string, errorMessage: string, errorStack?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_errors')
        .insert({
          user_id: user.id,
          error_type: errorType,
          error_message: errorMessage,
          error_stack: errorStack,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
        });

      if (error) {
        console.error('Error logging error:', error);
      }
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  };

  return {
    profile,
    settings,
    healthData,
    emergencyContacts,
    personalization,
    loading,
    error,
    updateProfile,
    updateSettings,
    updateHealthData,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    updatePersonalization,
    logError,
  };
};