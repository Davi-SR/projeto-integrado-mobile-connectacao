import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RootStackParamList } from '../../navigation/types';
import { HomeHeader } from '../components/HomeHeader';
import { AppIcon } from '../components/HomeIcons';
import {
  OngApoiadaItem,
  usePerfilViewModel,
} from '../../viewmodel/usePerfilViewModel';
import { useTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Perfil'>;

function OngApoiadaCard({
  ong,
  onPress,
}: {
  ong: OngApoiadaItem;
  onPress: () => void;
}) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const { isDark, theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.ongCard,
        {
          backgroundColor: isDark ? '#1A1D24' : theme.colors.surface,
          borderColor: isDark ? '#242A35' : '#F1F5F9',
        },
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver perfil de ${ong.nome}`}
    >
      {/* Banner com Badge de Categoria */}
      <View style={[styles.cardBannerContainer, { backgroundColor: isDark ? '#262B35' : theme.colors.subtle }]}>
        {ong.imagemUrl && !imageFailed ? (
          <Image
            source={{ uri: ong.imagemUrl }}
            onError={() => setImageFailed(true)}
            style={styles.cardBannerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.cardBannerImage, styles.cardBannerFallback, { backgroundColor: isDark ? '#262B35' : '#E6F4F1' }]}>
            <AppIcon name="volunteer_activism" size={36} color={isDark ? '#05BCAA' : theme.colors.tealDark} />
          </View>
        )}

        <View style={[styles.categoryPill, { backgroundColor: isDark ? '#0D3331' : '#FFFFFF' }]}>
          <Text style={[styles.categoryPillText, { color: isDark ? '#05BCAA' : theme.colors.tealDark }]}>
            {ong.categoriaNome}
          </Text>
        </View>
      </View>

      {/* Conteúdo do Card */}
      <View style={styles.cardBody}>
        <Text
          style={[styles.cardOngName, { color: isDark ? '#FFFFFF' : '#0A2540' }]}
          numberOfLines={1}
        >
          {ong.nome}
        </Text>

        <View style={styles.progressHeaderRow}>
          <Text style={[styles.progressLabel, { color: isDark ? '#9CA3AF' : '#64748B' }]}>
            Progresso da meta
          </Text>
          <Text style={styles.progressPercentage}>{ong.progressoMeta}%</Text>
        </View>

        <View style={[styles.progressTrack, { backgroundColor: isDark ? '#262B35' : '#E0F2FE' }]}>
          <View style={[styles.progressFill, { width: `${ong.progressoMeta}%` }]} />
        </View>
      </View>
    </Pressable>
  );
}

export function PerfilScreen({ navigation }: Props) {
  const { isDark, theme } = useTheme();

  const {
    user,
    primeiroNome,
    totalDoadoFormatado,
    vidasImpactadas,
    ongsApoiadas,
    doacoesRecentes,
    isLoading,
    error,
    recarregar,
  } = usePerfilViewModel();

  const titleColor = isDark ? '#FFFFFF' : '#0A2540';
  const subtitleColor = isDark ? '#9CA3AF' : '#64748B';
  const seeAllColor = isDark ? '#0AAEEE' : '#05BCAA';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#111418' : theme.colors.page }]}>
      <HomeHeader />

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={recarregar}
            tintColor={isDark ? '#05BCAA' : theme.colors.tealDark}
            colors={[isDark ? '#05BCAA' : theme.colors.tealDark]}
          />
        }
      >
        {/* Identidade do Usuário */}
        <View style={styles.identitySection}>
          {user?.fotoUrl ? (
            <Image
              source={{ uri: user.fotoUrl }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: isDark ? '#0D3331' : theme.colors.activeSurface }]}>
              <Text style={[styles.avatarInitial, { color: isDark ? '#05BCAA' : theme.colors.tealDark }]}>
                {primeiroNome.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.identityText}>
            <Text style={[styles.greetingTitle, { color: titleColor }]}>Olá, {primeiroNome}</Text>
            <View style={[styles.badgeGold, { backgroundColor: isDark ? '#382806' : '#FEF3C7' }]}>
              <Text style={styles.badgeGoldText}>★ Doadora Ouro</Text>
            </View>
          </View>
        </View>

        {/* Linha de Cards de Impacto (KPIs) */}
        <View style={styles.kpiRow}>
          {/* Card 1: Vidas Impactadas */}
          <View
            style={[
              styles.kpiWhiteCard,
              {
                backgroundColor: isDark ? '#1A1D24' : theme.colors.surface,
                borderColor: isDark ? '#242A35' : '#F1F5F9',
              },
            ]}
          >
            <View style={styles.kpiTopRow}>
              <AppIcon name="favorite" size={18} color="#05BCAA" />
              <Text style={styles.kpiTealLabel}>Vidas{'\n'}Impactadas</Text>
            </View>
            <Text style={[styles.kpiBigNumber, { color: titleColor }]}>{vidasImpactadas}</Text>
            <Text style={[styles.kpiSubtitle, { color: subtitleColor }]}>Neste ano</Text>
          </View>

          {/* Card 2: Total Doado */}
          <View style={[styles.kpiBlueCard, { backgroundColor: isDark ? '#0C3866' : '#004380' }]}>
            <View style={styles.kpiTopRow}>
              <AppIcon name="payments" size={18} color="#38BDF8" />
              <Text style={[styles.kpiWhiteLabel, { color: '#E0F2FE' }]}>Total Doado</Text>
            </View>
            <Text style={styles.kpiBigNumberWhite}>{totalDoadoFormatado}</Text>
            <Text style={styles.kpiSubtitleWhite}>Histórico completo</Text>
          </View>
        </View>

        {/* Estado de Carregamento / Erro */}
        {isLoading && (
          <View style={styles.centerState}>
            <ActivityIndicator size="small" color={isDark ? '#05BCAA' : theme.colors.tealDark} />
            <Text style={[styles.loadingText, { color: subtitleColor }]}>Atualizando perfil...</Text>
          </View>
        )}

        {error && (
          <View style={[styles.errorBox, { backgroundColor: isDark ? '#2D1616' : '#FFF0F0' }]}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={recarregar} style={styles.retryBtn}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        )}

        {/* Seção ONGs Apoiadas */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeading, { color: titleColor }]}>ONGs Apoiadas</Text>
          <Pressable
            onPress={() => navigation.navigate('Buscar')}
            accessibilityRole="button"
            accessibilityLabel="Ver todas as ONGs"
          >
            <Text style={[styles.seeAllText, { color: seeAllColor }]}>Ver todas</Text>
          </Pressable>
        </View>

        {ongsApoiadas.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {ongsApoiadas.map((ong) => (
              <OngApoiadaCard
                key={ong.id}
                ong={ong}
                onPress={() => navigation.navigate('OngDetails', { ongId: ong.id })}
              />
            ))}
          </ScrollView>
        ) : (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: isDark ? '#1A1D24' : theme.colors.surface,
                borderColor: isDark ? '#242A35' : '#F1F5F9',
              },
            ]}
          >
            <Text style={[styles.emptyCardText, { color: subtitleColor }]}>
              Você ainda não fez doações para ONGs.
            </Text>
            <Pressable
              style={[
                styles.exploreBtn,
                { backgroundColor: isDark ? '#0D3331' : theme.colors.activeSurface },
              ]}
              onPress={() => navigation.navigate('Buscar')}
            >
              <Text style={[styles.exploreBtnText, { color: isDark ? '#05BCAA' : theme.colors.tealDark }]}>
                Explorar Causas
              </Text>
            </Pressable>
          </View>
        )}

        {/* Seção Histórico de Doações */}
        <View style={styles.historySectionHeader}>
          <Text style={[styles.sectionHeading, { color: titleColor }]}>Histórico de Doações</Text>
        </View>

        {doacoesRecentes.length > 0 ? (
          <View style={styles.historyList}>
            {doacoesRecentes.map((d) => (
              <View
                key={d.id}
                style={[
                  styles.historyItemCard,
                  {
                    backgroundColor: isDark ? '#1A1D24' : theme.colors.surface,
                    borderColor: isDark ? '#242A35' : '#F1F5F9',
                  },
                ]}
              >
                <View style={styles.historyLeft}>
                  <View
                    style={[
                      styles.historyIconCircle,
                      { backgroundColor: isDark ? '#133835' : '#E6F8F6' },
                    ]}
                  >
                    <AppIcon
                      name="volunteer_activism"
                      size={20}
                      color="#05BCAA"
                    />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text
                      style={[styles.historyOngName, { color: titleColor }]}
                      numberOfLines={1}
                    >
                      {d.ongNome}
                    </Text>
                    <Text style={[styles.historyDate, { color: subtitleColor }]}>
                      {d.dataFormatada}
                    </Text>
                  </View>
                </View>

                <Text style={styles.historyValue}>{d.valorFormatado}</Text>
              </View>
            ))}

            {/* Botão Ver todo o histórico */}
            <Pressable
              style={({ pressed }) => [
                styles.seeAllHistoryBtn,
                {
                  borderColor: '#05BCAA',
                  backgroundColor: isDark ? 'transparent' : 'transparent',
                },
                pressed && styles.cardPressed,
              ]}
              onPress={() => navigation.navigate('Doacoes')}
              accessibilityRole="button"
              accessibilityLabel="Ver todo o histórico"
            >
              <Text style={[styles.seeAllHistoryText, { color: isDark ? '#05BCAA' : '#006A60' }]}>
                Ver todo o histórico
              </Text>
            </Pressable>
          </View>
        ) : (
          <View
            style={[
              styles.emptyHistoryCard,
              {
                backgroundColor: isDark ? '#1A1D24' : theme.colors.surface,
                borderColor: isDark ? '#242A35' : '#F1F5F9',
              },
            ]}
          >
            <AppIcon name="receipt_long" size={32} color={subtitleColor} />
            <Text style={[styles.emptyHistoryTitle, { color: titleColor }]}>
              Nenhuma doação registrada
            </Text>
            <Text style={[styles.emptyHistorySubtitle, { color: subtitleColor }]}>
              Quando você fizer uma doação para uma campanha ou ONG, ela aparecerá aqui.
            </Text>
          </View>
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

  /* Identidade */
  identitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    gap: 16,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#05BCAA',
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#05BCAA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 24,
    fontWeight: '800',
  },
  identityText: {
    flex: 1,
    gap: 4,
  },
  greetingTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  badgeGold: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeGoldText: {
    color: '#F59E0B',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Linha de KPIs */
  kpiRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 26,
  },
  kpiWhiteCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  kpiBlueCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  kpiTealLabel: {
    color: '#05BCAA',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
  },
  kpiWhiteLabel: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '700',
  },
  kpiBigNumber: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  kpiBigNumberWhite: {
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 34,
  },
  kpiSubtitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  kpiSubtitleWhite: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },

  /* Seções */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  historySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
    marginBottom: 14,
  },
  sectionHeading: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Carrossel de ONGs */
  horizontalScroll: {
    paddingRight: 8,
    gap: 14,
  },
  ongCard: {
    width: 200,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardBannerContainer: {
    width: '100%',
    height: 110,
    position: 'relative',
  },
  cardBannerImage: {
    width: '100%',
    height: '100%',
  },
  cardBannerFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryPillText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardBody: {
    padding: 12,
  },
  cardOngName: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 11,
    fontWeight: '500',
  },
  progressPercentage: {
    color: '#FB6407',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 11,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FB6407',
    borderRadius: 3,
  },

  /* Histórico */
  historyList: {
    gap: 10,
  },
  historyItemCard: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  historyIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyInfo: {
    flex: 1,
  },
  historyOngName: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
  },
  historyDate: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  historyValue: {
    color: '#05BCAA',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: '800',
  },
  seeAllHistoryBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  seeAllHistoryText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Empty States */
  emptyCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 10,
  },
  emptyCardText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    textAlign: 'center',
  },
  exploreBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  exploreBtnText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyHistoryCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 8,
  },
  emptyHistoryTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyHistorySubtitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Status */
  centerState: {
    paddingVertical: 12,
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
    transform: [{ scale: 0.98 }],
  },
});
