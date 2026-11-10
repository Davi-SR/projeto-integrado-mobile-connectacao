import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { authTheme as t } from '../../theme/authTheme';
import { AppIcon } from '../components/HomeIcons';
import { PixPaymentModal } from '../components/PixPaymentModal';
import { useOngDetailsViewModel } from '../../viewmodel/useOngDetailsViewModel';
import { useTheme } from '../../theme/ThemeContext';
import { gerarPixCopiaECola } from '../../services/pixHelper';

type Props = NativeStackScreenProps<RootStackParamList, 'OngDetails'>;

const VALORES_PREDEFINIDOS = [20, 50, 100, 200];

export function OngDetailsScreen({ navigation, route }: Props) {
  const { isDark, theme } = useTheme();

  const {
    ong,
    campanhas,
    categoriaNome,
    isLoading,
    error,
    realizarDoacao,
    confirmarDoacao,
    recarregar,
  } = useOngDetailsViewModel(route.params.ongId);

  const [imageFailed, setImageFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  // Modal de Doação
  const [modalVisible, setModalVisible] = useState(false);
  const [valorSelecionado, setValorSelecionado] = useState<number>(50);
  const [valorCustomizado, setValorCustomizado] = useState<string>('');
  const [formaPagamento, setFormaPagamento] = useState<'PIX' | 'CARTAO'>('PIX');
  const [campanhaSelecionadaId, setCampanhaSelecionadaId] = useState<number | null>(null);
  const [doando, setDoando] = useState(false);

  // Modal Interativo de Pagamento PIX
  const [pixModalVisible, setPixModalVisible] = useState(false);
  const [pixDados, setPixDados] = useState<{
    copiaECola: string;
    qrCodeUrl: string;
    valor: number;
    doacaoId: number | null;
    campanhaTitulo?: string;
  }>({
    copiaECola: '',
    qrCodeUrl: '',
    valor: 0,
    doacaoId: null,
    campanhaTitulo: '',
  });

  const handleShare = async () => {
    if (!ong) return;
    try {
      await Share.share({
        title: ong.nome,
        message: `Conheça a ONG ${ong.nome} no ConectAção! Juntos fazemos a diferença.`,
      });
    } catch (err) {
      console.warn('Erro ao compartilhar:', err);
    }
  };

  const abrirModalDoacao = (campanhaId?: number) => {
    if (campanhaId) {
      setCampanhaSelecionadaId(campanhaId);
    } else if (campanhas.length > 0) {
      setCampanhaSelecionadaId(campanhas[0].id);
    } else {
      setCampanhaSelecionadaId(null);
    }
    setModalVisible(true);
  };

  const handleConfirmarDoacao = async () => {
    const valorFinal = valorCustomizado ? parseFloat(valorCustomizado.replace(',', '.')) : valorSelecionado;
    if (!valorFinal || isNaN(valorFinal) || valorFinal <= 0) {
      Alert.alert('Valor inválido', 'Por favor, informe um valor válido para a doação.');
      return;
    }

    const campanhaId = campanhaSelecionadaId ?? (campanhas.length > 0 ? campanhas[0].id : null);
    if (!campanhaId) {
      Alert.alert('Campanha Indisponível', 'Não há campanhas ativas para receber doações no momento.');
      return;
    }

    const campanhaObj = campanhas.find((c) => c.id === campanhaId);

    setDoando(true);
    try {
      const doacaoCriada = await realizarDoacao(campanhaId, valorFinal, formaPagamento);
      setModalVisible(false);
      setValorCustomizado('');

      if (formaPagamento === 'PIX') {
        let copiaECola = doacaoCriada?.pixCopiaECola;
        let qrCodeUrl = doacaoCriada?.pixQrCodeUrl;

        if (!copiaECola || !qrCodeUrl) {
          const gerado = gerarPixCopiaECola({
            valor: valorFinal,
            txId: doacaoCriada?.id ? `DOA${doacaoCriada.id}` : '***',
            nome: ong?.nome,
          });
          copiaECola = gerado.copiaECola;
          qrCodeUrl = gerado.qrCodeUrl;
        }

        setPixDados({
          copiaECola,
          qrCodeUrl,
          valor: valorFinal,
          doacaoId: doacaoCriada?.id ?? null,
          campanhaTitulo: campanhaObj?.titulo,
        });
        setPixModalVisible(true);
      } else {
        Alert.alert(
          'Doação Realizada com Sucesso! 🎉',
          `Muito obrigado! Sua doação de R$ ${valorFinal.toFixed(2).replace('.', ',')} para ${ong?.nome} foi confirmada.`,
        );
      }
    } catch (err) {
      Alert.alert('Erro ao Doar', err instanceof Error ? err.message : 'Não foi possível processar a doação.');
    } finally {
      setDoando(false);
    }
  };

  const pageBg = isDark ? '#111418' : theme.colors.page;
  const topBarBg = isDark ? '#121418' : theme.colors.surface;
  const topBarBorder = isDark ? '#242A35' : 'rgba(0, 0, 0, 0.05)';
  const topBarTitleColor = isDark ? '#0AAEEE' : theme.colors.tealDark;
  const topBarIconColor = isDark ? '#05BCAA' : theme.colors.tealDark;
  const cardBg = isDark ? '#1A1D24' : '#FFFFFF';
  const cardBorder = isDark ? '#242A35' : '#F1F5F9';
  const titleColor = isDark ? '#FFFFFF' : '#0A2540';
  const textColor = isDark ? '#CBD5E1' : '#334155';
  const subtitleColor = isDark ? '#9CA3AF' : '#64748B';

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: pageBg }]}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={isDark ? '#05BCAA' : theme.colors.tealDark} />
          <Text style={[styles.loadingText, { color: subtitleColor }]}>Carregando perfil da ONG...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !ong) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: pageBg }]}>
        <View style={styles.centerState}>
          <AppIcon name="error_outline" size={40} color={theme.colors.error} />
          <Text style={[styles.errorTitle, { color: titleColor }]}>Não foi possível carregar esta ONG.</Text>
          <Pressable onPress={() => void recarregar()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </Pressable>
          <Pressable onPress={() => navigation.goBack()} style={styles.backLink}>
            <Text style={[styles.backLinkText, { color: isDark ? '#0AAEEE' : theme.colors.tealDark }]}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const localizacao = [ong.cidade, ong.estado].filter(Boolean).join(', ') || 'São Paulo, SP';
  const categoria = categoriaNome || 'Educação';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: pageBg }]}>
      {/* 1) Barra de Topo Padronizada */}
      <View style={[styles.topBar, { backgroundColor: topBarBg, borderBottomColor: topBarBorder }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <AppIcon name="arrow_back" size={24} color={topBarIconColor} />
        </Pressable>

        <Text style={[styles.topBarTitle, { color: topBarTitleColor }]}>ConectAção</Text>

        <Pressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Compartilhar"
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <AppIcon name="share" size={22} color={topBarIconColor} />
        </Pressable>
      </View>

      {/* Conteúdo com Scroll */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2) Banner Principal com Badge de Categoria */}
        <View style={[styles.bannerContainer, { backgroundColor: isDark ? '#262B35' : theme.colors.subtle }]}>
          {ong.imagemUrl && !imageFailed ? (
            <Image
              source={{ uri: ong.imagemUrl }}
              onError={() => setImageFailed(true)}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.bannerImage, styles.bannerFallback, { backgroundColor: isDark ? '#262B35' : '#E6F4F1' }]}>
              <AppIcon name="volunteer_activism" size={56} color={isDark ? '#05BCAA' : theme.colors.tealDark} />
            </View>
          )}

          {/* Badge flutuante no canto inferior esquerdo */}
          <View style={[styles.categoryBadge, { backgroundColor: isDark ? '#0D3331' : '#FFFFFF' }]}>
            <Text style={[styles.categoryBadgeText, { color: isDark ? '#05BCAA' : theme.colors.tealDark }]}>
              {categoria}
            </Text>
          </View>
        </View>

        {/* 3) Identidade da ONG (Logo + Nome + Localização) */}
        <View style={styles.identityRow}>
          <View style={[styles.logoCircle, { backgroundColor: isDark ? '#1A1D24' : '#FFFFFF', borderColor: cardBorder }]}>
            {ong.imagemUrl && !logoFailed ? (
              <Image
                source={{ uri: ong.imagemUrl }}
                onError={() => setLogoFailed(true)}
                style={styles.logoImage}
                resizeMode="cover"
              />
            ) : (
              <AppIcon name="domain" size={28} color={isDark ? '#05BCAA' : theme.colors.tealDark} />
            )}
          </View>

          <View style={styles.identityInfo}>
            <Text style={[styles.ongName, { color: titleColor }]}>{ong.nome}</Text>
            <View style={styles.locationRow}>
              <AppIcon name="location_on" size={16} color={subtitleColor} />
              <Text style={[styles.locationText, { color: subtitleColor }]}>{localizacao}</Text>
            </View>
          </View>
        </View>

        {/* 4) Card "Sobre Nós" */}
        <View style={[styles.aboutCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.aboutHeader}>
            <AppIcon name="info" size={20} color={isDark ? '#05BCAA' : theme.colors.tealDark} />
            <Text style={[styles.aboutTitle, { color: titleColor }]}>Sobre Nós</Text>
          </View>
          <Text style={[styles.aboutBody, { color: textColor }]}>
            {ong.descricao?.trim() ||
              'Dedicamo-nos a transformar realidades e gerar impacto positivo através de ações solidárias, educação inovadora e capacitação comunitária.'}
          </Text>
        </View>

        {/* 5) Seção "Transparência e Impacto" */}
        <View style={styles.transparencySection}>
          <Text style={[styles.sectionHeading, { color: titleColor }]}>Transparência e Impacto</Text>

          {campanhas.length > 0 ? (
            campanhas.map((campanha) => {
              const metaVal = campanha.meta || 0;
              const arrecadadoVal = campanha.valorArrecadado || 0;
              const percentual = Math.min(100, Math.max(0, Math.round(campanha.percentualMeta || 0)));

              return (
                <Pressable
                  key={campanha.id}
                  style={({ pressed }) => [
                    styles.impactCard,
                    { backgroundColor: cardBg, borderColor: cardBorder },
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() => abrirModalDoacao(campanha.id)}
                >
                  <View style={styles.impactCardHeader}>
                    <Text style={[styles.impactCardTitle, { color: titleColor }]} numberOfLines={1}>
                      {campanha.titulo}
                    </Text>
                    <Text style={[styles.impactPercentage, { color: isDark ? '#0AAEEE' : theme.colors.tealDark }]}>
                      {percentual}% Atingido
                    </Text>
                  </View>

                  {/* Barra de Progresso Laranja */}
                  <View style={[styles.progressTrack, { backgroundColor: isDark ? '#262B35' : '#E0F2FE' }]}>
                    <View style={[styles.progressFill, { width: `${percentual}%` }]} />
                  </View>

                  {/* Detalhes do Valor */}
                  <Text style={[styles.impactDetails, { color: subtitleColor }]}>
                    {arrecadadoVal > 0 || metaVal > 0
                      ? `R$ ${arrecadadoVal.toLocaleString('pt-BR', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })} arrecadados de R$ ${metaVal.toLocaleString('pt-BR', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}`
                      : 'Campanha em andamento para a comunidade'}
                  </Text>
                </Pressable>
              );
            })
          ) : (
            <View style={[styles.impactCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={styles.impactCardHeader}>
                <Text style={[styles.impactCardTitle, { color: titleColor }]}>Transparência e Prestação de Contas</Text>
              </View>
              <Text style={[styles.impactDetails, { color: subtitleColor }]}>
                Esta ONG ainda não possui campanhas com metas financeiras abertas no momento.
              </Text>
            </View>
          )}
        </View>

        {/* 6) Card de Depoimento / Citação */}
        <View style={[styles.quoteCard, { backgroundColor: isDark ? '#0C233C' : '#003366' }]}>
          <Text style={[styles.quoteWatermark, isDark && { color: 'rgba(56, 189, 248, 0.16)' }]}>”</Text>
          <Text style={styles.quoteText}>
            "Graças ao apoio contínuo, conseguimos oferecer um futuro promissor para centenas de jovens da nossa comunidade."
          </Text>
          <Text style={[styles.quoteAuthor, { color: '#38BDF8' }]}>— Maria Silva, Diretora</Text>
        </View>
      </ScrollView>

      {/* 7) Barra Fixa Inferior de Ação (Sticky CTA) */}
      <View style={[styles.stickyBottom, { backgroundColor: topBarBg, borderTopColor: topBarBorder }]}>
        <Pressable
          style={({ pressed }) => [styles.donateButton, pressed && styles.donateButtonPressed]}
          onPress={() => abrirModalDoacao()}
          accessibilityRole="button"
          accessibilityLabel="Quero Doar"
        >
          <AppIcon name="volunteer_activism" size={22} color="#FFFFFF" />
          <Text style={styles.donateButtonText}>Quero Doar</Text>
        </Pressable>
      </View>

      {/* Modal de Doação Rápida */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, isDark && { backgroundColor: 'rgba(0, 0, 0, 0.75)' }]}>
          <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
          <View style={[styles.modalSheet, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: titleColor }]}>Fazer uma Doação</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <AppIcon name="close" size={22} color={isDark ? '#CBD5E1' : theme.colors.text} />
              </Pressable>
            </View>

            <Text style={[styles.modalSubtitle, { color: subtitleColor }]}>
              Destino: <Text style={[styles.modalOngName, { color: isDark ? '#05BCAA' : theme.colors.tealDark }]}>{ong.nome}</Text>
            </Text>

            {/* Seleção de Valor Predefinido */}
            <Text style={[styles.modalLabel, { color: titleColor }]}>Selecione o valor:</Text>
            <View style={styles.presetsRow}>
              {VALORES_PREDEFINIDOS.map((val) => {
                const isSelected = valorSelecionado === val && !valorCustomizado;
                return (
                  <Pressable
                    key={val}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: isDark ? (isSelected ? '#0AAEEE' : '#262B35') : (isSelected ? '#E6F8F6' : '#F8FAFC'),
                        borderColor: isDark ? (isSelected ? '#0AAEEE' : '#2E3543') : (isSelected ? theme.colors.tealDark : '#E2E8F0'),
                      },
                    ]}
                    onPress={() => {
                      setValorSelecionado(val);
                      setValorCustomizado('');
                    }}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        { color: isDark ? '#FFFFFF' : (isSelected ? theme.colors.tealDark : '#334155') },
                        isSelected && styles.presetTextActive,
                      ]}
                    >
                      R$ {val}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Outro Valor */}
            <View style={styles.customValueRow}>
              <Text style={[styles.customValueLabel, { color: subtitleColor }]}>Ou digite outro valor:</Text>
              <View
                style={[
                  styles.customInputContainer,
                  {
                    backgroundColor: isDark ? '#262B35' : '#F8FAFC',
                    borderColor: isDark ? '#2E3543' : '#E2E8F0',
                  },
                ]}
              >
                <Text style={[styles.currencyPrefix, { color: subtitleColor }]}>R$</Text>
                <TextInput
                  style={[styles.customInput, { color: isDark ? '#FFFFFF' : '#0A2540' }]}
                  placeholder="0,00"
                  keyboardType="numeric"
                  value={valorCustomizado}
                  onChangeText={(txt) => setValorCustomizado(txt)}
                  placeholderTextColor={isDark ? '#6B7280' : theme.colors.muted}
                />
              </View>
            </View>

            {/* Forma de Pagamento */}
            <Text style={[styles.modalLabel, { color: titleColor }]}>Forma de Pagamento:</Text>
            <View style={styles.paymentRow}>
              <Pressable
                style={[
                  styles.paymentOption,
                  {
                    backgroundColor: isDark
                      ? (formaPagamento === 'PIX' ? '#133835' : '#262B35')
                      : (formaPagamento === 'PIX' ? '#E6F8F6' : '#F8FAFC'),
                    borderColor: isDark
                      ? (formaPagamento === 'PIX' ? '#0AAEEE' : '#2E3543')
                      : (formaPagamento === 'PIX' ? theme.colors.tealDark : '#E2E8F0'),
                  },
                ]}
                onPress={() => setFormaPagamento('PIX')}
              >
                <AppIcon
                  name="qr_code_2"
                  size={20}
                  color={formaPagamento === 'PIX' ? (isDark ? '#0AAEEE' : theme.colors.tealDark) : subtitleColor}
                />
                <Text
                  style={[
                    styles.paymentOptionText,
                    {
                      color: formaPagamento === 'PIX'
                        ? (isDark ? '#0AAEEE' : theme.colors.tealDark)
                        : (isDark ? '#CBD5E1' : '#64748B'),
                    },
                  ]}
                >
                  PIX
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.paymentOption,
                  {
                    backgroundColor: isDark
                      ? (formaPagamento === 'CARTAO' ? '#133835' : '#262B35')
                      : (formaPagamento === 'CARTAO' ? '#E6F8F6' : '#F8FAFC'),
                    borderColor: isDark
                      ? (formaPagamento === 'CARTAO' ? '#0AAEEE' : '#2E3543')
                      : (formaPagamento === 'CARTAO' ? theme.colors.tealDark : '#E2E8F0'),
                  },
                ]}
                onPress={() => setFormaPagamento('CARTAO')}
              >
                <AppIcon
                  name="credit_card"
                  size={20}
                  color={formaPagamento === 'CARTAO' ? (isDark ? '#0AAEEE' : theme.colors.tealDark) : subtitleColor}
                />
                <Text
                  style={[
                    styles.paymentOptionText,
                    {
                      color: formaPagamento === 'CARTAO'
                        ? (isDark ? '#0AAEEE' : theme.colors.tealDark)
                        : (isDark ? '#CBD5E1' : '#64748B'),
                    },
                  ]}
                >
                  Cartão
                </Text>
              </Pressable>
            </View>

            {/* Botão de Confirmação */}
            <Pressable
              style={({ pressed }) => [
                styles.confirmDonateButton,
                (doando || pressed) && styles.donateButtonPressed,
              ]}
              onPress={handleConfirmarDoacao}
              disabled={doando}
            >
              {doando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmDonateText}>
                  Confirmar Doação de R${' '}
                  {valorCustomizado
                    ? valorCustomizado
                    : valorSelecionado.toFixed(2).replace('.', ',')}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal Interativo do PIX com QR Code, Copia e Cola, Confirmação e Erro */}
      <PixPaymentModal
        visible={pixModalVisible}
        valor={pixDados.valor}
        ongNome={ong?.nome || 'ONG Social'}
        campanhaTitulo={pixDados.campanhaTitulo}
        copiaECola={pixDados.copiaECola}
        qrCodeUrl={pixDados.qrCodeUrl}
        doacaoId={pixDados.doacaoId}
        onConfirmarPagamento={async () => {
          if (pixDados.doacaoId) {
            await confirmarDoacao(pixDados.doacaoId);
          }
        }}
        onSimularAprovacao={async () => {
          if (pixDados.doacaoId) {
            await confirmarDoacao(pixDados.doacaoId);
          }
        }}
        onFechar={() => setPixModalVisible(false)}
        onDoacaoConcluida={() => {
          setPixModalVisible(false);
          navigation.navigate('Doacoes');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  /* Banner */
  bannerContainer: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryBadgeText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Identity */
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
    gap: 14,
  },
  logoCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  identityInfo: {
    flex: 1,
  },
  ongName: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '500',
  },

  /* Sobre Nós */
  aboutCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 22,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aboutTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 17,
    fontWeight: '800',
  },
  aboutBody: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },

  /* Transparência e Impacto */
  transparencySection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  impactCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  impactCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  impactCardTitle: {
    flex: 1,
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '700',
  },
  impactPercentage: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FB6407',
    borderRadius: 4,
  },
  impactDetails: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    fontWeight: '500',
  },

  /* Quote Card */
  quoteCard: {
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  quoteWatermark: {
    position: 'absolute',
    top: -24,
    right: 12,
    fontSize: 110,
    lineHeight: 110,
    color: 'rgba(56, 189, 248, 0.14)',
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '900',
  },
  quoteText: {
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
  },
  quoteAuthor: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
  },

  /* Sticky Bottom */
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  donateButton: {
    backgroundColor: '#05BCAA',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#05BCAA',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  donateButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  donateButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: '800',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 18,
    fontWeight: '800',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    marginBottom: 16,
  },
  modalOngName: {
    fontWeight: '700',
  },
  modalLabel: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipActive: {},
  presetText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
  },
  presetTextActive: {
    fontWeight: '800',
  },
  customValueRow: {
    marginBottom: 16,
  },
  customValueLabel: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    marginBottom: 6,
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  currencyPrefix: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },
  customInput: {
    flex: 1,
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '700',
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
  } as any,
  paymentRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  paymentOptionActive: {},
  paymentOptionText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmDonateButton: {
    backgroundColor: '#05BCAA',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDonateText: {
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '800',
  },

  /* Estados de Carregamento e Erro */
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  loadingText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
  },
  errorTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#05BCAA',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
  },
  backLink: {
    marginTop: 6,
  },
  backLinkText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
