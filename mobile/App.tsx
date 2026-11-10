import * as WebBrowser from 'expo-web-browser';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { MaterialSymbols_500Medium } from '@expo-google-fonts/material-symbols';
import { StatusBar } from 'expo-status-bar';

WebBrowser.maybeCompleteAuthSession();

import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/viewmodel/AuthContext';
import { DrawerProvider, useDrawer } from './src/viewmodel/DrawerContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function AppNavigation() {
  const { setActiveRoute } = useDrawer();
  const { isDark, theme } = useTheme();

  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: theme.colors.page,
          card: theme.colors.surface,
          text: theme.colors.ink,
          border: theme.colors.line,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.colors.page,
          card: theme.colors.surface,
          text: theme.colors.ink,
          border: theme.colors.line,
        },
      };

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer
        theme={navigationTheme}
        onStateChange={(state) => {
          const route = state?.routes[state.index ?? 0]?.name;
          if (route) setActiveRoute(route as keyof import('./src/navigation/types').RootStackParamList);
        }}
      >
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Plus Jakarta Sans': require('./assets/fonts/PlusJakartaSans.woff2'),
    MaterialSymbols_500Medium,
  });

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <DrawerProvider>
          <AppNavigation />
        </DrawerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
