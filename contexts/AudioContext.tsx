import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Audio } from 'expo-av';
import { RadioStation, PlaybackState, SleepTimer } from '../types/radio';
import { StorageService } from '../services/storageService';
import { RadioBrowserService } from '../services/radioBrowserService';

interface AudioContextType {
  playbackState: PlaybackState;
  sleepTimer: SleepTimer;
  favorites: RadioStation[];
  recentlyPlayed: RadioStation[];
  playStation: (station: RadioStation) => Promise<void>;
  pausePlayback: () => Promise<void>;
  stopPlayback: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setSleepTimer: (minutes: number) => void;
  cancelSleepTimer: () => void;
  addToFavorites: (station: RadioStation) => Promise<void>;
  removeFromFavorites: (stationUuid: string) => Promise<void>;
  isFavorite: (stationUuid: string) => boolean;
  loadFavorites: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioState {
  playbackState: PlaybackState;
  sleepTimer: SleepTimer;
  favorites: RadioStation[];
  recentlyPlayed: RadioStation[];
  sound: Audio.Sound | null;
}

type AudioAction =
  | { type: 'SET_PLAYBACK_STATE'; payload: Partial<PlaybackState> }
  | { type: 'SET_SLEEP_TIMER'; payload: Partial<SleepTimer> }
  | { type: 'SET_FAVORITES'; payload: RadioStation[] }
  | { type: 'ADD_RECENT'; payload: RadioStation }
  | { type: 'SET_SOUND'; payload: Audio.Sound | null };

const audioReducer = (state: AudioState, action: AudioAction): AudioState => {
  switch (action.type) {
    case 'SET_PLAYBACK_STATE':
      return {
        ...state,
        playbackState: { ...state.playbackState, ...action.payload },
      };
    case 'SET_SLEEP_TIMER':
      return {
        ...state,
        sleepTimer: { ...state.sleepTimer, ...action.payload },
      };
    case 'SET_FAVORITES':
      return {
        ...state,
        favorites: action.payload,
      };
    case 'ADD_RECENT':
      // add to front, remove duplicates, limit to 8
      const existing = state.recentlyPlayed.filter(r => r.stationuuid !== action.payload.stationuuid);
      return {
        ...state,
        recentlyPlayed: [action.payload, ...existing].slice(0, 8),
      };
    case 'SET_SOUND':
      return {
        ...state,
        sound: action.payload,
      };
    default:
      return state;
  }
};

const initialState: AudioState = {
  playbackState: {
    isPlaying: false,
    isLoading: false,
    currentStation: null,
    volume: 0.8,
    position: 0,
    duration: 0,
  },
  sleepTimer: {
    isActive: false,
    duration: 0,
    remainingTime: 0,
  },
  favorites: [],
  recentlyPlayed: [],
  sound: null,
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(audioReducer, initialState);
  let sleepTimerInterval: any = null;

  // Configure audio session for background playback
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Error configuring audio:', error);
      }
    };

    configureAudio();
    loadFavorites();

    return () => {
      if (sleepTimerInterval) {
        clearInterval(sleepTimerInterval);
      }
    };
  }, []);

  // Sleep timer effect
  useEffect(() => {
    if (state.sleepTimer.isActive && state.sleepTimer.remainingTime > 0) {
      sleepTimerInterval = setInterval(() => {
        dispatch({
          type: 'SET_SLEEP_TIMER',
          payload: { remainingTime: state.sleepTimer.remainingTime - 1 },
        });

        if (state.sleepTimer.remainingTime <= 1) {
          stopPlayback();
          cancelSleepTimer();
        }
      }, 1000);
    } else {
      if (sleepTimerInterval) {
        clearInterval(sleepTimerInterval);
        sleepTimerInterval = null;
      }
    }

    return () => {
      if (sleepTimerInterval) {
        clearInterval(sleepTimerInterval);
      }
    };
  }, [state.sleepTimer.isActive, state.sleepTimer.remainingTime]);

  const playStation = async (station: RadioStation): Promise<void> => {
    try {
      // Hızlı ve senkronize state güncellemesi
      dispatch({
        type: 'SET_PLAYBACK_STATE',
        payload: {
          isLoading: true,
          isPlaying: false,
          currentStation: station,
          position: 0,
          duration: 0,
        },
      });

      // Mevcut sesi durdur ve kaldır
      if (state.sound) {
        try {
          await state.sound.stopAsync();
        } catch (e) {}
        try {
          await state.sound.unloadAsync();
        } catch (e) {}
        dispatch({ type: 'SET_SOUND', payload: null });
      }

      // İstatistik için tıklama
      RadioBrowserService.clickStation(station.stationuuid);

      // Yeni sesi başlat
      const { sound } = await Audio.Sound.createAsync(
        { uri: station.url_resolved },
        {
          shouldPlay: true,
          rate: 1.0,
          shouldCorrectPitch: true,
          volume: state.playbackState.volume,
          isMuted: false,
          isLooping: false,
          progressUpdateIntervalMillis: 500,
          positionMillis: 0,
        }
      );

      // Ses hemen başlatıldı, state güncelle
      dispatch({
        type: 'SET_PLAYBACK_STATE',
        payload: {
          isPlaying: true,
          isLoading: false,
          position: 0,
          duration: 0,
        },
      });
      dispatch({ type: 'SET_SOUND', payload: sound });
      dispatch({ type: 'ADD_RECENT', payload: station });
    } catch (error) {
      dispatch({
        type: 'SET_PLAYBACK_STATE',
        payload: { isLoading: false, isPlaying: false },
      });
    }
  };

  const pausePlayback = async (): Promise<void> => {
    try {
      if (state.sound) {
        await state.sound.pauseAsync();
        await state.sound.unloadAsync();
        dispatch({ type: 'SET_SOUND', payload: null });
      }
      dispatch({
        type: 'SET_PLAYBACK_STATE',
        payload: { isPlaying: false, isLoading: false },
      });
    } catch (error) {
      dispatch({
        type: 'SET_PLAYBACK_STATE',
        payload: { isPlaying: false, isLoading: false },
      });
    }
  };

  const stopPlayback = async (): Promise<void> => {
    try {
      if (state.sound) {
        await state.sound.stopAsync();
        await state.sound.unloadAsync();
        dispatch({ type: 'SET_SOUND', payload: null });
      }
      dispatch({
        type: 'SET_PLAYBACK_STATE',
        payload: { isPlaying: false, currentStation: null, position: 0 },
      });
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  };

  const setVolume = async (volume: number): Promise<void> => {
    try {
      if (state.sound) {
        const status = await state.sound.getStatusAsync();
        if (status.isLoaded) {
          await state.sound.setVolumeAsync(volume);
        }
      }
      dispatch({ type: 'SET_PLAYBACK_STATE', payload: { volume } });
      
      // Save volume to settings
      const settings = await StorageService.getSettings();
      await StorageService.saveSettings({ ...settings, volume });
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const setSleepTimer = (minutes: number): void => {
    dispatch({
      type: 'SET_SLEEP_TIMER',
      payload: {
        isActive: true,
        duration: minutes,
        remainingTime: minutes * 60,
      },
    });
  };

  const cancelSleepTimer = (): void => {
    if (sleepTimerInterval) {
      clearInterval(sleepTimerInterval);
      sleepTimerInterval = null;
    }
    dispatch({
      type: 'SET_SLEEP_TIMER',
      payload: { isActive: false, duration: 0, remainingTime: 0 },
    });
  };

  const loadFavorites = async (): Promise<void> => {
    try {
      const favorites = await StorageService.getFavorites();
      dispatch({ type: 'SET_FAVORITES', payload: favorites });
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const addToFavorites = async (station: RadioStation): Promise<void> => {
    try {
      await StorageService.addToFavorites(station);
      await loadFavorites();
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const removeFromFavorites = async (stationUuid: string): Promise<void> => {
    try {
      await StorageService.removeFromFavorites(stationUuid);
      await loadFavorites();
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const isFavorite = (stationUuid: string): boolean => {
    return state.favorites.some(fav => fav.stationuuid === stationUuid);
  };

  return (
    <AudioContext.Provider
      value={{
        playbackState: state.playbackState,
        sleepTimer: state.sleepTimer,
        favorites: state.favorites,
  recentlyPlayed: state.recentlyPlayed,
        playStation,
        pausePlayback,
        stopPlayback,
        setVolume,
        setSleepTimer,
        cancelSleepTimer,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        loadFavorites,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
