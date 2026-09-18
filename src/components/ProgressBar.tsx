import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

interface Props {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
  showPercentage?: boolean;
  label?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<Props> = ({
  progress,
  color,
  height = 10,
  showPercentage = false,
  label,
  animated = true,
}) => {
  const { colors } = useTheme();
  const width = useSharedValue(0);
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  const barColor = color || (clampedProgress > 0.9 ? colors.error : clampedProgress > 0.7 ? colors.warning : colors.success);

  useEffect(() => {
    if (animated) {
      width.value = withTiming(clampedProgress, {
        duration: 1200,
        easing: Easing.bezierFn(0.25, 0.1, 0.25, 1),
      });
    } else {
      width.value = clampedProgress;
    }
  }, [clampedProgress]);

  const animatedWidth = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
          {showPercentage && (
            <Text style={[styles.percentage, { color: barColor }]}>
              {Math.round(clampedProgress * 100)}%
            </Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor: colors.surfaceVariant }]}>
        <Animated.View
          style={[
            styles.fill,
            { height, backgroundColor: barColor, borderRadius: height / 2 },
            animatedWidth,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '500' },
  percentage: { fontSize: 13, fontWeight: '700' },
  track: { borderRadius: 5, overflow: 'hidden' },
  fill: { borderRadius: 5 },
});