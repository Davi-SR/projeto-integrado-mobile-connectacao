import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { authTheme as t } from '../../theme/authTheme';
import { useTheme } from '../../theme/ThemeContext';
import { DoacaoRecenteItem, ModoFiltro } from '../../viewmodel/useDoacoesViewModel';
import { obterTituloPeriodo } from '../../services/relatorioPdfService';
import { AppIcon, DonationIcon } from './HomeIcons';

type Props = {
  doacoes: DoacaoRecenteItem[];
  onVerHistorico?: () => void;
  onExplorarCampanhas?: () => void;
  modoFiltro?: ModoFiltro;
  anoSelecionado?: number;
  mesSelecionado?: number;
  onBaixarRelatorio?: () => void;
  isBaixandoRelatorio?: boolean;
};

export function DoacoesRecentesSection({
  doacoes,
  onVerHistorico,
  onExplorarCampanhas,
  modoFiltro = 'meses',
  anoSelecionado = 2026,
  mesSelecionado = 0,
  onBaixarRelatorio,
  isBaixandoRelatorio = false,
}: Props) {
  const [imageErrors, setImageErrors] = React.useState<Record<number, boolean>>({});
  const { isDark, theme } = useTheme();

  const handleImageError = (id: number) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const titleColor = isDark ? '#FFFFFF' : '#0A2540';
  const seeAllColor = isDark ? '#0AAEEE' : t.colors.tealDark;
  const cardBg = isDark ? '#1A1D24' : theme.colors.surface;
  const borderColor = isDark ? '#242A35' : '#F1F5F9';
  const subtitleColor = isDark ? '#9CA3AF' : '#64748B';

  const tituloRelatorio = obterTituloPeriodo(modoFiltro, anoSelecionado, mesSelecionado);
  const rotuloBotao = tituloRelatorio.rotuloBotao;

  const renderBotaoRelatorio = () => (
    <Pressable
      style={({ pressed }) => [
        styles.reportButton,
        {
          backgroundColor: cardBg,
          borderColor,
        },
        isBaixandoRelatorio && { opacity: 0.65 },
        pressed && !isBaixandoRelatorio && styles.pressed,
      ]}
      onPress={onBaixarRelatorio}
      disabled={isBaixandoRelatorio}
      accessibilityRole="button"
      accessibilityLabel={rotuloBotao}
    >
      {isBaixandoRelatorio ? (
        <ActivityIndicator size="small" color={isDark ? '#0AAEEE' : t.colors.brand} />
      ) : (
        <AppIcon name="download" size={18} color={isDark ? '#0AAEEE' : t.colors.brand} />
      )}
      <Text style={[styles.reportButtonText, { color: isDark ? '#CBD5E1' : t.colors.brand }]}>
        {isBaixandoRelatorio ? 'Gerando Relatório PDF...' : rotuloBotao}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.section}>
      {/* Cabeçalho da Seção */}
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: titleColor }]}>Doações Recentes</Text>
        {doacoes.length > 0 && (
          <Pressable
            onPress={onVerHistorico}
            accessibilityRole="button"
            style={({ pressed }) => [styles.seeAllButton, pressed && styles.pressed]}
          >
            <Text style={[styles.seeAllText, { color: seeAllColor }]}>VER HISTÓRICO</Text>
          </Pressable>
        )}
      </View>

      {/* Lista de Doações Recentes */}
      {doacoes.length === 0 ? (
        <View style={styles.list}>
          <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? '#0D3331' : '#E6F8F6' }]}>
              <AppIcon name="volunteer_activism" size={32} color={isDark ? '#05BCAA' : t.colors.tealDark} />
            </View>
            <Text style={[styles.emptyTitle, { color: titleColor }]}>Nenhuma doação no histórico</Text>
            <Text style={[styles.emptyMessage, { color: subtitleColor }]}>
              As doações que você realizar para campanhas sociais ficarão salvas e listadas aqui.
            </Text>
            {onExplorarCampanhas && (
              <Pressable
                style={({ pressed }) => [
                  styles.exploreButton,
                  { backgroundColor: isDark ? '#0D3331' : t.colors.activeSurface },
                  pressed && styles.pressed,
                ]}
                onPress={onExplorarCampanhas}
                accessibilityRole="button"
              >
                <Text style={[styles.exploreButtonText, { color: isDark ? '#05BCAA' : t.colors.tealDark }]}>Explorar Causas</Text>
              </Pressable>
            )}
          </View>
          {onBaixarRelatorio && renderBotaoRelatorio()}
        </View>
      ) : (
        <View style={styles.list}>
          {doacoes.map((item) => {
            const hasValidImage = Boolean(item.imagemUrl && !imageErrors[item.id]);

            return (
              <View key={item.id} style={[styles.donationCard, { backgroundColor: cardBg, borderColor }]}>
                {/* Ícone / Imagem da ONG */}
                <View style={[styles.imageWrapper, { backgroundColor: isDark ? '#262B35' : '#F3F4F6' }]}>
                  {hasValidImage && item.imagemUrl ? (
                    <Image
                      source={{ uri: item.imagemUrl }}
                      onError={() => handleImageError(item.id)}
                      style={styles.ongImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.fallbackIcon}>
                      <DonationIcon active color={isDark ? '#05BCAA' : t.colors.tealDark} />
                    </View>
                  )}
                </View>

                {/* Informações da Doação: Título e Data */}
                <View style={styles.infoWrapper}>
                  <Text numberOfLines={1} style={[styles.donationTitle, { color: titleColor }]}>
                    {item.titulo}
                  </Text>
                  <Text style={[styles.donationDate, { color: subtitleColor }]}>{item.dataFormatada}</Text>
                </View>

                {/* Valor e Badge de Status */}
                <View style={styles.valueWrapper}>
                  <Text style={[styles.donationValue, { color: titleColor }]}>{item.valorFormatado}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      item.statusColor === 'concluida' && (isDark ? styles.statusBadgeSuccessDark : styles.statusBadgeSuccess),
                      item.statusColor === 'pendente' && (isDark ? styles.statusBadgePendingDark : styles.statusBadgePending),
                      item.statusColor === 'cancelada' && (isDark ? styles.statusBadgeErrorDark : styles.statusBadgeError),
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        item.statusColor === 'concluida' && (isDark ? { color: '#05BCAA' } : styles.statusTextSuccess),
                        item.statusColor === 'pendente' && (isDark ? { color: '#FB6407' } : styles.statusTextPending),
                        item.statusColor === 'cancelada' && (isDark ? { color: '#EF4444' } : styles.statusTextError),
                      ]}
                    >
                      {item.statusLabel}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Botão de Download de Relatório */}
          {onBaixarRelatorio && renderBotaoRelatorio()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 4,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  list: {
    gap: 12,
  },
  donationCard: {
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  imageWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ongImage: {
    width: '100%',
    height: '100%',
  },
  fallbackIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoWrapper: {
    flex: 1,
    gap: 2,
  },
  donationTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '700',
  },
  donationDate: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '500',
  },
  valueWrapper: {
    alignItems: 'flex-end',
    gap: 4,
  },
  donationValue: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeSuccess: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeSuccessDark: {
    backgroundColor: '#0D3331',
  },
  statusBadgePending: {
    backgroundColor: '#FFFBEB',
  },
  statusBadgePendingDark: {
    backgroundColor: '#382806',
  },
  statusBadgeError: {
    backgroundColor: '#FEF2F2',
  },
  statusBadgeErrorDark: {
    backgroundColor: '#2D1616',
  },
  statusBadgeText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  statusTextSuccess: {
    color: '#059669',
  },
  statusTextPending: {
    color: '#D97706',
  },
  statusTextError: {
    color: '#DC2626',
  },
  reportButton: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  reportButtonText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 10,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyMessage: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  exploreButton: {
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  exploreButtonText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
