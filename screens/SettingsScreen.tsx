import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Alert,
  Linking
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { StorageService } from '../services/storageService';
import { Ionicons } from '@expo/vector-icons';

interface SettingsScreenProps {
  onMenuPress: () => void;
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onMenuPress, onClose }) => {
  const navigation = useNavigation();
  const { t, language, setLanguage } = useLanguage();
  const [autoPlay, setAutoPlay] = useState(false);

  // Load settings on component mount
  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await StorageService.getSettings();
      setAutoPlay(settings.autoPlay);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleAutoPlayToggle = async (value: boolean) => {
    try {
      setAutoPlay(value);
      const settings = await StorageService.getSettings();
      await StorageService.saveSettings({ ...settings, autoPlay: value });
    } catch (error) {
      console.error('Error saving auto play setting:', error);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all favorites and settings. Are you sure?',
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAll();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              Alert.alert(t.error, 'Failed to clear data.');
            }
          }
        }
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Audio',
      items: [
        {
          id: 'autoplay',
          title: 'Açılışta Otomatik Çal',
          subtitle: 'Uygulama açıldığında otomatik olarak radyo çalmaya başlar',
          type: 'switch',
          value: autoPlay,
          onValueChange: handleAutoPlayToggle,
        },
      ],
    },
    {
      title: 'Localization',
      items: [
        {
          id: 'language',
          title: t.language,
          type: 'language',
          value: language,
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          id: 'clear',
          title: 'Clear All Data',
          subtitle: 'Remove favorites and settings',
          type: 'button',
          onPress: handleClearData,
          destructive: true,
        },
      ],
    },
    {
      title: t.about,
      items: [
        {
          id: 'version',
          title: t.version,
          value: '1.0.0',
          type: 'text',
        },
        {
          id: 'data-source',
          title: 'Data Source',
          value: 'Radio Browser API',
          subtitle: 'Community-driven radio station database',
          type: 'link',
          onPress: () => Linking.openURL('https://www.radio-browser.info'),
        },
        {
          id: 'github',
          title: 'Source Code',
          subtitle: 'View on GitHub',
          type: 'link',
          onPress: () => Linking.openURL('https://github.com'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => {
    switch (item.type) {
  // Removed slider case

      case 'switch':
        return (
          <TouchableOpacity
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3"
            onPress={() => item.onValueChange(!item.value)}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-gray-900 dark:text-white font-semibold">
                  {item.title}
                </Text>
                {item.subtitle && (
                  <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {item.subtitle}
                  </Text>
                )}
              </View>
              <Switch
                value={item.value}
                onValueChange={item.onValueChange}
                trackColor={{ false: '#D1D5DB', true: '#F97316' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </TouchableOpacity>
        );

      case 'language':
        return (
          <View key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3">
            <Text className="text-gray-900 dark:text-white font-semibold mb-3">
              {item.title}
            </Text>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setLanguage('tr')}
                className={`flex-1 py-3 px-4 rounded-l-lg ${
                  language === 'tr' 
                    ? 'bg-orange-500' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <Text 
                  className={`text-center font-semibold ${
                    language === 'tr' 
                      ? 'text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t.turkish}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLanguage('en')}
                className={`flex-1 py-3 px-4 rounded-r-lg ${
                  language === 'en' 
                    ? 'bg-orange-500' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <Text 
                  className={`text-center font-semibold ${
                    language === 'en' 
                      ? 'text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t.english}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'button':
        return (
          <TouchableOpacity
            key={item.id}
            onPress={item.onPress}
            className={`rounded-xl p-4 mb-3 ${
              item.destructive 
                ? 'bg-red-50 dark:bg-red-900/20' 
                : 'bg-white dark:bg-gray-800'
            }`}
          >
            <Text 
              className={`font-semibold ${
                item.destructive 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {item.title}
            </Text>
            {item.subtitle && (
              <Text 
                className={`text-sm mt-1 ${
                  item.destructive 
                    ? 'text-red-500' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {item.subtitle}
              </Text>
            )}
          </TouchableOpacity>
        );

      case 'link':
        return (
          <TouchableOpacity
            key={item.id}
            onPress={item.onPress}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-gray-900 dark:text-white font-semibold">
                  {item.title}
                </Text>
                {item.subtitle && (
                  <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {item.subtitle}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </View>
          </TouchableOpacity>
        );

      case 'text':
        return (
          <View key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-900 dark:text-white font-semibold">
                {item.title}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400">
                {item.value}
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <View style={{ marginTop: 40, marginBottom: -24 }}>
          <TouchableOpacity
            onPress={onClose}
            className="p-3 bg-white rounded-full shadow-md"
            style={{ elevation: 4 }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#F97316" />
          </TouchableOpacity>
        </View>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          {t.settings}
        </Text>
        <View className="w-10" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 p-4">
        {settingsSections.map((section, index) => (
          <View key={index} className="mb-6">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3 px-2">
              {section.title}
            </Text>
            {section.items.map(renderSettingItem)}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
