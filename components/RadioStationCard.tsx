import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { RadioStation } from '../types/radio';
import { useAudio } from '../contexts/AudioContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

interface RadioStationCardProps {
  station: RadioStation;
  onPress: (station: RadioStation) => void;
  small?: boolean;
}

// Logo eşleştirme nesnesi
const stationLogos: { [key: string]: any } = {
  'trt-antalya': require('../assets/station-logos/trt-antalya.png'),
  'trt-arabi': require('../assets/station-logos/trt-arabi.png'),
  'trt-cukurova': require('../assets/station-logos/trt-cukurova.png'),
  'trt-erzurum': require('../assets/station-logos/trt-erzurum.png'),
  'trt-fm': require('../assets/station-logos/trt-fm.png'),
  'trt-gap': require('../assets/station-logos/trt-gap.png'),
  'trt-memleketim': require('../assets/station-logos/trt-memleketim.png'),
  'trt-nagme': require('../assets/station-logos/trt-nagme.png'),
  'trt-radyo-1': require('../assets/station-logos/trt-radyo-1.png'),
  'trt-radyo-3': require('../assets/station-logos/trt-radyo-3.png'),
  'trt-radyo-haber': require('../assets/station-logos/trt-radyo-haber.png'),
  'trt-radyo-kurdi': require('../assets/station-logos/trt-radyo-kurdi.png'),
  'trt-trabzon': require('../assets/station-logos/trt-trabzon.png'),
  'trt-tsr': require('../assets/station-logos/trt-tsr.png'),
  'trt-turku': require('../assets/station-logos/trt-turku.png'),
  'trt-vot-east': require('../assets/station-logos/trt-vot-east.png'),
  'trt-vot-west': require('../assets/station-logos/trt-vot-west.png'),
  'trt-vot-world': require('../assets/station-logos/trt-vot-world.png'),
  'trt-vot': require('../assets/station-logos/trt-vot.png'),
  'trt-world': require('../assets/station-logos/trt-world.png'),
};

function getLogoForStation(name: string): any {
  if (!name) return null;
  const key = name
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/ı/g, 'i')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z0-9\-]/g, '');
  return stationLogos[key] || null;
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

  const localLogo = (!station.favicon && station.name) ? getLogoForStation(station.name) : null;

  return (
    <TouchableOpacity 
      className={`rounded-xl ${small ? 'p-1 mb-1' : 'p-2 mb-2'} shadow-sm border ${
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
      style={{ minHeight: small ? 48 : 64, height: small ? 56 : 72 }}
    >
      <View className="flex-row items-center">
        {/* Station Logo */}
        <View style={{
          width: small ? 40 : 64,
          height: small ? 40 : 64,
          marginRight: small ? 8 : 12,
          borderRadius: (small ? 40 : 64) / 2,
          overflow: 'hidden',
          backgroundColor: '#f5f5f5', // daha açık gri
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 0,
        }}>
          {station.favicon ? (
            <Image 
              source={{ uri: station.favicon }} 
              style={{ width: '70%', height: '70%', alignSelf: 'center' }}
              resizeMode="contain"
              defaultSource={require('../assets/images/icon.png')}
            />
          ) : localLogo ? (
            <Image 
              source={localLogo}
              style={{ width: '70%', height: '70%', alignSelf: 'center' }}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="radio" size={small ? 20 : 32} color="#6B7280" />
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
