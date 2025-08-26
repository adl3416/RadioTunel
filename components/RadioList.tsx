import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { RadioStation } from '../types/radio';
import { RadioStationCard } from './RadioStationCard';
import { useAudio } from '../contexts/AudioContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

interface RadioListProps {
  stations: RadioStation[];
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  searchEnabled?: boolean;
  emptyMessage?: string;
}

export const RadioList: React.FC<RadioListProps> = ({
  stations,
  loading = false,
  onRefresh,
  refreshing = false,
  searchEnabled = true,
  emptyMessage,
}) => {
  const { playStation } = useAudio();
  const { t } = useLanguage();
  const { recentlyPlayed } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStations, setFilteredStations] = useState<RadioStation[]>(stations);
  const playTimeout = useRef<any>(null);
  const lastPlayStation = useRef<string>('');

  const handleStationPress = useCallback(async (station: RadioStation) => {
    console.log('RadioList: Station press initiated', station.name);
    
    // Eğer aynı istasyon çok hızlı tekrar seçilirse engelle
    if (lastPlayStation.current === station.stationuuid) {
      console.log('RadioList: Duplicate station press ignored', station.name);
      return;
    }
    
    // Önceki timeout'u temizle
    if (playTimeout.current) {
      clearTimeout(playTimeout.current);
    }
    
    lastPlayStation.current = station.stationuuid;
    
    try {
      console.log('RadioList: Playing station', station.name);
      await playStation(station);
    } catch (error) {
      console.error('RadioList: Error playing station:', error);
      Alert.alert(t.error, t.playbackError);
    } finally {
      // 1 saniye sonra aynı istasyonu tekrar seçme yasağını kaldır
      playTimeout.current = setTimeout(() => {
        lastPlayStation.current = '';
      }, 1000);
    }
  }, [playStation, t]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStations(stations);
      return;
    }
    const normQuery = searchQuery
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g');
    const filtered = stations.filter(station => {
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
    });
    setFilteredStations(filtered);
  }, [searchQuery, stations]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const renderStation = ({ item }: { item: RadioStation }) => (
    <RadioStationCard 
      station={item} 
      onPress={handleStationPress}
    />
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-12">
      {loading ? (
        <View className="items-center">
          <ActivityIndicator size="large" color="#F97316" />
          <Text className="text-gray-600 dark:text-gray-400 mt-4">{t.loading}</Text>
        </View>
      ) : (
        <View className="items-center px-8">
          <Ionicons name="radio-outline" size={64} color="#D1D5DB" />
          <Text className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-4 text-center">
            {emptyMessage || t.noResults}
          </Text>
          {searchQuery.length > 0 && (
            <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center">
              Try adjusting your search terms
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loading || stations.length === 0) return null;
    
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#F97316" />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Sabit arama çubuğu */}
      {searchEnabled && (
        <View className="px-4 py-3" style={{ zIndex: 10, backgroundColor: '#f5f5f5' }}>
          <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3">
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-900 dark:text-white"
              placeholder={t.search}
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
              blurOnSubmit={false}
              returnKeyType="search"
              onBlur={e => {
                // Odak kaybolursa tekrar odakla
                e.target?.focus?.();
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      {/* FlatList altında */}
      <FlatList
        data={filteredStations}
        renderItem={renderStation}
        keyExtractor={(item) => item.stationuuid}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={
          filteredStations.length === 0 ? { flex: 1 } : { paddingBottom: 100 }
        }
        keyboardShouldPersistTaps="always"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#F97316"]}
              tintColor="#F97316"
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        disableIntervalMomentum={true}
        getItemLayout={(_, index) => ({
          length: 88,
          offset: 88 * index,
          index,
        })}
        scrollEventThrottle={16}
      />
    </View>
  );
};
