import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Modal,
  ScrollView 
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useAudio } from '../contexts/AudioContext';
import { Ionicons } from '@expo/vector-icons';

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  currentScreen: string;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({ 
  visible, 
  onClose, 
  onNavigate,
  currentScreen 
}) => {
  const { t, language, setLanguage } = useLanguage();
  const { favorites, sleepTimer } = useAudio();

  const menuItems = [
    {
      id: 'allStations',
      title: t.allStations,
      icon: 'radio',
      screen: 'allStations',
    },
    {
      id: 'favorites',
      title: t.favorites,
      icon: 'heart',
      screen: 'favorites',
      badge: favorites.length > 0 ? favorites.length.toString() : undefined,
    },
    {
      id: 'sleepTimer',
      title: t.sleepTimer,
      icon: 'timer',
      screen: 'sleepTimer',
      badge: sleepTimer.isActive ? '●' : undefined,
    },
    {
      id: 'settings',
      title: t.settings,
      icon: 'settings',
      screen: 'settings',
    },
  ];

  const handleItemPress = (screen: string) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row">
        {/* Drawer Content */}
        <View className="w-80 bg-white dark:bg-gray-800 shadow-xl">
          <SafeAreaView className="flex-1">
            {/* Header */}
            <View className="p-6 bg-orange-500 dark:bg-orange-600">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white text-2xl font-bold">
                    Radyo Tünel
                  </Text>
                  <Text className="text-orange-100 text-sm mt-1">
                    Turkish Radio Stations
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} className="p-2">
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Menu Items */}
            <ScrollView className="flex-1 py-4">
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleItemPress(item.screen)}
                  className={`flex-row items-center px-6 py-4 ${
                    currentScreen === item.screen 
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-r-4 border-orange-500' 
                      : ''
                  }`}
                  activeOpacity={0.7}
                >
                  <View className="w-8 items-center">
                    <Ionicons 
                      name={item.icon as any} 
                      size={22} 
                      color={currentScreen === item.screen ? '#F97316' : '#6B7280'} 
                    />
                  </View>
                  <Text 
                    className={`flex-1 ml-4 text-base ${
                      currentScreen === item.screen 
                        ? 'text-orange-600 dark:text-orange-400 font-semibold' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {item.title}
                  </Text>
                  {item.badge && (
                    <View className="bg-orange-500 rounded-full min-w-[20px] h-5 items-center justify-center px-2">
                      <Text className="text-white text-xs font-bold">
                        {item.badge}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Language Switcher */}
            <View className="border-t border-gray-200 dark:border-gray-700 p-4">
              <Text className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                {t.language}
              </Text>
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => setLanguage('tr')}
                  className={`flex-1 py-2 px-4 rounded-l-lg ${
                    language === 'tr' 
                      ? 'bg-orange-500' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text 
                    className={`text-center text-sm font-semibold ${
                      language === 'tr' 
                        ? 'text-white' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    TR
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setLanguage('en')}
                  className={`flex-1 py-2 px-4 rounded-r-lg ${
                    language === 'en' 
                      ? 'bg-orange-500' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text 
                    className={`text-center text-sm font-semibold ${
                      language === 'en' 
                        ? 'text-white' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    EN
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* App Info */}
            <View className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Text className="text-center text-gray-500 dark:text-gray-400 text-xs">
                {t.version} 1.0.0
              </Text>
            </View>
          </SafeAreaView>
        </View>

        {/* Overlay */}
        <TouchableOpacity 
          className="flex-1 bg-black bg-opacity-30" 
          onPress={onClose}
          activeOpacity={1}
        />
      </View>
    </Modal>
  );
};
