import { useState, useEffect } from 'react';

interface Language {
  code: string;
  name: string;
}

interface UseLanguagesReturn {
  availableLanguages: Language[];
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  isLanguageSupported: (language: string) => boolean;
}

export const useLanguages = (): UseLanguagesReturn => {
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguageState] = useState<string>('en-US');

  useEffect(() => {
    // Get available voices from the browser
    const getAvailableLanguages = () => {
      if ('speechSynthesis' in window) {
        const voices = speechSynthesis.getVoices();
        const languageMap = new Map<string, string>();
        
        // Common language mappings for better user experience
        const languageNames: { [key: string]: string } = {
          'en-US': 'English (US)',
          'en-GB': 'English (UK)',
          'es-ES': 'Spanish (Spain)',
          'es-MX': 'Spanish (Mexico)',
          'fr-FR': 'French',
          'de-DE': 'German',
          'it-IT': 'Italian',
          'pt-BR': 'Portuguese (Brazil)',
          'pt-PT': 'Portuguese (Portugal)',
          'ru-RU': 'Russian',
          'ja-JP': 'Japanese',
          'ko-KR': 'Korean',
          'zh-CN': 'Chinese (Simplified)',
          'zh-TW': 'Chinese (Traditional)',
          'hi-IN': 'Hindi',
          'ar-SA': 'Arabic',
          'nl-NL': 'Dutch',
          'sv-SE': 'Swedish',
          'no-NO': 'Norwegian',
          'da-DK': 'Danish',
          'fi-FI': 'Finnish',
          'pl-PL': 'Polish',
          'tr-TR': 'Turkish',
          'he-IL': 'Hebrew',
          'th-TH': 'Thai',
          'vi-VN': 'Vietnamese',
          'id-ID': 'Indonesian',
          'ms-MY': 'Malay',
          'uk-UA': 'Ukrainian',
          'cs-CZ': 'Czech',
          'sk-SK': 'Slovak',
          'hu-HU': 'Hungarian',
          'ro-RO': 'Romanian',
          'bg-BG': 'Bulgarian',
          'hr-HR': 'Croatian',
          'sl-SI': 'Slovenian',
          'et-EE': 'Estonian',
          'lv-LV': 'Latvian',
          'lt-LT': 'Lithuanian'
        };

        // Extract unique languages from available voices
        voices.forEach(voice => {
          const lang = voice.lang;
          if (!languageMap.has(lang)) {
            const displayName = languageNames[lang] || voice.name || lang;
            languageMap.set(lang, displayName);
          }
        });

        // Convert to array and sort
        const languages = Array.from(languageMap.entries())
          .map(([code, name]) => ({ code, name }))
          .sort((a, b) => a.name.localeCompare(b.name));

        // Ensure English (US) is always available as fallback
        if (!languages.find(lang => lang.code === 'en-US')) {
          languages.unshift({ code: 'en-US', name: 'English (US)' });
        }

        setAvailableLanguages(languages);
      }
    };

    // Initial load
    getAvailableLanguages();

    // Listen for voices changed event (some browsers load voices asynchronously)
    if ('speechSynthesis' in window) {
      speechSynthesis.addEventListener('voiceschanged', getAvailableLanguages);
      
      return () => {
        speechSynthesis.removeEventListener('voiceschanged', getAvailableLanguages);
      };
    }
  }, []);

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('socialhelp-language');
    if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
      setSelectedLanguageState(savedLanguage);
    } else if (availableLanguages.length > 0) {
      // Try to detect user's browser language
      const browserLang = navigator.language;
      const matchingLang = availableLanguages.find(lang => 
        lang.code === browserLang || lang.code.startsWith(browserLang.split('-')[0])
      );
      if (matchingLang) {
        setSelectedLanguageState(matchingLang.code);
      }
    }
  }, [availableLanguages]);

  const setSelectedLanguage = (language: string) => {
    setSelectedLanguageState(language);
    localStorage.setItem('socialhelp-language', language);
  };

  const isLanguageSupported = (language: string): boolean => {
    return availableLanguages.some(lang => lang.code === language);
  };

  return {
    availableLanguages,
    selectedLanguage,
    setSelectedLanguage,
    isLanguageSupported
  };
};