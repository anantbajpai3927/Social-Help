/*
  # Tavus Conversation Edge Function

  1. Purpose
    - Handle Tavus API integration for AI avatar conversations
    - Create, manage, and end avatar conversations
    - Proxy requests to avoid CORS issues

  2. Security
    - API key stored securely in environment variables
    - Input validation and error handling
*/

// File: supabase/functions/tavus-conversation/index.ts

// supabase/functions/tavus-conversation/index.ts

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ConversationRequest {
  action: 'create' | 'end' | 'status';
  replica_id?: string;
  conversation_id?: string;
  context_prompt?: string;
  conversation_name?: string;
}

function extractLanguageFromPrompt(prompt: string): string {
  const languageMap: { [key: string]: string } = {
    'English': 'English',
    'Hindi': 'Hindi',
    'Spanish': 'Spanish',
    // add more if needed
  };
  const lower = (prompt || '').toLowerCase();
  for (const [lang, tavusLang] of Object.entries(languageMap)) {
    if (
      lower.includes(`respond in ${lang.toLowerCase()}`) ||
      lower.includes(`language: ${lang.toLowerCase()}`) ||
      lower.includes(`speak ${lang.toLowerCase()}`)
    ) {
      return tavusLang;
    }
  }
  return 'English';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  const tavusApiKey = Deno.env.get('TAVUS_API_KEY');
  if (!tavusApiKey) {
    console.error('TAVUS_API_KEY not set');
    return new Response(
      JSON.stringify({ error: 'Tavus API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let requestBody: ConversationRequest;
  try {
    requestBody = await req.json();
  } catch (err) {
    console.error('Invalid JSON body:', err);
    return new Response(
      JSON.stringify({ error: 'Invalid JSON in request' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  const { action, replica_id, conversation_id, context_prompt, conversation_name } = requestBody;
  if (!action) {
    return new Response(
      JSON.stringify({ error: 'Action is required: create | end | status' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let tavusResponse: Response;
  try {
    if (action === 'create') {
      if (!replica_id) {
        return new Response(
          JSON.stringify({ error: 'replica_id is required for create' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const url = 'https://tavusapi.com/v2/conversations';
      const avatarLanguage = extractLanguageFromPrompt(context_prompt || '');
      const body = {
        replica_id: replica_id,
        conversation_name: conversation_name || `conversation_${Date.now()}`,
        conversational_context: context_prompt || 'You are a helpful AI assistant.',
        properties: {
          max_call_duration: 1800,
          participant_left_timeout: 60,
          participant_absent_timeout: 300,
          enable_recording: false,
          enable_transcription: true,
          language: avatarLanguage,
        },
      };
      console.log('Tavus CREATE request:', url, body);
      tavusResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': tavusApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

    } else if (action === 'end') {
      if (!conversation_id) {
        return new Response(
          JSON.stringify({ error: 'conversation_id is required for end' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const url = `https://tavusapi.com/v2/conversations/${conversation_id}/end`;
      console.log('Tavus END request:', url);
      tavusResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': tavusApiKey,
          'Content-Type': 'application/json',
        },
      });

    } else if (action === 'status') {
      if (!conversation_id) {
        return new Response(
          JSON.stringify({ error: 'conversation_id is required for status' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const url = `https://tavusapi.com/v2/conversations/${conversation_id}`;
      console.log('Tavus STATUS request:', url);
      tavusResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': tavusApiKey,
        },
      });
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    console.error('Error calling Tavus API:', err);
    return new Response(
      JSON.stringify({ error: 'Network or Tavus API call failed' }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const status = tavusResponse.status;
  const rawText = await tavusResponse.text();
  console.log('Tavus response status:', status, 'body:', rawText);

  if (!tavusResponse.ok) {
    let errData: any = {};
    if (rawText.trim()) {
      try { errData = JSON.parse(rawText); } catch { errData = { message: rawText }; }
    }
    let userError = errData.message || `Tavus API error ${status}`;
    if (status === 401) userError = 'Invalid Tavus API key';
    else if (status === 404) userError = 'Replica or conversation not found';
    else if (status === 429) userError = 'Rate limit exceeded';
    return new Response(
      JSON.stringify({ error: userError, details: errData }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let data: any = {};
  if (rawText.trim()) {
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.warn('Could not parse Tavus response JSON:', err, rawText);
      data = {};
    }
  }

  if (action === 'create') {
    if (!data.conversation_url) {
      console.error('Missing conversation_url in create response:', data);
      return new Response(
        JSON.stringify({ error: 'Tavus did not return conversation_url', details: data }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const conv = {
      conversation_id: data.conversation_id,
      conversation_url: data.conversation_url,
      status: data.status || 'active',
      created_at: data.created_at,
      replica_id: data.replica_id || replica_id,
    };
    console.log('Returning conversation object:', conv);
    return new Response(
      JSON.stringify({ success: true, conversation: conv }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } else if (action === 'end') {
    return new Response(
      JSON.stringify({ success: true, message: 'Conversation ended.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } else if (action === 'status') {
    return new Response(
      JSON.stringify({ success: true, conversation: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});