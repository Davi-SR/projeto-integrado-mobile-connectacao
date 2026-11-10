import React from 'react';
import {
  Animated,
  BackHandler,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../viewmodel/AuthContext';
import { useDrawer } from '../../viewmodel/DrawerContext';
import { useTheme } from '../../theme/ThemeContext';
import { AppIcon } from './HomeIcons';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type MenuKey = 'Home' | 'Doacoes' | 'Favoritos' | 'Configuracoes';
type DrawerRoute = MenuKey;

const menuItems: Array<{ key: MenuKey; label: string; icon: string; route: DrawerRoute }> = [
  { key: 'Home', label: 'Início', icon: 'home', route: 'Home' },
  { key: 'Doacoes', label: 'Minhas Doações', icon: 'history', route: 'Doacoes' },
  { key: 'Favoritos', label: 'ONGs Favoritas', icon: 'favorite_border', route: 'Favoritos' },
  { key: 'Configuracoes', label: 'Configurações', icon: 'settings', route: 'Configuracoes' },
];

function initial(nome: string | undefined) {
  return nome?.trim().charAt(0).toUpperCase() || 'U';
}

export function AppDrawer() {
  const { isOpen, activeRoute, closeDrawer } = useDrawer();
  const { user, signOut } = useAuth();
  const { isDark, theme } = useTheme();
  const navigation = useNavigation<Navigation>();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.74, 320);
  const translateX = React.useRef(new Animated.Value(-drawerWidth)).current;
  const [mounted, setMounted] = React.useState(isOpen);

  React.useEffect(() => {
    if (isOpen) {
      setMounted(true);
      translateX.setValue(-drawerWidth);
      Animated.timing(translateX, { toValue: 0, duration: 240, useNativeDriver: true }).start();
      return undefined;
    }
    if (!mounted) return undefined;
    Animated.timing(translateX, { toValue: -drawerWidth, duration: 210, useNativeDriver: true }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
    return undefined;
  }, [drawerWidth, isOpen, mounted, translateX]);

  React.useEffect(() => {
    if (Platform.OS !== 'android' || !isOpen) return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeDrawer();
      return true;
    });
    return () => subscription.remove();
  }, [closeDrawer, isOpen]);

  if (!mounted) return null;

  const navigate = (route: DrawerRoute) => {
    closeDrawer();
    if (route === 'Home' && activeRoute === 'Home') return;
    navigation.navigate(route);
  };

  const drawerBg = isDark ? '#181B20' : theme.colors.surface;
  const headerBg = isDark ? '#181B20' : theme.colors.subtle;
  const closeBtnBg = isDark ? '#262B35' : theme.colors.surface;
  const closeBtnColor = isDark ? '#CBD5E1' : theme.colors.text;
  const dividerColor = isDark ? '#262B35' : theme.colors.line;
  const logoutColor = isDark ? '#FB6407' : theme.colors.error;

  return (
    <View style={styles.layer} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar menu"
        onPress={closeDrawer}
        style={[
          styles.overlay,
          { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(25, 28, 29, 0.38)' },
        ]}
      />
      <Animated.View
        style={[
          styles.drawer,
          { width: drawerWidth, backgroundColor: drawerBg, transform: [{ translateX }] },
        ]}
      >
        <SafeAreaView style={[styles.safeDrawer, { backgroundColor: drawerBg }]}>
          <View style={[styles.profileHeader, { backgroundColor: headerBg }]}>
            {user?.fotoUrl ? (
              <Image source={{ uri: user.fotoUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#0AAEEE' }]}>
                <Text style={styles.avatarText}>{initial(user?.nome)}</Text>
              </View>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar menu"
              onPress={closeDrawer}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: closeBtnBg },
                pressed && styles.pressed,
              ]}
            >
              <AppIcon name="close" size={24} color={closeBtnColor} />
            </Pressable>
            <Text
              numberOfLines={2}
              style={[styles.userName, { color: isDark ? '#FFFFFF' : theme.colors.ink }]}
            >
              {user?.nome?.trim() || 'Marina Silva'}
            </Text>
            {user?.email && (
              <Text
                numberOfLines={1}
                style={[styles.userEmail, { color: isDark ? '#9CA3AF' : theme.colors.text }]}
              >
                {user.email}
              </Text>
            )}
          </View>

          <View style={styles.menuArea}>
            {menuItems.slice(0, 3).map((item) => (
              <DrawerItem
                key={item.key}
                item={item}
                active={activeRoute === item.route}
                isDark={isDark}
                theme={theme}
                onPress={() => navigate(item.route)}
              />
            ))}
            <View style={[styles.divider, { backgroundColor: dividerColor }]} />
            <DrawerItem
              item={menuItems[3]}
              active={activeRoute === menuItems[3].route}
              isDark={isDark}
              theme={theme}
              onPress={() => navigate(menuItems[3].route)}
            />
          </View>

          <View style={styles.logoutArea}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sair da conta"
              onPress={() => {
                closeDrawer();
                void signOut();
              }}
              style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
            >
              <AppIcon name="logout" size={24} color={logoutColor} />
              <Text style={[styles.logoutText, { color: logoutColor }]}>Sair</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

function DrawerItem({
  item,
  active,
  isDark,
  theme,
  onPress,
}: {
  item: (typeof menuItems)[number];
  active: boolean;
  isDark: boolean;
  theme: any;
  onPress: () => void;
}) {
  const activeBg = isDark ? '#232C37' : theme.colors.activeSurface;
  const activeIndicatorColor = isDark ? '#0AAEEE' : theme.colors.brand;
  const iconColor = active
    ? (isDark ? '#0AAEEE' : theme.colors.brand)
    : (isDark ? '#CBD5E1' : theme.colors.text);
  const textColor = active
    ? (isDark ? '#0AAEEE' : theme.colors.brand)
    : (isDark ? '#FFFFFF' : theme.colors.ink);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        item.key === 'Home'
          ? 'Ir para início'
          : item.key === 'Doacoes'
          ? 'Ver minhas doações'
          : item.label
      }
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        active && { backgroundColor: activeBg },
        pressed && styles.pressed,
      ]}
    >
      <AppIcon name={item.icon} size={25} color={iconColor} />
      <Text style={[styles.itemText, { color: textColor }, active && { fontWeight: '700' }]}>
        {item.label}
      </Text>
      {active && (
        <View style={[styles.activeIndicator, { backgroundColor: activeIndicatorColor }]} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFill, zIndex: 30, elevation: 30 },
  overlay: { ...StyleSheet.absoluteFill },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  safeDrawer: { flex: 1 },
  profileHeader: {
    minHeight: 250,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
    justifyContent: 'center',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 38,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    top: 24,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    marginTop: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  userEmail: {
    marginTop: 4,
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  menuArea: {
    paddingTop: 12,
  },
  item: {
    minHeight: 60,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  itemText: {
    flex: 1,
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: '600',
  },
  activeIndicator: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: 24,
    marginVertical: 10,
  },
  logoutArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  logout: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoutText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
});
