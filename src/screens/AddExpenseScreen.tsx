import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { useCurrency } from '../context/CurrencyContext';
import { CategoryPicker } from '../components/CategoryPicker';
import { formatDate } from '../utils/helpers';
import { Expense, Category } from '../types';

export const AddExpenseScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { categories, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { currency } = useCurrency();
  const editExpense: Expense | undefined = route.params?.expense;

  const [amount, setAmount] = useState(editExpense?.amount.toString() || '');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    editExpense ? categories.find(c => c.name === editExpense.category) || null : null
  );
  const [date, setDate] = useState(editExpense ? new Date(editExpense.date) : new Date());
  const [note, setNote] = useState(editExpense?.note || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const amountRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!editExpense) {
      setTimeout(() => amountRef.current?.focus(), 300);
    }
  }, []);

  useEffect(() => {
    setAmount(editExpense?.amount.toString() || '');
    setSelectedCategory(editExpense ? categories.find(c => c.name === editExpense.category) || null : null);
    setDate(editExpense ? new Date(editExpense.date) : new Date());
    setNote(editExpense?.note || '');
    setShowCategories(false);
  }, [editExpense?.id, editExpense?.amount, editExpense?.category, editExpense?.date, editExpense?.note, categories]);

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('No Category', 'Please select a category');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const expenseData = {
      amount: parseFloat(amount),
      category: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      categoryColor: selectedCategory.color,
      note,
      date: date.toISOString(),
    };

    if (editExpense) {
      await updateExpense(editExpense.id, expenseData);
    } else {
      await addExpense(expenseData);
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    if (!editExpense) return;
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteExpense(editExpense.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleAmountChange = (text: string) => {
    // Allow only numbers and one decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    setAmount(cleaned);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>
            {editExpense ? 'Edit Expense' : 'Add Expense'}
          </Text>
          {editExpense && (
            <Pressable onPress={handleDelete} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
            </Pressable>
          )}
        </Animated.View>

        {/* Amount Input */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.amountSection}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Amount</Text>
          <View style={[styles.amountContainer, { backgroundColor: colors.surfaceVariant }]}>
            <Text style={[styles.currencySymbol, { color: colors.primary }]}>{currency.symbol}</Text>
            <TextInput
              ref={amountRef}
              style={[styles.amountInput, { color: colors.text }]}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>
        </Animated.View>

        {/* Date Picker */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
          <Pressable
            style={[styles.dateBtn, { backgroundColor: colors.surfaceVariant }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={[styles.dateText, { color: colors.text }]}>{formatDate(date.toISOString())}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
          </Pressable>
        </Animated.View>

        {/* Category Selection */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View style={styles.categoryHeader}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
            {selectedCategory && (
              <Animated.View entering={ZoomIn} style={[styles.selectedBadge, { backgroundColor: selectedCategory.color + '20' }]}>
                <Ionicons name={selectedCategory.icon as any} size={14} color={selectedCategory.color} />
                <Text style={[styles.selectedBadgeText, { color: selectedCategory.color }]}>
                  {selectedCategory.name}
                </Text>
              </Animated.View>
            )}
          </View>
          <Pressable
            onPress={() => setShowCategories(!showCategories)}
            style={[styles.categoryToggle, { backgroundColor: colors.surfaceVariant }]}
          >
            <Text style={[styles.categoryToggleText, { color: colors.text }]}>
              {selectedCategory ? 'Change Category' : 'Select Category'}
            </Text>
            <Ionicons
              name={showCategories ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textTertiary}
            />
          </Pressable>
          {showCategories && (
            <Animated.View entering={FadeInDown.springify()} style={styles.categoryPicker}>
              <CategoryPicker
                categories={categories}
                selected={selectedCategory?.id || null}
                onSelect={(cat) => {
                  setSelectedCategory(cat);
                  setShowCategories(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              />
            </Animated.View>
          )}
        </Animated.View>

        {/* Note */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.noteSection}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Note (Optional)</Text>
          <TextInput
            style={[styles.noteInput, { backgroundColor: colors.surfaceVariant, color: colors.text }]}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
          />
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInUp.delay(500).springify()}>
          <Pressable
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Ionicons name="checkmark-circle" size={22} color="#FFF" />
            <Text style={styles.saveBtnText}>
              {editExpense ? 'Update Expense' : 'Save Expense'}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        date={date}
        onConfirm={(selectedDate) => {
          setShowDatePicker(false);
          setDate(selectedDate);
        }}
        onCancel={() => setShowDatePicker(false)}
        maximumDate={new Date()}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 140 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  title: { flex: 1, fontSize: 22, fontWeight: '700', marginLeft: 12 },
  deleteBtn: { padding: 8 },
  amountSection: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  amountContainer: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 4,
  },
  currencySymbol: { fontSize: 30, fontWeight: '700', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 36, fontWeight: '700', paddingVertical: 16 },
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14,
    marginBottom: 20, gap: 10,
  },
  dateText: { flex: 1, fontSize: 15, fontWeight: '500' },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, gap: 6,
  },
  selectedBadgeText: { fontSize: 12, fontWeight: '600' },
  categoryToggle: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderRadius: 14,
  },
  categoryToggleText: { fontSize: 15, fontWeight: '500' },
  categoryPicker: { marginTop: 12, marginBottom: 20 },
  noteInput: {
    borderRadius: 14, padding: 16, fontSize: 15, minHeight: 80,
    textAlignVertical: 'top', marginBottom: 30,
  },
  saveBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    padding: 18, borderRadius: 16, gap: 8,
    shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  saveBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  noteSection: { marginTop: 16 },
});