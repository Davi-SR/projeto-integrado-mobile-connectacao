import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { RootStackParamList } from '../../navigation/types';
import { BottomNavigation } from './BottomNavigation';
import { useTheme } from '../../theme/ThemeContext';

type TabName = 'Home' | 'Buscar' | 'Doacoes' | 'Perfil';
type Props = {
  activeTab: TabName;
  navigation: NativeStackNavigationProp<RootStackParamList, TabName>;
  children: React.ReactNode;
};

export function MainTabScreen({ activeTab, navigation, children }: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.page }]}>
      <View style={styles.content}>{children}</View>
      <BottomNavigation activeTab={activeTab} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
