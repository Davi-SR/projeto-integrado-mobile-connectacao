import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AppTheme, darkTheme, lightTheme } from './authTheme';

const THEME_STORAGE_KEY = 'connectacao.theme_preference';
const isWeb = () => typeof document !== 'undefined';

async function getStoredTheme(): Promise<boolean> {
  try {
    let saved: string | null = null;
    if (isWeb()) {
      saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    } else {
      saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
    }
    return saved === 'dark';
  } catch {
    return false;
  }
}

async function persistTheme(isDark: boolean): Promise<void> {
  try {
    const value = isDark ? 'dark' : 'light';
    if (isWeb()) {
      window.localStorage.setItem(THEME_STORAGE_KEY, value);
    } else {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, value);
    }
  } catch (error) {
    console.warn('Erro ao salvar preferência de tema:', error);
  }
}

type ThemeContextType = {
  isDark: boolean;
  theme: AppTheme;
  toggleTheme: () => void;
  setThemeMode: (dark: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  theme: lightTheme,
  toggleTheme: () => undefined,
  setThemeMode: () => undefined,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    void getStoredTheme().then((storedIsDark) => {
      if (mounted) {
        setIsDark(storedIsDark);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setThemeMode = useCallback((dark: boolean) => {
    setIsDark(dark);
    void persistTheme(dark);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      void persistTheme(next);
      return next;
    });
  }, []);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
  }
  return context;
}

