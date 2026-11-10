import { useEffect } from "react";

interface ElevenLabsMicProps {
  conversationActive: boolean;
  onAvatarReply: (text: string) => void;
  onUserSpeak: (text: string) => void;
  onSpeaking: (text: string) => void;
  onConversationEnd: () => void;
  session: any;
  context: string;
}

const ElevenLabsMic = ({
  conversationActive,
  session,
  context,
  onAvatarReply,
  onUserSpeak,
  onSpeaking,
  onConversationEnd,
}: ElevenLabsMicProps) => {
  useEffect(() => {
    if (conversationActive) {
      console.log("🎙️ Starting ElevenLabs AI agent...");

      // Simulated response from ElevenLabs Voice Agent
      const timeout = setTimeout(() => {
        const reply = `Hello from ${context} context!`;
        onAvatarReply(reply);
        onSpeaking(reply);
      }, 2000);

      return () => clearTimeout(timeout);
    } else {
      onConversationEnd();
    }
  }, [conversationActive]);

  return null; // No visible UI
};

export default ElevenLabsMic;