import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { useCurrency } from '../context/CurrencyContext';
import { AnimatedCard } from '../components/AnimatedCard';
import { ProgressBar } from '../components/ProgressBar';
import { formatCurrency, getDaysInMonth, getDayOfMonth } from '../utils/helpers';

export const BudgetScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { budget, setBudget, getMonthTotal, getCategoryTotals } = useExpenses();
  const [editMode, setEditMode] = useState(false);
  const [newLimit, setNewLimit] = useState(budget.monthlyLimit.toString());
  const { currency } = useCurrency();
  const currencySymbol = currency.symbol;

  const monthTotal = getMonthTotal();
  const categoryTotals = getCategoryTotals('month');
  const progress = budget.monthlyLimit > 0 ? monthTotal / budget.monthlyLimit : 0;
  const remaining = budget.monthlyLimit - monthTotal;
  const daysLeft = getDaysInMonth() - getDayOfMonth();
  const dailyBudget = daysLeft > 0 && remaining > 0 ? remaining / daysLeft : 0;

  const handleSaveBudget = async () => {
    const limit = parseFloat(newLimit);
    if (isNaN(limit) || limit < 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid amount');
      return;
    }
    await setBudget({ ...budget, monthlyLimit: limit });
    setEditMode(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Budget</Text>
          <Pressable
            style={[styles.editBtn, { backgroundColor: colors.surfaceVariant }]}
            onPress={() => setEditMode(!editMode)}
          >
            <Ionicons name={editMode ? 'close' : 'create-outline'} size={20} color={colors.primary} />
          </Pressable>
        </Animated.View>

        {/* Budget Setting */}
        {editMode && (
          <Animated.View entering={FadeInDown.springify()}>
            <AnimatedCard style={styles.editCard}>
              <Text style={[styles.editLabel, { color: colors.textSecondary }]}>Monthly Budget Limit</Text>
              <View style={[styles.editInputRow, { backgroundColor: colors.surfaceVariant }]}>
                <Text style={[styles.editCurrency, { color: colors.primary }]}>{currencySymbol}</Text>
                <TextInput
                  style={[styles.editInput, { color: colors.text }]}
                  value={newLimit}
                  onChangeText={(text) => setNewLimit(text.replace(/[^0-9.]/g, ''))}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <Pressable
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveBudget}
              >
                <Text style={styles.saveBtnText}>Save Budget</Text>
              </Pressable>
            </AnimatedCard>
          </Animated.View>
        )}

        {/* Budget Overview */}
        {budget.monthlyLimit > 0 ? (
          <>
            <AnimatedCard index={1} style={styles.overviewCard}>
              <View style={styles.overviewHeader}>
                <View>
                  <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>
                    Monthly Limit
                  </Text>
                  <Text style={[styles.overviewValue, { color: colors.text }]}>
                    {formatCurrency(budget.monthlyLimit, currencySymbol)}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: progress > 1 ? colors.error + '20' : progress > 0.7 ? colors.warning + '20' : colors.success + '20' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: progress > 1 ? colors.error : progress > 0.7 ? colors.warning : colors.success }
                  ]}>
                    {progress > 1 ? 'Over Budget' : progress > 0.7 ? 'Warning' : 'On Track'}
                  </Text>
                </View>
              </View>
              <View style={{ marginTop: 20 }}>
                <ProgressBar progress={progress} height={14} showPercentage />
              </View>
              <View style={styles.budgetStats}>
                <View style={styles.budgetStat}>
                  <Text style={[styles.budgetStatLabel, { color: colors.textSecondary }]}>Spent</Text>
                  <Text style={[styles.budgetStatValue, { color: colors.error }]}>
                    {formatCurrency(monthTotal, currencySymbol)}
                  </Text>
                </View>
                <View style={styles.budgetStat}>
                  <Text style={[styles.budgetStatLabel, { color: colors.textSecondary }]}>Remaining</Text>
                  <Text style={[styles.budgetStatValue, { color: remaining >= 0 ? colors.success : colors.error }]}>
                    {formatCurrency(Math.abs(remaining), currencySymbol)}
                  </Text>
                </View>
              </View>
            </AnimatedCard>

            {/* Daily Budget */}
            <AnimatedCard index={2}>
              <View style={styles.dailyBudgetRow}>
                <View style={[styles.dailyIcon, { backgroundColor: colors.secondary + '20' }]}>
                  <Ionicons name="today" size={24} color={colors.secondary} />
                </View>
                <View style={styles.dailyInfo}>
                  <Text style={[styles.dailyLabel, { color: colors.textSecondary }]}>
                    Recommended Daily Spending
                  </Text>
                  <Text style={[styles.dailyValue, { color: colors.text }]}>
                    {formatCurrency(Math.max(dailyBudget, 0), currencySymbol)} / day
                  </Text>
                  <Text style={[styles.dailyDays, { color: colors.textTertiary }]}>
                    {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining this month
                  </Text>
                </View>
              </View>
            </AnimatedCard>

            {/* Category Budget Progress */}
            <AnimatedCard index={3} style={{ marginTop: 16 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Category Spending
              </Text>
              {categoryTotals.map((cat, index) => (
                <Animated.View
                  key={cat.name}
                  entering={FadeInUp.delay(index * 60).springify()}
                  style={[styles.catBudgetRow, { borderBottomColor: colors.border }]}
                >
                  <View style={[styles.catBudgetIcon, { backgroundColor: cat.color + '20' }]}>
                    <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                  </View>
                  <View style={styles.catBudgetInfo}>
                    <View style={styles.catBudgetNameRow}>
                      <Text style={[styles.catBudgetName, { color: colors.text }]}>{cat.name}</Text>
                      <Text style={[styles.catBudgetAmount, { color: colors.text }]}>
                        {formatCurrency(cat.total, currencySymbol)}
                      </Text>
                    </View>
                    <ProgressBar
                      progress={budget.monthlyLimit > 0 ? cat.total / budget.monthlyLimit : 0}
                      height={5}
                      color={cat.color}
                    />
                  </View>
                </Animated.View>
              ))}
            </AnimatedCard>
          </>
        ) : (
          <AnimatedCard index={1} style={styles.emptyBudget}>
            <Ionicons name="calculator-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Budget Set</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Set a monthly spending limit to track your progress
            </Text>
            <Pressable
              style={[styles.setupBtn, { backgroundColor: colors.primary }]}
              onPress={() => setEditMode(true)}
            >
              <Text style={styles.setupBtnText}>Set Budget</Text>
            </Pressable>
          </AnimatedCard>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800' },
  editBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  editCard: { marginBottom: 16 },
  editLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  editInputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 16 },
  editCurrency: { fontSize: 24, fontWeight: '700' },
  editInput: { flex: 1, fontSize: 24, fontWeight: '700', padding: 14, marginLeft: 8 },
  saveBtn: { padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 14 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  overviewCard: { marginBottom: 16 },
  overviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  overviewLabel: { fontSize: 13 },
  overviewValue: { fontSize: 28, fontWeight: '800', marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  budgetStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  budgetStat: {},
  budgetStatLabel: { fontSize: 12, marginBottom: 4 },
  budgetStatValue: { fontSize: 18, fontWeight: '700' },
  dailyBudgetRow: { flexDirection: 'row', alignItems: 'center' },
  dailyIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  dailyInfo: { flex: 1, marginLeft: 14 },
  dailyLabel: { fontSize: 12 },
  dailyValue: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  dailyDays: { fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  catBudgetRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5 },
  catBudgetIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  catBudgetInfo: { flex: 1, marginLeft: 12 },
  catBudgetNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  catBudgetName: { fontSize: 14, fontWeight: '600' },
  catBudgetAmount: { fontSize: 14, fontWeight: '700' },
  emptyBudget: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
  setupBtn: { paddingHorizontal: 30, paddingVertical: 14, borderRadius: 14, marginTop: 20 },
  setupBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});