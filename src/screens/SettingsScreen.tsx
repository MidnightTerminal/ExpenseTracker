import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { useCurrency } from '../context/CurrencyContext';
import { storage } from '../utils/storage';
import { AnimatedCard } from '../components/AnimatedCard';
import { CURRENCY_OPTIONS } from '../utils/constants';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { isLockEnabled, enableLock, isPinSet, setPin, isBiometricAvailable, logout } = useAuth();
  const { expenses } = useExpenses();
  const { currency: selectedCurrency, setCurrency } = useCurrency();
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const handleToggleLock = async (enabled: boolean) => {
    if (enabled && !isPinSet) {
      setShowPinModal(true);
    } else {
      await enableLock(enabled);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSetPin = async () => {
    if (newPin.length < 4) {
      Alert.alert('Invalid PIN', 'PIN must be at least 4 digits');
      return;
    }
    await setPin(newPin);
    setShowPinModal(false);
    setNewPin('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleExportData = () => {
    const data = JSON.stringify(expenses, null, 2);
    Alert.alert('Export Data', `You have ${expenses.length} transactions.\n\nData export feature coming soon!`);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your expenses, categories, and budget settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await storage.remove(storage.keys.EXPENSES);
            await storage.remove(storage.keys.CATEGORIES);
            await storage.remove(storage.keys.BUDGET);
            Alert.alert('Done', 'All data has been cleared. Please restart the app.');
          },
        },
      ]
    );
  };

  const SettingRow = ({
    icon, iconColor, title, subtitle, right, onPress,
  }: {
    icon: string; iconColor: string; title: string; subtitle?: string;
    right?: React.ReactNode; onPress?: () => void;
  }) => (
    <Pressable
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textTertiary }]}>{subtitle}</Text>}
      </View>
      {right || <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.springify()}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </Animated.View>

        {/* Appearance */}
        <AnimatedCard index={0} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>
          <SettingRow
            icon="moon"
            iconColor={colors.primary}
            title="Dark Mode"
            subtitle={isDark ? 'Enabled' : 'Disabled'}
            right={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary + '60' }}
                thumbColor={isDark ? colors.primary : '#f4f3f4'}
              />
            }
          />
          <SettingRow
            icon="cash"
            iconColor={colors.secondary}
            title="Currency"
            subtitle={selectedCurrency.label}
            onPress={() => setShowCurrencyModal(true)}
          />
        </AnimatedCard>

        {/* Security */}
        <AnimatedCard index={1} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SECURITY</Text>
          <SettingRow
            icon="lock-closed"
            iconColor={colors.accent}
            title="App Lock"
            subtitle={isLockEnabled ? 'Enabled' : 'Disabled'}
            right={
              <Switch
                value={isLockEnabled}
                onValueChange={handleToggleLock}
                trackColor={{ false: colors.border, true: colors.primary + '60' }}
                thumbColor={isLockEnabled ? colors.primary : '#f4f3f4'}
              />
            }
          />
          {isPinSet && (
            <SettingRow
              icon="keypad"
              iconColor={colors.warning}
              title="Change PIN"
              onPress={() => setShowPinModal(true)}
            />
          )}
          {isBiometricAvailable && (
            <SettingRow
              icon="finger-print"
              iconColor="#6C63FF"
              title="Biometric Auth"
              subtitle="Use fingerprint or face to unlock"
              right={
                <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              }
            />
          )}
        </AnimatedCard>

        {/* Data */}
        <AnimatedCard index={2} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DATA</Text>
          <SettingRow
            icon="download"
            iconColor={colors.success}
            title="Export Data"
            subtitle="Download your expenses"
            onPress={handleExportData}
          />
          <SettingRow
            icon="trash"
            iconColor={colors.error}
            title="Clear All Data"
            subtitle="Delete all expenses and settings"
            onPress={handleClearData}
          />
        </AnimatedCard>

        {/* About */}
        <AnimatedCard index={3} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ABOUT</Text>
          <SettingRow icon="information-circle" iconColor={colors.primary} title="Version" subtitle="1.0.0" right={null} />
          <SettingRow icon="heart" iconColor={colors.accent} title="Made by Mhs Mehedi Hasan" subtitle="RU ICE-20" right={null} />
        </AnimatedCard>

        {isLockEnabled && (
          <AnimatedCard index={4} style={styles.logoutSection}>
            <Pressable style={[styles.logoutBtn, { backgroundColor: colors.error + '15' }]} onPress={logout}>
              <Ionicons name="log-out" size={20} color={colors.error} />
              <Text style={[styles.logoutText, { color: colors.error }]}>Lock App</Text>
            </Pressable>
          </AnimatedCard>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* PIN Modal */}
      <Modal visible={showPinModal} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <Animated.View
            entering={FadeInDown.springify()}
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>Set PIN</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Enter a 4-6 digit PIN
            </Text>
            <TextInput
              style={[styles.pinInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
              value={newPin}
              onChangeText={(text) => setNewPin(text.replace(/[^0-9]/g, '').substring(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry
              placeholder="****"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: colors.surfaceVariant }]}
                onPress={() => { setShowPinModal(false); setNewPin(''); }}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleSetPin}
              >
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Save</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <Animated.View
            entering={FadeInDown.springify()}
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Currency</Text>
              <Pressable onPress={() => setShowCurrencyModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            {CURRENCY_OPTIONS.map(currency => (
              <Pressable
                key={currency.value}
                style={[
                  styles.currencyOption,
                  {
                    backgroundColor: selectedCurrency.value === currency.value
                      ? colors.primary + '15' : 'transparent',
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => {
                  setCurrency(currency);
                  setShowCurrencyModal(false);
                }}
              >
                <Text style={[styles.currencyText, { color: colors.text }]}>{currency.label}</Text>
                {selectedCurrency.value === currency.value && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 20 },
  section: { marginBottom: 16 },
  logoutSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5 },
  settingIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingInfo: { flex: 1, marginLeft: 14 },
  settingTitle: { fontSize: 15, fontWeight: '600' },
  settingSubtitle: { fontSize: 12, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 8 },
  logoutText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  modalContent: { borderRadius: 20, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalSubtitle: { fontSize: 14, marginBottom: 16 },
  pinInput: {
    borderRadius: 14, padding: 16, fontSize: 24, fontWeight: '700',
    textAlign: 'center', letterSpacing: 8,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { fontSize: 16, fontWeight: '600' },
  currencyOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderRadius: 12, borderBottomWidth: 0.5, marginBottom: 4,
  },
  currencyText: { fontSize: 16, fontWeight: '500' },
});