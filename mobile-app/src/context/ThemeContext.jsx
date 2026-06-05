import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const AYDINLIK = {
  bg:            '#f5f5f5',
  card:          '#ffffff',
  border:        '#f0f0f0',
  borderStrong:  '#e5e7eb',
  text:          '#111827',
  textSecondary: '#6b7280',
  textMuted:     '#9ca3af',
  input:         '#f9fafb',
  inputBorder:   '#e5e7eb',
  tabBg:         '#ffffff',
  tabBorder:     '#f3f4f6',
  grupBaslik:    '#9ca3af',
  badge:         '#dbeafe',
  badgeText:     '#2563eb',
  price:         '#d97706',
  priceAlt:      '#b45309',
};

export const KARANLIK = {
  bg:            '#0a0f1e',
  card:          '#111827',
  border:        '#1e293b',
  borderStrong:  '#334155',
  text:          '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted:     '#64748b',
  input:         '#1e293b',
  inputBorder:   '#334155',
  tabBg:         '#111827',
  tabBorder:     '#1e293b',
  grupBaslik:    '#475569',
  badge:         '#1e3a5f',
  badgeText:     '#93c5fd',
  price:         '#f59e0b',
  priceAlt:      '#fbbf24',
};

export function ThemeProvider({ children }) {
  const sistemTema = useColorScheme();
  const [tema, setTema] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('tema').then(kayitli => {
      setTema(kayitli || 'dark');
    });
  }, [sistemTema]);

  const toggle = async () => {
    const yeni = tema === 'dark' ? 'light' : 'dark';
    setTema(yeni);
    await AsyncStorage.setItem('tema', yeni);
  };

  const gercekTema = tema || 'light';
  const colors = gercekTema === 'dark' ? KARANLIK : AYDINLIK;

  return (
    <ThemeContext.Provider value={{ tema: gercekTema, toggle, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
