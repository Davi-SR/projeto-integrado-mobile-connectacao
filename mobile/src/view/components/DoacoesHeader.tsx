import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { BellIcon, MenuIcon } from './HomeIcons';
import { useDrawer } from '../../viewmodel/DrawerContext';
import { Usuario } from '../../model/entities/Usuario';
import { useTheme } from '../../theme/ThemeContext';

type Props = {
  user: Usuario | null;
  primeiroNome: string;
};

export function DoacoesHeader({ user, primeiroNome }: Props) {
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

      <View style={styles.userCenter}>
        {user?.fotoUrl ? (
          <Image
            source={{ uri: user.fotoUrl }}
            style={[styles.avatar, { borderColor: isDark ? '#05BCAA' : 'transparent', borderWidth: isDark ? 1 : 0 }]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              { backgroundColor: isDark ? '#0D3331' : theme.colors.activeSurface },
            ]}
          >
            <Text
              style={[
                styles.avatarInitial,
                { color: isDark ? '#05BCAA' : theme.colors.tealDark },
              ]}
            >
              {primeiroNome.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.userText}>
          <Text style={[styles.caption, { color: isDark ? '#9CA3AF' : theme.colors.muted }]}>
            BEM-VINDO(A) DE VOLTA
          </Text>
          <Text style={[styles.userName, { color: isDark ? '#FFFFFF' : theme.colors.ink }]}>
            Olá, {primeiroNome} 👋
          </Text>
        </View>
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
  userCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: '800',
  },
  userText: {
    justifyContent: 'center',
  },
  caption: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  userName: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: '800',
  },
});
