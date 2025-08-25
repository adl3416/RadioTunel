import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { tr, en } from '../i18n/translations';
import { StorageService } from '../services/storageService';

type Language = 'tr' | 'en';
type Translations = typeof tr;

interface LanguageState {
  language: Language;
  t: Translations;
}

interface LanguageContextType extends LanguageState {
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = { tr, en };

type LanguageAction = {
  type: 'SET_LANGUAGE';
  payload: Language;
};

const languageReducer = (state: LanguageState, action: LanguageAction): LanguageState => {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return {
        language: action.payload,
        t: translations[action.payload],
      };
    default:
      return state;
  }
};

const initialState: LanguageState = {
  language: 'tr',
  t: tr,
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(languageReducer, initialState);

  const setLanguage = async (language: Language) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
    
    // Save to storage
    try {
      const settings = await StorageService.getSettings();
      await StorageService.saveSettings({ ...settings, language });
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  // Load language preference on app start
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const settings = await StorageService.getSettings();
        dispatch({ type: 'SET_LANGUAGE', payload: settings.language });
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };

    loadLanguagePreference();
  }, []);

  return (
    <LanguageContext.Provider value={{ ...state, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
