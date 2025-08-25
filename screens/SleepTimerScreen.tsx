import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Alert 
} from 'react-native';
import { useAudio } from '../contexts/AudioContext';
import { useLanguage } from '../contexts/LanguageContext';
import { SleepTimerModal } from '../components/SleepTimerModal';
import { Ionicons } from '@expo/vector-icons';

interface SleepTimerScreenProps {
  onMenuPress: () => void;
}

export const SleepTimerScreen: React.FC<SleepTimerScreenProps> = ({ onMenuPress }) => {
  const { sleepTimer, setSleepTimer, cancelSleepTimer } = useAudio();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCancelTimer = () => {
    Alert.alert(
      t.sleepTimerCancel,
      'Are you sure you want to cancel the sleep timer?',
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.ok, onPress: cancelSleepTimer },
      ]
    );
  };

  const quickTimerOptions = [
    { label: '5 min', value: 5 },
    { label: '10 min', value: 10 },
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={onMenuPress} className="p-2">
          <Ionicons name="menu" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          {t.sleepTimer}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Current Timer Status */}
        {sleepTimer.isActive ? (
          <View className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-6 mb-6">
            <View className="items-center">
              <Ionicons name="timer" size={48} color="white" className="mb-4" />
              <Text className="text-white text-2xl font-bold mb-2">
                {t.sleepTimerActive}
              </Text>
              <Text className="text-white text-4xl font-mono font-bold mb-4">
                {formatTime(sleepTimer.remainingTime)}
              </Text>
              <Text className="text-orange-100 text-center mb-6">
                The radio will stop playing when the timer reaches zero
              </Text>
              <TouchableOpacity
                onPress={handleCancelTimer}
                className="bg-white bg-opacity-20 px-6 py-3 rounded-full"
              >
                <Text className="text-white font-semibold">{t.sleepTimerCancel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6">
            <View className="items-center">
              <Ionicons name="timer-outline" size={48} color="#6B7280" className="mb-4" />
              <Text className="text-gray-900 dark:text-white text-xl font-bold mb-2">
                {t.setSleepTimer}
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-center">
                Set a timer to automatically stop radio playback
              </Text>
            </View>
          </View>
        )}

        {/* Quick Timer Options */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Timer
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {quickTimerOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSleepTimer(option.value)}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm border border-gray-100 dark:border-gray-700"
                style={{ width: '48%' }}
                disabled={sleepTimer.isActive}
              >
                <View className="items-center">
                  <Text className="text-2xl font-bold text-orange-500 mb-1">
                    {option.value}
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-400 text-sm">
                    {t.minutes}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Timer Button */}
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="bg-orange-500 rounded-xl p-4 mb-6"
          disabled={sleepTimer.isActive}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="time" size={20} color="white" className="mr-2" />
            <Text className="text-white font-semibold text-lg">
              Custom Timer
            </Text>
          </View>
        </TouchableOpacity>

        {/* How it works */}
        <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
          <Text className="text-gray-900 dark:text-white font-semibold mb-2">
            How Sleep Timer Works
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-sm leading-5">
            • Select a time duration from the options above{'\n'}
            • The radio will continue playing until the timer expires{'\n'}
            • When the timer reaches zero, playback will stop automatically{'\n'}
            • You can cancel the timer at any time
          </Text>
        </View>
      </ScrollView>

      <SleepTimerModal 
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </SafeAreaView>
  );
};
