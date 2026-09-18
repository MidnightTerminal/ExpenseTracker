import React, { useEffect, useRef } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';

// Since AnimatedProps for Text value is complex, we'll use a simpler approach
interface Props {
  value: number;
  prefix?: string;
  suffix?: string;
  style?: TextStyle;
  duration?: number;
}

export const AnimatedNumber: React.FC<Props> = ({
  value,
  prefix = '',
  suffix = '',
  style,
  duration = 800,
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    const startValue = displayValue;
    const diff = value - startValue;
    const startTime = Date.now();

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + diff * eased;
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value]);

  return (
    <Text style={style}>
      {prefix}{displayValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{suffix}
    </Text>
  );
};