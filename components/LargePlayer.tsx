import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Modal, 
  Alert,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useAudio } from '../contexts/AudioContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Share } from 'react-native';
import { SleepTimerModal } from './SleepTimerModal';

interface LargePlayerProps {
  visible: boolean;
  onClose: () => void;
}

export const LargePlayer: React.FC<LargePlayerProps> = ({ visible, onClose }) => {
  const { 
    playbackState, 
    sleepTimer,
    pausePlayback, 
    playStation, 
    setVolume, 
    stopPlayback,
    isFavorite,
    addToFavorites,
    removeFromFavorites
  } = useAudio();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [localVolume, setLocalVolume] = useState<number>(playbackState.volume ?? 0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const lastVolumeRef = useRef<number>(playbackState.volume ?? 0.8);
  const isLocked = useRef(false);

  // keep a small local volume state to ensure slider and instant buttons feel snappy
  useEffect(() => {
    if (typeof playbackState.volume === 'number') {
      setLocalVolume(playbackState.volume);
      // track last non-zero volume
      if (playbackState.volume > 0) {
        lastVolumeRef.current = playbackState.volume;
        setIsMuted(false);
      } else {
        setIsMuted(true);
      }
    }
  }, [playbackState.volume]);

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
      setTimeout(() => { isLocked.current = false; }, 600);
    }
  };

  const handleStop = async () => {
    Alert.alert(
      t.stop,
      'Are you sure you want to stop playback?',
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.stop, onPress: stopPlayback },
      ]
    );
  };

  const handleFavoritePress = async () => {
    const station = playbackState.currentStation;
    if (station && isFavorite(station.stationuuid)) {
      await removeFromFavorites(station.stationuuid);
    } else if (station) {
      await addToFavorites(station);
    }
  };

  // store last non-zero volume so we can restore after unmute
  const handleToggleMute = async () => {
    try {
      if (isMuted) {
        const restore = lastVolumeRef.current > 0 ? lastVolumeRef.current : 0.8;
        setIsMuted(false);
        setLocalVolume(restore);
        await setVolume(restore);
      } else {
        // mute
        lastVolumeRef.current = localVolume > 0 ? localVolume : lastVolumeRef.current || 0.8;
        setIsMuted(true);
        setLocalVolume(0);
        await setVolume(0);
      }
    } catch (err) {
      console.error('Mute toggle error', err);
    }
  };

  const handleShare = async () => {
    if (!playbackState.currentStation) return;
    const station = playbackState.currentStation;
    const message = `${station.name} radyosunu dinliyorum! 📻\n\nLink: ${station.url_resolved || ''}\n\nRadyo Tüneli`;
    try {
      await Share.share({ message });
    } catch (error) {
      console.error('Share error', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // responsive sizes
  const imageSize = Math.min(Math.max(windowWidth * 0.62, 160), 320);
  const playSize = Math.min(Math.max(windowWidth * 0.28, 96), 180);
  const sideBtnSize = Math.round(playSize * 0.66);
  const titleFontSize = Math.min(Math.max(windowWidth * 0.07, 18), 32);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Main Player Content - Modern Beyaz Tasarım */}
      <View className="flex-1 bg-white">
        {/* Top Header - Minimal Gri */}
        <View className="bg-gray-200 px-4 pt-12 pb-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity 
              onPress={onClose} 
              className="w-10 h-10 items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-down" size={28} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity 
              className="w-10 h-10 items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

  {/* Content wrapper - scrollable so very small screens can still access controls */}
  <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 28 + (insets.bottom || 0) }}>
        {playbackState.currentStation ? (
          <>
            {/* Radio Station Info - Header altında */}
            <View className="items-center px-6 py-4">
              <View className="flex-row items-center justify-center mb-2">
                <Text style={{ fontSize: titleFontSize, lineHeight: titleFontSize + 6 }} className="text-gray-900 font-bold text-center" numberOfLines={2}>
                  {playbackState.currentStation.name}
                </Text>
                {/* Favorite heart next to title */}
                {playbackState.currentStation && (
                  <TouchableOpacity
                    onPress={handleFavoritePress}
                    className="ml-3"
                    style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isFavorite(playbackState.currentStation.stationuuid) ? 'heart' : 'heart-outline'}
                      size={24}
                      color={isFavorite(playbackState.currentStation.stationuuid) ? '#F97316' : '#374151'}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <Text className="text-gray-600 text-base text-center" numberOfLines={1}>
                Liste: Tüm Radyolar
              </Text>
              <Text className="text-gray-700 text-sm text-center mt-2 font-medium">
                {playbackState.isPlaying ? 'Şu an çalıyor' : playbackState.isLoading ? 'Bağlanıyor...' : 'Hazır'}
              </Text>
            </View>

            {/* Station Image - Large Circular (responsive) */}
            <View className="items-center px-6 py-6">
              <View style={{ width: imageSize, height: imageSize, borderRadius: imageSize / 2, overflow: 'hidden', backgroundColor: '#ffffff', elevation: 8 }}>
                {playbackState.currentStation.favicon ? (
                  <Image 
                    source={{ uri: playbackState.currentStation.favicon }} 
                    style={{ width: imageSize, height: imageSize }}
                    defaultSource={require('../assets/images/icon.png')}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ width: imageSize, height: imageSize, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
                    <View style={{ flex: 1, width: imageSize, height: imageSize, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
                      <View style={{ position: 'absolute', inset: 0, width: imageSize, height: imageSize, borderRadius: imageSize / 2, overflow: 'hidden', backgroundColor: undefined }}>
                        <View style={{ flex: 1, backgroundColor: undefined }} />
                      </View>
                      <Ionicons name="radio" size={Math.min(80, Math.floor(imageSize * 0.35))} color="#ffffff" />
                      {/* background gradient fallback using simple color */}
                    </View>
                  </View>
                )}

                {/* Loading overlay */}
                {playbackState.isLoading && (
                  <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.28)', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 48, height: 48, borderWidth: 4, borderColor: '#fff', borderTopColor: 'transparent', borderRadius: 24 }} />
                  </View>
                )}
              </View>
            </View>

            {/* Station Details */}
            <View className="px-8 pb-6">
              <Text className="text-gray-700 text-sm text-center mb-4 font-medium">
                {playbackState.isPlaying ? 'Çalıyor' : playbackState.isLoading ? 'Yükleniyor...' : 'Durduruldu'}
              </Text>
              
              {/* Bitrate and Codec Info */}
              <View className="flex-row items-center justify-center space-x-6">
                {playbackState.currentStation.bitrate && (
                  <View className="bg-gray-200 rounded-full px-3 py-1">
                    <Text className="text-gray-800 text-xs font-medium">
                      {playbackState.currentStation.bitrate}kbps
                    </Text>
                  </View>
                )}
                {playbackState.currentStation.codec && (
                  <View className="bg-gray-200 rounded-full px-3 py-1">
                    <Text className="text-gray-800 text-xs font-medium">
                      {playbackState.currentStation.codec.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Media Controls - Modern Style */}
            <View className="px-4 pb-6">
              {/* Main Play Controls - responsive sizes */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Math.min(48, Math.round(windowHeight * 0.06)) }}>
                {/* Previous/Geri */}
                <TouchableOpacity 
                  onPress={() => {
                    // Önceki radyo istasyonuna geçiş
                    console.log('Previous station');
                  }}
                  activeOpacity={0.6}
                  style={{ width: sideBtnSize, height: sideBtnSize, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: sideBtnSize / 2, marginRight: Math.max(16, Math.round(windowWidth * 0.08)) }}
                >
                  <Ionicons name="play-skip-back" size={Math.round(sideBtnSize * 0.6)} color="#374151" />
                </TouchableOpacity>

                {/* Play/Pause Button - responsive */}
                <TouchableOpacity
                  onPress={handlePlayPause}
                  disabled={playbackState.isLoading}
                  activeOpacity={0.8}
                  style={{
                    width: playSize,
                    height: playSize,
                    borderRadius: playSize / 2,
                    backgroundColor: '#111827',
                    alignItems: 'center',
                    justifyContent: 'center',
                    elevation: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                  }}
                >
                  {playbackState.isLoading ? (
                    <View style={{ width: Math.max(36, Math.round(playSize * 0.28)), height: Math.max(36, Math.round(playSize * 0.28)), borderWidth: 4, borderColor: '#fff', borderTopColor: 'transparent', borderRadius: 999 }} />
                  ) : (
                    <Ionicons 
                      name={playbackState.isPlaying ? "pause" : "play"} 
                      size={Math.round(playSize * 0.34)} 
                      color="white"
                      style={{ marginLeft: playbackState.isPlaying ? 0 : 4 }}
                    />
                  )}
                </TouchableOpacity>

                {/* Next/İleri */}
                <TouchableOpacity 
                  onPress={() => {
                    // Sonraki radyo istasyonuna geçiş
                    console.log('Next station');
                  }}
                  activeOpacity={0.6}
                  style={{ width: sideBtnSize, height: sideBtnSize, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: sideBtnSize / 2, marginLeft: Math.max(16, Math.round(windowWidth * 0.08)) }}
                >
                  <Ionicons name="play-skip-forward" size={Math.round(sideBtnSize * 0.6)} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Volume control removed: use instant +/- buttons in bottom bar */}
              <View className="h-2" />

              {/* Secondary controls moved to bottom bar for persistent access */}
              {/* ...existing code... */}
            </View>
          </>
        ) : (
          <View className="flex-1 items-center justify-center">
            <View className="items-center px-6 py-6 mb-8">
              <Text className="text-gray-500 text-2xl font-medium text-center mb-2">
                Radyo Seçiniz
              </Text>
              <Text className="text-gray-400 text-base text-center">
                Bir radyo istasyonu seçin
              </Text>
            </View>
            <View className="w-80 h-80 rounded-full bg-gray-200 items-center justify-center">
              <Ionicons name="radio" size={80} color="#9CA3AF" />
            </View>
          </View>
        )}
        </ScrollView>
      </View>

      {/* Bottom Icon Bar - fixed controls (shifted above safe area) */}
      <View className="absolute left-0 right-0 px-6" style={{ bottom: (insets.bottom || 0) + 12 }}>
        <View className="bg-white rounded-2xl shadow-lg px-4 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity 
              onPress={handleStop}
              className="w-12 h-12 items-center justify-center bg-gray-100 rounded-full"
              activeOpacity={0.6}
            >
              <Ionicons name="stop" size={20} color="#374151" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setShowSleepTimer(true)}
              className="w-12 h-12 items-center justify-center bg-gray-100 rounded-full"
              activeOpacity={0.6}
            >
              <Ionicons name="moon" size={20} color={sleepTimer.isActive ? '#F97316' : '#374151'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleFavoritePress}
              className="w-12 h-12 items-center justify-center bg-gray-100 rounded-full"
              activeOpacity={0.6}
            >
              <Ionicons
                name={playbackState.currentStation && isFavorite(playbackState.currentStation.stationuuid) ? 'heart' : 'heart-outline'}
                size={20}
                color={playbackState.currentStation && isFavorite(playbackState.currentStation.stationuuid) ? '#F97316' : '#374151'}
              />
            </TouchableOpacity>
          </View>

          {/* Volume quick +/- and share on right side */}
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity
              onPress={handleToggleMute}
              className="w-10 h-10 items-center justify-center bg-gray-100 rounded-full"
              activeOpacity={0.6}
            >
              <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={18} color="#374151" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleShare}
              className="w-10 h-10 items-center justify-center bg-gray-100 rounded-full"
              activeOpacity={0.6}
            >
              <Ionicons name="share" size={18} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <SleepTimerModal 
        visible={showSleepTimer}
        onClose={() => setShowSleepTimer(false)}
      />
    </Modal>
  );
};
