import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { account, cloudLogout } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Cloud backup will stop on this device until you sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await cloudLogout();
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View entering={FadeInDown.springify()} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.profileCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{account?.email.charAt(0).toUpperCase() || '?'}</Text>
        </View>
        <Text style={[styles.email, { color: colors.text }]}>{account?.email || 'No account email'}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.statusText, { color: colors.success }]}>Cloud backup active</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT DETAILS</Text>
        <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
          <Ionicons name="mail-outline" size={20} color={colors.primary} />
          <View style={styles.detailInfo}>
            <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>Email</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{account?.email || '-'}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="finger-print-outline" size={20} color={colors.primary} />
          <View style={styles.detailInfo}>
            <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>Account ID</Text>
            <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>{account?.id || '-'}</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <Pressable style={[styles.signOutButton, { backgroundColor: colors.error + '15' }]} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.signOutText, { color: colors.error }]}>Sign out</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 58 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginLeft: 12 },
  profileCard: { alignItems: 'center', borderRadius: 20, padding: 26, marginBottom: 16 },
  avatar: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText: { color: '#FFF', fontSize: 32, fontWeight: '800' },
  email: { fontSize: 17, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 7 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '600' },
  detailsCard: { borderRadius: 20, padding: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 0.5 },
  detailInfo: { flex: 1, marginLeft: 14 },
  detailLabel: { fontSize: 12 },
  detailValue: { fontSize: 15, fontWeight: '600', marginTop: 3 },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, borderRadius: 14 },
  signOutText: { fontSize: 16, fontWeight: '700' },
});
