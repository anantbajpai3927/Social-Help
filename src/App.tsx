import React, { useState, useEffect } from 'react';
import { Menu, Mic, MicOff, Volume2, VolumeX, ToggleLeft, ToggleRight } from 'lucide-react';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import Personalization from './components/Personalization';
import CreateShortcut from './components/CreateShortcut';
import AvatarPage from './components/AvatarPage';
import HealthPage from './components/HealthPage';
import ErrorBoundary from './components/ErrorBoundary';
import TavusAvatar from './components/TavusAvatar';
import { useAuth } from './hooks/useAuth';
import { useUserData } from './hooks/useUserData';
import { usePermissions } from './hooks/usePermissions';
import { useLanguages } from './hooks/useLanguages';
import { useVoiceAssistant } from './hooks/useVoiceAssistant';

function App() {
  const { user, session } = useAuth();
  const { logError } = useUserData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [error, setError] = useState<string | null>(null);
  const [dataSaverMode, setDataSaverMode] = useState(() => {
    return localStorage.getItem('socialhelp-data-saver') === 'true';
  });
  const [avatarConversationActive, setAvatarConversationActive] = useState(false);

  const {
    microphonePermission,
    locationPermission,
    requestMicrophonePermission,
    requestLocationPermission
  } = usePermissions();

  const {
    availableLanguages,
    selectedLanguage,
    setSelectedLanguage
  } = useLanguages();

  const {
    isListening,
    isSpeaking,
    transcript,
    response,
    showTranscript,
    showResponse,
    error: voiceError,
    toggleVoiceAssistant,
    stopSpeaking,
    isSupported: voiceSupported
  } = useVoiceAssistant();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDataSaver = () => {
    const newMode = !dataSaverMode;
    setDataSaverMode(newMode);
    localStorage.setItem('socialhelp-data-saver', newMode.toString());
    
    // End any active avatar conversation when enabling data saver
    if (newMode && avatarConversationActive) {
      setAvatarConversationActive(false);
    }
  };

  const handleVoiceHelp = async () => {
    try {
      setError(null);
      
      if (microphonePermission !== 'granted') {
        await requestMicrophonePermission();
      }
      
      if (dataSaverMode) {
        // Use traditional voice assistant
        toggleVoiceAssistant();
      } else {
        // Start avatar conversation
        setAvatarConversationActive(true);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to access microphone');
      if (user) {
        logError('microphone_access', error instanceof Error ? error.message : 'Failed to access microphone', error instanceof Error ? error.stack : undefined);
      }
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSidebarOpen(false);
    setError(null);
  };

  const handleRequestMicrophonePermission = async () => {
    try {
      await requestMicrophonePermission();
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to request microphone permission');
      if (user) {
        logError('microphone_permission', error instanceof Error ? error.message : 'Failed to request microphone permission');
      }
    }
  };

  const handleRequestLocationPermission = async () => {
    try {
      await requestLocationPermission();
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to request location permission');
      if (user) {
        logError('location_permission', error instanceof Error ? error.message : 'Failed to request location permission');
      }
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'avatar':
        return (
          <>
            <header className="flex items-center justify-between p-6">
              <button
                onClick={toggleSidebar}
                className="p-3 hover:bg-white/80 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              
              <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
                AI AVATAR
              </h1>
              
              <div className="w-12 h-12"></div>
            </header>
            
            <AvatarPage session={session} />
          </>
        );
      case 'health':
        return (
          <>
            <header className="flex items-center justify-between p-6">
              <button
                onClick={toggleSidebar}
                className="p-3 hover:bg-white/80 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              
              <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
                HEALTH ASSISTANT
              </h1>
              
              <div className="w-12 h-12"></div>
            </header>
            
            <HealthPage session={session} />
          </>
        );
      case 'personalization':
        return (
          <>
            <header className="flex items-center justify-between p-6">
              <button
                onClick={toggleSidebar}
                className="p-3 hover:bg-white/80 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              
              <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
                PERSONALIZATION
              </h1>
              
              <div className="w-12 h-12"></div>
            </header>
            
            <Personalization />
          </>
        );
      case 'shortcut':
        return (
          <>
            <header className="flex items-center justify-between p-6">
              <button
                onClick={toggleSidebar}
                className="p-3 hover:bg-white/80 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              
              <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
                CREATE SHORTCUT
              </h1>
              
              <div className="w-12 h-12"></div>
            </header>
            
            <CreateShortcut />
          </>
        );
      case 'settings':
        return (
          <>
            <header className="flex items-center justify-between p-6">
              <button
                onClick={toggleSidebar}
                className="p-3 hover:bg-white/80 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              
              <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
                SETTINGS
              </h1>
              
              <div className="w-12 h-12"></div>
            </header>
            
            <Settings
              microphonePermission={microphonePermission}
              locationPermission={locationPermission}
              onRequestMicrophonePermission={handleRequestMicrophonePermission}
              onRequestLocationPermission={handleRequestLocationPermission}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              availableLanguages={availableLanguages}
            />
          </>
        );
      case 'home':
      default:
        return renderHomePage();
    }
  };

  useEffect(() => {
    if (voiceError) {
      setError(voiceError);
    }
  }, [voiceError]);

  const renderHomePage = () => (
    <>
      {/* Badge in top right corner */}
      <div className="fixed top-4 right-4 z-30">
        <a 
          href="https://bolt.new/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <img 
            src="/black_circle_360x360.png"
            alt="Powered by Bolt"
            className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer"
          />
        </a>
      </div>

      {/* Data Saver Toggle */}
      <div className="fixed top-4 left-4 z-30">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Data Saver</span>
            <button
              onClick={toggleDataSaver}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                dataSaverMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-label="Toggle data saver mode"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  dataSaverMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {dataSaverMode ? 'Voice only' : 'Avatar enabled'}
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between p-6 pt-20">
        <button
          onClick={toggleSidebar}
          className="p-3 hover:bg-white/80 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        
        <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
          SOCIAL HELP
        </h1>
        
        <div className="w-12 h-12"></div>
      </header>

      {/* Main Content Area */}
      <main className="px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 max-w-md mx-auto">
            <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0"></div>
            <span className="text-red-800 text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Voice Assistant Status (Data Saver Mode) */}
        {dataSaverMode && (showTranscript || showResponse) && (
          <div className="mb-6 max-w-2xl mx-auto space-y-3">
            {showTranscript && transcript && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">You said:</h4>
                <p className="text-blue-700">{transcript}</p>
              </div>
            )}
            {showResponse && response && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-green-800">Assistant Response:</h4>
                  {isSpeaking && (
                    <button
                      onClick={stopSpeaking}
                      className="flex items-center space-x-1 px-2 py-1 bg-green-200 hover:bg-green-300 text-green-800 rounded text-xs transition-colors duration-200"
                    >
                      <VolumeX className="w-3 h-3" />
                      <span>Stop</span>
                    </button>
                  )}
                </div>
                <p className="text-green-700">{response}</p>
                {isSpeaking && (
                  <div className="mt-2 flex items-center space-x-2 text-green-600">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">Speaking...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            How can I help you today?
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            I'm here to provide emergency guidance, health advice, and support whenever you need it.
          </p>
        </div>

        {/* Main Help Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleVoiceHelp}
            disabled={microphonePermission === 'denied' || !voiceSupported}
            className={`relative w-64 h-64 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 ${
              microphonePermission === 'denied' || !voiceSupported
                ? 'bg-gray-400 cursor-not-allowed'
                : isListening || avatarConversationActive
                ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse'
                : isSpeaking
                ? 'bg-gradient-to-r from-green-500 to-blue-500 animate-pulse'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            }`}
            aria-label={
              isListening ? 'Stop listening' : 
              isSpeaking ? 'Stop speaking' : 
              avatarConversationActive ? 'Avatar active' :
              'Start voice help'
            }
          >
            <div className="absolute inset-4 bg-white/20 rounded-full flex items-center justify-center">
              <div className="text-center">
                {microphonePermission === 'denied' || !voiceSupported ? (
                  <MicOff className="w-16 h-16 text-white mx-auto mb-3" />
                ) : isSpeaking ? (
                  <Volume2 className="w-16 h-16 text-white mx-auto mb-3" />
                ) : (
                  <Mic className="w-16 h-16 text-white mx-auto mb-3" />
                )}
                <span className="text-white font-bold text-xl">
                  {microphonePermission === 'denied' || !voiceSupported
                    ? 'Voice Disabled' 
                    : isListening 
                    ? 'Listening...' 
                    : isSpeaking
                    ? 'Speaking...'
                    : avatarConversationActive
                    ? 'Avatar Active'
                    : dataSaverMode
                    ? 'Voice Help'
                    : 'Start Chat'}
                </span>
              </div>
            </div>
            
            {/* Ripple effect when active */}
            {(isListening || isSpeaking || avatarConversationActive) && (
              <div className="absolute inset-0 rounded-full border-4 border-white/50 animate-ping"></div>
            )}
          </button>
        </div>

        {/* AI Avatar Chat Space (Non-Data Saver Mode) */}
        {!dataSaverMode && (
          <div className="max-w-2xl mx-auto mb-8">
            <TavusAvatar
              replicaId={import.meta.env.VITE_TAVUS_EMERGENCY_REPLICA_ID}
              conversationActive={avatarConversationActive}
              onConversationEnd={() => setAvatarConversationActive(false)}
              context="emergency_help"
              session={session}
              className="w-full h-96 rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* Status Indicator */}
        <div className="text-center mt-12">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
            microphonePermission === 'granted' && locationPermission === 'granted' && voiceSupported
              ? 'bg-green-100'
              : microphonePermission === 'denied' || locationPermission === 'denied' || !voiceSupported
              ? 'bg-yellow-100'
              : 'bg-blue-100'
          }`}>
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              microphonePermission === 'granted' && locationPermission === 'granted' && voiceSupported
                ? 'bg-green-500'
                : microphonePermission === 'denied' || locationPermission === 'denied' || !voiceSupported
                ? 'bg-yellow-500'
                : 'bg-blue-500'
            }`}></div>
            <span className={`font-medium ${
              microphonePermission === 'granted' && locationPermission === 'granted' && voiceSupported
                ? 'text-green-800'
                : microphonePermission === 'denied' || locationPermission === 'denied' || !voiceSupported
                ? 'text-yellow-800'
                : 'text-blue-800'
            }`}>
              {microphonePermission === 'granted' && locationPermission === 'granted' && voiceSupported
                ? 'All Systems Ready'
                : microphonePermission === 'denied' || locationPermission === 'denied' || !voiceSupported
                ? 'Limited Features Available'
                : 'System Ready'}
            </span>
          </div>
          
          {!dataSaverMode && (
            <p className="text-sm text-gray-500 mt-2">
              AI Avatar mode enabled • Toggle Data Saver for voice-only mode
            </p>
          )}
        </div>
      </main>
    </>
  );

  return (
    <ProtectedRoute>
      <ErrorBoundary onReset={() => setCurrentPage('home')}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 relative overflow-hidden">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onNavigate={handleNavigate}
            currentPage={currentPage}
            microphonePermission={microphonePermission}
            locationPermission={locationPermission}
            onRequestMicrophonePermission={handleRequestMicrophonePermission}
            onRequestLocationPermission={handleRequestLocationPermission}
          />

          {/* Main Content */}
          <div className="relative z-10">
            {renderCurrentPage()}
          </div>

          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-pink-200/30 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-blue-200/30 to-transparent rounded-full translate-y-40 -translate-x-40"></div>
        </div>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}

export default App;