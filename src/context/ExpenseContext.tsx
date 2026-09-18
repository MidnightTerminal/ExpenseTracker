import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Expense, Category, Budget } from '../types';
import { storage } from '../utils/storage';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import { generateId, isToday, isThisWeek, isThisMonth } from '../utils/helpers';

interface ExpenseContextType {
  expenses: Expense[];
  categories: Category[];
  budget: Budget;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  setBudget: (budget: Budget) => Promise<void>;
  getTodayTotal: () => number;
  getWeekTotal: () => number;
  getMonthTotal: () => number;
  getMonthExpenses: () => Expense[];
  getCategoryTotals: (period?: 'day' | 'week' | 'month') => { name: string; total: number; color: string; icon: string; percentage: number }[];
  loading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType>({} as ExpenseContextType);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budget, setBudgetState] = useState<Budget>({ monthlyLimit: 0, categoryLimits: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedExpenses, savedCategories, savedBudget] = await Promise.all([
        storage.load(storage.keys.EXPENSES),
        storage.load(storage.keys.CATEGORIES),
        storage.load(storage.keys.BUDGET),
      ]);

      if (savedExpenses) setExpenses(savedExpenses);
      if (savedCategories) setCategories(savedCategories);
      if (savedBudget) setBudgetState(savedBudget);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    await storage.save(storage.keys.EXPENSES, updated);
  };

  const updateExpense = async (id: string, data: Partial<Expense>) => {
    const updated = expenses.map(e => e.id === id ? { ...e, ...data } : e);
    setExpenses(updated);
    await storage.save(storage.keys.EXPENSES, updated);
  };

  const deleteExpense = async (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    await storage.save(storage.keys.EXPENSES, updated);
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const newCat: Category = { ...category, id: generateId() };
    const updated = [...categories, newCat];
    setCategories(updated);
    await storage.save(storage.keys.CATEGORIES, updated);
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...data } : c);
    setCategories(updated);
    await storage.save(storage.keys.CATEGORIES, updated);
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    await storage.save(storage.keys.CATEGORIES, updated);
  };

  const setBudget = async (newBudget: Budget) => {
    setBudgetState(newBudget);
    await storage.save(storage.keys.BUDGET, newBudget);
  };

  const getTodayTotal = useCallback(() => {
    return expenses.filter(e => isToday(e.date)).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const getWeekTotal = useCallback(() => {
    return expenses.filter(e => isThisWeek(e.date)).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const getMonthTotal = useCallback(() => {
    return expenses.filter(e => isThisMonth(e.date)).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const getMonthExpenses = useCallback(() => {
    return expenses.filter(e => isThisMonth(e.date));
  }, [expenses]);

  const getCategoryTotals = useCallback((period: 'day' | 'week' | 'month' = 'month') => {
    let filtered = expenses;
    if (period === 'day') filtered = expenses.filter(e => isToday(e.date));
    else if (period === 'week') filtered = expenses.filter(e => isThisWeek(e.date));
    else filtered = expenses.filter(e => isThisMonth(e.date));

    const totals: { [key: string]: { total: number; color: string; icon: string } } = {};
    filtered.forEach(e => {
      if (!totals[e.category]) {
        totals[e.category] = { total: 0, color: e.categoryColor, icon: e.categoryIcon };
      }
      totals[e.category].total += e.amount;
    });

    const grandTotal = Object.values(totals).reduce((sum, t) => sum + t.total, 0);

    return Object.entries(totals)
      .map(([name, data]) => ({
        name,
        total: data.total,
        color: data.color,
        icon: data.icon,
        percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  return (
    <ExpenseContext.Provider
      value={{
        expenses, categories, budget, loading,
        addExpense, updateExpense, deleteExpense,
        addCategory, updateCategory, deleteCategory,
        setBudget, getTodayTotal, getWeekTotal, getMonthTotal,
        getMonthExpenses, getCategoryTotals,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);