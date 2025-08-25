import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert,
  Linking 
} from 'react-native';
import { RadioList } from '../components/RadioList';
import { RadioStation } from '../types/radio';
import { RadioBrowserService } from '../services/radioBrowserService';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../contexts/AudioContext';

interface AllStationsScreenProps {
  onMenuPress: () => void;
  onNavigateToFavorites: () => void;
}

export const AllStationsScreen: React.FC<AllStationsScreenProps> = ({ onMenuPress, onNavigateToFavorites }) => {
  const { t } = useLanguage();
  const { favorites, recentlyPlayed } = useAudio();
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    filterStations();
  }, [searchQuery, stations]);

  const loadStations = async () => {
    try {
      setLoading(true);
      const turkishStations = await RadioBrowserService.getTurkishRadioStations(200);
      // Also try to fetch "Cihan" specifically and merge it so our app includes Radyo Cihan
      let cihanMatches: RadioStation[] = [];
      try {
        const found = await RadioBrowserService.searchStations('cihan');
        cihanMatches = Array.isArray(found) ? found : [];
      } catch (err) {
        console.warn('Error fetching Cihan station:', err);
      }
      
      // Sort by popularity (clickcount) and filter out low quality streams
      const sortedStations = turkishStations
        .filter(station => 
          station.bitrate >= 64 && // Minimum quality
          station.url_resolved && 
          station.name.trim().length > 0
        )
        .sort((a, b) => (b.clickcount || 0) - (a.clickcount || 0));
      // Filter and sanitize cihan matches similarly
      const filteredCihan = cihanMatches
        .filter(station => station.lastcheckok === 1 && station.url_resolved && station.name && station.name.trim().length > 0)
        .sort((a, b) => (b.clickcount || 0) - (a.clickcount || 0));

      // Merge cihan matches on top, dedupe by stationuuid
      const combined = [...filteredCihan, ...sortedStations];
      // Also ensure Herkul Radyo is included (manual entry) using provided stream URL
      const herkulStation = {
        changeuuid: '',
        stationuuid: 'herkul-radyo-local',
        name: 'Herkul Radyo',
        url: 'https://www.radioking.com/play/herkulradyo',
        url_resolved: 'https://www.radioking.com/play/herkulradyo',
        homepage: 'https://www.radioking.com/',
        favicon: '',
        tags: 'Türkçe, müzik',
        country: 'Turkey',
        countrycode: 'TR',
        iso_3166_2: '',
        state: '',
        language: 'turkish',
        languagecodes: 'tr',
        votes: 0,
        lastchangetime: '',
        lastchangetime_iso8601: '',
        codec: 'MP3',
        bitrate: 128,
        hls: 0,
        lastcheckok: 1,
        lastchecktime: '',
        lastchecktime_iso8601: '',
        lastcheckoktime: '',
        lastcheckoktime_iso8601: '',
        lastlocalchecktime: '',
        lastlocalchecktime_iso8601: '',
        clicktimestamp: '',
        clicktimestamp_iso8601: '',
        clickcount: 0,
        clicktrend: 0,
        ssl_error: 0,
        geo_lat: 0,
        geo_long: 0,
        has_extended_info: false,
      } as RadioStation;
      // put herkul first
      combined.unshift(herkulStation);
      const uniqueMap = new Map<string, RadioStation>();
      for (const s of combined) {
        if (!uniqueMap.has(s.stationuuid)) uniqueMap.set(s.stationuuid, s);
      }
      const mergedStations = Array.from(uniqueMap.values());

      setStations(mergedStations);
    } catch (error) {
      console.error('Error loading stations:', error);
      Alert.alert(
        t.error,
        t.networkError,
        [
          { text: t.tryAgain, onPress: loadStations },
          { text: t.cancel, style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStations();
    setRefreshing(false);
  };

  const filterStations = () => {
    if (!searchQuery.trim()) {
      setFilteredStations(stations);
      return;
    }

    const filtered = stations.filter(station =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.tags.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredStations(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
  {/* Header - Ekranın 1/4'ü kadar yükseklik */}
  <View className="bg-orange-500" style={{ height: '25%' }}>
        <View className="flex-1 justify-center items-center px-4 pt-8">
          {/* Menu butonu sol üstte */}
          <View className="absolute top-8 left-4">
            <TouchableOpacity onPress={onMenuPress} className="p-3 bg-white rounded-full shadow-md">
              <Ionicons name="menu" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          
          {/* Radyo Tüneli başlığı */}
          <Text className="text-3xl font-bold text-white text-center mb-4">
            Radyo Tüneli
          </Text>
          
          {/* Favoriler butonu sağ altta */}
          <View className="absolute bottom-4 right-4 flex-row items-center">
            <TouchableOpacity 
              onPress={onNavigateToFavorites}
              className="p-4 bg-white bg-opacity-20 rounded-full flex-row items-center"
            >
              <Ionicons name="heart" size={20} color="#FCD34D" />
              <Text className="text-white text-sm ml-2 font-medium">Favoriler</Text>
            </TouchableOpacity>
            {/* favorites count badge */}
            <View className="ml-2 bg-white rounded-full px-2 py-1">
              <Text className="text-orange-600 text-xs font-semibold">{favorites?.length ?? 0}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20">
        <Text className="text-orange-700 dark:text-orange-300 text-sm text-center">
          {filteredStations.length} {searchQuery ? 'results' : 'Turkish radio stations'}
          {searchQuery && ` for "${searchQuery}"`}
        </Text>
      </View>

      {/* Content */}
      <RadioList
        stations={filteredStations}
        loading={loading}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        searchEnabled={true}
        onSearch={handleSearch}
        emptyMessage={searchQuery ? t.noResults : 'No stations available'}
      />
    </SafeAreaView>
  );
};
