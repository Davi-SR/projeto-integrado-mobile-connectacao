import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { BellIcon, MenuIcon } from './HomeIcons';
import { useDrawer } from '../../viewmodel/DrawerContext';
import { useTheme } from '../../theme/ThemeContext';

export function HomeHeader() {
  const { openDrawer } = useDrawer();
  const { isDark, theme } = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: isDark ? '#121418' : theme.colors.surface,
          borderBottomColor: isDark ? '#242A35' : theme.colors.line,
        },
      ]}
    >
      <Pressable
        style={styles.iconButton}
        onPress={openDrawer}
        accessibilityRole="button"
        accessibilityLabel="Abrir menu"
      >
        <MenuIcon color={isDark ? '#05BCAA' : theme.colors.tealDark} />
      </Pressable>

      <View style={styles.brandMark} accessibilityLabel="Logo ConectAção">
        <View style={[styles.logoCrop, isDark && styles.logoCropDark]}>
          <Image
            source={isDark ? require('../../Assets/Logo-removed.png') : require('../../Assets/Logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.wordmark}>
          <Text style={{ color: isDark ? '#0AAEEE' : theme.colors.tealDark }}>Conect</Text>
          <Text style={{ color: isDark ? '#0AAEEE' : theme.colors.tealDark }}>Ação</Text>
        </Text>
      </View>

      <Pressable
        style={styles.iconButton}
        onPress={() => undefined}
        accessibilityRole="button"
        accessibilityLabel="Notificações"
      >
        <BellIcon color={isDark ? '#05BCAA' : theme.colors.tealDark} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 76,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoCrop: {
    width: 34,
    height: 34,
    overflow: 'hidden',
    marginRight: 6,
    borderRadius: 8,
  },
  logoCropDark: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  logo: {
    width: 44,
    height: 44,
    position: 'absolute',
    top: -4,
    left: -5,
  },
  wordmark: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
});
