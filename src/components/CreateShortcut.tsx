import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Check, X, AlertCircle, ExternalLink, Share } from 'lucide-react';

interface CreateShortcutProps {}

const CreateShortcut: React.FC<CreateShortcutProps> = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      console.log('Install prompt available');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      console.log('App installed successfully');
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Check if install prompt is available after a delay
    setTimeout(() => {
      if (!installPrompt && !isInstalled) {
        console.log('Install prompt not available, showing manual instructions');
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      setErrorMessage('Installation prompt is not available. Please use the manual installation instructions below.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    try {
      console.log('Triggering install prompt');
      const result = await installPrompt.prompt();
      console.log('Install prompt result:', result);
      
      if (result.outcome === 'accepted') {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        setErrorMessage('Installation was cancelled. You can try again anytime.');
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
      }
      
      setInstallPrompt(null);
    } catch (error) {
      console.error('Install error:', error);
      setErrorMessage('Failed to install the app. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  const IOSInstructions = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
        <Share className="w-5 h-5 mr-2" />
        Install on iOS (iPhone/iPad)
      </h3>
      <ol className="space-y-3 text-blue-700">
        <li className="flex items-start">
          <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
          <span>Tap the Share button <Share className="w-4 h-4 inline mx-1" /> at the bottom of your Safari browser</span>
        </li>
        <li className="flex items-start">
          <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
          <span>Scroll down and tap "Add to Home Screen"</span>
        </li>
        <li className="flex items-start">
          <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
          <span>Tap "Add" to confirm and create the shortcut</span>
        </li>
      </ol>
    </div>
  );

  const AndroidInstructions = () => (
    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
        <Download className="w-5 h-5 mr-2" />
        Install on Android
      </h3>
      <ol className="space-y-3 text-green-700">
        <li className="flex items-start">
          <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
          <span>Tap the menu button (⋮) in your Chrome browser</span>
        </li>
        <li className="flex items-start">
          <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
          <span>Select "Add to Home screen" or "Install app"</span>
        </li>
        <li className="flex items-start">
          <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
          <span>Tap "Add" or "Install" to confirm</span>
        </li>
      </ol>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-pink-50 p-6 min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Create App Shortcut</h1>
          </div>
          <p className="text-gray-600 max-w-md mx-auto">
            Install Social Help on your device for quick access during emergencies
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3 animate-fade-in">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              App installed successfully! Check your home screen.
            </span>
          </div>
        )}

        {/* Error Message */}
        {showError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 animate-fade-in">
            <X className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Already Installed */}
        {isInstalled && (
          <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
            <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-green-800 mb-2">App Already Installed</h2>
            <p className="text-green-700">
              Social Help is already installed on your device. You can access it from your home screen.
            </p>
          </div>
        )}

        {/* Main Installation Section */}
        {!isInstalled && (
          <div className="space-y-6">
            {/* PWA Install Button */}
            {installPrompt && (
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Install Social Help</h2>
                <p className="text-gray-600 mb-6">
                  Get instant access to emergency assistance with a single tap from your home screen.
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Install App Now
                </button>
              </div>
            )}
            
            {/* Show manual instructions if no install prompt */}
            {!installPrompt && !isInstalled && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Installation Available</h3>
                <p className="text-blue-700 mb-4">
                  Your browser supports app installation. Look for an install icon in your address bar or follow the manual instructions below.
                </p>
                <div className="text-sm text-blue-600">
                  <p>• Chrome/Edge: Look for the install icon (⬇️) in the address bar</p>
                  <p>• Safari: Use "Add to Home Screen" from the share menu</p>
                  <p>• Firefox: Look for the install prompt or use "Install" from the menu</p>
                </div>
              </div>
            )}

            {/* Manual Instructions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                Manual Installation Instructions
              </h2>
              
              {isIOS && <IOSInstructions />}
              {isAndroid && !installPrompt && <AndroidInstructions />}
              
              {!isIOS && !isAndroid && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Desktop Installation
                  </h3>
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                      <span>Look for an install icon in your browser's address bar</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                      <span>Click the install button when it appears</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                      <span>Follow the prompts to install the app</span>
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Why Install the App?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Instant Access</h3>
                    <p className="text-sm text-gray-600">Launch directly from your home screen without opening a browser</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Offline Support</h3>
                    <p className="text-sm text-gray-600">Basic features work even without internet connection</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Native Experience</h3>
                    <p className="text-sm text-gray-600">Feels like a native app with smooth performance</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Emergency Ready</h3>
                    <p className="text-sm text-gray-600">Quick access during critical situations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Make sure you're using a supported browser (Chrome, Safari, Edge, Firefox)</li>
                    <li>• Try refreshing the page if the install option doesn't appear</li>
                    <li>• Some browsers require HTTPS for installation</li>
                    <li>• Clear your browser cache if you encounter issues</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateShortcut;