import React, { useEffect, useRef, useState } from 'react';
import { Menu, Home, Heart, Bot, Settings, Smartphone, Palette, X, Mic, Phone, MapPin, Shield, MicOff, MapPinOff, Globe, User, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import UserProfile from './UserProfile';
import AuthPage from './AuthPage';

interface SidebarItem {
  icon: React.ComponentType<any>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  microphonePermission: PermissionState | null;
  locationPermission: PermissionState | null;
  onRequestMicrophonePermission: () => void;
  onRequestLocationPermission: () => void;
}

// Emergency numbers by country
const emergencyNumbers: { [key: string]: { number: string; name: string } } = {
  'US': { number: '911', name: 'Emergency Services' },
  'GB': { number: '999', name: 'Emergency Services' },
  'CA': { number: '911', name: 'Emergency Services' },
  'AU': { number: '000', name: 'Emergency Services' },
  'DE': { number: '112', name: 'Notruf' },
  'FR': { number: '112', name: 'Services d\'urgence' },
  'IT': { number: '112', name: 'Emergenza' },
  'ES': { number: '112', name: 'Emergencias' },
  'IN': { number: '112', name: 'Emergency' },
  'JP': { number: '110', name: '警察' },
  'CN': { number: '110', name: '报警' },
  'BR': { number: '190', name: 'Emergência' },
  'MX': { number: '911', name: 'Emergencias' },
  'RU': { number: '112', name: 'Экстренные службы' },
  'KR': { number: '112', name: '응급상황' },
  'NL': { number: '112', name: 'Noodgevallen' },
  'SE': { number: '112', name: 'Nödnummer' },
  'NO': { number: '112', name: 'Nödnummer' },
  'DK': { number: '112', name: 'Nødnummer' },
  'FI': { number: '112', name: 'Hätänumero' },
  'PL': { number: '112', name: 'Pogotowie' },
  'TR': { number: '112', name: 'Acil Durum' },
  'SA': { number: '999', name: 'الطوارئ' },
  'AE': { number: '999', name: 'الطوارئ' },
  'ZA': { number: '10111', name: 'Emergency' },
  'NG': { number: '199', name: 'Emergency' },
  'EG': { number: '122', name: 'الطوارئ' },
  'TH': { number: '191', name: 'ฉุกเฉิน' },
  'VN': { number: '113', name: 'Cấp cứu' },
  'ID': { number: '112', name: 'Darurat' },
  'MY': { number: '999', name: 'Kecemasan' },
  'SG': { number: '995', name: 'Emergency' },
  'PH': { number: '911', name: 'Emergency' },
  'AR': { number: '911', name: 'Emergencias' },
  'CL': { number: '133', name: 'Emergencias' },
  'CO': { number: '123', name: 'Emergencias' },
  'PE': { number: '105', name: 'Emergencias' },
  'VE': { number: '171', name: 'Emergencias' },
  'UY': { number: '911', name: 'Emergencias' },
  'PY': { number: '911', name: 'Emergencias' },
  'BO': { number: '911', name: 'Emergencias' },
  'EC': { number: '911', name: 'Emergencias' },
  'CR': { number: '911', name: 'Emergencias' },
  'PA': { number: '911', name: 'Emergencias' },
  'GT': { number: '110', name: 'Emergencias' },
  'HN': { number: '199', name: 'Emergencias' },
  'SV': { number: '911', name: 'Emergencias' },
  'NI': { number: '118', name: 'Emergencias' },
  'BZ': { number: '911', name: 'Emergency' },
  'JM': { number: '119', name: 'Emergency' },
  'TT': { number: '999', name: 'Emergency' },
  'BB': { number: '211', name: 'Emergency' },
  'GY': { number: '911', name: 'Emergency' },
  'SR': { number: '115', name: 'Emergency' },
  'GF': { number: '15', name: 'Urgences' },
  'FK': { number: '999', name: 'Emergency' }
};

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentPage,
  microphonePermission,
  locationPermission,
  onRequestMicrophonePermission,
  onRequestLocationPermission
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const { profile } = useUserData();
  const [showProfile, setShowProfile] = useState(false);
  const [showAuthPage, setShowAuthPage] = useState(false);

  // Get user's country from localStorage or detect from browser
  const [selectedCountry, setSelectedCountry] = useState(() => {
    const saved = localStorage.getItem('socialhelp-country');
    if (saved) return saved;
    
    // Try to detect from browser locale
    const locale = navigator.language || 'en-US';
    const countryCode = locale.split('-')[1] || 'US';
    return countryCode.toUpperCase();
  });

  const currentEmergency = emergencyNumbers[selectedCountry] || emergencyNumbers['US'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const sidebarItems: SidebarItem[] = [
    { 
      icon: Home, 
      label: 'Home', 
      active: currentPage === 'home',
      onClick: () => onNavigate('home')
    },
    { 
      icon: Bot, 
      label: 'Avatar',
      active: currentPage === 'avatar',
      onClick: () => onNavigate('avatar')
    },
    { 
      icon: Heart, 
      label: 'Health',
      active: currentPage === 'health',
      onClick: () => onNavigate('health')
    },
    { 
      icon: Settings, 
      label: 'Settings',
      active: currentPage === 'settings',
      onClick: () => onNavigate('settings')
    },
    { 
      icon: Smartphone, 
      label: 'Create Shortcut',
      active: currentPage === 'shortcut',
      onClick: () => onNavigate('shortcut')
    },
    { 
      icon: Palette, 
      label: 'Personalization',
      active: currentPage === 'personalization',
      onClick: () => onNavigate('personalization')
    },
  ];

  const handleEmergencyCall = () => {
    if (locationPermission !== 'granted') {
      onRequestLocationPermission();
    }
    // Emergency call logic here
    window.open(`tel:${currentEmergency.number}`, '_self');
  };

  const handleShareLocation = () => {
    if (locationPermission !== 'granted') {
      onRequestLocationPermission();
    } else {
      // Share location logic here
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
          navigator.share?.({
            title: 'My Emergency Location',
            text: 'I need help at this location',
            url: locationUrl
          }).catch(() => {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(locationUrl);
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <>
      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto overflow-x-hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`} ref={sidebarRef}>
        <div className="p-6 min-h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center relative">
                <div className="text-white font-bold text-lg">SH</div>
              </div>
              <span className="text-xl font-bold text-gray-800">SOCIAL HELP</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* User Profile Section */}
          {user ? (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={signOut}
                  className="flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
              <div className="text-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-800">
                  Guest Mode
                </p>
                <p className="text-xs text-gray-600">
                  Sign in for full features
                </p>
              </div>
              <button
                onClick={() => setShowAuthPage(true)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign In / Sign Up</span>
              </button>
            </div>
          )}

          {/* Permission Status Indicators */}
          <div className="mb-6 space-y-2">
            {microphonePermission === 'denied' && (
              <div className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <MicOff className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-800">Microphone access needed for voice features</span>
              </div>
            )}
            {locationPermission === 'denied' && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <MapPinOff className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">Location access limited - emergency alerts may be reduced</span>
              </div>
            )}
          </div>

          {/* Sidebar Navigation */}
          <nav className="space-y-2 mb-8">
            {sidebarItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-200 ${
                  item.active
                    ? 'bg-gradient-to-r from-blue-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label={item.label}
              >
                <item.icon className="w-6 h-6 flex-shrink-0" />
                <span className="text-lg font-medium truncate">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Emergency Contacts */}
          <div className="p-4 bg-red-50 rounded-xl">
            <h3 className="text-sm font-semibold text-red-800 mb-3">Emergency Contacts</h3>
            
            {/* Country Selector */}
            <div className="mb-3">
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  localStorage.setItem('socialhelp-country', e.target.value);
                }}
                className="w-full p-2 text-xs border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              >
                {Object.entries(emergencyNumbers).map(([code, info]) => (
                  <option key={code} value={code}>
                    {code} - {info.number}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={handleEmergencyCall}
                className="w-full flex items-center space-x-3 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                aria-label="Call emergency services"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">Call {currentEmergency.number}</span>
              </button>
              <button 
                onClick={handleShareLocation}
                className="w-full flex items-center space-x-3 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200"
                aria-label="Share current location"
              >
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">Share Location</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {showProfile && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <UserProfile onClose={() => setShowProfile(false)} />
          </div>
        </div>
      )}

      {/* Auth Page Modal */}
      {showAuthPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <AuthPage onBack={() => setShowAuthPage(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;