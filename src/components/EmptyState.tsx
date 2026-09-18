import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

interface Props {
  icon: string;
  title: string;
  subtitle: string;
}

export const EmptyState: React.FC<Props> = ({ icon, title, subtitle }) => {
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeInUp.springify()} style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight + '20' }]}>
        <Ionicons name={icon as any} size={48} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  iconCircle: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
});