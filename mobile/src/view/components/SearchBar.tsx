import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppIcon, SearchIcon } from './HomeIcons';
import { useTheme } from '../../theme/ThemeContext';

export function SearchBar({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (value: string) => void;
}) {
  const { isDark, theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1A1D24' : theme.colors.surface,
          borderColor: isDark ? '#2D3545' : theme.colors.inputBorder,
        },
      ]}
    >
      <SearchIcon color={isDark ? '#9CA3AF' : theme.colors.text} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          {
            color: isDark ? '#FFFFFF' : theme.colors.ink,
          },
        ]}
        placeholder="Buscar ONGs, campanhas, locais..."
        placeholderTextColor={isDark ? '#6B7280' : theme.colors.muted}
        accessibilityLabel="Buscar ONGs, campanhas e locais"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          style={styles.clearButton}
        >
          <AppIcon name="close" size={18} color={isDark ? '#9CA3AF' : theme.colors.muted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 14,
  },
  input: {
    flex: 1,
    minHeight: 52,
    marginLeft: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
  },
  clearButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
