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
};

export const KARANLIK = {
  bg:            '#0f172a',
  card:          '#1e293b',
  border:        '#1e293b',
  borderStrong:  '#334155',
  text:          '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted:     '#64748b',
  input:         '#1e293b',
  inputBorder:   '#334155',
  tabBg:         '#1e293b',
  tabBorder:     '#334155',
  grupBaslik:    '#64748b',
  badge:         '#1e3a5f',
  badgeText:     '#93c5fd',
};

export function ThemeProvider({ children }) {
  const sistemTema = useColorScheme();
  const [tema, setTema] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('tema').then(kayitli => {
      setTema(kayitli || sistemTema || 'light');
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
