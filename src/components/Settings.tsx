import React, { useState, useEffect } from 'react';
import { Save, Mic, MapPin, Globe, Check, X, AlertCircle, MicOff, MapPinOff, ExternalLink, Bot } from 'lucide-react';
import { useUserData } from '../hooks/useUserData';

interface SettingsProps {
  microphonePermission: PermissionState | null;
  locationPermission: PermissionState | null;
  onRequestMicrophonePermission: () => void;
  onRequestLocationPermission: () => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  availableLanguages: { code: string; name: string; }[];
}

// Tavus supported languages for avatar conversations
const tavusLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese (Mandarin)' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'he', name: 'Hebrew' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'cs', name: 'Czech' },
  { code: 'sk', name: 'Slovak' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'ro', name: 'Romanian' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'hr', name: 'Croatian' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'et', name: 'Estonian' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' }
];

const Settings: React.FC<SettingsProps> = ({
  microphonePermission,
  locationPermission,
  onRequestMicrophonePermission,
  onRequestLocationPermission,
  selectedLanguage,
  onLanguageChange,
  availableLanguages
}) => {
  const { settings, updateSettings } = useUserData();
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [tempLanguage, setTempLanguage] = useState(selectedLanguage);
  const [tempCountry, setTempCountry] = useState('US');
  const [tempAvatarLanguage, setTempAvatarLanguage] = useState('en');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Country options for emergency services
  const countryOptions = [
    { code: 'US', name: 'United States', emergency: '911' },
    { code: 'GB', name: 'United Kingdom', emergency: '999' },
    { code: 'CA', name: 'Canada', emergency: '911' },
    { code: 'AU', name: 'Australia', emergency: '000' },
    { code: 'DE', name: 'Germany', emergency: '112' },
    { code: 'FR', name: 'France', emergency: '112' },
    { code: 'IT', name: 'Italy', emergency: '112' },
    { code: 'ES', name: 'Spain', emergency: '112' },
    { code: 'IN', name: 'India', emergency: '112' },
    { code: 'JP', name: 'Japan', emergency: '110' },
    { code: 'CN', name: 'China', emergency: '110' },
    { code: 'BR', name: 'Brazil', emergency: '190' },
    { code: 'MX', name: 'Mexico', emergency: '911' },
    { code: 'RU', name: 'Russia', emergency: '112' },
    { code: 'KR', name: 'South Korea', emergency: '112' },
    { code: 'NL', name: 'Netherlands', emergency: '112' },
    { code: 'SE', name: 'Sweden', emergency: '112' },
    { code: 'NO', name: 'Norway', emergency: '112' },
    { code: 'DK', name: 'Denmark', emergency: '112' },
    { code: 'FI', name: 'Finland', emergency: '112' },
    { code: 'PL', name: 'Poland', emergency: '112' },
    { code: 'TR', name: 'Turkey', emergency: '112' },
    { code: 'SA', name: 'Saudi Arabia', emergency: '999' },
    { code: 'AE', name: 'UAE', emergency: '999' },
    { code: 'ZA', name: 'South Africa', emergency: '10111' },
    { code: 'NG', name: 'Nigeria', emergency: '199' },
    { code: 'EG', name: 'Egypt', emergency: '122' },
    { code: 'TH', name: 'Thailand', emergency: '191' },
    { code: 'VN', name: 'Vietnam', emergency: '113' },
    { code: 'ID', name: 'Indonesia', emergency: '112' },
    { code: 'MY', name: 'Malaysia', emergency: '999' },
    { code: 'SG', name: 'Singapore', emergency: '995' },
    { code: 'PH', name: 'Philippines', emergency: '911' },
    { code: 'AR', name: 'Argentina', emergency: '911' },
    { code: 'CL', name: 'Chile', emergency: '133' },
    { code: 'CO', name: 'Colombia', emergency: '123' },
    { code: 'PE', name: 'Peru', emergency: '105' },
  ];

  useEffect(() => {
    setTempLanguage(selectedLanguage);
    // Load saved country from localStorage
    const savedCountry = localStorage.getItem('socialhelp-country') || 'US';
    setTempCountry(savedCountry);
    // Load saved avatar language from localStorage
    const savedAvatarLanguage = localStorage.getItem('socialhelp-avatar-language') || 'en';
    setTempAvatarLanguage(savedAvatarLanguage);
    setHasUnsavedChanges(false);
  }, [selectedLanguage]);

  useEffect(() => {
    setHasUnsavedChanges(
      tempLanguage !== selectedLanguage || 
      tempCountry !== (localStorage.getItem('socialhelp-country') || 'US') ||
      tempAvatarLanguage !== (localStorage.getItem('socialhelp-avatar-language') || 'en')
    );
  }, [tempLanguage, selectedLanguage, tempCountry, tempAvatarLanguage]);

  const handleSaveSettings = async () => {
    try {
      // Update language preference
      onLanguageChange(tempLanguage);
      
      // Save country preference to localStorage
      localStorage.setItem('socialhelp-country', tempCountry);
      
      // Save avatar language preference to localStorage
      localStorage.setItem('socialhelp-avatar-language', tempAvatarLanguage);
      
      // Save to database
      await updateSettings({
        language_preference: tempLanguage,
        microphone_permission: microphonePermission === 'granted',
        location_permission: locationPermission === 'granted',
      });
      
      setHasUnsavedChanges(false);
      setShowSaveConfirmation(true);
      setTimeout(() => setShowSaveConfirmation(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const openBrowserPermissions = () => {
    // Try to trigger browser permission dialog
    if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
      // Show instructions
      alert('To change permissions:\n\n1. Click the lock icon (🔒) in your browser\'s address bar\n2. Select "Allow" or "Block" for microphone and location\n3. Refresh the page to apply changes');
    }
  };

  const getPermissionStatus = (permission: PermissionState | null) => {
    switch (permission) {
      case 'granted':
        return { icon: Check, color: 'text-green-600', bg: 'bg-green-100', text: 'Granted' };
      case 'denied':
        return { icon: X, color: 'text-red-600', bg: 'bg-red-100', text: 'Denied' };
      case 'prompt':
        return { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Not Set' };
      default:
        return { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100', text: 'Unknown' };
    }
  };

  const micStatus = getPermissionStatus(microphonePermission);
  const locationStatus = getPermissionStatus(locationPermission);
  const selectedCountryInfo = countryOptions.find(c => c.code === tempCountry) || countryOptions[0];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-pink-50 p-6 min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Settings Description */}
        <div className="mb-8 text-center">
          <p className="text-gray-600">Manage your app preferences and permissions</p>
        </div>

        {/* Save Confirmation */}
        {showSaveConfirmation && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Settings saved successfully!</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Language Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Language & Region</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Language for Voice Features
                </label>
                <select
                  id="language-select"
                  value={tempLanguage}
                  onChange={(e) => {
                    setTempLanguage(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Your Country
                </label>
                <select
                  id="country-select"
                  value={tempCountry}
                  onChange={(e) => {
                    setTempCountry(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {countryOptions.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name} (Emergency: {country.emergency})
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-600">
                  Emergency number for {selectedCountryInfo.name}: <strong>{selectedCountryInfo.emergency}</strong>
                </p>
              </div>
              
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p>Language is used for voice recognition and text-to-speech features. Country setting determines your emergency contact number and regional preferences.</p>
              </div>

              <div>
                <label htmlFor="avatar-language-select" className="block text-sm font-medium text-gray-700 mb-2">
                  AI Avatar Conversation Language
                </label>
                <select
                  id="avatar-language-select"
                  value={tempAvatarLanguage}
                  onChange={(e) => {
                    setTempAvatarLanguage(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {tavusLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-600">
                  This language will be used for AI avatar conversations and responses.
                </p>
              </div>
              
              <div className="text-sm text-gray-600 bg-purple-50 border border-purple-200 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Bot className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-purple-800 mb-1">Avatar Language Settings</p>
                    <p>The avatar language setting controls the language used in AI avatar conversations. This is separate from the voice recognition language and allows you to have conversations in different languages with your AI avatars.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Permission Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">App Permissions</h2>
            
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-medium text-blue-800 mb-2">Permission Management</h3>
              <p className="text-sm text-blue-700">
                You can toggle permissions below. Changes take effect immediately and help customize your app experience.
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Microphone Permission */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center space-x-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={microphonePermission === 'granted'}
                      onChange={openBrowserPermissions}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                      microphonePermission === 'granted' ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                        microphonePermission === 'granted' ? 'translate-x-5' : 'translate-x-0'
                      } mt-0.5 ml-0.5`}></div>
                    </div>
                  </label>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    {microphonePermission === 'denied' ? (
                      <MicOff className="w-6 h-6 text-white" />
                    ) : (
                      <Mic className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Microphone Access</h3>
                    <p className="text-sm text-gray-600">Required for voice commands and emergency assistance</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${micStatus.bg}`}>
                    <micStatus.icon className={`w-4 h-4 ${micStatus.color}`} />
                    <span className={`text-sm font-medium ${micStatus.color}`}>{micStatus.text}</span>
                  </div>
                  {microphonePermission !== 'granted' && (
                    <button
                      onClick={onRequestMicrophonePermission}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                    >
                      Enable
                    </button>
                  )}
                  <button
                    onClick={openBrowserPermissions}
                    className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-1"
                    title="Open browser permission settings"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Location Permission */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center space-x-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={locationPermission === 'granted'}
                      onChange={openBrowserPermissions}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                      locationPermission === 'granted' ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                        locationPermission === 'granted' ? 'translate-x-5' : 'translate-x-0'
                      } mt-0.5 ml-0.5`}></div>
                    </div>
                  </label>
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    {locationPermission === 'denied' ? (
                      <MapPinOff className="w-6 h-6 text-white" />
                    ) : (
                      <MapPin className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Location Services</h3>
                    <p className="text-sm text-gray-600">Used for emergency alerts and location sharing</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${locationStatus.bg}`}>
                    <locationStatus.icon className={`w-4 h-4 ${locationStatus.color}`} />
                    <span className={`text-sm font-medium ${locationStatus.color}`}>{locationStatus.text}</span>
                  </div>
                  {locationPermission !== 'granted' && (
                    <button
                      onClick={onRequestLocationPermission}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200"
                    >
                      Enable
                    </button>
                  )}
                  <button
                    onClick={openBrowserPermissions}
                    className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-1"
                    title="Open browser permission settings"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Permission Help */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-800 mb-2">Need Help with Permissions?</h4>
              <p className="text-sm text-gray-600 mb-3">
                If permissions are blocked, you can re-enable them in your browser settings:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Click the lock icon in your browser's address bar</li>
                <li>• Select "Allow" for microphone and location</li>
                <li>• Refresh the page to apply changes</li>
              </ul>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSaveSettings}
              disabled={!hasUnsavedChanges}
              className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
                !hasUnsavedChanges
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              <Save className="w-5 h-5" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;