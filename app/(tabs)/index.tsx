import React, { useState } from 'react';
import { View } from 'react-native';
import { AllStationsScreen } from '../../screens/AllStationsScreen';
import { FavoritesScreen } from '../../screens/FavoritesScreen';
import { SleepTimerScreen } from '../../screens/SleepTimerScreen';
import { SettingsScreen } from '../../screens/SettingsScreen';
import { DrawerMenu } from '../../components/DrawerMenu';
import { MiniPlayer } from '../../components/MiniPlayer';
import { LargePlayer } from '../../components/LargePlayer';

export default function TabOneScreen() {
  const [currentScreen, setCurrentScreen] = useState('allStations');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);

  const handleMenuPress = () => {
    setDrawerVisible(true);
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handlePlayerExpand = () => {
    setPlayerVisible(true);
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'favorites':
        return <FavoritesScreen 
          onMenuPress={handleMenuPress} 
          onGoBack={() => handleNavigate('allStations')}
        />;
      case 'sleepTimer':
        return <SleepTimerScreen onMenuPress={handleMenuPress} />;
      case 'settings':
        return <SettingsScreen onMenuPress={handleMenuPress} />;
      case 'allStations':
      default:
        return <AllStationsScreen 
          onMenuPress={handleMenuPress} 
          onNavigateToFavorites={() => handleNavigate('favorites')}
        />;
    }
  };

  return (
    <View className="flex-1">
      {renderCurrentScreen()}
      
      {/* Mini Player */}
      <MiniPlayer onExpand={handlePlayerExpand} />
      
      {/* Large Player Modal */}
      <LargePlayer 
        visible={playerVisible}
        onClose={() => setPlayerVisible(false)}
      />
      
      {/* Drawer Menu */}
      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onNavigate={handleNavigate}
        currentScreen={currentScreen}
      />
    </View>
  );
}
