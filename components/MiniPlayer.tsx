import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, // Geri eklendi
  Animated,
  PanResponder,
  Dimensions,
  Pressable,
  Image
} from 'react-native';
import { useAudio } from '../contexts/AudioContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

interface MiniPlayerProps {
  onExpand: () => void;
}

const { height: screenHeight } = Dimensions.get('window');

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand }) => {
  const { playbackState, pausePlayback, playStation } = useAudio();
  const { t } = useLanguage();
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const isLocked = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          translateY.setValue(gestureState.dy);
          opacity.setValue(Math.max(0.5, 1 + gestureState.dy / 100));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50) {
          onExpand();
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            })
          ]).start();
        } else {
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.spring(opacity, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            })
          ]).start();
        }
      },
    })
  ).current;

  if (!playbackState.currentStation) {
    return null;
  }

  const handlePlayPause = async () => {
    if (isLocked.current || playbackState.isLoading) return;
    isLocked.current = true;
    try {
      if (playbackState.isPlaying) {
        await pausePlayback();
      } else if (playbackState.currentStation) {
        await playStation(playbackState.currentStation);
      }
    } finally {
      setTimeout(() => { isLocked.current = false; }, 600); // 600ms lock
    }
  };

  const handleExpand = () => {
    if (playbackState.currentStation) {
      onExpand();
    }
  };

  return (
    <Animated.View 
      className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 shadow-lg"
      style={{
        transform: [{ translateY }],
        opacity,
        height: 120,
        minHeight: 120,
      }}
      {...panResponder.panHandlers}
    >
      <View className="flex-row h-full">
        {/* Sol taraf - Radyo İkonu (1/4 alan) */}
        <TouchableOpacity
          onPress={handleExpand}
          className="w-1/4 bg-orange-500 items-center justify-center"
          activeOpacity={0.8}
        >
          {playbackState.currentStation.favicon ? (
            <View style={{ width: 48, height: 48, borderRadius: 24, overflow: 'hidden', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
              <Image 
                source={{ uri: playbackState.currentStation.favicon }} 
                style={{ width: 44, height: 44, borderRadius: 22 }}
                defaultSource={require('../assets/images/icon.png')}
              />
            </View>
          ) : (
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="radio" size={24} color="white" />
            </View>
          )}
        </TouchableOpacity>

        {/* Sağ taraf - Gri Alan (3/4 alan) */}
        <View className="flex-1 bg-gray-100 dark:bg-gray-800 flex-row items-center px-4">
          {/* Station Info */}
            <TouchableOpacity 
              onPress={handleExpand}
              className="flex-1 mr-2"
              activeOpacity={0.8}
            >
              <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-1" numberOfLines={1}>
                {playbackState.currentStation.name}
              </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400" numberOfLines={1}>
              {playbackState.isLoading ? t.connecting : (playbackState.isPlaying ? 'Çalıyor' : 'Duraklatıldı')}
            </Text>
          </TouchableOpacity>

          {/* Play/Pause Button */}
          <TouchableOpacity
            onPress={handlePlayPause}
            disabled={playbackState.isLoading}
            activeOpacity={0.7}
            className={`w-16 h-16 items-center justify-center rounded-full ${
              playbackState.isLoading ? 'bg-gray-300' : 'bg-orange-500'
            }`}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              elevation: 4,
              shadowColor: '#F97316',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          >
            {playbackState.isLoading ? (
              <View className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Ionicons 
                name={playbackState.isPlaying ? 'pause' : 'play'}
                size={28}
                color="white"
                style={{ marginLeft: playbackState.isPlaying ? 0 : 2 }}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};
