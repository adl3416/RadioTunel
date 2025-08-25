import AsyncStorage from '@react-native-async-storage/async-storage';
import { RadioStation, AppSettings } from '../types/radio';

const FAVORITES_KEY = 'radio_favorites';
const SETTINGS_KEY = 'app_settings';

export class StorageService {
  /**
   * Get favorite radio stations
   */
  static async getFavorites(): Promise<RadioStation[]> {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  /**
   * Add station to favorites
   */
  static async addToFavorites(station: RadioStation): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const exists = favorites.some(fav => fav.stationuuid === station.stationuuid);
      
      if (!exists) {
        favorites.push(station);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  }

  /**
   * Remove station from favorites
   */
  static async removeFromFavorites(stationUuid: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter(fav => fav.stationuuid !== stationUuid);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  }

  /**
   * Check if station is in favorites
   */
  static async isFavorite(stationUuid: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav.stationuuid === stationUuid);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  /**
   * Get app settings
   */
  static async getSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
      return settingsJson ? JSON.parse(settingsJson) : {
        language: 'tr',
        volume: 0.8,
        autoPlay: false,
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        language: 'tr',
        volume: 0.8,
        autoPlay: false,
      };
    }
  }

  /**
   * Save app settings
   */
  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  /**
   * Clear all data
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([FAVORITES_KEY, SETTINGS_KEY]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}
