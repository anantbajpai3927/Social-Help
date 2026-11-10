import React, { useState } from 'react';
import { Bot, Play, Square, MessageCircle, Heart } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import TavusAvatar from './TavusAvatar';

interface AvatarPageProps {
  session: Session | null;
}

const AvatarPage: React.FC<AvatarPageProps> = ({ session }) => {
  const [conversationActive, setConversationActive] = useState(false);

  const startConversation = () => {
    setConversationActive(true);
  };

  const endConversation = () => {
    setConversationActive(false);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-pink-50 p-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Page Description */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">AI Companion</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chat with your friendly AI companion about daily life, share your thoughts, and get helpful advice. 
            Perfect for meaningful conversations and emotional support.
          </p>
        </div>

        {/* Avatar Container */}
        <div className="mb-8">
          <TavusAvatar
            replicaId={import.meta.env.VITE_TAVUS_AVATAR_REPLICA_ID}
            conversationActive={conversationActive}
            onConversationEnd={endConversation}
            context="daily_chat"
            session={session}
            className="w-full max-w-3xl mx-auto h-96"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          {!conversationActive ? (
            <button
              onClick={startConversation}
              className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Play className="w-6 h-6" />
              <span>Start Conversation</span>
            </button>
          ) : (
            <button
              onClick={endConversation}
              className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Square className="w-6 h-6" />
              <span>End Conversation</span>
            </button>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Daily Conversations</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Share your thoughts, experiences, and daily activities with a caring AI companion who listens and responds thoughtfully.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Emotional Support</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Get encouragement, advice, and emotional support during difficult times. Your AI companion is always here to help.
            </p>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
          <h3 className="font-semibold text-blue-800 mb-3">💡 Conversation Tips</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• Speak naturally and clearly to your AI companion</li>
            <li>• Share your feelings, concerns, or daily experiences</li>
            <li>• Ask for advice on personal matters or life decisions</li>
            <li>• Take your time - the AI is patient and understanding</li>
            <li>• End the conversation anytime by clicking "End Conversation"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AvatarPage;