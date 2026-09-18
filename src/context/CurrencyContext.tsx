import React, { createContext, useContext, useEffect, useState } from 'react';
import { CURRENCY_OPTIONS } from '../utils/constants';
import { storage } from '../utils/storage';

type Currency = (typeof CURRENCY_OPTIONS)[number];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => Promise<void>;
}

const defaultCurrency = CURRENCY_OPTIONS[0];
const CurrencyContext = createContext<CurrencyContextType>({
  currency: defaultCurrency,
  setCurrency: async () => {},
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency);

  useEffect(() => {
    const loadCurrency = async () => {
      const settings = await storage.load(storage.keys.SETTINGS);
      const savedCurrency = CURRENCY_OPTIONS.find(option => option.value === settings?.currency);
      if (savedCurrency) setCurrencyState(savedCurrency);
    };

    loadCurrency();
  }, []);

  const setCurrency = async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    const settings = await storage.load(storage.keys.SETTINGS) || {};
    await storage.save(storage.keys.SETTINGS, { ...settings, currency: newCurrency.value });
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);