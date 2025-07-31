import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useColorScheme as useNativeColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ColorScheme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  colorScheme: ColorScheme;
  actualColorScheme: 'light' | 'dark';
  setColorScheme: (scheme: ColorScheme) => void;
  isDark: boolean;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_preference';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useNativeColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('auto');

  // Load theme preference from storage
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Listen to system theme changes when in auto mode
  useEffect(() => {
    if (colorScheme === 'auto') {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        // This will trigger a re-render when system theme changes
      });
      return () => subscription?.remove();
    }
  }, [colorScheme]);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && ['light', 'dark', 'auto'].includes(saved)) {
        setColorSchemeState(saved as ColorScheme);
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  const setColorScheme = async (scheme: ColorScheme) => {
    try {
      setColorSchemeState(scheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const toggleColorScheme = () => {
    if (colorScheme === 'light') {
      setColorScheme('dark');
    } else if (colorScheme === 'dark') {
      setColorScheme('light');
    } else {
      // If auto, toggle to opposite of current system theme
      setColorScheme(systemColorScheme === 'dark' ? 'light' : 'dark');
    }
  };

  // Determine the actual color scheme to use
  const actualColorScheme: 'light' | 'dark' = 
    colorScheme === 'auto' 
      ? (systemColorScheme === 'dark' ? 'dark' : 'light')
      : colorScheme;

  const isDark = actualColorScheme === 'dark';

  return (
    <ThemeContext.Provider value={{
      colorScheme,
      actualColorScheme,
      setColorScheme,
      isDark,
      toggleColorScheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  const systemColorScheme = useNativeColorScheme();
  
  if (!context) {
    // Fallback when not using ThemeProvider
    return {
      colorScheme: 'auto' as ColorScheme,
      actualColorScheme: (systemColorScheme === 'dark' ? 'dark' : 'light') as 'light' | 'dark',
      setColorScheme: () => {},
      isDark: systemColorScheme === 'dark',
      toggleColorScheme: () => {},
    };
  }
  
  return context;
}
