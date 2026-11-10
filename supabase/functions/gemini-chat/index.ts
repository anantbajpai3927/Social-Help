/*
  # Gemini Chat Edge Function

  1. Purpose
    - Proxy requests to Google's Gemini API to avoid CORS issues
    - Handle authentication and API key management securely
    - Process voice assistant requests with user context

  2. Security
    - Uses Supabase authentication to verify users
    - API key stored securely in environment variables
    - Input validation and error handling
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ChatRequest {
  transcript: string;
  requestType: 'voice' | 'health' | 'safety';
  isGuest?: boolean;
  userContext: {
    profile: any;
    settings: any;
    healthData: any;
    emergencyContacts: any[];
    personalization: any;
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    let user = null;
    const authHeader = req.headers.get('Authorization');
    
    // Only verify authentication if authorization header is present
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      );

      const {
        data: { user: authUser },
        error: authError,
      } = await supabaseClient.auth.getUser();

      if (!authError && authUser) {
        user = authUser;
      }
    }

    // Parse request body
    const { transcript, requestType, userContext, isGuest }: ChatRequest = await req.json();

    if (!transcript && requestType !== 'health' && requestType !== 'safety') {
      return new Response(
        JSON.stringify({ error: 'Transcript is required for voice requests' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create comprehensive prompt for Gemini based on request type
    let systemPrompt = '';
    let userPrompt = '';

    if (requestType === 'health') {
      systemPrompt = `You are a ${isGuest ? 'general' : 'personalized'} health advisor. ${isGuest ? 'Provide general health tips suitable for most people.' : 'Provide daily health tips based on the user\'s specific health profile.'} Keep responses concise (2-3 sentences), actionable, and suitable for text-to-speech.`;
      
      if (isGuest) {
        userPrompt = `Provide 2-3 general health tips that are beneficial for most people. Focus on basic wellness advice like hydration, sleep, exercise, and nutrition.`;
      } else {
        userPrompt = `Based on my health profile, give me personalized daily health tips:
- Medical Conditions: ${userContext.healthData?.medicalConditions?.join(', ') || 'None'}
- Current Medications: ${userContext.healthData?.medications?.map((m: any) => `${m.name} (${m.dosage})`).join(', ') || 'None'}
- Allergies: ${userContext.healthData?.allergies?.join(', ') || 'None'}
- Stress Level: ${userContext.healthData?.stressLevel || 5}/10
- Sleep Hours: ${userContext.healthData?.sleepHours || 8} hours
- Anxiety Level: ${userContext.healthData?.anxietyLevel || 3}/10
- Exercise Frequency: ${userContext.healthData?.exerciseFrequency || 3} days/week
- Sleep Quality: ${userContext.healthData?.sleepQuality || 7}/10

Please provide 2-3 specific, actionable health tips for today.`;
      }
    } else if (requestType === 'safety') {
      systemPrompt = `You are a safety advisor providing general emergency preparedness guidance. Give practical safety advice for common emergencies. Keep responses concise and actionable, suitable for text-to-speech.`;
      
      userPrompt = `Provide general safety guidance for common emergencies that someone in ${userContext.profile?.country || 'US'} should know. Include:
1. Basic emergency preparedness
2. Common emergency situations and responses
3. Important safety reminders

Keep it practical and easy to remember.`;
    } else {
      // Voice request
      systemPrompt = `You are a helpful emergency and health assistant. The user has spoken to you with a voice command. ${isGuest ? 'Provide general helpful advice as the user is not signed in.' : 'Provide helpful, personalized advice based on their query and health profile.'} Keep responses concise but comprehensive, suitable for text-to-speech conversion.`;
      
      if (isGuest) {
        userPrompt = `The user is in guest mode (not signed in). Provide general helpful advice for their query.

User said: "${transcript}"`;
      } else {
        userPrompt = `User Context:
- Name: ${userContext.profile?.name || 'User'}
- Country: ${userContext.profile?.country || 'US'}
- Language: ${userContext.settings?.language || 'en-US'}
- Medical Conditions: ${userContext.healthData?.medicalConditions?.join(', ') || 'None'}
- Current Medications: ${userContext.healthData?.medications?.map((m: any) => `${m.name} (${m.dosage})`).join(', ') || 'None'}
- Allergies: ${userContext.healthData?.allergies?.join(', ') || 'None'}
- Stress Level: ${userContext.healthData?.stressLevel || 5}/10
- Sleep Hours: ${userContext.healthData?.sleepHours || 8} hours
- Anxiety Level: ${userContext.healthData?.anxietyLevel || 3}/10
- Exercise Frequency: ${userContext.healthData?.exerciseFrequency || 3} days/week
- Emergency Contacts: ${userContext.emergencyContacts?.map((c: any) => `${c.name} (${c.relationship})`).join(', ') || 'None'}

User said: "${transcript}"`;
      }
    }

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\n${userPrompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 300, // Keep responses concise for TTS
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      
      let errorMessage = errorData.error?.message || 'Unknown error';
      
      if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        errorMessage = 'Voice assistant service has reached its usage limit. Please try again later.';
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Gemini API error: ${errorMessage}` 
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});