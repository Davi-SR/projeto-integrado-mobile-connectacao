import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RootStackParamList } from '../../navigation/types';
import { authTheme as t } from '../../theme/authTheme';
import { HomeHeader } from '../components/HomeHeader';
import { SearchBar } from '../components/SearchBar';
import { CategoryCarousel } from '../components/CategoryCarousel';
import { OngRecommendedCard } from '../components/OngRecommendedCard';
import { AppIcon, CategoryIcon } from '../components/HomeIcons';
import {
  TipoFiltroBuscar,
  useBuscarViewModel,
} from '../../viewmodel/useBuscarViewModel';
import { CampanhaDestaque } from '../../model/entities/CampanhaDestaque';
import { useTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Buscar'>;

const SUGESTOES_POPULARES = [
  { label: '🐾 Animais', query: 'animal' },
  { label: '🍲 Combate à Fome', query: 'alimento' },
  { label: '🌳 Sustentabilidade', query: 'ambiente' },
  { label: '🎓 Apoio Escolar', query: 'educ' },
  { label: '🏥 Saúde & Cuidados', query: 'saúde' },
];

function CampanhaBuscarCard({
  campanha,
  onPress,
}: {
  campanha: CampanhaDestaque;
  onPress: () => void;
}) {
  const { isDark, theme } = useTheme();

  const metaVal = campanha.meta || 0;
  const arrecadadoVal = campanha.valorArrecadado || 0;
  const percentual = Math.min(
    100,
    Math.max(0, Math.round(campanha.percentualMeta || 0)),
  );

  const cardBg = isDark ? '#1A1D24' : theme.colors.surface;
  const borderColor = isDark ? '#242A35' : '#F1F5F9';
  const titleColor = isDark ? '#FFFFFF' : '#0A2540';
  const subtitleColor = isDark ? '#9CA3AF' : t.colors.muted;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.campanhaCard,
        { backgroundColor: cardBg, borderColor },
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.campanhaCardTop}>
        <View style={styles.campanhaInfo}>
          <Text style={[styles.campanhaTitle, { color: titleColor }]} numberOfLines={2}>
            {campanha.titulo}
          </Text>
          {campanha.ongNome && (
            <Text style={[styles.campanhaOngNome, { color: subtitleColor }]} numberOfLines={1}>
              Por {campanha.ongNome}
            </Text>
          )}
        </View>
        <View style={[styles.percentBadge, { backgroundColor: isDark ? '#0D3331' : '#E6F8F6' }]}>
          <Text style={[styles.percentText, { color: isDark ? '#05BCAA' : t.colors.tealDark }]}>{percentual}%</Text>
        </View>
      </View>

      {/* Barra de Progresso */}
      <View style={[styles.progressTrack, { backgroundColor: isDark ? '#262B35' : '#E0F2FE' }]}>
        <View style={[styles.progressFill, { width: `${percentual}%` }]} />
      </View>

      {/* Valores e Ação */}
      <View style={styles.campanhaFooter}>
        <Text style={[styles.campanhaValor, { color: subtitleColor }]}>
          R${' '}
          {arrecadadoVal.toLocaleString('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}{' '}
          de R${' '}
          {metaVal.toLocaleString('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
        <View style={[styles.doarMiniBtn, { backgroundColor: isDark ? '#0D3331' : '#E6F8F6' }]}>
          <AppIcon name="volunteer_activism" size={14} color={isDark ? '#05BCAA' : t.colors.tealDark} />
          <Text style={[styles.doarMiniText, { color: isDark ? '#05BCAA' : t.colors.tealDark }]}>Apoiar</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function BuscarScreen({ navigation }: Props) {
  const { isDark, theme } = useTheme();

  const {
    search,
    setSearch,
    selectedCategoriaId,
    selectedCategoriaNome,
    selecionarCategoria,
    tipoFiltro,
    setTipoFiltro,
    categorias,
    ongsFiltradas,
    campanhasFiltradas,
    contagemPorCategoria,
    totalResultados,
    favoritoIds,
    toggleFavorito,
    isLoading,
    error,
    recarregar,
  } = useBuscarViewModel();

  const filtrosTipo: Array<{ tipo: TipoFiltroBuscar; label: string }> = [
    { tipo: 'TUDO', label: 'Tudo' },
    { tipo: 'ONGS', label: 'ONGs' },
    { tipo: 'CAMPANHAS', label: 'Campanhas' },
    { tipo: 'FAVORITAS', label: 'Favoritas' },
  ];

  const emModoExploracao =
    search.trim().length === 0 &&
    selectedCategoriaId === null &&
    tipoFiltro === 'TUDO';

  const pageBg = isDark ? '#111418' : t.colors.page;
  const titleColor = isDark ? '#FFFFFF' : t.colors.ink;
  const subtitleColor = isDark ? '#9CA3AF' : t.colors.muted;
  const cardBg = isDark ? '#1A1D24' : t.colors.surface;
  const borderColor = isDark ? '#242A35' : '#F1F5F9';
  const spinnerColor = isDark ? '#05BCAA' : t.colors.tealDark;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: pageBg }]}>
      <HomeHeader />

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={recarregar}
            tintColor={spinnerColor}
            colors={[spinnerColor]}
          />
        }
      >
        {/* Barra de Busca Unificada */}
        <View style={styles.searchSection}>
          <SearchBar value={search} onChangeText={setSearch} />
        </View>

        {/* Abas / Tipos de Filtro */}
        <View style={styles.tabsRow}>
          {filtrosTipo.map((f) => {
            const isActive = tipoFiltro === f.tipo;
            return (
              <Pressable
                key={f.tipo}
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: isActive
                      ? (isDark ? '#0D3331' : t.colors.activeSurface)
                      : (isDark ? '#1A1D24' : t.colors.surface),
                    borderColor: isActive
                      ? (isDark ? '#05BCAA' : t.colors.tealDark)
                      : (isDark ? '#2E3543' : t.colors.inputBorder),
                  },
                ]}
                onPress={() => setTipoFiltro(f.tipo)}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    {
                      color: isActive
                        ? (isDark ? '#05BCAA' : t.colors.tealDark)
                        : (isDark ? '#CBD5E1' : t.colors.text),
                    },
                    isActive && styles.tabButtonTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Carrossel de Categorias */}
        <View style={styles.categorySection}>
          <CategoryCarousel
            categorias={categorias}
            selectedCategoriaId={selectedCategoriaId}
            onSelect={selecionarCategoria}
          />
        </View>

        {/* Estado de Carregamento */}
        {isLoading && (
          <View style={styles.centerState}>
            <ActivityIndicator size="small" color={spinnerColor} />
            <Text style={[styles.loadingText, { color: subtitleColor }]}>Atualizando resultados...</Text>
          </View>
        )}

        {/* Estado de Erro */}
        {error && (
          <View style={[styles.errorBox, { backgroundColor: isDark ? '#2D1616' : '#FFF0F0' }]}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={recarregar} style={styles.retryBtn}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        )}

        {/* Modo Exploração: Tags Populares e Grade de Categorias */}
        {!isLoading && emModoExploracao && (
          <>
            {/* Sugestões Populares */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: titleColor }]}>Sugestões Populares</Text>
            </View>
            <View style={styles.sugestoesRow}>
              {SUGESTOES_POPULARES.map((sug) => (
                <Pressable
                  key={sug.label}
                  style={[
                    styles.sugestaoChip,
                    {
                      backgroundColor: cardBg,
                      borderColor: isDark ? '#2E3543' : '#E2E8F0',
                    },
                  ]}
                  onPress={() => setSearch(sug.query)}
                >
                  <Text style={[styles.sugestaoChipText, { color: isDark ? '#CBD5E1' : '#334155' }]}>{sug.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Grid de Exploração por Categorias */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: titleColor }]}>Explorar por Causa</Text>
            </View>
            <View style={styles.categoryGrid}>
              {categorias.map((cat) => {
                const count = contagemPorCategoria[cat.id] || 0;
                return (
                  <Pressable
                    key={cat.id}
                    style={[styles.gridCard, { backgroundColor: cardBg, borderColor }]}
                    onPress={() => selecionarCategoria(cat.id)}
                  >
                    <View style={[styles.gridIconCircle, { backgroundColor: isDark ? '#0D3331' : t.colors.activeSurface }]}>
                      <CategoryIcon
                        color={isDark ? '#05BCAA' : undefined}
                        type={
                          cat.nome.toLowerCase().includes('educ')
                            ? 'education'
                            : cat.nome.toLowerCase().includes('saude') ||
                              cat.nome.toLowerCase().includes('saúde')
                            ? 'health'
                            : cat.nome.toLowerCase().includes('ambiente') ||
                              cat.nome.toLowerCase().includes('animal')
                            ? 'environment'
                            : cat.nome.toLowerCase().includes('comun') ||
                              cat.nome.toLowerCase().includes('social')
                            ? 'community'
                            : 'default'
                        }
                      />
                    </View>
                    <Text style={[styles.gridTitle, { color: titleColor }]} numberOfLines={1}>
                      {cat.nome}
                    </Text>
                    <Text style={[styles.gridCount, { color: subtitleColor }]}>
                      {count} {count === 1 ? 'ONG' : 'ONGs'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* Resultados da Busca / Filtro */}
        {!isLoading && (
          <>
            {/* Cabeçalho de Resultados com Contador */}
            <View style={styles.resultsHeader}>
              <Text style={[styles.sectionTitle, { color: titleColor }]}>
                {search.trim()
                  ? `Resultados para "${search.trim()}"`
                  : selectedCategoriaNome
                  ? `Causas em ${selectedCategoriaNome}`
                  : tipoFiltro === 'FAVORITAS'
                  ? 'Minhas ONGs Favoritas'
                  : 'Todas as Causas e ONGs'}
              </Text>
              <Text style={[styles.resultsCountBadge, { backgroundColor: isDark ? '#0D3331' : t.colors.activeSurface, color: isDark ? '#05BCAA' : t.colors.tealDark }]}>
                {totalResultados} {totalResultados === 1 ? 'item' : 'itens'}
              </Text>
            </View>

            {/* Empty State */}
            {totalResultados === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? '#262B35' : '#F3F4F6' }]}>
                  <AppIcon name="search_off" size={32} color={subtitleColor} />
                </View>
                <Text style={[styles.emptyTitle, { color: titleColor }]}>Nenhum resultado encontrado</Text>
                <Text style={[styles.emptySubtitle, { color: subtitleColor }]}>
                  {search.trim()
                    ? `Não encontramos nenhuma ONG ou campanha para "${search.trim()}".`
                    : 'Tente selecionar outra categoria ou limpar os filtros aplicados.'}
                </Text>
                <Pressable
                  style={[styles.clearAllBtn, { backgroundColor: isDark ? '#0D3331' : t.colors.activeSurface }]}
                  onPress={() => {
                    setSearch('');
                    selecionarCategoria(null);
                    setTipoFiltro('TUDO');
                  }}
                >
                  <Text style={[styles.clearAllText, { color: isDark ? '#05BCAA' : t.colors.tealDark }]}>Limpar todos os filtros</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {/* Seção de Campanhas Encontradas */}
                {campanhasFiltradas.length > 0 && (
                  <View style={styles.groupSection}>
                    <Text style={[styles.subGroupTitle, { color: subtitleColor }]}>Campanhas em Andamento</Text>
                    {campanhasFiltradas.map((campanha) => (
                      <CampanhaBuscarCard
                        key={campanha.id}
                        campanha={campanha}
                        onPress={() =>
                          navigation.navigate('OngDetails', { ongId: campanha.ongId })
                        }
                      />
                    ))}
                  </View>
                )}

                {/* Seção de ONGs Encontradas */}
                {ongsFiltradas.length > 0 && (
                  <View style={styles.groupSection}>
                    {campanhasFiltradas.length > 0 && (
                      <Text style={[styles.subGroupTitle, { color: subtitleColor }]}>ONGs & Instituições</Text>
                    )}
                    {ongsFiltradas.map((ong) => (
                      <View key={ong.id} style={styles.ongSpacing}>
                        <OngRecommendedCard
                          ong={ong}
                          categorias={categorias}
                          isFavorite={favoritoIds.includes(ong.id)}
                          onFavoritePress={() => void toggleFavorito(ong.id)}
                          onProfile={() =>
                            navigation.navigate('OngDetails', { ongId: ong.id })
                          }
                        />
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  searchSection: {
    marginBottom: 14,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {},
  tabButtonText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    fontWeight: '800',
  },
  categorySection: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 18,
    fontWeight: '800',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 14,
  },
  resultsCountBadge: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sugestoesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  sugestaoChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sugestaoChipText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 22,
  },
  gridCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  gridIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  gridTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  gridCount: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '500',
  },
  groupSection: {
    marginBottom: 16,
  },
  subGroupTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 10,
    marginTop: 6,
  },
  ongSpacing: {
    marginBottom: 20,
  },

  /* Campanha Card */
  campanhaCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  campanhaCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  campanhaInfo: {
    flex: 1,
  },
  campanhaTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  campanhaOngNome: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    marginTop: 3,
  },
  percentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FB6407',
    borderRadius: 3,
  },
  campanhaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  campanhaValor: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '600',
  },
  doarMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  doarMiniText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Empty State */
  emptyContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  clearAllBtn: {
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  clearAllText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Status */
  centerState: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  loadingText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
  },
  errorBox: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  errorText: {
    color: '#EF4444',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EF4444',
  },
  retryText: {
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '700',
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});
