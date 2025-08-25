import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView 
} from 'react-native';
import { useAudio } from '../contexts/AudioContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

interface SleepTimerModalProps {
  visible: boolean;
  onClose: () => void;
}

const TIMER_OPTIONS = [5, 10, 15, 30, 45, 60, 90, 120];

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ visible, onClose }) => {
  const { sleepTimer, setSleepTimer, cancelSleepTimer } = useAudio();
  const { t } = useLanguage();

  const handleSetTimer = (minutes: number) => {
    setSleepTimer(minutes);
    onClose();
  };

  const handleCancelTimer = () => {
    cancelSleepTimer();
    onClose();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-end">
        <View className="bg-white dark:bg-gray-800 rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              {t.sleepTimer}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Current Timer Status */}
          {sleepTimer.isActive && (
            <View className="p-6 bg-orange-50 dark:bg-orange-900/20 border-b border-gray-200 dark:border-gray-700">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-orange-700 dark:text-orange-300 font-semibold">
                    {t.sleepTimerActive}
                  </Text>
                  <Text className="text-orange-600 dark:text-orange-400 text-sm">
                    {t.sleepTimerRemaining}: {formatTime(sleepTimer.remainingTime)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleCancelTimer}
                  className="bg-orange-500 px-4 py-2 rounded-full"
                >
                  <Text className="text-white font-semibold">{t.sleepTimerCancel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Timer Options */}
          <ScrollView className="max-h-96">
            <View className="p-6">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.setSleepTimer}
              </Text>
              
              <View className="flex-row flex-wrap">
                {TIMER_OPTIONS.map((minutes) => (
                  <TouchableOpacity
                    key={minutes}
                    onPress={() => handleSetTimer(minutes)}
                    className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 m-2 min-w-[80px] items-center"
                    activeOpacity={0.7}
                  >
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {minutes}
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      {t.minutes}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Time Input */}
              <View className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <Text className="text-gray-700 dark:text-gray-300 text-center text-sm">
                  Select a time above to set the sleep timer
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
