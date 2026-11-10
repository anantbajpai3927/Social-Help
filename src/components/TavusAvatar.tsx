
// src/components/TavusAvatar.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Play, Square, Loader2, AlertCircle, Phone, RefreshCw } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

interface TavusAvatarProps {
  replicaId: string;
  conversationActive: boolean;
  onConversationEnd: () => void;
  context: 'emergency_help' | 'daily_chat' | 'health_advice';
  session: Session | null;
  className?: string;
}

interface DailyCallObject {
  join: (options?: any) => Promise<void>;
  leave: () => Promise<void>;
  destroy: () => void;
  participants: () => any;
  localAudio: () => boolean;
  setLocalAudio: (enabled: boolean) => void;
  iframe: () => HTMLIFrameElement | null;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
}

declare global {
  interface Window {
    DailyIframe: {
      createCallObject: (options?: any) => DailyCallObject;
    };
  }
}

const TavusAvatar: React.FC<TavusAvatarProps> = ({
  replicaId,
  conversationActive,
  onConversationEnd,
  context,
  session,
  className = ''
}) => {
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [callObject, setCallObject] = useState<DailyCallObject | null>(null);
  const [conversationData, setConversationData] = useState<{ conversation_id: string; conversation_url: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [dailyScriptLoaded, setDailyScriptLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    console.log(`[TavusAvatar Debug] ${info}`);
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const getContextPrompt = (): string => {
    const language = localStorage.getItem('socialhelp-avatar-language') || 'en-US';
    const languageName = language === 'en-US' ? 'English' :
                        language === 'es-ES' ? 'Spanish' :
                        language === 'fr-FR' ? 'French' :
                        language === 'de-DE' ? 'German' :
                        language === 'it-IT' ? 'Italian' :
                        language === 'pt-PT' ? 'Portuguese' :
                        language === 'ru-RU' ? 'Russian' :
                        language === 'zh-CN' ? 'Chinese' :
                        language === 'ja-JP' ? 'Japanese' :
                        language === 'ko-KR' ? 'Korean' : 'English';
    const basePrompt = `You are a helpful AI assistant speaking in ${languageName}. `;
    switch (context) {
      case 'emergency_help':
        return basePrompt +
          `You are providing emergency assistance and crisis support. Be calm, reassuring, and provide practical help. Ask about the user's immediate safety and guide them to appropriate resources or emergency services if needed. Stay focused on their immediate needs and wellbeing.`;
      case 'health_advice':
        return basePrompt +
          `You are a health and wellness advisor. Provide general health information, wellness tips, and lifestyle advice. Always remind users to consult healthcare professionals for medical concerns. Focus on preventive care, mental health support, and healthy lifestyle recommendations.`;
      case 'daily_chat':
        return basePrompt +
          `You are a friendly companion for casual conversation. Be warm, engaging, and supportive. Help with daily concerns, provide encouragement, and maintain a positive, caring tone. You can discuss various topics while being mindful of the user's wellbeing.`;
      default:
        return basePrompt +
          `You are a helpful AI assistant. Be friendly, supportive, and provide useful information while maintaining a caring and professional tone.`;
    }
  };

  // Load Daily.co script once
  useEffect(() => {
    if (window.DailyIframe) {
      setDailyScriptLoaded(true);
      addDebugInfo('Daily.co script already loaded');
      return;
    }
    addDebugInfo('Loading Daily.co script...');
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@daily-co/daily-js';
    script.async = true;
    script.onload = () => {
      addDebugInfo('Daily.co script loaded');
      setDailyScriptLoaded(true);
    };
    script.onerror = () => {
      addDebugInfo('Failed to load Daily.co script');
      setError('Failed to load video library; please refresh.');
    };
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  // Start or end when conversationActive toggles
  useEffect(() => {
    if (conversationActive && !conversationData && dailyScriptLoaded) {
      startConversation();
    } else if (!conversationActive && conversationData) {
      endConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationActive, dailyScriptLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callObject) {
        try { callObject.destroy(); } catch {}
      }
    };
  }, [callObject]);

  const clearIframeContainer = () => {
    if (iframeContainerRef.current) {
      while (iframeContainerRef.current.firstChild) {
        iframeContainerRef.current.removeChild(iframeContainerRef.current.firstChild);
      }
      addDebugInfo('Iframe container cleared');
    }
  };

  const startConversation = async () => {
    // Clean up existing call object
    if (callObject) {
      addDebugInfo('Cleaning up existing call object');
      try {
        await callObject.leave();
        callObject.destroy();
      } catch (e) {
        addDebugInfo(`Error cleaning previous call: ${(e as Error).message}`);
      }
      setCallObject(null);
      setIsConnected(false);
      setVideoReady(false);
      setParticipantCount(0);
      clearIframeContainer();
      await new Promise(r => setTimeout(r, 500));
    }

    if (!dailyScriptLoaded || !window.DailyIframe) {
      setError('Video library not loaded.');
      return;
    }
    if (!replicaId || replicaId.includes('your_') || replicaId === '') {
      setError('Replica ID not configured.');
      return;
    }
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your_')) {
      setError('Supabase URL not configured.');
      return;
    }

    setIsLoading(true);
    setError(null);
    addDebugInfo('Starting conversation...');

    try {
      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tavus-conversation`;
      const payload = {
        action: 'create',
        replica_id: replicaId,
        context_prompt: getContextPrompt(),
        conversation_name: `${context}_${Date.now()}`
      };
      addDebugInfo(`Calling Edge Function: ${JSON.stringify(payload)}`);
      const resp = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session && { Authorization: `Bearer ${session.access_token}` })
        },
        body: JSON.stringify(payload)
      });
      addDebugInfo(`Edge Function status: ${resp.status}`);
      const text = await resp.text();
      addDebugInfo(`Edge Function raw response: ${text}`);
      if (!resp.ok) {
        let msg = `Error ${resp.status}`;
        try {
          const js = JSON.parse(text);
          msg = js.error || JSON.stringify(js);
        } catch {}
        throw new Error(msg);
      }
      const data = JSON.parse(text);
      if (!data.success || !data.conversation || !data.conversation.conversation_url) {
        throw new Error('Missing conversation_url in response');
      }
      const conv = data.conversation;
      setConversationData({ conversation_id: conv.conversation_id, conversation_url: conv.conversation_url });
      addDebugInfo(`Conversation URL: ${conv.conversation_url}`);
      await initializeDailyCall(conv.conversation_url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      addDebugInfo(`startConversation error: ${msg}`);
      setError(msg);
      onConversationEnd();
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDailyCall = async (roomUrl: string) => {
    try {
      addDebugInfo(`Initializing Daily call: ${roomUrl}`);
      if (!roomUrl.includes('daily.co')) {
        throw new Error(`Invalid room URL: ${roomUrl}`);
      }
      clearIframeContainer();

      // Create call object WITHOUT parentEl
      const call = window.DailyIframe.createCallObject({
        showLeaveButton: false, // example extra options
        theme: { colors: { accent: '#3B82F6', accentText: '#FFFFFF' } }
      });

      // Event listeners
      call.on('joined-meeting', () => {
        addDebugInfo('Joined meeting');
        setIsConnected(true);
        // video may take a moment
        setTimeout(() => {
          setVideoReady(true);
          addDebugInfo('Video ready');
        }, 1000);
      });
      call.on('left-meeting', () => {
        addDebugInfo('Left meeting');
        setIsConnected(false);
        setVideoReady(false);
        clearIframeContainer();
      });
      call.on('participant-joined', (ev: any) => {
        addDebugInfo('Participant joined');
        setParticipantCount(c => c + 1);
        if (ev.participant && !ev.participant.local) {
          setTimeout(() => {
            setVideoReady(true);
            addDebugInfo('Avatar video ready');
          }, 1000);
        }
      });
      call.on('participant-left', () => {
        setParticipantCount(c => Math.max(0, c - 1));
      });
      call.on('error', (ev: any) => {
        const msg = ev.errorMsg || 'Unknown Daily error';
        addDebugInfo(`Daily error: ${msg}`);
        setError(`Video call error: ${msg}`);
      });
      call.on('track-started', (ev: any) => {
        if (ev.track?.kind === 'video' && !ev.participant?.local) {
          setVideoReady(true);
          addDebugInfo('Remote video track started');
        }
      });

      setCallObject(call);

      addDebugInfo('Joining Daily.co room...');
      // Join without parentEl; the iframe will be injected somewhere in DOM by Daily
      await call.join({
        url: roomUrl,
        userName: 'User',
        userData: { context },
        startVideoOff: true,
        startAudioOff: false
      });
      addDebugInfo('call.join() resolved');

      // Now detect the iframe in document and move it into our container
      const roomIdMatch = roomUrl.split('/').pop() || '';
      const selector = `iframe[src*="${roomIdMatch}"]`;
      // Observe additions in the document for a short time
      const observer = new MutationObserver((mutations, obs) => {
        for (const m of mutations) {
          for (const node of Array.from(m.addedNodes)) {
            if (node instanceof HTMLIFrameElement) {
              const src = node.src || '';
              if (src.includes(roomIdMatch) && iframeContainerRef.current) {
                // style & move
                node.style.position = 'absolute';
                node.style.top = '0';
                node.style.left = '0';
                node.style.width = '100%';
                node.style.height = '100%';
                node.style.border = 'none';
                iframeContainerRef.current.appendChild(node);
                addDebugInfo('Detected and appended iframe via MutationObserver');
                obs.disconnect();
                return;
              }
            }
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      // Also try immediate querySelector if already present
      setTimeout(() => {
        if (iframeContainerRef.current) {
          const found = document.querySelector(selector) as HTMLIFrameElement | null;
          if (found) {
            found.style.position = 'absolute';
            found.style.top = '0';
            found.style.left = '0';
            found.style.width = '100%';
            found.style.height = '100%';
            found.style.border = 'none';
            iframeContainerRef.current.appendChild(found);
            addDebugInfo('Found and appended iframe via querySelector');
            observer.disconnect();
          }
        }
      }, 500);
      // After some time, stop observing to avoid leaks
      setTimeout(() => observer.disconnect(), 10000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      addDebugInfo(`initializeDailyCall error: ${msg}`);
      setError(`Failed to join video call: ${msg}`);
    }
  };

  const endConversation = async () => {
    if (!conversationData) return;
    addDebugInfo('Ending conversation...');
    if (callObject) {
      try {
        await callObject.leave();
        callObject.destroy();
      } catch (e) {
        addDebugInfo(`Error leaving call: ${(e as Error).message}`);
      }
      setCallObject(null);
      setIsConnected(false);
      setVideoReady(false);
      clearIframeContainer();
    }
    if (session) {
      try {
        const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tavus-conversation`;
        const payload = { action: 'end', conversation_id: conversationData.conversation_id };
        addDebugInfo(`Calling end: ${JSON.stringify(payload)}`);
        await fetch(fnUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify(payload)
        });
        addDebugInfo('End API call done');
      } catch (e) {
        addDebugInfo(`Error calling end API: ${(e as Error).message}`);
      }
    }
    setConversationData(null);
    setParticipantCount(0);
    setError(null);
    onConversationEnd();
  };

  const toggleMute = () => {
    if (callObject) {
      const curr = callObject.localAudio();
      callObject.setLocalAudio(!curr);
      setIsMuted(!curr);
      addDebugInfo(`Audio ${curr ? 'unmuted' : 'muted'}`);
    }
  };

  const handleEmergencyCall = () => {
    const country = localStorage.getItem('socialhelp-country') || 'US';
    const emergencyNumbers: Record<string,string> = {
      'US': '911','GB': '999','CA': '911','AU': '000','DE': '112','FR': '112'
    };
    const num = emergencyNumbers[country] || '911';
    window.open(`tel:${num}`, '_self');
  };

  const forceVideoReady = () => {
    addDebugInfo('Force video ready');
    setVideoReady(true);
    setError(null);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Video Container */}
      <div
        className="relative bg-gray-900 aspect-video overflow-hidden"
        style={{ minHeight: '300px' }}
        ref={iframeContainerRef}
      >
        {/* The iframe will be detected & moved here via MutationObserver */}

        {/* Loading */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
            <div className="text-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Connecting to AI Avatar...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-4 z-20">
            <div className="text-center text-white max-w-md">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
              <p className="text-sm text-gray-300 mb-4">{error}</p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => {
                    setError(null);
                    if (conversationActive) startConversation();
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm"
                >
                  Retry
                </button>
                {context === 'emergency_help' && (
                  <button
                    onClick={handleEmergencyCall}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm flex items-center space-x-1"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Emergency</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Not Active */}
        {!conversationActive && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 z-15">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Avatar Ready</h3>
              <p className="text-sm opacity-90">
                {context === 'emergency_help' && 'Emergency assistance avatar ready to help'}
                {context === 'daily_chat' && 'Friendly companion ready to chat'}
                {context === 'health_advice' && 'Health advisor ready to assist'}
              </p>
            </div>
          </div>
        )}

        {/* Loading overlay when connected but video not yet ready */}
        {isConnected && !videoReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-15">
            <div className="text-center text-white">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm">Loading avatar video...</p>
              <button
                onClick={forceVideoReady}
                className="mt-3 px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-xs"
              >
                Show Anyway
              </button>
            </div>
          </div>
        )}

        {/* Video Controls */}
        {isConnected && (
          <div className="absolute bottom-4 right-4 flex space-x-2 z-30">
            <button
              onClick={toggleMute}
              className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={onConversationEnd}
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
              aria-label="End conversation"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Connection Status */}
        {conversationActive && (
          <div className="absolute top-4 left-4 z-30">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isConnected && videoReady ? 'bg-green-500/80 text-white' : 'bg-yellow-500/80 text-white'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected && videoReady ? 'bg-white animate-pulse' : 'bg-white/70'
              }`}></div>
              <span>
                {isConnected && videoReady ? 'Connected' : isConnected ? 'Loading...' : 'Connecting...'}
              </span>
              {participantCount > 0 && (
                <span className="text-xs">({participantCount} participants)</span>
              )}
            </div>
          </div>
        )}

        {/* Debug Info */}
        {import.meta.env.DEV && debugInfo.length > 0 && (
          <div className="absolute top-4 right-4 z-30 bg-black/80 text-white text-xs p-2 rounded max-w-xs">
            <div className="font-bold mb-1">Debug Info:</div>
            {debugInfo.map((info, idx) => (
              <div key={idx} className="truncate">{info}</div>
            ))}
          </div>
        )}
      </div>

      {/* Controls area */}
      {conversationActive && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                isConnected && videoReady ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium text-gray-700">
                {isConnected && videoReady ? 'Avatar is ready - speak!' : 'Connecting...'}
              </span>
            </div>
            <div className="flex space-x-2">
              {isConnected && !videoReady && (
                <button
                  onClick={forceVideoReady}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Show Video</span>
                </button>
              )}
              <button
                onClick={onConversationEnd}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                <Square className="w-4 h-4" />
                <span>End Chat</span>
              </button>
            </div>
          </div>
          {isConnected && (
            <div className="mt-3 flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mic className="w-4 h-4" />
                <span>Microphone: {isMuted ? 'Muted' : 'Active'}</span>
              </div>
              <button
                onClick={toggleMute}
                className={`px-3 py-1 rounded-lg text-sm ${
                  isMuted 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TavusAvatar;
