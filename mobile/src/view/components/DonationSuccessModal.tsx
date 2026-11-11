import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { AppIcon } from './HomeIcons';

type Props = {
  visible: boolean;
  valor: number;
  ongNome: string;
  campanhaTitulo?: string;
  formaPagamento: 'PIX' | 'CARTAO';
  doacaoId?: number | null;
  onClose: () => void;
  onVerHistorico: () => void;
};

export function DonationSuccessModal({
  visible,
  valor,
  ongNome,
  campanhaTitulo,
  formaPagamento,
  doacaoId,
  onClose,
  onVerHistorico,
}: Props) {
  const { isDark, theme } = useTheme();

  // Animações de entrada e celebração
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const checkScaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.85);
      slideAnim.setValue(24);
      checkScaleAnim.setValue(0);

      // Sequência fluida com curvas bezier suaves do Design System
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start(() => {
        // Animação de pop do ícone de sucesso
        Animated.spring(checkScaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: Platform.OS !== 'web',
        }).start();
      });

      // Efeito de pulso no anel de destaque (Design System ca-pulse)
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.18,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      );
      pulseLoop.start();

      return () => pulseLoop.stop();
    }
  }, [visible]);

  if (!visible) return null;

  // Tokens Semânticos do Design System ConectAção
  const bgOverlay = isDark ? 'rgba(0, 0, 0, 0.82)' : 'rgba(1, 57, 120, 0.45)';
  const surfaceBg = isDark ? '#1A1D24' : '#FFFFFF';
  const cardBorder = isDark ? '#2E3543' : '#E5E7EB';
  const titleColor = isDark ? '#FFFFFF' : '#191C1D';
  const textColor = isDark ? '#CBD5E1' : '#3E4850';
  const mutedColor = isDark ? '#9CA3AF' : '#6E7881';
  const receiptBg = isDark ? '#121418' : '#F8F9FA';
  const badgeBg = formaPagamento === 'PIX' ? (isDark ? '#0D3331' : '#E6F8F6') : (isDark ? '#0A2540' : '#EBF5FF');
  const badgeTextColor = formaPagamento === 'PIX' ? '#05BCAA' : (isDark ? '#0AAEEE' : '#013978');

  const valorFormatado = valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const protocolo = doacaoId ? `#CONECT-${doacaoId}` : `#CONECT-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: bgOverlay }]}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: surfaceBg,
              borderColor: cardBorder,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          {/* Botão de Fechar no topo */}
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10} accessibilityLabel="Fechar">
            <AppIcon name="close" size={20} color={mutedColor} />
          </Pressable>

          {/* Anel de celebração com animação de pulso */}
          <View style={styles.iconContainer}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  borderColor: isDark ? 'rgba(5, 188, 170, 0.3)' : 'rgba(5, 188, 170, 0.4)',
                },
              ]}
            />
            <Animated.View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: isDark ? '#003B35' : '#E6F8F6',
                  transform: [{ scale: checkScaleAnim }],
                },
              ]}
            >
              <AppIcon name="check_circle" size={48} color="#05BCAA" />
            </Animated.View>
          </View>

          {/* Título de Sucesso */}
          <Text style={[styles.title, { color: titleColor }]}>Doação Confirmada! 🎉</Text>
          <Text style={[styles.subtitle, { color: mutedColor }]}>
            Sua solidariedade faz a diferença hoje e conecta quem quer ajudar a quem precisa.
          </Text>

          {/* Cartão de Comprovante / Recibo Visual */}
          <View style={[styles.receiptCard, { backgroundColor: receiptBg, borderColor: cardBorder }]}>
            <View style={styles.amountRow}>
              <Text style={[styles.amountLabel, { color: mutedColor }]}>Valor Doado</Text>
              <Text style={styles.amountValue}>{valorFormatado}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: cardBorder }]} />

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: mutedColor }]}>Beneficiário</Text>
              <Text style={[styles.detailValue, { color: titleColor }]} numberOfLines={1}>
                {ongNome}
              </Text>
            </View>

            {campanhaTitulo && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: mutedColor }]}>Campanha</Text>
                <Text style={[styles.detailValue, { color: textColor }]} numberOfLines={1}>
                  {campanhaTitulo}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: mutedColor }]}>Forma de Pagamento</Text>
              <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                <Text style={[styles.badgeText, { color: badgeTextColor }]}>
                  {formaPagamento === 'PIX' ? '⚡ PIX Instantâneo' : '💳 Cartão de Crédito'}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: mutedColor }]}>Protocolo</Text>
              <Text style={[styles.protocolText, { color: mutedColor }]}>{protocolo}</Text>
            </View>
          </View>

          {/* Ações (Pills do Design System) */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onVerHistorico}
              accessibilityRole="button"
            >
              <AppIcon name="receipt" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Ver no Extrato de Doações</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                { borderColor: cardBorder },
                pressed && styles.buttonPressed,
              ]}
              onPress={onClose}
              accessibilityRole="button"
            >
              <Text style={[styles.secondaryButtonText, { color: titleColor }]}>Concluir e Voltar</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    borderWidth: 1.5,
    padding: 26,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconContainer: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 6,
  },
  pulseRing: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  receiptCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 22,
  },
  amountRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  amountLabel: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  amountValue: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 30,
    fontWeight: '800',
    color: '#05BCAA',
    letterSpacing: -0.5,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  detailLabel: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '700',
  },
  protocolText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: '#05BCAA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#05BCAA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    width: '100%',
    minHeight: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});

