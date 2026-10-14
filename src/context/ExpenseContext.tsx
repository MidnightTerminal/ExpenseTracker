import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { Expense, Category, Budget } from '../types';
import { storage } from '../utils/storage';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import { generateId } from '../utils/helpers';
import { cloudApi } from '../utils/api';
import { useAuth } from './AuthContext';

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
  syncNow: () => Promise<void>;
  backupTime: string;
  setBackupTime: (time: string) => Promise<void>;
  lastBackupAt: string | null;
  loading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType>({} as ExpenseContextType);

const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isThisWeek = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return date >= startOfWeek && date < endOfWeek;
};

const isThisMonth = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budget, setBudgetState] = useState<Budget>({ monthlyLimit: 0, categoryLimits: {} });
  const [backupTime, setBackupTimeState] = useState('23:00');
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { account } = useAuth();
  const backupInProgress = useRef(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading && account && cloudApi.isConfigured) syncFromCloud();
  }, [account, loading]);

  const loadData = async () => {
    try {
      const [savedExpenses, savedCategories, savedBudget] = await Promise.all([
        storage.load(storage.keys.EXPENSES),
        storage.load(storage.keys.CATEGORIES),
        storage.load(storage.keys.BUDGET),
      ]);

      if (Array.isArray(savedExpenses)) setExpenses(savedExpenses);
      if (Array.isArray(savedCategories)) setCategories(savedCategories);
      if (savedBudget && typeof savedBudget === 'object') setBudgetState(savedBudget);
      const savedBackupTime = await storage.load(storage.keys.BACKUP_TIME);
      const savedLastBackup = await storage.load(storage.keys.LAST_BACKUP_AT);
      if (typeof savedBackupTime === 'string' && /^\d{2}:\d{2}$/.test(savedBackupTime)) setBackupTimeState(savedBackupTime);
      if (typeof savedLastBackup === 'string') setLastBackupAt(savedLastBackup);
      if (!savedLastBackup && (Array.isArray(savedExpenses) || Array.isArray(savedCategories) || savedBudget)) {
        await storage.save(storage.keys.BACKUP_PENDING, true);
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncFromCloud = async () => {
    try {
      const remote = await cloudApi.getSync();
      const hasPendingChanges = await storage.load(storage.keys.BACKUP_PENDING);
      if (hasPendingChanges) {
        return;
      }
      if (Array.isArray(remote.expenses)) setExpenses(remote.expenses);
      if (Array.isArray(remote.categories)) setCategories(remote.categories);
      if (remote.budget && typeof remote.budget === 'object') setBudgetState(remote.budget);
      await Promise.all([
        storage.save(storage.keys.EXPENSES, remote.expenses),
        storage.save(storage.keys.CATEGORIES, remote.categories),
        storage.save(storage.keys.BUDGET, remote.budget),
      ]);
    } catch (error) {
      console.warn('Cloud sync load skipped:', error);
    }
  };

  const syncNow = async () => {
    if (!account || !cloudApi.isConfigured) return;
    await cloudApi.saveSync({ expenses, categories, budget });
    const backedUpAt = new Date().toISOString();
    setLastBackupAt(backedUpAt);
    await Promise.all([
      storage.save(storage.keys.LAST_BACKUP_AT, backedUpAt),
      storage.save(storage.keys.BACKUP_PENDING, false),
    ]);
  };

  const markBackupPending = async () => {
    await storage.save(storage.keys.BACKUP_PENDING, true);
  };

  const runScheduledBackup = useCallback(async () => {
    if (!account || !cloudApi.isConfigured || backupInProgress.current) return;
    const pending = await storage.load(storage.keys.BACKUP_PENDING);
    if (!pending) return;

    const now = new Date();
    const [hours, minutes] = backupTime.split(':').map(Number);
    const scheduledAt = new Date(now);
    scheduledAt.setHours(hours, minutes, 0, 0);
    const lastBackupDate = lastBackupAt ? new Date(lastBackupAt).toDateString() : null;
    if (now < scheduledAt || lastBackupDate === now.toDateString()) return;

    backupInProgress.current = true;
    try {
      await cloudApi.saveSync({ expenses, categories, budget });
      const backedUpAt = now.toISOString();
      setLastBackupAt(backedUpAt);
      await Promise.all([
        storage.save(storage.keys.LAST_BACKUP_AT, backedUpAt),
        storage.save(storage.keys.BACKUP_PENDING, false),
      ]);
    } catch (error) {
      console.warn('Scheduled cloud backup skipped:', error);
    } finally {
      backupInProgress.current = false;
    }
  }, [account, backupTime, budget, categories, expenses, lastBackupAt]);

  useEffect(() => {
    const interval = setInterval(() => { void runScheduledBackup(); }, 60 * 1000);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') void runScheduledBackup();
    });
    void runScheduledBackup();
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [runScheduledBackup]);

  const setBackupTime = async (time: string) => {
    setBackupTimeState(time);
    await storage.save(storage.keys.BACKUP_TIME, time);
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
    await markBackupPending();
  };

  const updateExpense = async (id: string, data: Partial<Expense>) => {
    const updated = expenses.map(e => e.id === id ? { ...e, ...data } : e);
    setExpenses(updated);
    await storage.save(storage.keys.EXPENSES, updated);
    await markBackupPending();
  };

  const deleteExpense = async (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    await storage.save(storage.keys.EXPENSES, updated);
    await markBackupPending();
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const newCat: Category = { ...category, id: generateId() };
    const updated = [...categories, newCat];
    setCategories(updated);
    await storage.save(storage.keys.CATEGORIES, updated);
    await markBackupPending();
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...data } : c);
    setCategories(updated);
    await storage.save(storage.keys.CATEGORIES, updated);
    await markBackupPending();
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    await storage.save(storage.keys.CATEGORIES, updated);
    await markBackupPending();
  };

  const setBudget = async (newBudget: Budget) => {
    setBudgetState(newBudget);
    await storage.save(storage.keys.BUDGET, newBudget);
    await markBackupPending();
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
        syncNow, backupTime, setBackupTime, lastBackupAt,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);