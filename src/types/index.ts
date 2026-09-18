export interface Expense {
  id: string;
  amount: number;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  note: string;
  date: string; // ISO string
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom: boolean;
}

export interface Budget {
  monthlyLimit: number;
  categoryLimits: { [categoryId: string]: number };
}

export interface UserSettings {
  currency: string;
  currencySymbol: string;
  isDarkMode: boolean;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  pin: string;
  reminderEnabled: boolean;
  reminderTime: string;
}

export type ThemeColors = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  shadow: string;
  gradient1: string;
  gradient2: string;
  tabBar: string;
  tabBarBorder: string;
  inputBackground: string;
  modalOverlay: string;
};