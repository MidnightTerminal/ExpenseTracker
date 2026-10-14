import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  EXPENSES: '@expenses',
  CATEGORIES: '@categories',
  BUDGET: '@budget',
  SETTINGS: '@settings',
  PIN: '@pin_hash',
  ACCOUNT: '@account',
  BACKUP_PENDING: '@backup_pending',
  LAST_BACKUP_AT: '@last_backup_at',
  BACKUP_TIME: '@backup_time',
};

export const storage = {
  async save(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Storage save error:', error);
    }
  },

  async load(key: string): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Storage load error:', error);
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },

  keys: KEYS,
};