import { useColorScheme as useNativeColorScheme } from "react-native";
import { useTheme } from './ThemeProvider';

export type ColorScheme = 'light' | 'dark' | null;

// Enhanced useColorScheme hook that works with ThemeProvider
export function useColorScheme(): ColorScheme {
  try {
    const { actualColorScheme } = useTheme();
    return actualColorScheme;
  } catch {
    // Fallback to native hook if ThemeProvider is not available
    const nativeScheme = useNativeColorScheme();
    return nativeScheme as ColorScheme;
  }
}

// Re-export useTheme for convenience
export { useTheme } from './ThemeProvider';
