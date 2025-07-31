import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './useColorScheme';
import { useThemeColor } from './Themed';

interface ThemeToggleProps {
  size?: number;
  style?: any;
}

export function ThemeToggle({ size = 24, style }: ThemeToggleProps) {
  const { actualColorScheme, toggleColorScheme } = useTheme();
  const iconColor = useThemeColor({}, 'text');
  
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={toggleColorScheme}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={actualColorScheme === 'dark' ? 'sunny' : 'moon'} 
        size={size} 
        color={iconColor} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
