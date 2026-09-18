import * as LocalAuthentication from 'expo-local-authentication';

export const security = {
  async checkBiometricAvailability(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch {
      return false;
    }
  },

  async authenticateWithBiometric(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access ExpenseTracker',
        cancelLabel: 'Use PIN',
        disableDeviceFallback: true,
      });
      return result.success;
    } catch {
      return false;
    }
  },

  hashPin(pin: string): string {
    // Simple hash for PIN - in production use proper crypto
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
      const char = pin.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  },

  validatePin(pin: string): boolean {
    return /^\d{4,6}$/.test(pin);
  },
};