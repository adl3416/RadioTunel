import { RadioStation } from '../types/radio';

const BASE_URL = 'https://de1.api.radio-browser.info';

export class RadioBrowserService {
  /**
   * Get popular Turkish radio stations
   */
  static async getTurkishRadioStations(limit: number = 100): Promise<RadioStation[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/json/stations/bycountrycodeexact/TR?limit=${limit * 2}&order=clickcount&reverse=true`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const stations = await response.json();
      
      // Filter for high quality stations
      const filteredStations = stations.filter((station: RadioStation) => {
        return (
          station.lastcheckok === 1 && 
          station.url_resolved &&
          (station.bitrate >= 128 || station.bitrate === 0) && // Prefer high bitrate or unknown (often good quality)
          station.codec !== 'MP3' || station.bitrate >= 192 // If MP3, prefer 192kbps+
        );
      });
      
      // Sort by quality: higher bitrate first, then by click count
      const sortedStations = filteredStations.sort((a: RadioStation, b: RadioStation) => {
        if (a.bitrate !== b.bitrate) {
          return (b.bitrate || 320) - (a.bitrate || 320); // Higher bitrate first
        }
        return (b.clickcount || 0) - (a.clickcount || 0); // Then by popularity
      });
      
      return sortedStations.slice(0, limit);
    } catch (error) {
      console.error('Error fetching Turkish radio stations:', error);
      throw error;
    }
  }

  /**
   * Search radio stations by name
   */
  static async searchStations(query: string, country: string = 'TR'): Promise<RadioStation[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/json/stations/byname/${encodeURIComponent(query)}?countrycode=${country}&limit=50`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const stations = await response.json();
      return stations.filter((station: RadioStation) => 
        station.lastcheckok === 1 && station.url_resolved
      );
    } catch (error) {
      console.error('Error searching radio stations:', error);
      throw error;
    }
  }

  /**
   * Get stations by language
   */
  static async getStationsByLanguage(language: string = 'turkish'): Promise<RadioStation[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/json/stations/bylanguageexact/${language}?limit=200&order=clickcount&reverse=true`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const stations = await response.json();
      return stations.filter((station: RadioStation) => 
        station.lastcheckok === 1 && station.url_resolved
      );
    } catch (error) {
      console.error('Error fetching stations by language:', error);
      throw error;
    }
  }

  /**
   * Get popular stations globally
   */
  static async getPopularStations(limit: number = 100): Promise<RadioStation[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/json/stations/topvote/${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const stations = await response.json();
      return stations.filter((station: RadioStation) => 
        station.lastcheckok === 1 && station.url_resolved
      );
    } catch (error) {
      console.error('Error fetching popular stations:', error);
      throw error;
    }
  }

  /**
   * Get station by UUID
   */
  static async getStationByUuid(uuid: string): Promise<RadioStation | null> {
    try {
      const response = await fetch(
        `${BASE_URL}/json/stations/byuuid/${uuid}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const stations = await response.json();
      return stations.length > 0 ? stations[0] : null;
    } catch (error) {
      console.error('Error fetching station by UUID:', error);
      return null;
    }
  }

  /**
   * Click on station (for statistics)
   */
  static async clickStation(uuid: string): Promise<void> {
    try {
      await fetch(`${BASE_URL}/json/url/${uuid}`, {
        method: 'GET',
      });
    } catch (error) {
      console.error('Error clicking station:', error);
    }
  }
}
