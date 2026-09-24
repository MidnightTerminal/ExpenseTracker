import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { security } from '../utils/security';
import { Account, cloudApi } from '../utils/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLockEnabled: boolean;
  isPinSet: boolean;
  isBiometricAvailable: boolean;
  authenticate: () => Promise<boolean>;
  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  enableLock: (enabled: boolean) => Promise<void>;
  logout: () => void;
  account: Account | null;
  cloudConfigured: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  cloudLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [isPinSet, setIsPinSet] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    const bioAvailable = await security.checkBiometricAvailability();
    setIsBiometricAvailable(bioAvailable);

    const settings = await storage.load(storage.keys.SETTINGS);
    const pin = await storage.load(storage.keys.PIN);
    const savedAccount = await storage.load(storage.keys.ACCOUNT);
    if (savedAccount) setAccount(savedAccount);

    if (pin) setIsPinSet(true);
    if (settings?.biometricEnabled || pin) {
      setIsLockEnabled(true);
    } else {
      setIsAuthenticated(true);
    }
  };

  const authenticate = async (): Promise<boolean> => {
    if (isBiometricAvailable) {
      const result = await security.authenticateWithBiometric();
      if (result) {
        setIsAuthenticated(true);
        return true;
      }
    }
    return false;
  };

  const setPin = async (pin: string) => {
    const hashed = security.hashPin(pin);
    await storage.save(storage.keys.PIN, hashed);
    setIsPinSet(true);
    setIsLockEnabled(true);
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    const storedHash = await storage.load(storage.keys.PIN);
    const inputHash = security.hashPin(pin);
    if (storedHash === inputHash) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const enableLock = async (enabled: boolean) => {
    setIsLockEnabled(enabled);
    if (!enabled) {
      await storage.remove(storage.keys.PIN);
      setIsPinSet(false);
      setIsAuthenticated(true);
    }
    const settings = await storage.load(storage.keys.SETTINGS) || {};
    await storage.save(storage.keys.SETTINGS, { ...settings, biometricEnabled: enabled });
  };

  const logout = () => {
    if (isLockEnabled) {
      setIsAuthenticated(false);
    }
  };

  const register = async (email: string, password: string) => {
    const savedAccount = await cloudApi.register(email, password);
    setAccount(savedAccount);
    await storage.save(storage.keys.ACCOUNT, savedAccount);
  };

  const login = async (email: string, password: string) => {
    const savedAccount = await cloudApi.login(email, password);
    setAccount(savedAccount);
    await storage.save(storage.keys.ACCOUNT, savedAccount);
  };

  const cloudLogout = async () => {
    await cloudApi.logout();
    setAccount(null);
    await storage.remove(storage.keys.ACCOUNT);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated, isLockEnabled, isPinSet, isBiometricAvailable,
        authenticate, setPin, verifyPin, enableLock, logout,
        account, cloudConfigured: cloudApi.isConfigured, register, login, cloudLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);