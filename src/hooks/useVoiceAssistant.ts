import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserData } from './useUserData';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

interface VoiceAssistantState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  response: string;
  error: string | null;
  showTranscript: boolean;
  showResponse: boolean;
}

interface UserContext {
  profile: any;
  settings: any;
  healthData: any;
  emergencyContacts: any[];
  personalization: any;
}

export const useVoiceAssistant = () => {
  const { user } = useAuth();
  const { profile, settings, healthData, emergencyContacts, personalization } = useUserData();
  
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    response: '',
    error: null,
    showTranscript: false,
    showResponse: false
  });

  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  
  // Refs for managing timeouts
  const transcriptTimerRef = useRef<NodeJS.Timeout | null>(null);
  const responseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = settings?.language_preference || 'en-US';
        
        recognitionInstance.onstart = () => {
          console.log('Speech recognition started');
          setState(prev => ({ ...prev, isListening: true, error: null }));
        };
        
        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          console.log('Speech recognition result:', transcript);
          
          setState(prev => ({ 
            ...prev, 
            transcript, 
            isListening: false, 
            showTranscript: true 
          }));
          
          // Clear previous transcript timer
          if (transcriptTimerRef.current) {
            clearTimeout(transcriptTimerRef.current);
          }
          
          // Set timer to hide transcript after 4 seconds
          transcriptTimerRef.current = setTimeout(() => {
            setState(prev => ({ 
              ...prev, 
              showTranscript: false, 
              transcript: '' 
            }));
          }, 4000);
          
          processVoiceCommand(transcript);
        };
        
        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setState(prev => ({ 
            ...prev, 
            isListening: false, 
            error: `Speech recognition error: ${event.error}`,
            showTranscript: false,
            transcript: ''
          }));
          
          // Clear transcript timer on error
          if (transcriptTimerRef.current) {
            clearTimeout(transcriptTimerRef.current);
          }
        };
        
        recognitionInstance.onend = () => {
          console.log('Speech recognition ended');
          setState(prev => ({ 
            ...prev, 
            isListening: false,
            showTranscript: false,
            transcript: ''
          }));
          
          // Clear transcript timer when recognition ends
          if (transcriptTimerRef.current) {
            clearTimeout(transcriptTimerRef.current);
          }
        };
        
        setRecognition(recognitionInstance);
      }

      // Initialize Speech Synthesis
      if (window.speechSynthesis) {
        console.log('Speech synthesis available');
        setSynthesis(window.speechSynthesis);
      } else {
        console.warn('Speech synthesis not available');
      }
    }
  }, [settings?.language_preference]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (transcriptTimerRef.current) {
        clearTimeout(transcriptTimerRef.current);
      }
      if (responseTimerRef.current) {
        clearTimeout(responseTimerRef.current);
      }
    };
  }, []);

  // Gather comprehensive user context for AI
  const getUserContext = useCallback((): UserContext => {
    return {
      profile: {
        name: profile?.full_name || 'User',
        country: profile?.country_code || 'US',
        timezone: profile?.timezone || 'UTC'
      },
      settings: {
        language: settings?.language_preference || 'en-US',
        notifications: settings?.notifications_enabled || true,
        emergencyAlerts: settings?.emergency_alerts_enabled || true
      },
      healthData: {
        medicalConditions: healthData?.medical_conditions || [],
        medications: healthData?.medications || [],
        allergies: healthData?.allergies || [],
        stressLevel: healthData?.stress_level || 5,
        sleepHours: healthData?.sleep_hours || 8,
        anxietyLevel: healthData?.anxiety_level || 3,
        exerciseFrequency: healthData?.exercise_frequency || 3,
        sleepQuality: healthData?.sleep_quality || 7
      },
      emergencyContacts: emergencyContacts.map(contact => ({
        name: contact.contact_name,
        phone: contact.contact_phone,
        relationship: contact.relationship,
        isPrimary: contact.is_primary
      })),
      personalization: {
        theme: personalization?.theme_preference || 'light',
        quickActions: personalization?.quick_actions || []
      }
    };
  }, [profile, settings, healthData, emergencyContacts, personalization]);

  // Process voice command with AI
  const processVoiceCommand = async (transcript: string, requestType: 'voice' | 'health' | 'safety' = 'voice') => {
    try {
      console.log('Processing voice command:', transcript, 'Type:', requestType);
      setState(prev => ({ ...prev, error: null }));
      
      const userContext = getUserContext();
      
      // Get current session - allow guest users for basic functionality
      const { data: { session } } = await supabase.auth.getSession();

      // Call Gemini API through Edge Function
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-chat`;
      
      console.log('Making request to:', apiUrl);
      console.log('Request type:', requestType);
      console.log('User context:', userContext);
      console.log('Is guest:', !session);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header only if user is authenticated
      if (session) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          transcript: requestType === 'voice' ? transcript : '',
          requestType,
          userContext,
          isGuest: !session
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || 'Failed to process request');
      }

      const data = await response.json();
      const aiResponse = data.response;
      
      console.log('AI response received:', aiResponse);
      setState(prev => ({ 
        ...prev, 
        response: aiResponse, 
        showResponse: true 
      }));
      
      // Convert response to speech
      speakResponse(aiResponse);
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      
      let errorMessage = 'Failed to process request';
      
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage = 'Voice assistant is temporarily unavailable due to usage limits. Please try again later.';
        } else if (error.message.includes('Gemini API error')) {
          errorMessage = 'Voice assistant service is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to the voice assistant service. Please check your internet connection.';
        } else if (error.message.includes('not configured')) {
          errorMessage = 'Voice assistant service is not properly configured. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      
      // Speak error message
      const spokenError = errorMessage.includes('limit') || errorMessage.includes('service') 
        ? 'Sorry, the voice assistant is temporarily unavailable. Please try again later.'
        : errorMessage.includes('Network error')
        ? 'Sorry, I cannot connect to the voice assistant service right now. Please check your internet connection and try again.'
        : `Sorry, I encountered an error: ${errorMessage}`;
      
      speakResponse(spokenError);
    }
  };

  // Convert text to speech with robust voice selection
  const speakResponse = (text: string) => {
    if (!synthesis) {
      console.error('Text-to-speech not supported');
      setState(prev => ({ ...prev, error: 'Text-to-speech not supported' }));
      return;
    }

    console.log('Starting text-to-speech for:', text);

    // Cancel any ongoing speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const preferredLang = settings?.language_preference || 'en-US';
    
    // Wait for voices to load if they haven't already
    const setVoiceAndSpeak = () => {
      const voices = synthesis.getVoices();
      console.log('Available voices:', voices.length);
      
      if (voices.length > 0) {
        // Try to find the best voice for the user's language
        let selectedVoice = null;
        
        // 1. Try exact language match
        selectedVoice = voices.find(voice => voice.lang === preferredLang);
        
        // 2. Try general language match (e.g., 'en' for 'en-US')
        if (!selectedVoice) {
          const generalLang = preferredLang.split('-')[0];
          selectedVoice = voices.find(voice => voice.lang.startsWith(generalLang));
        }
        
        // 3. Fallback to English
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
        }
        
        // 4. Final fallback to first available voice
        if (!selectedVoice && voices.length > 0) {
          selectedVoice = voices[0];
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log('Selected voice:', selectedVoice.name, selectedVoice.lang);
        }
      }
      
      // Set utterance properties
      utterance.lang = preferredLang;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        console.log('Speech synthesis started');
        setState(prev => ({ ...prev, isSpeaking: true }));
      };

      utterance.onend = () => {
        console.log('Speech synthesis ended');
        setState(prev => ({ ...prev, isSpeaking: false }));
        
        // Clear previous response timer
        if (responseTimerRef.current) {
          clearTimeout(responseTimerRef.current);
        }
        
        // Set timer to hide response after 2 seconds
        responseTimerRef.current = setTimeout(() => {
          setState(prev => ({ 
            ...prev, 
            showResponse: false, 
            response: '' 
          }));
        }, 2000);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setState(prev => ({ 
          ...prev, 
          isSpeaking: false, 
          error: `Speech synthesis error: ${event.error}`,
          showResponse: false,
          response: ''
        }));
        
        // Clear response timer on error
        if (responseTimerRef.current) {
          clearTimeout(responseTimerRef.current);
        }
      };

      console.log('Starting speech synthesis...');
      synthesis.speak(utterance);
    };

    // Check if voices are already loaded
    if (synthesis.getVoices().length > 0) {
      setVoiceAndSpeak();
    } else {
      // Wait for voices to load
      synthesis.addEventListener('voiceschanged', setVoiceAndSpeak, { once: true });
      
      // Fallback timeout in case voiceschanged doesn't fire
      setTimeout(() => {
        if (synthesis.getVoices().length === 0) {
          console.warn('No voices loaded, speaking without voice selection');
          utterance.lang = preferredLang;
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 1;
          
          utterance.onstart = () => {
            setState(prev => ({ ...prev, isSpeaking: true }));
          };
          
          utterance.onend = () => {
            setState(prev => ({ ...prev, isSpeaking: false }));
            if (responseTimerRef.current) {
              clearTimeout(responseTimerRef.current);
            }
            responseTimerRef.current = setTimeout(() => {
              setState(prev => ({ 
                ...prev, 
                showResponse: false, 
                response: '' 
              }));
            }, 2000);
          };
          
          utterance.onerror = (event) => {
            setState(prev => ({ 
              ...prev, 
              isSpeaking: false, 
              error: `Speech synthesis error: ${event.error}`,
              showResponse: false,
              response: ''
            }));
            if (responseTimerRef.current) {
              clearTimeout(responseTimerRef.current);
            }
          };
          
          synthesis.speak(utterance);
        }
      }, 1000);
    }
  };

  // Start listening
  const startListening = () => {
    if (!recognition) {
      setState(prev => ({ ...prev, error: 'Speech recognition not supported' }));
      return;
    }

    // Clear previous state and timers
    if (transcriptTimerRef.current) {
      clearTimeout(transcriptTimerRef.current);
    }
    if (responseTimerRef.current) {
      clearTimeout(responseTimerRef.current);
    }
    
    setState(prev => ({ 
      ...prev, 
      transcript: '', 
      response: '', 
      error: null,
      showTranscript: false,
      showResponse: false
    }));
    
    try {
      recognition.start();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to start speech recognition. Please check microphone permissions.' 
      }));
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognition && state.isListening) {
      recognition.stop();
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (synthesis && state.isSpeaking) {
      synthesis.cancel();
      setState(prev => ({ 
        ...prev, 
        isSpeaking: false,
        showResponse: false,
        response: ''
      }));
      
      // Clear response timer
      if (responseTimerRef.current) {
        clearTimeout(responseTimerRef.current);
      }
    }
  };

  // Toggle voice assistant
  const toggleVoiceAssistant = () => {
    if (state.isListening) {
      stopListening();
    } else if (state.isSpeaking) {
      stopSpeaking();
    } else {
      startListening();
    }
  };

  // Get health tips
  const getHealthTips = async () => {
    if (!user) {
      setState(prev => ({ 
        ...prev, 
        response: 'For personalized health tips based on your medical profile, please sign in to your account. As a guest, I can provide general wellness advice: Stay hydrated, get 7-8 hours of sleep, exercise regularly, and maintain a balanced diet.',
        showResponse: true 
      }));
      speakResponse('For personalized health tips based on your medical profile, please sign in to your account. As a guest, I can provide general wellness advice: Stay hydrated, get 7-8 hours of sleep, exercise regularly, and maintain a balanced diet.');
      return;
    }
    await processVoiceCommand('', 'health');
  };

  // Get safety advice
  const getSafetyAdvice = async () => {
    if (!user) {
      setState(prev => ({ 
        ...prev, 
        response: 'Here are essential safety tips: Keep emergency contacts handy, know your local emergency number, have a basic first aid kit, stay aware of your surroundings, and trust your instincts. For personalized safety advice, please sign in.',
        showResponse: true 
      }));
      speakResponse('Here are essential safety tips: Keep emergency contacts handy, know your local emergency number, have a basic first aid kit, stay aware of your surroundings, and trust your instincts. For personalized safety advice, please sign in.');
      return;
    }
    await processVoiceCommand('', 'safety');
  };

  return {
    ...state,
    startListening,
    stopListening,
    stopSpeaking,
    toggleVoiceAssistant,
    getHealthTips,
    getSafetyAdvice,
    isSupported: !!recognition && !!synthesis
  };
};