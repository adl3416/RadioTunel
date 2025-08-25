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
  onSearch?: (query: string) => void;
  emptyMessage?: string;
}

export const RadioList: React.FC<RadioListProps> = ({
  stations,
  loading = false,
  onRefresh,
  refreshing = false,
  searchEnabled = true,
  onSearch,
  emptyMessage,
}) => {
  const { playStation } = useAudio();
  const { t } = useLanguage();
  const { recentlyPlayed } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');
  const searchDebounce = useRef<any>(null);
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // debounce parent search to avoid re-rendering list on every keystroke
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      onSearch?.(query);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, []);

  const renderStation = ({ item }: { item: RadioStation }) => (
    <RadioStationCard 
      station={item} 
      onPress={handleStationPress}
    />
  );

  const renderHeader = () => (
    <View>
      {searchEnabled && (
        <View className="px-4 py-3">
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
              onSubmitEditing={() => onSearch?.(searchQuery)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          {/* Recently played horizontal list under search */}
          {recentlyPlayed && recentlyPlayed.length > 0 && (
            <View className="mt-3">
              <Text className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Son dinlenenler</Text>
              <FlatList
                data={recentlyPlayed}
                horizontal
                keyExtractor={(item) => item.stationuuid}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View className="mr-2 px-1" style={{ width: 140 }}>
                    <RadioStationCard station={item} onPress={() => { /* optional play */ }} small />
                  </View>
                )}
              />
            </View>
          )}
        </View>
      )}
    </View>
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
      <FlatList
        data={stations}
        renderItem={renderStation}
        keyExtractor={(item) => item.stationuuid}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={
          stations.length === 0 ? { flex: 1 } : { paddingBottom: 100 }
        }
        keyboardShouldPersistTaps="always"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#F97316']}
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
