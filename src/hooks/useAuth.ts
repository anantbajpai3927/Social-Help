import { useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  deleteAccountAndSignOut: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Create user profile and settings on sign up or sign in
        if (event === 'SIGNED_IN' && session?.user) {
          await createUserProfileAndSettings(session.user);
        }

        // Clear user data on sign out
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          // Clear any cached data
          localStorage.removeItem('socialhelp-country');
          localStorage.removeItem('socialhelp-language');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const createUserProfileAndSettings = async (user: User) => {
    try {
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
        }, { onConflict: 'user_id' });

      if (profileError && profileError.code !== '23505') { // Ignore unique constraint violations
        console.error('Error creating user profile:', profileError);
      }

      // Create user settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          language_preference: navigator.language || 'en-US',
        }, { onConflict: 'user_id' });

      if (settingsError && settingsError.code !== '23505') {
        console.error('Error creating user settings:', settingsError);
      }

      // Create user health data
      const { error: healthError } = await supabase
        .from('user_health_data')
        .upsert({
          user_id: user.id,
        }, { onConflict: 'user_id' });

      if (healthError && healthError.code !== '23505') {
        console.error('Error creating user health data:', healthError);
      }

      // Create user personalization
      const { error: personalizationError } = await supabase
        .from('user_personalization')
        .upsert({
          user_id: user.id,
        }, { onConflict: 'user_id' });

      if (personalizationError && personalizationError.code !== '23505') {
        console.error('Error creating user personalization:', personalizationError);
      }
    } catch (error) {
      console.error('Error in createUserProfileAndSettings:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Don't manage loading state here - let the auth state change handle it
      console.log('Sign in request completed, error:', error);
      
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}`,
          data: {
            full_name: fullName || '',
          },
        },
      });
      
      // Don't manage loading state here - let the auth state change handle it
      console.log('Sign up request completed, error:', error);
      
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      // Clear local state immediately to ensure UI updates
      setUser(null);
      setSession(null);
      setLoading(false);
      
      // Clear any cached data
      localStorage.removeItem('socialhelp-country');
      localStorage.removeItem('socialhelp-language');
      
      // Then call Supabase signOut
      const { error } = await supabase.auth.signOut();
      
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, ensure local state is cleared
      setUser(null);
      setSession(null);
      setLoading(false);
      localStorage.removeItem('socialhelp-country');
      localStorage.removeItem('socialhelp-language');
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}`,
      });
      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as AuthError };
    }
  };

  const deleteAccountAndSignOut = async () => {
    try {
      if (!user || !session) {
        return { error: 'No authenticated user found' };
      }

      // Call the Edge Function to delete the user account
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmDeletion: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Failed to delete account' };
      }

      // Clear local state immediately after successful deletion
      setUser(null);
      setSession(null);
      setLoading(false);
      
      // Clear any cached data
      localStorage.removeItem('socialhelp-country');
      localStorage.removeItem('socialhelp-language');
      
      // Sign out from Supabase (this should be redundant since user is deleted)
      await supabase.auth.signOut();
      
      return { error: null };
    } catch (error) {
      console.error('Delete account error:', error);
      return { error: 'Failed to delete account. Please try again.' };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    deleteAccountAndSignOut,
    resetPassword,
  };
};