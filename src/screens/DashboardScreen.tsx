import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, FadeInRight, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { useCurrency } from '../context/CurrencyContext';
import { AnimatedCard } from '../components/AnimatedCard';
import { ProgressBar } from '../components/ProgressBar';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { formatCurrency, getGreeting, formatDate } from '../utils/helpers';

const { width } = Dimensions.get('window');

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const {
    expenses, budget, getTodayTotal, getWeekTotal, getMonthTotal,
    getCategoryTotals, getMonthExpenses,
  } = useExpenses();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month');
  const { currency } = useCurrency();
  const currencySymbol = currency.symbol;
  const todayTotal = getTodayTotal();
  const weekTotal = getWeekTotal();
  const monthTotal = getMonthTotal();
  const categoryTotals = getCategoryTotals(selectedPeriod);
  const recentExpenses = expenses.slice(0, 5);
  const budgetProgress = budget.monthlyLimit > 0 ? monthTotal / budget.monthlyLimit : 0;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const periodTotals = {
    day: todayTotal,
    week: weekTotal,
    month: monthTotal,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()} 👋</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            style={[styles.settingsBtn, { backgroundColor: colors.surfaceVariant }]}
          >
            <Ionicons name="settings-outline" size={22} color={colors.text} />
          </Pressable>
        </Animated.View>

        {/* Main Balance Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LinearGradient
            colors={[colors.gradient1, colors.gradient2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <Text style={styles.balanceLabel}>Total Spent This Month</Text>
            <AnimatedNumber
              value={monthTotal}
              prefix={currencySymbol}
              style={styles.balanceAmount}
            />
            {budget.monthlyLimit > 0 && (
              <View style={styles.budgetInfo}>
                <View style={styles.budgetBarContainer}>
                  <View style={styles.budgetBar}>
                    <View
                      style={[
                        styles.budgetBarFill,
                        { width: `${Math.min(budgetProgress * 100, 100)}%` },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.budgetText}>
                  {formatCurrency(budget.monthlyLimit - monthTotal, currencySymbol)} remaining
                </Text>
              </View>
            )}

            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceItemLabel}>Today</Text>
                <Text style={styles.balanceItemValue}>{formatCurrency(todayTotal, currencySymbol)}</Text>
              </View>
              <View style={[styles.balanceDivider]} />
              <View style={styles.balanceItem}>
                <Text style={styles.balanceItemLabel}>This Week</Text>
                <Text style={styles.balanceItemValue}>{formatCurrency(weekTotal, currencySymbol)}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.quickActions}>
          <Pressable
            style={[styles.quickAction, { backgroundColor: colors.primary + '15' }]}
            onPress={() => navigation.navigate('AddExpense')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="add" size={24} color="#FFF" />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Add</Text>
          </Pressable>
          <Pressable
            style={[styles.quickAction, { backgroundColor: colors.secondary + '15' }]}
            onPress={() => navigation.navigate('Reports')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.secondary }]}>
              <Ionicons name="pie-chart" size={20} color="#FFF" />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Reports</Text>
          </Pressable>
          <Pressable
            style={[styles.quickAction, { backgroundColor: colors.accent + '15' }]}
            onPress={() => navigation.navigate('Budget')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.accent }]}>
              <Ionicons name="calculator" size={20} color="#FFF" />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Budget</Text>
          </Pressable>
          <Pressable
            style={[styles.quickAction, { backgroundColor: colors.warning + '15' }]}
            onPress={() => navigation.navigate('Categories')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.warning }]}>
              <Ionicons name="grid" size={20} color="#FFF" />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Manage</Text>
          </Pressable>
        </Animated.View>

        {/* Budget Progress */}
        {budget.monthlyLimit > 0 && (
          <AnimatedCard index={3} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Budget</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                {formatCurrency(monthTotal, currencySymbol)} of {formatCurrency(budget.monthlyLimit, currencySymbol)}
              </Text>
            </View>
            <ProgressBar
              progress={budgetProgress}
              height={12}
              showPercentage
              label={budgetProgress > 1 ? '⚠️ Over Budget!' : 'Budget Used'}
            />
          </AnimatedCard>
        )}

        {/* Category Breakdown */}
        {categoryTotals.length > 0 && (
          <AnimatedCard index={4} style={styles.section}>
            <View style={[styles.sectionHeader, styles.categorySectionHeader]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending by Category</Text>
              <View style={styles.periodSelector}>
                {(['day', 'week', 'month'] as const).map(period => (
                  <Pressable
                    key={period}
                    onPress={() => setSelectedPeriod(period)}
                    style={[
                      styles.periodBtn,
                      {
                        backgroundColor: selectedPeriod === period ? colors.primary : colors.surfaceVariant,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodBtnText,
                        { color: selectedPeriod === period ? '#FFF' : colors.textSecondary },
                      ]}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {categoryTotals.slice(0, 5).map((cat, index) => (
              <Animated.View
                key={cat.name}
                entering={SlideInRight.delay(index * 80).springify()}
                style={styles.categoryRow}
              >
                <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
                  <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                </View>
                <View style={styles.catInfo}>
                  <View style={styles.catNameRow}>
                    <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
                    <Text style={[styles.catAmount, { color: colors.text }]}>
                      {formatCurrency(cat.total, currencySymbol)}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={cat.percentage / 100}
                    height={6}
                    color={cat.color}
                    animated
                  />
                  <Text style={[styles.catPercentage, { color: colors.textTertiary }]}>
                    {cat.percentage.toFixed(1)}%
                  </Text>
                </View>
              </Animated.View>
            ))}
          </AnimatedCard>
        )}

        {/* Recent Transactions */}
        <AnimatedCard index={5} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
            <Pressable onPress={() => navigation.navigate('Transactions')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </Pressable>
          </View>
          {recentExpenses.length === 0 ? (
            <View style={styles.emptyRecent}>
              <Ionicons name="receipt-outline" size={40} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                No transactions yet
              </Text>
            </View>
          ) : (
            recentExpenses.map((expense, index) => (
              <Animated.View
                key={expense.id}
                entering={FadeInRight.delay(index * 60)}
              >
                <Pressable
                  style={[styles.recentItem, { borderBottomColor: colors.border }]}
                  onPress={() => navigation.navigate('AddExpense', { expense })}
                >
                  <View style={[styles.recentIcon, { backgroundColor: expense.categoryColor + '20' }]}>
                    <Ionicons name={expense.categoryIcon as any} size={18} color={expense.categoryColor} />
                  </View>
                  <View style={styles.recentInfo}>
                    <Text style={[styles.recentCategory, { color: colors.text }]}>{expense.category}</Text>
                    <Text style={[styles.recentDate, { color: colors.textTertiary }]}>
                      {formatDate(expense.date)}
                    </Text>
                  </View>
                  <Text style={[styles.recentAmount, { color: colors.error }]}>
                    -{formatCurrency(expense.amount, currencySymbol)}
                  </Text>
                </Pressable>
              </Animated.View>
            ))
          )}
        </AnimatedCard>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 14, fontWeight: '500' },
  headerTitle: { fontSize: 28, fontWeight: '800', marginTop: 4 },
  settingsBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  balanceCard: {
    borderRadius: 24, padding: 24, marginBottom: 20,
    shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  balanceAmount: { color: '#FFF', fontSize: 38, fontWeight: '800', marginTop: 8 },
  budgetInfo: { marginTop: 16 },
  budgetBarContainer: { marginBottom: 8 },
  budgetBar: {
    height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)',
  },
  budgetBarFill: {
    height: 6, borderRadius: 3, backgroundColor: '#FFFFFF',
  },
  budgetText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  balanceRow: { flexDirection: 'row', marginTop: 20, alignItems: 'center' },
  balanceItem: { flex: 1, alignItems: 'center' },
  balanceDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.3)' },
  balanceItemLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 },
  balanceItemValue: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  quickAction: { alignItems: 'center', padding: 14, borderRadius: 16, width: (width - 60) / 4 },
  quickActionIcon: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  quickActionText: { fontSize: 12, fontWeight: '600' },
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionSubtitle: { fontSize: 13 },
  seeAll: { fontSize: 14, fontWeight: '600' },
  periodSelector: {
    flexDirection: 'row',
    width: '100%',
    gap: 6,
  },
  periodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 20,
  },
  periodBtnText: { fontSize: 12, fontWeight: '600' },
  categoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  catIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  catInfo: { flex: 1, marginLeft: 12 },
  catNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catName: { fontSize: 14, fontWeight: '600' },
  catAmount: { fontSize: 14, fontWeight: '700' },
  catPercentage: { fontSize: 11, marginTop: 4 },
  recentItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  recentIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  recentInfo: { flex: 1, marginLeft: 12 },
  recentCategory: { fontSize: 14, fontWeight: '600' },
  recentDate: { fontSize: 12, marginTop: 2 },
  recentAmount: { fontSize: 15, fontWeight: '700' },
  emptyRecent: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { marginTop: 10, fontSize: 14 },
  categorySectionHeader: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
  },
});