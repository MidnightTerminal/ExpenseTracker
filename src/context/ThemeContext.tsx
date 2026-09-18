import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeColors } from '../types';
import { storage } from '../utils/storage';

const lightTheme: ThemeColors = {
  primary: '#6C63FF',
  primaryLight: '#8B83FF',
  primaryDark: '#5A52D5',
  secondary: '#00BFA6',
  accent: '#FF6584',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F2F5',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  shadow: '#000000',
  gradient1: '#6C63FF',
  gradient2: '#00BFA6',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  inputBackground: '#F3F4F6',
  modalOverlay: 'rgba(0,0,0,0.5)',
};

const darkTheme: ThemeColors = {
  primary: '#8B83FF',
  primaryLight: '#A49BFF',
  primaryDark: '#6C63FF',
  secondary: '#00E5C3',
  accent: '#FF7A9A',
  background: '#0F0F23',
  surface: '#1A1A2E',
  surfaceVariant: '#16213E',
  card: '#1A1A2E',
  text: '#EAEAEA',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  border: '#2D2D44',
  error: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  shadow: '#000000',
  gradient1: '#8B83FF',
  gradient2: '#00E5C3',
  tabBar: '#1A1A2E',
  tabBarBorder: '#2D2D44',
  inputBackground: '#16213E',
  modalOverlay: 'rgba(0,0,0,0.7)',
};

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const settings = await storage.load(storage.keys.SETTINGS);
    if (settings?.isDarkMode) {
      setIsDark(true);
    }
  };

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    const settings = await storage.load(storage.keys.SETTINGS) || {};
    await storage.save(storage.keys.SETTINGS, { ...settings, isDarkMode: newValue });
  };

  return (
    <ThemeContext.Provider value={{ colors: isDark ? darkTheme : lightTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);