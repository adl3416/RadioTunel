import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { RadioList } from '../components/RadioList';
import { useAudio } from '../contexts/AudioContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

interface FavoritesScreenProps {
  onMenuPress: () => void;
  onGoBack: () => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ onMenuPress, onGoBack }) => {
  const { favorites, loadFavorites } = useAudio();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-orange-50 dark:bg-orange-900">
      {/* Header - Ekranın 1/4'ü kadar yükseklik */}
  <View style={{ height: '16%', backgroundColor: '#F97316', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <View className="flex-1 justify-center items-center px-4 pt-2">
          {/* Geri butonu sol üstte */}
          <View className="absolute top-8 left-4 z-10">
            <TouchableOpacity onPress={onGoBack} className="p-3 bg-white bg-opacity-30 rounded-full">
              <Ionicons name="arrow-back" size={24} color="#F97316" />
            </TouchableOpacity>
          </View>

          {/* Favoriler başlığı */}
          <Text className="text-3xl font-bold text-white text-center mb-4" style={{ marginTop: 16 }}>
            Favori Radyolar
          </Text>

          {/* Favori sayısı */}
          <View className="bg-white bg-opacity-30 rounded-full px-4 py-2">
            <Text className="text-orange-600 text-sm font-medium">
              {favorites.length} favori radyo
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <RadioList
        stations={favorites}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        searchEnabled={true}
        emptyMessage={t.noFavorites}
      />
    </SafeAreaView>
  );
};
