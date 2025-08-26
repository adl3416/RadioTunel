import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';

const letters = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('');

export const AlphabeticFilter = ({ onSelect, selected }: { onSelect: (letter: string | null) => void, selected: string | null }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxWidth: 320 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {letters.map(letter => (
          <TouchableOpacity
            key={letter}
            onPress={() => onSelect(letter)}
            style={{
              backgroundColor: selected === letter ? '#fff' : 'rgba(255,255,255,0.2)',
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginHorizontal: 2,
              borderWidth: selected === letter ? 1 : 0,
              borderColor: '#F97316',
            }}
          >
            <Text style={{ color: selected === letter ? '#F97316' : '#fff', fontWeight: 'bold', fontSize: 14 }}>{letter}</Text>
          </TouchableOpacity>
        ))}
        {selected && (
          <TouchableOpacity onPress={() => onSelect(null)} style={{ marginLeft: 8 }}>
            <Text style={{ color: '#fff', fontSize: 13 }}>Temizle</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};