import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert,
  Linking,
  TextInput
} from 'react-native';
import { RadioList } from '../components/RadioList';
import { AlphabeticFilter } from '../components/AlphabeticFilter';
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [azSortActive, setAzSortActive] = useState(false);
  const [originalStations, setOriginalStations] = useState<RadioStation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStations();
  }, []);

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
          station.name.trim().length > 0 &&
          !(station.name.toLowerCase().includes('trt radyo haber') && station.bitrate === 140)
        )
        .sort((a, b) => (b.clickcount || 0) - (a.clickcount || 0))
        // Alem FM için sadece bir tanesini tut
        .filter((station, idx, arr) => {
          if (station.name.trim().toLowerCase() === 'alem fm') {
            // Sadece ilk Alem FM kalsın
            return arr.findIndex(s => s.name.trim().toLowerCase() === 'alem fm') === idx;
          }
          return true;
        });
      // Filter and sanitize cihan matches similarly
      const filteredCihan = cihanMatches
        .filter(station => station.lastcheckok === 1 && station.url_resolved && station.name && station.name.trim().length > 0)
        .sort((a, b) => (b.clickcount || 0) - (a.clickcount || 0));

      // Merge cihan matches on top, dedupe by stationuuid
      const combined = [...filteredCihan, ...sortedStations];
      // Manuel eklenen istasyonlar
      const manualStations: RadioStation[] = [
        {
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
        },
        {
          changeuuid: '7748d750-3804-40d4-a615-f21cd06fbaf8',
          stationuuid: '7ec738e7-9e9f-4eb5-be74-ec08f2ecb7c2',
          name: 'A Haber',
          url: 'https://trkvz-radyolar.ercdn.net/ahaberradyo/playlist.m3u8',
          url_resolved: 'https://trkvz-radyolar.ercdn.net/ahaberradyo/playlist.m3u8',
          homepage: 'https://www.ahaber.com.tr/',
          favicon: '',
          tags: 'Haber, Türkçe',
          country: 'Turkey',
          countrycode: 'TR',
          iso_3166_2: '',
          state: '',
          language: 'turkish',
          languagecodes: 'tr',
          votes: 0,
          lastchangetime: '',
          lastchangetime_iso8601: '',
          codec: 'AAC',
          bitrate: 128,
          hls: 1,
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
        },
      ];
      // Manuel istasyonları en üste ekle
      manualStations.reverse().forEach(station => combined.unshift(station));
      const uniqueMap = new Map<string, RadioStation>();
      for (const s of combined) {
        if (!uniqueMap.has(s.stationuuid)) uniqueMap.set(s.stationuuid, s);
      }
      const mergedStations = Array.from(uniqueMap.values());

  setStations(mergedStations);
  setOriginalStations(mergedStations);
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
  {/* Header - Ekranın 1/4'ü kadar yükseklik */}
  <View className="bg-orange-500" style={{ height: '25%' }}>
  <View className="flex-1 justify-start items-center px-4 pt-4">
          {/* Menu butonu sol üstte */}
          <View className="absolute top-8 left-4">
            <TouchableOpacity onPress={onMenuPress} className="p-3 bg-white rounded-full shadow-md">
              <Ionicons name="menu" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Alfabetik filtre sağ üstte */}
          <View className="absolute top-8 right-4 flex-row items-center">
            <TouchableOpacity
              onPress={() => {
                setAzSortActive(prev => {
                  if (!prev) {
                    setStations([...stations].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
                  } else {
                    setStations([...originalStations]);
                  }
                  return !prev;
                });
              }}
              style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, marginRight: 4 }}>A-Z</Text>
                <Ionicons name={azSortActive ? 'arrow-down' : 'arrow-up'} size={18} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Radyo Tüneli başlığı */}
          <View className="w-full flex-row items-center justify-between mb-2">
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text className="text-3xl font-bold text-white text-center" style={{ marginBottom: 2, marginTop: 26 }}>
                Radyo Tüneli
              </Text>
              <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-2 py-0" style={{ minHeight: 18, maxWidth: 380, marginTop: 28, alignSelf: 'center' }}>
                <Ionicons name="search" size={13} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-1 text-gray-900 dark:text-white"
                  placeholder={t.search}
                  placeholderTextColor="#6B7280"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  blurOnSubmit={false}
                  returnKeyType="search"
                  style={{ fontSize: 11, minHeight: 10, maxWidth: 260 }}
                />
                {searchQuery && searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={13} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Favoriler butonu sağ altta */}
          <View className="absolute bottom-4 right-4 flex-row items-center">
            <TouchableOpacity 
              onPress={onNavigateToFavorites}
              className="p-2 bg-white bg-opacity-20 rounded-full flex-row items-center"
            >
              <Ionicons name="heart" size={20} color="#FCD34D" />
              <Text className="text-white text-sm ml-1 font-medium">Favoriler</Text>
               <View className="ml-2 bg-white rounded-full px-2 py-1">
              <Text className="text-orange-600 text-xs font-semibold">{favorites?.length ?? 0}</Text>
            </View>
            </TouchableOpacity>
            {/* favorites count badge */}
           
          </View>
        </View>
      </View>

      {/* Stats */}
      <View className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20">
        <Text className="text-orange-700 dark:text-orange-300 text-sm text-center">
          {stations.length} Turkish radio stations
        </Text>
      </View>

      {/* Content */}
      <RadioList
        stations={searchQuery.trim() ? stations.filter(station => {
          const normQuery = searchQuery
            .toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/ü/g, 'u')
            .replace(/ö/g, 'o')
            .replace(/ş/g, 's')
            .replace(/ç/g, 'c')
            .replace(/ğ/g, 'g');
          const fields = [
            station.name,
            station.tags,
            station.country,
            station.codec,
            station.bitrate?.toString() || '',
            station.homepage || '',
            station.state || '',
            station.language || '',
          ];
          return fields.some(field => (field || '').toLowerCase().includes(normQuery));
        }) : stations}
        loading={loading}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        searchEnabled={false}
        emptyMessage={t.noResults}
      />
    </SafeAreaView>
  );
};
