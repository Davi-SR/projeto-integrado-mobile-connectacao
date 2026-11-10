import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { HomeIcon, PersonIcon, SearchIcon, DonationIcon } from './HomeIcons';
import { useTheme } from '../../theme/ThemeContext';

type TabName = 'Home' | 'Buscar' | 'Doacoes' | 'Perfil';
type Navigation = NativeStackNavigationProp<RootStackParamList, TabName>;

type Props = { activeTab: TabName; navigation: Navigation };

const tabs: Array<{ name: TabName; label: string }> = [
  { name: 'Home', label: 'Início' },
  { name: 'Buscar', label: 'Buscar' },
  { name: 'Doacoes', label: 'Doações' },
  { name: 'Perfil', label: 'Perfil' },
];

function TabIcon({
  name,
  active,
  activeColor,
  inactiveColor,
}: {
  name: TabName;
  active: boolean;
  activeColor: string;
  inactiveColor: string;
}) {
  const color = active ? activeColor : inactiveColor;
  if (name === 'Home') return <HomeIcon active={active} color={color} />;
  if (name === 'Buscar') return <SearchIcon color={color} />;
  if (name === 'Doacoes') return <DonationIcon active={active} color={color} />;
  return <PersonIcon active={active} color={color} />;
}

export function BottomNavigation({ activeTab, navigation }: Props) {
  const { isDark, theme } = useTheme();

  const activeColor = isDark ? '#05BCAA' : theme.colors.tealDark;
  const inactiveColor = isDark ? '#9CA3AF' : theme.colors.muted;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: isDark ? '#16191E' : theme.colors.surface,
          borderTopColor: isDark ? '#242A35' : 'transparent',
          borderTopWidth: isDark ? 1 : 0,
        },
      ]}
      accessibilityRole="tablist"
    >
      {tabs.map((tab) => {
        const active = tab.name === activeTab;
        return (
          <Pressable
            key={tab.name}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            onPress={() => navigation.navigate(tab.name)}
            style={({ pressed }) => [
              styles.tab,
              active && {
                backgroundColor: isDark ? '#133835' : '#5EEAD4',
                minWidth: 84,
              },
              pressed && styles.pressed,
            ]}
          >
            <TabIcon
              name={tab.name}
              active={active}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
            />
            <Text
              style={[
                styles.label,
                { color: inactiveColor },
                active && { color: activeColor, fontWeight: '700' },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 92,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  tab: {
    minWidth: 68,
    height: 64,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.76,
  },
});
