import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { useCurrency } from '../context/CurrencyContext';
import { ExpenseItem } from '../components/ExpenseItem';
import { EmptyState } from '../components/EmptyState';
import { formatCurrency, groupByDate, formatDate } from '../utils/helpers';
import { Expense } from '../types';

export const TransactionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { expenses, categories, deleteExpense } = useExpenses();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { currency } = useCurrency();
  const currencySymbol = currency.symbol;

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.category.toLowerCase().includes(query) ||
          e.note.toLowerCase().includes(query) ||
          e.amount.toString().includes(query)
      );
    }

    if (selectedFilter) {
      filtered = filtered.filter(e => e.category === selectedFilter);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchQuery, selectedFilter]);

  const groupedExpenses = useMemo(() => {
    const groups = groupByDate(filteredExpenses);
    return Object.entries(groups).map(([date, items]) => ({
      date,
      data: items as Expense[],
      total: (items as Expense[]).reduce((sum, e) => sum + e.amount, 0),
    }));
  }, [filteredExpenses]);

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExpense(id),
        },
      ]
    );
  };

  const uniqueCategories = useMemo(() => {
    const cats = new Set(expenses.map(e => e.category));
    return Array.from(cats);
  }, [expenses]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.springify()} style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''}
        </Text>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceVariant }]}>
          <Ionicons name="search" size={20} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search transactions..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          style={[styles.filterBtn, { backgroundColor: showFilters ? colors.primary : colors.surfaceVariant }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={20} color={showFilters ? '#FFF' : colors.text} />
        </Pressable>
      </Animated.View>

      {/* Filters */}
      {showFilters && (
        <Animated.ScrollView
          entering={FadeInDown.springify()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersRow}
          contentContainerStyle={styles.filtersContent}
        >
          <Pressable
            style={[styles.filterChip, { backgroundColor: !selectedFilter ? colors.primary : colors.surfaceVariant }]}
            onPress={() => setSelectedFilter(null)}
          >
            <Text style={[styles.filterChipText, { color: !selectedFilter ? '#FFF' : colors.text }]}>All</Text>
          </Pressable>
          {uniqueCategories.map(cat => (
            <Pressable
              key={cat}
              style={[
                styles.filterChip,
                { backgroundColor: selectedFilter === cat ? colors.primary : colors.surfaceVariant },
              ]}
              onPress={() => setSelectedFilter(selectedFilter === cat ? null : cat)}
            >
              <Text style={[styles.filterChipText, { color: selectedFilter === cat ? '#FFF' : colors.text }]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </Animated.ScrollView>
      )}

      {/* Transaction List */}
      <FlatList
        data={groupedExpenses}
        keyExtractor={(item) => item.date}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="No Transactions"
            subtitle="Start tracking your expenses by adding your first transaction"
          />
        }
        renderItem={({ item: group, index: groupIndex }) => (
          <Animated.View entering={FadeInDown.delay(groupIndex * 50)} style={styles.dateGroup}>
            <View style={styles.dateHeader}>
              <Text style={[styles.dateTitle, { color: colors.textSecondary }]}>
                {formatDate(new Date(group.date).toISOString())}
              </Text>
              <Text style={[styles.dateTotal, { color: colors.error }]}>
                -{formatCurrency(group.total, currencySymbol)}
              </Text>
            </View>
            {group.data.map((expense, index) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                index={index}
                currencySymbol={currencySymbol}
                onPress={(e) => navigation.navigate('AddExpense', { expense: e })}
                onDelete={handleDelete}
              />
            ))}
          </Animated.View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 12, gap: 10 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, borderRadius: 14, height: 48, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filterBtn: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  filtersRow: { maxHeight: 44, marginBottom: 8 },
  filtersContent: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterChipText: { fontSize: 13, fontWeight: '600' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  dateGroup: { marginBottom: 16 },
  dateHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10, paddingVertical: 4,
  },
  dateTitle: { fontSize: 13, fontWeight: '600' },
  dateTotal: { fontSize: 13, fontWeight: '600' },
});