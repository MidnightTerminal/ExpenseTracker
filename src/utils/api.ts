import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Expense, Category, Budget } from '../types';

const API_URL = (Constants.expoConfig?.extra?.apiUrl as string | undefined)?.replace(/\/+$/, '');
const TOKEN_KEY = 'expense_tracker_session';

export interface Account {
  id: string;
  email: string;
}

interface SyncPayload {
  expenses: Expense[];
  categories: Category[];
  budget: Budget;
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  if (!API_URL) throw new Error('Cloud sync is not configured. Set EXPO_PUBLIC_API_URL in your Expo environment.');
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  let body: { message?: string } & T;
  try {
    body = await response.json();
  } catch {
    throw new Error('The cloud server returned an invalid response. Check the API URL and server deployment.');
  }
  if (!response.ok) throw new Error(body.message || 'Cloud request failed');
  return body as T;
};

export const cloudApi = {
  isConfigured: Boolean(API_URL),
  async register(email: string, password: string) {
    const result = await request<{ token: string; user: Account }>('/auth/register', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    await SecureStore.setItemAsync(TOKEN_KEY, result.token);
    return result.user;
  },
  async login(email: string, password: string) {
    const result = await request<{ token: string; user: Account }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    await SecureStore.setItemAsync(TOKEN_KEY, result.token);
    return result.user;
  },
  async logout() { await SecureStore.deleteItemAsync(TOKEN_KEY); },
  async getSync(): Promise<SyncPayload> { return request<SyncPayload>('/sync'); },
  async saveSync(payload: SyncPayload) {
    return request<{ ok: true }>('/sync', { method: 'PUT', body: JSON.stringify(payload) });
  },
};