import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Image } from 'react-native';
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
  const { playStation, recentlyPlayed } = useAudio();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStations, setFilteredStations] = useState<RadioStation[]>(stations);
  const playTimeout = useRef<any>(null);
  const lastPlayStation = useRef<string>('');

  const handleStationPress = useCallback(async (station: RadioStation) => {
    if (lastPlayStation.current === station.stationuuid) return;
    if (playTimeout.current) clearTimeout(playTimeout.current);
    lastPlayStation.current = station.stationuuid;
    try {
      await playStation(station);
    } catch (error) {
      Alert.alert(t.error, t.playbackError);
    } finally {
      playTimeout.current = setTimeout(() => { lastPlayStation.current = ''; }, 1000);
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

  const handleSearch = (query: string) => setSearchQuery(query);

  const renderStation = ({ item }: { item: RadioStation }) => (
    <RadioStationCard station={item} onPress={handleStationPress} />
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
        <View className="px-4 py-1" style={{ zIndex: 10, backgroundColor: '#f5f5f5', minHeight: 24 }}>
          <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-1" style={{ minHeight: 24 }}>
            <Ionicons name="search" size={16} color="#6B7280" />
            <TextInput
              className="flex-1 ml-1 text-gray-900 dark:text-white"
              placeholder={t.search}
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
              blurOnSubmit={false}
              returnKeyType="search"
              onBlur={e => {
                e.target?.focus?.();
              }}
              style={{ fontSize: 13, minHeight: 20 }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={16} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      {/* Son Dinlenenler - Arama çubuğunun hemen altında */}
      {recentlyPlayed && recentlyPlayed.length > 0 && (
        <View className="px-4 py-3 flex-row items-center" style={{ backgroundColor: '#e5e7eb', borderRadius: 16, marginHorizontal: 8, marginTop: 2, marginBottom: 4, height: 100 }}>
          <Text className="text-gray-700 font-semibold" style={{ fontSize: 14, marginRight: 16, minWidth: 100 }}>Son Dinlenenler</Text>
          <FlatList
            data={recentlyPlayed.slice(0, 10)}
            horizontal={true}
            keyExtractor={item => item.stationuuid}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: 'row', alignItems: 'flex-start', paddingTop: 0 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ alignItems: 'flex-start', marginRight: 12, justifyContent: 'flex-start' }}
                onPress={() => handleStationPress(item)}
                activeOpacity={0.8}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2 }}>
                  {item.favicon ? (
                    <Image source={{ uri: item.favicon }} style={{ width: 34, height: 34, borderRadius: 17 }} />
                  ) : (
                    <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="radio" size={18} color="#9ca3af" />
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 11, color: '#374151', textAlign: 'center', maxWidth: 48, marginTop: 2 }} numberOfLines={2}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
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
          loading && filteredStations.length === 0
            ? { flex: 1, justifyContent: 'center' }
            : undefined
        }
        refreshControl={
          onRefresh
            ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            : undefined
        }
      />
    </View>
  );
};
