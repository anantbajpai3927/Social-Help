import React, { useState, useEffect } from 'react';
import { Heart, Play, Square, FileText, Download, Trash2 } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import TavusAvatar from './TavusAvatar';

interface TranscriptEntry {
  id: string;
  timestamp: string;
  speaker: 'user' | 'avatar';
  text: string;
}

interface HealthPageProps {
  session: Session | null;
}

const HealthPage: React.FC<HealthPageProps> = ({ session }) => {
  const [conversationActive, setConversationActive] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentSpeech, setCurrentSpeech] = useState<string>('');

  const startConversation = () => {
    setConversationActive(true);
    // Add initial greeting to transcript
    addToTranscript('avatar', 'Hello! I\'m your health advisor. How can I help you with your wellness today?');
  };

  const endConversation = () => {
    setConversationActive(false);
    setCurrentSpeech('');
  };

  const addToTranscript = (speaker: 'user' | 'avatar', text: string) => {
    const entry: TranscriptEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      speaker,
      text
    };
    setTranscript(prev => [...prev, entry]);
  };

  const clearTranscript = () => {
    setTranscript([]);
  };

  const downloadTranscript = () => {
    const content = transcript.map(entry => 
      `[${entry.timestamp}] ${entry.speaker === 'user' ? 'You' : 'Health Advisor'}: ${entry.text}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-consultation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Simulate real-time speech updates (in real implementation, this would come from Tavus)
  useEffect(() => {
    if (conversationActive) {
      const interval = setInterval(() => {
        // This would be replaced with actual speech recognition/TTS integration
        if (Math.random() > 0.8) {
          const samplePhrases = [
            "Remember to stay hydrated throughout the day...",
            "Regular exercise is important for your overall health...",
            "Getting adequate sleep helps your body recover...",
            "A balanced diet provides essential nutrients..."
          ];
          const randomPhrase = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
          setCurrentSpeech(randomPhrase);
          
          setTimeout(() => {
            addToTranscript('avatar', randomPhrase);
            setCurrentSpeech('');
          }, 3000);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [conversationActive]);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-pink-50 p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Page Description */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Health Advisor</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get personalized health advice and wellness tips from your AI health advisor. 
            All conversations are transcribed below for your reference.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Avatar Section */}
          <div className="space-y-6">
            <TavusAvatar
              replicaId={import.meta.env.VITE_TAVUS_HEALTH_REPLICA_ID}
              conversationActive={conversationActive}
              onConversationEnd={endConversation}
              context="health_advice"
              session={session}
              className="w-full h-96"
            />

            {/* Control Buttons */}
            <div className="flex justify-center space-x-4">
              {!conversationActive ? (
                <button
                  onClick={startConversation}
                  className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Health Consultation</span>
                </button>
              ) : (
                <button
                  onClick={endConversation}
                  className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Square className="w-5 h-5" />
                  <span>End Consultation</span>
                </button>
              )}
            </div>

            {/* Current Speech Display */}
            {currentSpeech && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800">Health Advisor is speaking:</span>
                </div>
                <p className="text-green-700 italic">{currentSpeech}</p>
              </div>
            )}
          </div>

          {/* Transcript Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">Conversation Transcript</h2>
              </div>
              
              <div className="flex space-x-2">
                {transcript.length > 0 && (
                  <>
                    <button
                      onClick={downloadTranscript}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors duration-200"
                      title="Download transcript"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={clearTranscript}
                      className="flex items-center space-x-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors duration-200"
                      title="Clear transcript"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Transcript Content */}
            <div className="h-96 overflow-y-auto space-y-3">
              {transcript.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Start a conversation to see the transcript here</p>
                    <p className="text-sm mt-1">All spoken words will be automatically transcribed</p>
                  </div>
                </div>
              ) : (
                transcript.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-lg ${
                      entry.speaker === 'user'
                        ? 'bg-blue-50 border-l-4 border-blue-500 ml-8'
                        : 'bg-green-50 border-l-4 border-green-500 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        entry.speaker === 'user' ? 'text-blue-800' : 'text-green-800'
                      }`}>
                        {entry.speaker === 'user' ? 'You' : 'Health Advisor'}
                      </span>
                      <span className="text-xs text-gray-500">{entry.timestamp}</span>
                    </div>
                    <p className={`text-sm ${
                      entry.speaker === 'user' ? 'text-blue-700' : 'text-green-700'
                    }`}>
                      {entry.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Health Tips */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-semibold text-green-800 mb-3">🏥 Health Consultation Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-700">
            <div>
              <strong>Personalized Advice:</strong> Get health tips based on your profile and current needs
            </div>
            <div>
              <strong>Real-time Transcript:</strong> All conversations are automatically transcribed for your records
            </div>
            <div>
              <strong>Download & Save:</strong> Export your consultation transcripts for future reference
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthPage;