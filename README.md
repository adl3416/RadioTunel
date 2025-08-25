# Turkish Radio App

A modern, fully-featured Turkish radio application built with React Native, Expo, TypeScript, and NativeWind (Tailwind CSS).

## Features

### 🎵 Core Functionality
- **Live Radio Streaming**: Stream Turkish radio stations with high-quality audio
- **Radio Browser API**: Access to 1000+ Turkish radio stations via Radio Browser API
- **Background Playback**: Continue listening when the app is minimized
- **Smart Search**: Search stations by name, tags, or country

### 🎨 Modern UI/UX
- **Mini Player**: Persistent footer player with station info and controls
- **Large Player**: Expandable full-screen player with beautiful gradient design
- **Smooth Animations**: Fluid transitions between mini and large player
- **Dark/Light Theme**: Automatic theme switching
- **Responsive Design**: Optimized for different screen sizes

### 📱 Navigation & Layout
- **Drawer Menu**: Side navigation with easy access to all features
- **Multi-Screen App**: All Stations, Favorites, Sleep Timer, and Settings
- **Clean Interface**: Modern design inspired by contemporary radio apps

### ⭐ User Features
- **Favorites System**: Save and organize your favorite radio stations
- **Sleep Timer**: Set countdown timer to automatically stop playback (5, 10, 15, 30, 45, 60, 90, 120 minutes)
- **Volume Control**: Intuitive slider for audio level adjustment
- **Multi-language Support**: Turkish and English interface

### 🔧 Technical Features
- **TypeScript**: Fully typed for better development experience
- **Context API**: Global state management for audio and settings
- **Async Storage**: Persistent storage for favorites and settings
- **Error Handling**: Robust error management and user feedback
- **Performance Optimized**: Efficient rendering and memory management

## Technology Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **NativeWind** (Tailwind CSS for React Native)
- **Expo AV** for audio playback
- **Radio Browser API** for station data
- **AsyncStorage** for local data persistence
- **React Context** for state management

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd radioyeni
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/emulator**
   ```bash
   # For Android
   npm run android
   
   # For iOS
   npm run ios
   ```

## Project Structure

```
radioyeni/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation
│   └── _layout.tsx        # Root layout with providers
├── components/            # Reusable UI components
│   ├── RadioStationCard.tsx
│   ├── MiniPlayer.tsx
│   ├── LargePlayer.tsx
│   ├── DrawerMenu.tsx
│   ├── RadioList.tsx
│   └── SleepTimerModal.tsx
├── contexts/              # React Context providers
│   ├── AudioContext.tsx   # Audio playback state
│   └── LanguageContext.tsx # i18n state
├── screens/               # Main application screens
│   ├── AllStationsScreen.tsx
│   ├── FavoritesScreen.tsx
│   ├── SleepTimerScreen.tsx
│   └── SettingsScreen.tsx
├── services/              # API and data services
│   ├── radioBrowserService.ts
│   └── storageService.ts
├── types/                 # TypeScript type definitions
│   └── radio.ts
├── i18n/                  # Internationalization
│   └── translations.ts
└── assets/                # Images, fonts, and other assets
```

## API Integration

The app uses the **Radio Browser API** (https://www.radio-browser.info/) to fetch Turkish radio stations:

- **Base URL**: `https://de1.api.radio-browser.info`
- **Features**: Search by country, language, name, and popularity
- **Data**: Station metadata, streaming URLs, and logos
- **Quality Filtering**: Automatic filtering for high-quality streams (64kbps+)

## Key Features Explained

### Audio Playback
- **Expo AV**: Handles audio streaming and background playback
- **Stream Quality**: Filters stations by bitrate and codec
- **Error Handling**: Graceful handling of network and playback errors

### State Management
- **AudioContext**: Manages playback state, favorites, and sleep timer
- **LanguageContext**: Handles language switching and translations
- **AsyncStorage**: Persists user preferences and favorites

### UI Components
- **RadioStationCard**: Displays station info with play/favorite controls
- **MiniPlayer**: Compact player in app footer
- **LargePlayer**: Full-screen player with all controls
- **DrawerMenu**: Side navigation with language switcher

### Sleep Timer
- **Multiple Options**: Preset times from 5 minutes to 2 hours
- **Visual Feedback**: Real-time countdown display
- **Auto-stop**: Gracefully stops playback when timer expires

## Customization

### Adding New Languages
1. Add translations to `i18n/translations.ts`
2. Update language type in `contexts/LanguageContext.tsx`
3. Add language option to `components/DrawerMenu.tsx`

### Styling
- **NativeWind**: Use Tailwind CSS classes for styling
- **Colors**: Modify theme colors in `tailwind.config.js`
- **Responsive**: Use Tailwind responsive prefixes

### Adding Features
- **New Screens**: Add to `screens/` directory
- **Navigation**: Update drawer menu and screen routing
- **State**: Extend contexts for new global state

## Performance Considerations

- **FlatList Optimization**: Efficient rendering of large station lists
- **Image Caching**: Automatic caching of station logos
- **Memory Management**: Proper cleanup of audio resources
- **Background Playback**: Optimized for battery life

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Credits

- **Radio Data**: Radio Browser API (https://www.radio-browser.info/)
- **Icons**: Expo Vector Icons
- **Design**: Inspired by modern radio applications
- **Community**: React Native and Expo communities

---

Built with ❤️ for Turkish radio lovers worldwide 🇹🇷
