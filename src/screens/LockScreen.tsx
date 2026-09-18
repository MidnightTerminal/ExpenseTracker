import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  FadeIn,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const LockScreen: React.FC = () => {
  const { colors } = useTheme();
  const { authenticate, verifyPin, isPinSet, isBiometricAvailable, setPin } = useAuth();
  const [pin, setPinState] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (isBiometricAvailable && isPinSet) {
      tryBiometric();
    } else if (!isPinSet) {
      setIsSettingPin(true);
    }
  }, []);

  const tryBiometric = async () => {
    const success = await authenticate();
    if (!success && isPinSet) {
      // Fall back to PIN
    }
  };

  const handleNumberPress = async (num: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPin = pin + num;
    setPinState(newPin);

    if (newPin.length === 4) {
      if (isSettingPin) {
        if (step === 'enter') {
          setConfirmPin(newPin);
          setStep('confirm');
          setPinState('');
        } else {
          if (newPin === confirmPin) {
            await setPin(newPin);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            shakeAnimation();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setStep('enter');
            setConfirmPin('');
            setPinState('');
            Alert.alert('Mismatch', 'PINs do not match. Try again.');
          }
        }
      } else {
        const success = await verifyPin(newPin);
        if (!success) {
          shakeAnimation();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setPinState('');
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPinState(pin.slice(0, -1));
  };

  const shakeAnimation = () => {
    shakeX.value = withSequence(
      withSpring(10, { damping: 2 }),
      withSpring(-10, { damping: 2 }),
      withSpring(10, { damping: 2 }),
      withSpring(0, { damping: 5 }),
    );
  };

  const dotsStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <LinearGradient colors={[colors.gradient1, colors.gradient2]} style={styles.container}>
      <Animated.View entering={ZoomIn.springify()} style={styles.lockIcon}>
        <Ionicons name="lock-closed" size={40} color="#FFFFFF" />
      </Animated.View>

      <Animated.Text entering={FadeInUp.delay(200)} style={styles.title}>
        {isSettingPin
          ? step === 'enter' ? 'Set Your PIN' : 'Confirm PIN'
          : 'Enter PIN'
        }
      </Animated.Text>

      <Animated.Text entering={FadeInUp.delay(300)} style={styles.subtitle}>
        {isSettingPin
          ? 'Create a 4-digit PIN to secure your data'
          : 'Enter your 4-digit PIN to continue'
        }
      </Animated.Text>

      <Animated.View style={[styles.dotsContainer, dotsStyle]}>
        {[0, 1, 2, 3].map(i => (
          <Animated.View
            key={i}
            entering={FadeIn.delay(400 + i * 100)}
            style={[
              styles.dot,
              {
                backgroundColor: i < pin.length ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                transform: [{ scale: i < pin.length ? 1.2 : 1 }],
              },
            ]}
          />
        ))}
      </Animated.View>

      <View style={styles.keypad}>
        {numbers.map((num, index) => (
          <Animated.View key={index} entering={FadeInUp.delay(500 + index * 50).springify()}>
            {num === '' ? (
              <View style={styles.keyEmpty} />
            ) : num === 'del' ? (
              <Pressable style={styles.key} onPress={handleDelete}>
                <Ionicons name="backspace-outline" size={28} color="#FFFFFF" />
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
                onPress={() => handleNumberPress(num)}
              >
                <Text style={styles.keyText}>{num}</Text>
              </Pressable>
            )}
          </Animated.View>
        ))}
      </View>

      {isBiometricAvailable && isPinSet && (
        <Pressable onPress={tryBiometric} style={styles.biometricButton}>
          <Ionicons name="finger-print" size={32} color="#FFFFFF" />
          <Text style={styles.biometricText}>Use Biometric</Text>
        </Pressable>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  lockIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#FFF', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 32 },
  dotsContainer: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 280 },
  key: {
    width: 75, height: 75, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', margin: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  keyPressed: { backgroundColor: 'rgba(255,255,255,0.3)' },
  keyEmpty: { width: 75, height: 75, margin: 8 },
  keyText: { fontSize: 28, fontWeight: '600', color: '#FFFFFF' },
  biometricButton: { flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 8 },
  biometricText: { color: '#FFF', fontSize: 16, fontWeight: '500' },
});