import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { useDoacoesViewModel } from '../../viewmodel/useDoacoesViewModel';
import { DoacoesHeader } from '../components/DoacoesHeader';
import { DoacoesHeroCard } from '../components/DoacoesHeroCard';
import { DoacoesChartCard } from '../components/DoacoesChartCard';
import { DoacoesRecentesSection } from '../components/DoacoesRecentesSection';
import { AppIcon } from '../components/HomeIcons';
import { useTheme } from '../../theme/ThemeContext';
import { baixarRelatorioDoacoesPdf } from '../../services/relatorioPdfService';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function DoacoesScreen() {
  const navigation = useNavigation<Navigation>();
  const { isDark, theme } = useTheme();

  const {
    user,
    primeiroNome,
    doacoesRecentes,
    valorTotalDoado,
    ongsApoiadasCount,
    modoFiltro,
    setModoFiltro,
    anoSelecionado,
    canRetrocederAno,
    canAvancarAno,
    avancarAno,
    retrocederAno,
    mesSelecionado,
    canRetrocederMes,
    canAvancarMes,
    setMesSelecionado,
    avancarMes,
    retrocederMes,
    semestreSelecionado,
    setSemestreSelecionado,
    selectedPointIndex,
    setSelectedPointIndex,
    chartData,
    kpis,
    isLoading,
    error,
    recarregar,
  } = useDoacoesViewModel();

  const [refreshing, setRefreshing] = React.useState(false);
  const [isBaixandoRelatorio, setIsBaixandoRelatorio] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await recarregar();
    } finally {
      setRefreshing(false);
    }
  };

  const handleBaixarRelatorio = async () => {
    if (isBaixandoRelatorio) return;
    setIsBaixandoRelatorio(true);
    try {
      const res = await baixarRelatorioDoacoesPdf({
        user,
        modoFiltro,
        anoSelecionado,
        mesSelecionado,
        kpis,
        valorTotalGeral: valorTotalDoado,
        ongsApoiadasCount,
        doacoes: doacoesRecentes,
      });

      if (!res.sucesso && res.erro) {
        Alert.alert('Aviso', res.erro);
      }
    } catch (err: any) {
      console.error('Erro ao baixar relatório:', err);
      Alert.alert('Erro', 'Não foi possível gerar o relatório de doações.');
    } finally {
      setIsBaixandoRelatorio(false);
    }
  };

  const pageBg = isDark ? '#111418' : theme.colors.page;
  const spinnerColor = isDark ? '#05BCAA' : theme.colors.tealDark;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: pageBg }]}>
      {/* 1. Cabeçalho Oficial do Usuário */}
      <DoacoesHeader user={user} primeiroNome={primeiroNome} />

      {/* 2. Conteúdo Scrollável com Pull to Refresh */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={spinnerColor} />
          <Text style={[styles.loadingText, { color: isDark ? '#9CA3AF' : theme.colors.muted }]}>
            Carregando suas doações...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <AppIcon name="error_outline" size={36} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: isDark ? '#FFFFFF' : theme.colors.ink }]}>
            {error}
          </Text>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            onPress={() => void recarregar()}
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void handleRefresh()}
              colors={[spinnerColor]}
              tintColor={spinnerColor}
            />
          }
        >
          {/* Card Hero: Valor Total Doado e ONGs Apoiadas */}
          <DoacoesHeroCard
            valorTotalDoado={valorTotalDoado}
            ongsApoiadasCount={ongsApoiadasCount}
            onDoarPress={() => navigation.navigate('Home')}
          />

          {/* Gráfico Visual: Doações com Filtros Temporais Específicos e KPIs */}
          <DoacoesChartCard
            modoFiltro={modoFiltro}
            onSelectModoFiltro={setModoFiltro}
            anoSelecionado={anoSelecionado}
            canRetrocederAno={canRetrocederAno}
            canAvancarAno={canAvancarAno}
            onAvancarAno={avancarAno}
            onRetrocederAno={retrocederAno}
            mesSelecionado={mesSelecionado}
            canRetrocederMes={canRetrocederMes}
            canAvancarMes={canAvancarMes}
            onSelectMes={setMesSelecionado}
            onAvancarMes={avancarMes}
            onRetrocederMes={retrocederMes}
            semestreSelecionado={semestreSelecionado}
            onSelectSemestre={setSemestreSelecionado}
            chartData={chartData}
            kpis={kpis}
            selectedPointIndex={selectedPointIndex}
            onSelectPoint={setSelectedPointIndex}
          />

          {/* Seção de Doações Recentes salvas no banco de dados */}
          <DoacoesRecentesSection
            doacoes={doacoesRecentes}
            onVerHistorico={() => navigation.navigate('Home')}
            onExplorarCampanhas={() => navigation.navigate('Home')}
            modoFiltro={modoFiltro}
            anoSelecionado={anoSelecionado}
            mesSelecionado={mesSelecionado}
            onBaixarRelatorio={handleBaixarRelatorio}
            isBaixandoRelatorio={isBaixandoRelatorio}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
    gap: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  loadingText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  errorText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: '#05BCAA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
