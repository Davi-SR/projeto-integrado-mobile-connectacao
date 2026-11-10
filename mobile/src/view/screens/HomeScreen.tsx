import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RootStackParamList } from '../../navigation/types';
import { CategoryCarousel } from '../components/CategoryCarousel';
import { CampaignHighlightCard } from '../components/CampaignHighlightCard';
import { HomeHeader } from '../components/HomeHeader';
import { OngRecommendedCard } from '../components/OngRecommendedCard';
import { SearchBar } from '../components/SearchBar';
import { useHomeViewModel } from '../../viewmodel/useHomeViewModel';
import { useTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen(props: Props) {
  const { isDark, theme } = useTheme();

  const {
    categorias,
    categoriasLoading,
    categoriasError,
    selectedCategoriaId,
    selectedCategoriaNome,
    selecionarCategoria,
    carregarCategorias,
    search,
    setSearch,
    campanhaDestaque,
    campanhaLoading,
    campanhaError,
    ongsRecomendadas,
    ongsLoading,
    ongsError,
    favoritoIds,
    toggleFavorito,
  } = useHomeViewModel();

  const tituloSecaoOngs = search.trim()
    ? `Resultados para "${search.trim()}"`
    : selectedCategoriaNome
    ? `ONGs em ${selectedCategoriaNome}`
    : 'ONGs Recomendadas';

  const titleColor = isDark ? '#FFFFFF' : theme.colors.ink;
  const seeAllColor = isDark ? '#0AAEEE' : theme.colors.brand;
  const mutedColor = isDark ? '#9CA3AF' : theme.colors.muted;
  const activeSpinnerColor = isDark ? '#05BCAA' : theme.colors.tealDark;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#111418' : theme.colors.page }]}>
      <HomeHeader />
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBar value={search} onChangeText={setSearch} />

        <Text style={[styles.sectionTitle, { color: titleColor }]}>Categorias</Text>
        {categoriasLoading ? (
          <View style={styles.categoryState}>
            <ActivityIndicator color={activeSpinnerColor} />
          </View>
        ) : categoriasError ? (
          <View style={styles.categoryState}>
            <Text style={[styles.error, { color: mutedColor }]}>{categoriasError}</Text>
            <Pressable onPress={() => void carregarCategorias()} accessibilityRole="button">
              <Text style={[styles.retry, { color: seeAllColor }]}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <CategoryCarousel
            categorias={categorias}
            selectedCategoriaId={selectedCategoriaId}
            onSelect={selecionarCategoria}
          />
        )}

        <Text style={[styles.sectionTitle, { color: titleColor }]}>Campanha em Destaque</Text>
        {campanhaLoading ? (
          <View style={styles.contentState}>
            <ActivityIndicator color={activeSpinnerColor} />
          </View>
        ) : campanhaError ? (
          <Text style={[styles.error, { color: mutedColor }]}>{campanhaError}</Text>
        ) : campanhaDestaque ? (
          <CampaignHighlightCard
            campanha={campanhaDestaque}
            onDonate={() =>
              props.navigation.navigate('OngDetails', { ongId: campanhaDestaque.ongId })
            }
          />
        ) : (
          <Text style={[styles.empty, { color: mutedColor }]}>Nenhuma campanha ativa no momento.</Text>
        )}

        <View style={styles.ongsHeading}>
          <Text style={[styles.sectionTitle, { color: titleColor }]}>{tituloSecaoOngs}</Text>
          <Pressable
            onPress={() => props.navigation.navigate('Favoritos')}
            accessibilityRole="button"
          >
            <Text style={[styles.seeAll, { color: seeAllColor }]}>Ver Favoritas</Text>
          </Pressable>
        </View>

        {ongsLoading ? (
          <View style={styles.contentState}>
            <ActivityIndicator color={activeSpinnerColor} />
          </View>
        ) : ongsError ? (
          <Text style={[styles.error, { color: mutedColor }]}>{ongsError}</Text>
        ) : ongsRecomendadas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.empty, { color: mutedColor }]}>
              {search.trim()
                ? `Nenhuma ONG encontrada para "${search.trim()}".`
                : selectedCategoriaNome
                ? `Nenhuma ONG encontrada na categoria "${selectedCategoriaNome}".`
                : 'Nenhuma ONG disponível no momento.'}
            </Text>
            {(selectedCategoriaId !== null || search.trim().length > 0) && (
              <Pressable
                onPress={() => {
                  selecionarCategoria(null);
                  setSearch('');
                }}
                style={[
                  styles.clearFilterButton,
                  { backgroundColor: isDark ? '#0D3331' : theme.colors.activeSurface },
                ]}
              >
                <Text
                  style={[
                    styles.clearFilterText,
                    { color: isDark ? '#05BCAA' : theme.colors.tealDark },
                  ]}
                >
                  Limpar filtros
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          ongsRecomendadas.map((ong) => (
            <View key={ong.id} style={styles.ongSpacing}>
              <OngRecommendedCard
                ong={ong}
                categorias={categorias}
                isFavorite={favoritoIds.includes(ong.id)}
                onFavoritePress={() => void toggleFavorito(ong.id)}
                onProfile={() => props.navigation.navigate('OngDetails', { ongId: ong.id })}
              />
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  body: { flex: 1 },
  content: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 14,
  },
  categoryState: {
    minHeight: 56,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  contentState: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ongsHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  seeAll: {
    marginBottom: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
  },
  ongSpacing: {
    marginBottom: 20,
  },
  emptyContainer: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  empty: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    textAlign: 'center',
  },
  clearFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  clearFilterText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    fontWeight: '700',
  },
  error: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
  },
  retry: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
});
