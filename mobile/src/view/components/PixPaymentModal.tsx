import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { useTheme } from '../../theme/ThemeContext';
import { AppIcon } from './HomeIcons';

type Props = {
  visible: boolean;
  valor: number;
  ongNome: string;
  campanhaTitulo?: string;
  copiaECola: string;
  qrCodeUrl: string;
  doacaoId?: number | null;
  onConfirmarPagamento: () => Promise<void>;
  onSimularAprovacao: () => Promise<void>;
  onFechar: () => void;
  onDoacaoConcluida?: () => void;
};

type ModoModal = 'PAGAMENTO' | 'SUCESSO' | 'ERRO';

export function PixPaymentModal({
  visible,
  valor,
  ongNome,
  campanhaTitulo,
  copiaECola,
  qrCodeUrl,
  doacaoId,
  onConfirmarPagamento,
  onSimularAprovacao,
  onFechar,
  onDoacaoConcluida,
}: Props) {
  const { isDark, theme } = useTheme();

  const [modo, setModo] = useState<ModoModal>('PAGAMENTO');
  const [copiado, setCopiado] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [tempoRestanteSegundos, setTempoRestanteSegundos] = useState(15 * 60); // 15 minutos
  const [mensagemErro, setMensagemErro] = useState<string>('');

  // Reinicia o estado ao abrir o modal
  useEffect(() => {
    if (visible) {
      setModo('PAGAMENTO');
      setCopiado(false);
      setProcessando(false);
      setTempoRestanteSegundos(15 * 60);
      setMensagemErro('');
    }
  }, [visible, copiaECola]);

  // Timer decrescente de 15 minutos
  useEffect(() => {
    if (!visible || modo !== 'PAGAMENTO') return;

    const interval = setInterval(() => {
      setTempoRestanteSegundos((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setMensagemErro('O tempo limite deste QR Code expirou. Por favor, gere um novo código para doar.');
          setModo('ERRO');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, modo]);

  const minutos = Math.floor(tempoRestanteSegundos / 60)
    .toString()
    .padStart(2, '0');
  const segundos = (tempoRestanteSegundos % 60).toString().padStart(2, '0');

  const handleCopiar = async () => {
    try {
      await Clipboard.setStringAsync(copiaECola);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3500);
    } catch {
      // Fallback para Web
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(copiaECola);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 3500);
      }
    }
  };

  const handleConfirmar = async () => {
    setProcessando(true);
    try {
      await onConfirmarPagamento();
      setModo('SUCESSO');
    } catch (err: any) {
      setMensagemErro(
        err?.message ||
          'Não conseguimos identificar a transferência bancária deste Pix ainda. Verifique se o valor foi debitado no seu app bancário.'
      );
      setModo('ERRO');
    } finally {
      setProcessando(false);
    }
  };

  const handleSimular = async () => {
    setProcessando(true);
    try {
      await onSimularAprovacao();
      setModo('SUCESSO');
    } catch (err: any) {
      setMensagemErro('Falha na simulação de aprovação.');
      setModo('ERRO');
    } finally {
      setProcessando(false);
    }
  };

  // Cores dinâmicas para Dark Mode e Light Mode
  const bgCard = isDark ? '#1A1D24' : '#FFFFFF';
  const borderCard = isDark ? '#2E3543' : '#E2E8F0';
  const titleColor = isDark ? '#FFFFFF' : '#0A2540';
  const textColor = isDark ? '#CBD5E1' : '#334155';
  const mutedColor = isDark ? '#9CA3AF' : '#64748B';
  const copyBoxBg = isDark ? '#262B35' : '#F8FAFC';
  const valorFormatado = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onFechar}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: bgCard, borderColor: borderCard }]}>
          {/* ========================================================================= */}
          {/* TELA 1: FLUXO DE PAGAMENTO PIX */}
          {/* ========================================================================= */}
          {modo === 'PAGAMENTO' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Cabeçalho */}
              <View style={styles.headerRow}>
                <View style={styles.titleBadgeRow}>
                  <View style={[styles.pixIconCircle, { backgroundColor: isDark ? '#0D3331' : '#E6F8F6' }]}>
                    <AppIcon name="qr_code_2" size={24} color={isDark ? '#05BCAA' : '#006A60'} />
                  </View>
                  <View>
                    <Text style={[styles.modalTitle, { color: titleColor }]}>Pagamento via PIX</Text>
                    <Text style={[styles.modalSubtitle, { color: mutedColor }]}>
                      Doe {valorFormatado} para {ongNome}
                    </Text>
                  </View>
                </View>
                <Pressable onPress={onFechar} style={styles.closeButton} accessibilityRole="button">
                  <AppIcon name="close" size={20} color={mutedColor} />
                </Pressable>
              </View>

              {/* QR Code com borda de alto contraste */}
              <View style={styles.qrCodeWrapper}>
                <View style={styles.qrCodeContainer}>
                  {qrCodeUrl ? (
                    <Image source={{ uri: qrCodeUrl }} style={styles.qrCodeImage} resizeMode="contain" />
                  ) : (
                    <ActivityIndicator size="large" color="#05BCAA" />
                  )}
                </View>
                {/* Timer Regressivo */}
                <View style={[styles.timerBadge, { backgroundColor: isDark ? '#262B35' : '#FEF3C7' }]}>
                  <AppIcon name="schedule" size={16} color={isDark ? '#0AAEEE' : '#D97706'} />
                  <Text style={[styles.timerText, { color: isDark ? '#0AAEEE' : '#B45309' }]}>
                    Expira em {minutos}:{segundos}
                  </Text>
                </View>
              </View>

              {/* Caixa Pix Copia e Cola */}
              <View style={styles.copySection}>
                <Text style={[styles.copyLabel, { color: titleColor }]}>Código Pix Copia e Cola:</Text>
                <View style={[styles.copyBox, { backgroundColor: copyBoxBg, borderColor: borderCard }]}>
                  <Text numberOfLines={2} ellipsizeMode="middle" style={[styles.copyCodeText, { color: textColor }]}>
                    {copiaECola}
                  </Text>
                </View>
                <Pressable
                  onPress={handleCopiar}
                  style={({ pressed }) => [
                    styles.copyButton,
                    copiado && styles.copyButtonActive,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                >
                  <AppIcon name={copiado ? 'check' : 'content_copy'} size={18} color="#FFFFFF" />
                  <Text style={styles.copyButtonText}>{copiado ? 'Código Copiado!' : 'Copiar Código Pix'}</Text>
                </Pressable>
              </View>

              {/* Instruções Didáticas */}
              <View style={[styles.instructionsBox, { backgroundColor: copyBoxBg, borderColor: borderCard }]}>
                <Text style={[styles.instructionsHeading, { color: titleColor }]}>Como pagar:</Text>
                <Text style={[styles.stepText, { color: textColor }]}>
                  1. Abra o aplicativo do seu banco (Nubank, Inter, etc.).
                </Text>
                <Text style={[styles.stepText, { color: textColor }]}>
                  2. Escolha a opção <Text style={{ fontWeight: '700' }}>Pix &gt; Copia e Cola</Text> ou aponte a câmera
                  para o QR Code.
                </Text>
                <Text style={[styles.stepText, { color: textColor }]}>
                  3. Verifique o valor e o nome do beneficiário e confirme.
                </Text>
              </View>

              {/* Botões de Ação */}
              <View style={styles.actionsContainer}>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    processando && styles.buttonDisabled,
                    pressed && !processando && styles.pressed,
                  ]}
                  onPress={handleConfirmar}
                  disabled={processando}
                  accessibilityRole="button"
                >
                  {processando ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <AppIcon name="check_circle" size={20} color="#FFFFFF" />
                      <Text style={styles.primaryButtonText}>Já realizei o pagamento</Text>
                    </>
                  )}
                </Pressable>

                {/* Botão de Demonstração / Aprovação Rápida */}
                <Pressable
                  style={({ pressed }) => [
                    styles.simulateButton,
                    { borderColor: isDark ? '#0AAEEE' : theme.colors.brand },
                    pressed && styles.pressed,
                  ]}
                  onPress={handleSimular}
                  disabled={processando}
                  accessibilityRole="button"
                >
                  <AppIcon name="bolt" size={18} color={isDark ? '#0AAEEE' : theme.colors.brand} />
                  <Text style={[styles.simulateButtonText, { color: isDark ? '#0AAEEE' : theme.colors.brand }]}>
                    Simular Aprovação Instantânea
                  </Text>
                </Pressable>

                <Pressable onPress={onFechar} style={styles.cancelLink} accessibilityRole="button">
                  <Text style={[styles.cancelLinkText, { color: mutedColor }]}>Cancelar e fechar</Text>
                </Pressable>
              </View>
            </ScrollView>
          )}

          {/* ========================================================================= */}
          {/* TELA 2: TELA DE CONFIRMAÇÃO (SUCESSO!) */}
          {/* ========================================================================= */}
          {modo === 'SUCESSO' && (
            <View style={styles.resultContainer}>
              <View style={[styles.successCircle, { backgroundColor: isDark ? '#0D3331' : '#E6F8F6' }]}>
                <AppIcon name="check_circle" size={54} color="#05BCAA" />
              </View>

              <Text style={[styles.resultTitle, { color: titleColor }]}>Doação Confirmada! 🎉</Text>

              <View style={[styles.resultValueCard, { backgroundColor: copyBoxBg, borderColor: borderCard }]}>
                <Text style={[styles.resultValueLabel, { color: mutedColor }]}>Valor recebido com sucesso:</Text>
                <Text style={styles.resultValueText}>{valorFormatado}</Text>
                <Text style={[styles.resultOngText, { color: titleColor }]}>Destinado para: {ongNome}</Text>
                {campanhaTitulo && (
                  <Text style={[styles.resultCampanhaText, { color: mutedColor }]}>Campanha: {campanhaTitulo}</Text>
                )}
                {doacaoId && (
                  <Text style={[styles.resultProtocol, { color: mutedColor }]}>Protocolo: #DOA-{doacaoId}</Text>
                )}
              </View>

              <Text style={[styles.resultMessage, { color: textColor }]}>
                O valor foi computado com sucesso na meta da campanha e o seu extrato já foi atualizado!
              </Text>

              <Pressable
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                onPress={() => {
                  onFechar();
                  if (onDoacaoConcluida) onDoacaoConcluida();
                }}
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>Concluir e Ver no Histórico</Text>
              </Pressable>
            </View>
          )}

          {/* ========================================================================= */}
          {/* TELA 3: TELA DE ERRO (FALHA / EXPIRADO) */}
          {/* ========================================================================= */}
          {modo === 'ERRO' && (
            <View style={styles.resultContainer}>
              <View style={[styles.errorCircle, { backgroundColor: isDark ? '#3E1818' : '#FEE2E2' }]}>
                <AppIcon name="error_outline" size={54} color="#EF4444" />
              </View>

              <Text style={[styles.resultTitle, { color: isDark ? '#F87171' : '#DC2626' }]}>
                Não foi possível confirmar o Pix
              </Text>

              <View style={[styles.resultValueCard, { backgroundColor: copyBoxBg, borderColor: borderCard }]}>
                <Text style={[styles.errorMessageText, { color: textColor }]}>
                  {mensagemErro ||
                    'Não identificamos a compensação do seu Pix até o momento. Caso tenha pago recentemente, aguarde alguns instantes.'}
                </Text>
              </View>

              <View style={styles.actionsContainer}>
                <Pressable
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                  onPress={() => {
                    setModo('PAGAMENTO');
                    setTempoRestanteSegundos(15 * 60);
                  }}
                  accessibilityRole="button"
                >
                  <AppIcon name="refresh" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Tentar Novamente</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.simulateButton,
                    { borderColor: isDark ? '#0AAEEE' : theme.colors.brand },
                    pressed && styles.pressed,
                  ]}
                  onPress={handleSimular}
                  accessibilityRole="button"
                >
                  <AppIcon name="bolt" size={18} color={isDark ? '#0AAEEE' : theme.colors.brand} />
                  <Text style={[styles.simulateButtonText, { color: isDark ? '#0AAEEE' : theme.colors.brand }]}>
                    Simular Aprovação (Modo Demonstração)
                  </Text>
                </Pressable>

                <Pressable onPress={onFechar} style={styles.cancelLink} accessibilityRole="button">
                  <Text style={[styles.cancelLinkText, { color: mutedColor }]}>Voltar ao perfil da ONG</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
  },
  scrollContent: {
    padding: 22,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  pixIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    borderRadius: 12,
  },
  qrCodeWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  qrCodeContainer: {
    width: 210,
    height: 210,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  qrCodeImage: {
    width: '100%',
    height: '100%',
  },
  timerBadge: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  timerText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '700',
  },
  copySection: {
    gap: 8,
  },
  copyLabel: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    fontWeight: '700',
  },
  copyBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  copyCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
  copyButton: {
    backgroundColor: '#05BCAA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#05BCAA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  copyButtonActive: {
    backgroundColor: '#10B981',
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
  },
  instructionsBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  instructionsHeading: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  stepText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 11,
    lineHeight: 17,
  },
  actionsContainer: {
    gap: 10,
    marginTop: 4,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#05BCAA',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '700',
  },
  simulateButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  simulateButtonText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  cancelLinkText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  pressed: {
    opacity: 0.82,
  },
  resultContainer: {
    padding: 28,
    alignItems: 'center',
    gap: 16,
  },
  successCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  resultValueCard: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  resultValueLabel: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '600',
  },
  resultValueText: {
    color: '#05BCAA',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 26,
    fontWeight: '900',
  },
  resultOngText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  resultCampanhaText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  resultProtocol: {
    fontFamily: 'monospace',
    fontSize: 10,
    marginTop: 4,
  },
  resultMessage: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  errorMessageText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});

