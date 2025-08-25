import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { RadioStation } from '../types/radio';
import { useAudio } from '../contexts/AudioContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

interface RadioStationCardProps {
  station: RadioStation;
  onPress: (station: RadioStation) => void;
  small?: boolean;
}

export const RadioStationCard: React.FC<RadioStationCardProps> = ({ station, onPress, small = false }) => {
  const { playbackState, isFavorite, addToFavorites, removeFromFavorites } = useAudio();
  const { t } = useLanguage();
  const lastPressTime = useRef(0);
  const isProcessing = useRef(false);
  
  const isCurrentStation = playbackState.currentStation?.stationuuid === station.stationuuid;
  const isFav = isFavorite(station.stationuuid);

  const handleFavoritePress = async () => {
    if (isFav) {
      await removeFromFavorites(station.stationuuid);
    } else {
      await addToFavorites(station);
    }
  };

  const handleStationPress = useCallback(() => {
    const now = Date.now();
    
    // Debouncing: 300ms içinde tekrar tıklamayı engelle
    if (now - lastPressTime.current < 300) {
      console.log('RadioStationCard: Debounced press ignored', station.name);
      return;
    }
    
    // Eğer işlem devam ediyorsa yeni tıklamayı engelle
    if (isProcessing.current) {
      console.log('RadioStationCard: Processing, ignoring press', station.name);
      return;
    }
    
    lastPressTime.current = now;
    isProcessing.current = true;
    
    console.log('RadioStationCard: Processing press for', station.name);
    
    try {
      onPress(station);
    } finally {
      // 500ms sonra işlemi serbest bırak
      setTimeout(() => {
        isProcessing.current = false;
      }, 500);
    }
  }, [station, onPress]);

  return (
    <TouchableOpacity 
      className={`rounded-xl ${small ? 'p-2 mb-2' : 'p-4 mb-3'} shadow-sm border ${
        isCurrentStation 
          ? 'bg-orange-500 dark:bg-orange-600 border-orange-400 dark:border-orange-500' 
          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
      }`}
      onPress={handleStationPress}
      activeOpacity={0.7}
      disabled={isProcessing.current}
      delayPressIn={0}
      delayPressOut={0}
      delayLongPress={1000}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View className="flex-row items-center">
        {/* Station Logo */}
  <View className={`${small ? 'w-10 h-10 mr-3' : 'w-16 h-16 mr-4'} rounded-full overflow-hidden ${
          isCurrentStation ? 'bg-white bg-opacity-20' : 'bg-gray-200 dark:bg-gray-700'
        }`}>
          {station.favicon ? (
            <Image 
              source={{ uri: station.favicon }} 
              className="w-full h-full"
              defaultSource={require('../assets/images/icon.png')}
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons name="radio" size={24} color={isCurrentStation ? "white" : "#6B7280"} />
            </View>
          )}
        </View>

        {/* Station Info */}
        <View className="flex-1">
          <Text className={`${small ? 'text-sm' : 'text-lg'} font-semibold mb-1 ${
            isCurrentStation ? 'text-white' : 'text-gray-900 dark:text-white'
          }`} numberOfLines={1}>
            {station.name}
          </Text>
          {!small && (
            <>
              <View className="flex-row items-center mb-1">
                <Text className={`text-sm mr-2 ${
                  isCurrentStation ? 'text-orange-100' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {station.bitrate ? `${station.bitrate}kbps` : ''}
                </Text>
                {station.codec && (
                  <Text className={`text-sm ${
                    isCurrentStation ? 'text-orange-100' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {station.codec.toUpperCase()}
                  </Text>
                )}
              </View>
              {station.tags && (
                <Text className={`text-xs ${
                  isCurrentStation ? 'text-orange-200' : 'text-gray-500 dark:text-gray-500'
                }`} numberOfLines={1}>
                  {station.tags}
                </Text>
              )}
            </>
          )}
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          onPress={handleFavoritePress}
          className="p-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={isFav ? "heart" : "heart-outline"} 
            size={20} 
            color={
              isFav 
                ? (isCurrentStation ? "#FCD34D" : "#EF4444")
                : (isCurrentStation ? "white" : "#6B7280")
            } 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
