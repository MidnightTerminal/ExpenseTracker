import React, { useEffect } from 'react';
import { ViewStyle, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

interface Props {
  children: React.ReactNode;
  index?: number;
  style?: ViewStyle;
  onPress?: () => void;
  delay?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AnimatedCard: React.FC<Props> = ({ children, index = 0, style, onPress, delay = 0 }) => {
  const { colors } = useTheme();
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.value = withDelay(
      delay + index * 100,
      withSpring(1, { damping: 15, stiffness: 100 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [30, 0]) },
      { scale: scale.value },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 3,
        },
        style,
        animatedStyle,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
};