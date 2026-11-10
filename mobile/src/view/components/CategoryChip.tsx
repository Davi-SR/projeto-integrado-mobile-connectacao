import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { CategoryIcon } from './HomeIcons';
import { useTheme } from '../../theme/ThemeContext';

function iconType(nome: string): 'all' | 'environment' | 'education' | 'health' | 'community' | 'default' {
  const value = nome.toLowerCase();
  if (value === 'todas' || value === 'todos') return 'all';
  if (value.includes('ambiente') || value.includes('animal') || value.includes('sustent')) return 'environment';
  if (value.includes('educ')) return 'education';
  if (value.includes('saúde') || value.includes('saude')) return 'health';
  if (value.includes('comun') || value.includes('social')) return 'community';
  return 'default';
}

export function CategoryChip({
  categoria,
  selected,
  onPress,
}: {
  categoria: { id: number | null; nome: string };
  selected: boolean;
  onPress: () => void;
}) {
  const { isDark, theme } = useTheme();

  const chipBg = selected
    ? (isDark ? '#0D3331' : theme.colors.activeSurface)
    : (isDark ? '#1A1D24' : theme.colors.surface);

  const chipBorder = selected
    ? (isDark ? '#05BCAA' : theme.colors.teal)
    : (isDark ? '#2E3543' : theme.colors.inputBorder);

  const chipTextColor = selected
    ? (isDark ? '#05BCAA' : theme.colors.tealDark)
    : (isDark ? '#9CA3AF' : theme.colors.text);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: chipBg,
          borderColor: chipBorder,
        },
        pressed && styles.chipPressed,
      ]}
    >
      <CategoryIcon type={iconType(categoria.nome)} color={chipTextColor} />
      <Text
        numberOfLines={1}
        style={[
          styles.text,
          { color: chipTextColor },
          selected && styles.textSelected,
        ]}
      >
        {categoria.nome}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 52,
    paddingHorizontal: 18,
    marginRight: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipPressed: {
    opacity: 0.78,
  },
  text: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '600',
  },
  textSelected: {
    fontWeight: '700',
  },
});
