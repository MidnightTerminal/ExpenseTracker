import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { Category } from '../types';

interface Props {
  categories: Category[];
  selected: string | null;
  onSelect: (category: Category) => void;
}

export const CategoryPicker: React.FC<Props> = ({ categories, selected, onSelect }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {categories.map((cat, index) => (
          <Animated.View key={cat.id} entering={FadeInDown.delay(index * 30).springify()}>
            <Pressable
              style={[
                styles.item,
                {
                  backgroundColor: selected === cat.id ? cat.color + '20' : colors.surfaceVariant,
                  borderColor: selected === cat.id ? cat.color : 'transparent',
                  borderWidth: 2,
                },
              ]}
              onPress={() => onSelect(cat)}
            >
              <View style={[styles.iconCircle, { backgroundColor: cat.color + '30' }]}>
                <Ionicons name={cat.icon as any} size={22} color={cat.color} />
              </View>
              <Text
                style={[styles.name, { color: selected === cat.id ? cat.color : colors.text }]}
                numberOfLines={1}
              >
                {cat.name}
              </Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  item: {
    width: 100,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
});