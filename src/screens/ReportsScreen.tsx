import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { useCurrency } from '../context/CurrencyContext';
import { AnimatedCard } from '../components/AnimatedCard';
import { formatCurrency, getMonthName } from '../utils/helpers';

const { width } = Dimensions.get('window');

export const ReportsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { getCategoryTotals, getMonthExpenses, expenses } = useExpenses();
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
  const { currency } = useCurrency();
  const currencySymbol = currency.symbol;

  const categoryTotals = getCategoryTotals(period);
  const totalSpent = categoryTotals.reduce((sum, c) => sum + c.total, 0);

  const monthlyHistory = useMemo(() => {
    const months: { [key: string]: { label: string; total: number; count: number } } = {};
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { label: getMonthName(date), total: 0, count: 0 };
      months[key].total += expense.amount;
      months[key].count += 1;
    });
    return Object.entries(months).sort(([a], [b]) => b.localeCompare(a)).map(([, month]) => month);
  }, [expenses]);

  const pieData = useMemo(() =>
    categoryTotals.slice(0, 8).map(cat => ({
      name: cat.name.length > 12 ? cat.name.substring(0, 12) + '...' : cat.name,
      amount: cat.total,
      color: cat.color,
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    })),
    [categoryTotals, colors]
  );

  // Daily spending for bar chart (last 7 days)
  const dailyData = useMemo(() => {
    const days: { [key: string]: number } = {};
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      days[key] = 0;
      labels.push(dayLabel);
    }

    expenses.forEach(e => {
      const key = new Date(e.date).toISOString().split('T')[0];
      if (days[key] !== undefined) {
        days[key] += e.amount;
      }
    });

    Object.values(days).forEach(val => data.push(val));

    return { labels, data };
  }, [expenses]);

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: () => colors.textSecondary,
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
    barPercentage: 0.6,
    fillShadowGradientFrom: colors.primary,
    fillShadowGradientTo: colors.primary + '30',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Reports</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {getMonthName(new Date())}
          </Text>
        </Animated.View>

        {/* Summary Cards */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="trending-down" size={24} color={colors.primary} />
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Spent</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatCurrency(totalSpent, currencySymbol)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.secondary + '15' }]}>
            <Ionicons name="layers" size={24} color={colors.secondary} />
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Categories</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{categoryTotals.length}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.accent + '15' }]}>
            <Ionicons name="receipt" size={24} color={colors.accent} />
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Transactions</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {getMonthExpenses().length}
            </Text>
          </View>
        </Animated.View>

        {/* Period Selector */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.periodRow}>
          {(['day', 'week', 'month'] as const).map(p => (
            <Pressable
              key={p}
              style={[styles.periodBtn, { backgroundColor: period === p ? colors.primary : colors.surfaceVariant }]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, { color: period === p ? '#FFF' : colors.textSecondary }]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* Chart Type Toggle */}
        <AnimatedCard index={3} style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Spending Breakdown</Text>
            <View style={styles.chartToggle}>
              <Pressable
                style={[styles.toggleBtn, { backgroundColor: chartType === 'pie' ? colors.primary : colors.surfaceVariant }]}
                onPress={() => setChartType('pie')}
              >
                <Ionicons name="pie-chart" size={16} color={chartType === 'pie' ? '#FFF' : colors.textSecondary} />
              </Pressable>
              <Pressable
                style={[styles.toggleBtn, { backgroundColor: chartType === 'bar' ? colors.primary : colors.surfaceVariant }]}
                onPress={() => setChartType('bar')}
              >
                <Ionicons name="bar-chart" size={16} color={chartType === 'bar' ? '#FFF' : colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          {categoryTotals.length === 0 ? (
            <View style={styles.emptyChart}>
              <Ionicons name="analytics-outline" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyChartText, { color: colors.textTertiary }]}>
                No data for this period
              </Text>
            </View>
          ) : chartType === 'pie' ? (
            <PieChart
              data={pieData}
              width={width - 72}
              height={220}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <BarChart
              data={{
                labels: dailyData.labels,
                datasets: [{ data: dailyData.data.length > 0 ? dailyData.data : [0] }],
              }}
              width={width - 72}
              height={220}
              chartConfig={chartConfig}
              style={{ borderRadius: 16 }}
              showValuesOnTopOfBars
              fromZero
              yAxisLabel={currencySymbol}
              yAxisSuffix=""
            />
          )}
        </AnimatedCard>

        {/* Category Details */}
        <AnimatedCard index={4} style={styles.categoryDetailCard}>
          <Text style={[styles.chartTitle, { color: colors.text, marginBottom: 16 }]}>
            Category Details
          </Text>
          {categoryTotals.map((cat, index) => (
            <Animated.View
              key={cat.name}
              entering={FadeInRight.delay(index * 60).springify()}
              style={[styles.categoryDetail, { borderBottomColor: colors.border }]}
            >
              <View style={[styles.catColorDot, { backgroundColor: cat.color }]} />
              <View style={styles.catDetailInfo}>
                <Text style={[styles.catDetailName, { color: colors.text }]}>{cat.name}</Text>
                <Text style={[styles.catDetailPercent, { color: colors.textTertiary }]}>
                  {cat.percentage.toFixed(1)}% of total
                </Text>
              </View>
              <Text style={[styles.catDetailAmount, { color: colors.text }]}>
                {formatCurrency(cat.total, currencySymbol)}
              </Text>
            </Animated.View>
          ))}
        </AnimatedCard>

        {/* Average Daily Spending */}
        <AnimatedCard index={5} style={styles.avgCard}>
          <View style={styles.avgRow}>
            <View style={[styles.avgIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="analytics" size={24} color={colors.warning} />
            </View>
            <View style={styles.avgInfo}>
              <Text style={[styles.avgLabel, { color: colors.textSecondary }]}>Daily Average (This Month)</Text>
              <Text style={[styles.avgValue, { color: colors.text }]}>
                {formatCurrency(totalSpent / Math.max(new Date().getDate(), 1), currencySymbol)}
              </Text>
            </View>
          </View>
        </AnimatedCard>

        <AnimatedCard index={6} style={styles.historyCard}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Monthly History</Text>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          </View>
          {monthlyHistory.length === 0 ? (
            <Text style={[styles.emptyHistory, { color: colors.textTertiary }]}>No monthly history yet</Text>
          ) : monthlyHistory.map(month => (
            <View key={month.label} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
              <View style={styles.historyInfo}>
                <Text style={[styles.historyMonth, { color: colors.text }]}>{month.label}</Text>
                <Text style={[styles.historyCount, { color: colors.textTertiary }]}>{month.count} transaction{month.count !== 1 ? 's' : ''}</Text>
              </View>
              <Text style={[styles.historyTotal, { color: colors.text }]}>{formatCurrency(month.total, currencySymbol)}</Text>
            </View>
          ))}
        </AnimatedCard>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1, padding: 14, borderRadius: 16, alignItems: 'center',
  },
  summaryLabel: { fontSize: 11, marginTop: 6 },
  summaryValue: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  periodText: { fontSize: 14, fontWeight: '600' },
  chartCard: { marginBottom: 16 },
  chartHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  chartTitle: { fontSize: 18, fontWeight: '700' },
  chartToggle: { flexDirection: 'row', gap: 6 },
  toggleBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  emptyChart: { alignItems: 'center', paddingVertical: 40 },
  emptyChartText: { marginTop: 10, fontSize: 14 },
  categoryDetailCard: { marginBottom: 16 },
  categoryDetail: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  catColorDot: { width: 12, height: 12, borderRadius: 6 },
  catDetailInfo: { flex: 1, marginLeft: 12 },
  catDetailName: { fontSize: 14, fontWeight: '600' },
  catDetailPercent: { fontSize: 12, marginTop: 2 },
  catDetailAmount: { fontSize: 15, fontWeight: '700' },
  avgCard: { marginBottom: 16 },
  avgRow: { flexDirection: 'row', alignItems: 'center' },
  avgIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avgInfo: { flex: 1, marginLeft: 14 },
  avgLabel: { fontSize: 13 },
  avgValue: { fontSize: 22, fontWeight: '700', marginTop: 4 },
  historyCard: { marginBottom: 16 },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5 },
  historyInfo: { flex: 1 },
  historyMonth: { fontSize: 15, fontWeight: '600' },
  historyCount: { fontSize: 12, marginTop: 3 },
  historyTotal: { fontSize: 15, fontWeight: '700' },
  emptyHistory: { paddingVertical: 16, textAlign: 'center' },
});