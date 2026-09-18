import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInRight,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { Expense } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';

interface Props {
  expense: Expense;
  index: number;
  currencySymbol: string;
  onPress: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseItem: React.FC<Props> = ({ expense, index, currencySymbol, onPress, onDelete }) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50).springify()}
    >
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={() => onPress(expense)}
        onLongPress={() => onDelete(expense.id)}
      >
        <Animated.View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }, animatedStyle]}>
          <View style={[styles.iconContainer, { backgroundColor: expense.categoryColor + '20' }]}>
            <Ionicons name={expense.categoryIcon as any} size={22} color={expense.categoryColor} />
          </View>
          <View style={styles.details}>
            <Text style={[styles.category, { color: colors.text }]}>{expense.category}</Text>
            {expense.note ? (
              <Text style={[styles.note, { color: colors.textTertiary }]} numberOfLines={1}>
                {expense.note}
              </Text>
            ) : null}
            <Text style={[styles.date, { color: colors.textTertiary }]}>{formatDate(expense.date)}</Text>
          </View>
          <Text style={[styles.amount, { color: colors.error }]}>
            -{formatCurrency(expense.amount, currencySymbol)}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 0.5,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: { flex: 1, marginLeft: 12 },
  category: { fontSize: 15, fontWeight: '600' },
  note: { fontSize: 12, marginTop: 2 },
  date: { fontSize: 11, marginTop: 3 },
  amount: { fontSize: 16, fontWeight: '700' },
});