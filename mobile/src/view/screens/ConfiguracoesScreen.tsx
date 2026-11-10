import React from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { authTheme as t } from '../../theme/authTheme';
import { HomeHeader } from '../components/HomeHeader';
import { AppIcon } from '../components/HomeIcons';
import { useConfiguracoesViewModel } from '../../viewmodel/useConfiguracoesViewModel';
import { useTheme } from '../../theme/ThemeContext';

export function ConfiguracoesScreen() {
  const { isDark, theme } = useTheme();

  const {
    user,
    notificacoesCampanhas,
    temaEscuro,
    toggleNotificacoes,
    toggleTemaEscuro,

    // Edição de Perfil
    modalEditarPerfilVisible,
    abrirEditarPerfil,
    fecharEditarPerfil,
    nomeEdit,
    setNomeEdit,
    emailEdit,
    setEmailEdit,
    telefoneEdit,
    setTelefoneEdit,
    fotoUrlEdit,
    setFotoUrlEdit,
    selecionarFotoDaGaleria,
    salvarPerfil,
    isSaving,
    saveError,

    // Modais informativos
    modalSobreVisible,
    abrirSobre,
    fecharSobre,
    modalTermosVisible,
    abrirTermos,
    fecharTermos,
    modalSuporteVisible,
    abrirSuporte,
    fecharSuporte,
    modalLogoutVisible,
    abrirLogout,
    fecharLogout,
    confirmarLogout,
  } = useConfiguracoesViewModel();

  const [avatarError, setAvatarError] = React.useState(false);

  const initial = user?.nome?.trim().charAt(0).toUpperCase() || 'U';
  const initialEdit = nomeEdit?.trim().charAt(0).toUpperCase() || initial;

  const pageBg = isDark ? '#111418' : '#F8F9FA';
  const cardBg = isDark ? '#1A1D24' : '#FFFFFF';
  const cardBorder = isDark ? '#242A35' : 'transparent';
  const dividerBg = isDark ? '#242A35' : '#F3F4F6';
  const titleColor = isDark ? '#FFFFFF' : '#0A2540';
  const labelColor = isDark ? '#FFFFFF' : '#1F2937';
  const subtitleColor = isDark ? '#9CA3AF' : '#6B7280';
  const inputBg = isDark ? '#262B35' : '#F8FAFC';
  const inputBorder = isDark ? '#2E3543' : '#E2E8F0';
  const primaryTeal = isDark ? '#05BCAA' : '#006A60';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: pageBg }]}>
      <HomeHeader />

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Título da Tela */}
        <Text style={[styles.pageTitle, { color: titleColor }]}>Configurações</Text>

        {/* Card de Identificação do Usuário */}
        <View style={[styles.userCard, { backgroundColor: cardBg, borderColor: cardBorder, borderWidth: isDark ? 1 : 0 }]}>
          <View style={[styles.avatarWrapper, { backgroundColor: isDark ? '#0D3331' : '#E6F8F6', borderColor: '#05BCAA' }]}>
            {user?.fotoUrl && !avatarError ? (
              <Image
                source={{ uri: user.fotoUrl }}
                onError={() => setAvatarError(true)}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: isDark ? '#0D3331' : '#E6F8F6' }]}>
                <Text style={[styles.avatarInitial, { color: primaryTeal }]}>{initial}</Text>
              </View>
            )}
          </View>

          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: titleColor }]} numberOfLines={1}>
              {user?.nome || 'Marina Silva'}
            </Text>
            <Text style={[styles.userEmail, { color: subtitleColor }]} numberOfLines={1}>
              {user?.email || 'marina.silva@email.com'}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar dados do perfil"
            onPress={abrirEditarPerfil}
            style={({ pressed }) => [styles.editIconButton, pressed && styles.cardPressed]}
          >
            <AppIcon name="edit" size={22} color={primaryTeal} />
          </Pressable>
        </View>

        {/* Seção: PREFERÊNCIAS */}
        <Text style={[styles.sectionHeading, { color: subtitleColor }]}>PREFERÊNCIAS</Text>
        <View style={[styles.cardContainer, { backgroundColor: cardBg, borderColor: cardBorder, borderWidth: isDark ? 1 : 0 }]}>
          {/* Notificações de Campanhas */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? '#0D3331' : '#CCFBF1' }]}>
                <AppIcon name="campaign" size={22} color={primaryTeal} />
              </View>
              <Text style={[styles.settingLabel, { color: labelColor }]}>
                Notificações de{'\n'}Campanhas
              </Text>
            </View>

            <Switch
              value={notificacoesCampanhas}
              onValueChange={toggleNotificacoes}
              trackColor={{ false: isDark ? '#2E3543' : '#E5E7EB', true: '#05BCAA' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={isDark ? '#2E3543' : '#E5E7EB'}
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: dividerBg }]} />

          {/* Tema Escuro */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? '#262B35' : '#F3F4F6' }]}>
                <AppIcon name="dark_mode" size={20} color={isDark ? '#0AAEEE' : '#374151'} />
              </View>
              <Text style={[styles.settingLabel, { color: labelColor }]}>Tema Escuro</Text>
            </View>

            <Switch
              value={temaEscuro}
              onValueChange={toggleTemaEscuro}
              trackColor={{ false: isDark ? '#2E3543' : '#E5E7EB', true: '#05BCAA' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={isDark ? '#2E3543' : '#E5E7EB'}
            />
          </View>
        </View>

        {/* Seção: INFORMAÇÕES */}
        <Text style={[styles.sectionHeading, { color: subtitleColor }]}>INFORMAÇÕES</Text>
        <View style={[styles.cardContainer, { backgroundColor: cardBg, borderColor: cardBorder, borderWidth: isDark ? 1 : 0 }]}>
          {/* Sobre o ConectAção */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sobre o ConectAção"
            onPress={abrirSobre}
            style={({ pressed }) => [styles.infoRow, pressed && styles.cardPressed]}
          >
            <View style={styles.infoLeft}>
              <AppIcon name="info" size={22} color={primaryTeal} />
              <Text style={[styles.infoLabel, { color: labelColor }]}>Sobre o ConectAção</Text>
            </View>
            <AppIcon name="chevron_right" size={22} color={subtitleColor} />
          </Pressable>

          <View style={[styles.infoDivider, { backgroundColor: dividerBg }]} />

          {/* Termos de Uso e Privacidade */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Termos de Uso e Privacidade"
            onPress={abrirTermos}
            style={({ pressed }) => [styles.infoRow, pressed && styles.cardPressed]}
          >
            <View style={styles.infoLeft}>
              <AppIcon name="policy" size={22} color={primaryTeal} />
              <Text style={[styles.infoLabel, { color: labelColor }]}>Termos de Uso e Privacidade</Text>
            </View>
            <AppIcon name="chevron_right" size={22} color={subtitleColor} />
          </Pressable>

          <View style={[styles.infoDivider, { backgroundColor: dividerBg }]} />

          {/* Ajuda e Suporte */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ajuda e Suporte"
            onPress={abrirSuporte}
            style={({ pressed }) => [styles.infoRow, pressed && styles.cardPressed]}
          >
            <View style={styles.infoLeft}>
              <AppIcon name="help_outline" size={22} color={primaryTeal} />
              <Text style={[styles.infoLabel, { color: labelColor }]}>Ajuda e Suporte</Text>
            </View>
            <AppIcon name="chevron_right" size={22} color={subtitleColor} />
          </Pressable>
        </View>

        {/* Botão Sair da Conta */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair da Conta"
          onPress={abrirLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            { backgroundColor: cardBg, borderColor: '#DC2626' },
            pressed && styles.cardPressed,
          ]}
        >
          <AppIcon name="logout" size={20} color="#DC2626" />
          <Text style={styles.logoutButtonText}>SAIR DA CONTA</Text>
        </Pressable>
      </ScrollView>

      {/* 1. Modal: Editar Perfil */}
      <Modal
        visible={modalEditarPerfilVisible}
        transparent
        animationType="slide"
        onRequestClose={fecharEditarPerfil}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.modalOverlay, isDark && { backgroundColor: 'rgba(0, 0, 0, 0.75)' }]}
        >
          <Pressable style={styles.modalBackdrop} onPress={fecharEditarPerfil} />
          <View style={[styles.modalSheet, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: titleColor }]}>Editar Perfil</Text>
              <Pressable onPress={fecharEditarPerfil} style={styles.modalCloseBtn}>
                <AppIcon name="close" size={22} color={isDark ? '#CBD5E1' : '#0A2540'} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {saveError && (
                <View style={[styles.errorBanner, isDark && { backgroundColor: '#2D1616' }]}>
                  <Text style={styles.errorBannerText}>{saveError}</Text>
                </View>
              )}

              {/* Seletor de Foto da Galeria */}
              <View style={styles.photoPickerContainer}>
                <View style={[styles.modalAvatarWrapper, { backgroundColor: isDark ? '#0D3331' : '#E6F8F6', borderColor: primaryTeal }]}>
                  {fotoUrlEdit ? (
                    <Image
                      source={{ uri: fotoUrlEdit }}
                      style={styles.modalAvatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.modalAvatarFallback, { backgroundColor: isDark ? '#0D3331' : '#E6F8F6' }]}>
                      <Text style={[styles.modalAvatarInitial, { color: primaryTeal }]}>{initialEdit}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.photoPickerActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.pickGalleryBtn,
                      { backgroundColor: isDark ? '#0D3331' : '#E6F8F6', borderColor: isDark ? '#05BCAA' : '#BDEBE5' },
                      pressed && styles.cardPressed,
                    ]}
                    onPress={selecionarFotoDaGaleria}
                  >
                    <AppIcon name="photo_library" size={18} color={primaryTeal} />
                    <Text style={[styles.pickGalleryBtnText, { color: primaryTeal }]}>Escolher da Galeria</Text>
                  </Pressable>

                  {fotoUrlEdit ? (
                    <Pressable
                      style={styles.removePhotoBtn}
                      onPress={() => setFotoUrlEdit('')}
                    >
                      <Text style={styles.removePhotoBtnText}>Remover foto</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>

              <Text style={[styles.inputLabel, { color: titleColor }]}>Nome Completo</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: titleColor }]}
                value={nomeEdit}
                onChangeText={setNomeEdit}
                placeholder="Seu nome completo"
                placeholderTextColor={subtitleColor}
              />

              <Text style={[styles.inputLabel, { color: titleColor }]}>E-mail</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: titleColor }]}
                value={emailEdit}
                onChangeText={setEmailEdit}
                placeholder="seu.email@exemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={subtitleColor}
              />

              <Text style={[styles.inputLabel, { color: titleColor }]}>Telefone</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: titleColor }]}
                value={telefoneEdit}
                onChangeText={setTelefoneEdit}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                placeholderTextColor={subtitleColor}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.primaryModalBtn,
                  { backgroundColor: '#05BCAA' },
                  (isSaving || pressed) && styles.cardPressed,
                ]}
                onPress={salvarPerfil}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryModalBtnText}>Salvar Alterações</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 2. Modal: Sobre o ConectAção */}
      <Modal
        visible={modalSobreVisible}
        transparent
        animationType="fade"
        onRequestClose={fecharSobre}
      >
        <View style={[styles.centerModalOverlay, isDark && { backgroundColor: 'rgba(0, 0, 0, 0.75)' }]}>
          <Pressable style={styles.modalBackdrop} onPress={fecharSobre} />
          <View style={[styles.infoDialog, { backgroundColor: cardBg, borderColor: cardBorder, borderWidth: isDark ? 1 : 0 }]}>
            <View style={[styles.infoIconCircle, { backgroundColor: isDark ? '#0D3331' : '#E6F8F6' }]}>
              <AppIcon name="volunteer_activism" size={32} color={primaryTeal} />
            </View>
            <Text style={[styles.infoDialogTitle, { color: titleColor }]}>Sobre o ConectAção</Text>
            <Text style={[styles.infoDialogBody, { color: isDark ? '#CBD5E1' : '#4B5563' }]}>
              O ConectAção é uma plataforma solidária e transparente desenvolvida para conectar
              corações generosos a organizações não governamentais que transformam vidas.
            </Text>
            <View style={[styles.versionBadge, { backgroundColor: isDark ? '#262B35' : '#F3F4F6' }]}>
              <Text style={[styles.versionText, { color: subtitleColor }]}>Versão 1.0.0 • 2026</Text>
            </View>
            <Pressable style={[styles.dialogCloseBtn, { backgroundColor: primaryTeal }]} onPress={fecharSobre}>
              <Text style={styles.dialogCloseBtnText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* 3. Modal: Termos de Uso e Privacidade */}
      <Modal
        visible={modalTermosVisible}
        transparent
        animationType="fade"
        onRequestClose={fecharTermos}
      >
        <View style={[styles.centerModalOverlay, isDark && { backgroundColor: 'rgba(0, 0, 0, 0.75)' }]}>
          <Pressable style={styles.modalBackdrop} onPress={fecharTermos} />
          <View style={[styles.infoDialog, { backgroundColor: cardBg, borderColor: cardBorder, borderWidth: isDark ? 1 : 0 }]}>
            <View style={[styles.infoIconCircle, { backgroundColor: isDark ? '#0D3331' : '#E6F8F6' }]}>
              <AppIcon name="policy" size={32} color={primaryTeal} />
            </View>
            <Text style={[styles.infoDialogTitle, { color: titleColor }]}>Privacidade e Segurança</Text>
            <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
              <Text style={[styles.infoDialogBody, { color: isDark ? '#CBD5E1' : '#4B5563' }]}>
                Seus dados cadastrais e histórico de doações são estritamente protegidos de acordo
                com a Lei Geral de Proteção de Dados (LGPD). As doações financeiras utilizam
                criptografia ponta a ponta e auditoria transparente para assegurar que 100% dos
                recursos cheguem às causas apoiadas.
              </Text>
            </ScrollView>
            <Pressable style={[styles.dialogCloseBtn, { backgroundColor: primaryTeal }]} onPress={fecharTermos}>
              <Text style={styles.dialogCloseBtnText}>Entendido</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* 4. Modal: Ajuda e Suporte */}
      <Modal
        visible={modalSuporteVisible}
        transparent
        animationType="fade"
        onRequestClose={fecharSuporte}
      >
        <View style={[styles.centerModalOverlay, isDark && { backgroundColor: 'rgba(0, 0, 0, 0.75)' }]}>
          <Pressable style={styles.modalBackdrop} onPress={fecharSuporte} />
          <View style={[styles.infoDialog, { backgroundColor: cardBg, borderColor: cardBorder, borderWidth: isDark ? 1 : 0 }]}>
            <View style={[styles.infoIconCircle, { backgroundColor: isDark ? '#0D3331' : '#E6F8F6' }]}>
              <AppIcon name="help_outline" size={32} color={primaryTeal} />
            </View>
            <Text style={[styles.infoDialogTitle, { color: titleColor }]}>Ajuda e Suporte</Text>
            <Text style={[styles.infoDialogBody, { color: isDark ? '#CBD5E1' : '#4B5563' }]}>
              Precisa de ajuda com uma doação ou tem dúvidas sobre a plataforma? Nossa equipe está
              pronta para te atender:
            </Text>
            <View style={[styles.supportContactBox, { backgroundColor: isDark ? '#262B35' : '#F9FAFB' }]}>
              <Text style={[styles.supportContactText, { color: titleColor }]}>📧 contato@conectacao.org</Text>
              <Text style={[styles.supportContactText, { color: titleColor }]}>💬 WhatsApp: (11) 98765-4321</Text>
            </View>
            <Pressable style={[styles.dialogCloseBtn, { backgroundColor: primaryTeal }]} onPress={fecharSuporte}>
              <Text style={styles.dialogCloseBtnText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* 5. Modal: Confirmação de Logout */}
      <Modal
        visible={modalLogoutVisible}
        transparent
        animationType="fade"
        onRequestClose={fecharLogout}
      >
        <View style={[styles.centerModalOverlay, isDark && { backgroundColor: 'rgba(0, 0, 0, 0.75)' }]}>
          <Pressable style={styles.modalBackdrop} onPress={fecharLogout} />
          <View style={[styles.infoDialog, { backgroundColor: cardBg, borderColor: cardBorder, borderWidth: isDark ? 1 : 0 }]}>
            <View style={[styles.infoIconCircle, { backgroundColor: isDark ? '#2D1616' : '#FEE2E2' }]}>
              <AppIcon name="logout" size={28} color="#DC2626" />
            </View>
            <Text style={[styles.infoDialogTitle, { color: titleColor }]}>Sair da Conta?</Text>
            <Text style={[styles.infoDialogBody, { color: isDark ? '#CBD5E1' : '#4B5563' }]}>
              Você precisará realizar o login novamente para acessar seus dados e histórico de
              doações.
            </Text>
            <View style={styles.logoutActionsRow}>
              <Pressable
                style={[styles.cancelBtn, { backgroundColor: isDark ? '#262B35' : '#F3F4F6' }]}
                onPress={fecharLogout}
              >
                <Text style={[styles.cancelBtnText, { color: isDark ? '#FFFFFF' : '#374151' }]}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.confirmLogoutBtn} onPress={confirmarLogout}>
                <Text style={styles.confirmLogoutBtnText}>Sair</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  /* Título */
  pageTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 10,
    marginBottom: 18,
  },

  /* Card do Usuário */
  userCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 24,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 18,
    fontWeight: '700',
  },
  userEmail: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '400',
    marginTop: 2,
  },
  editIconButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Seções */
  sectionHeading: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  cardContainer: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 22,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    flex: 1,
  },
  rowDivider: {
    height: 1,
    marginLeft: 72,
  },

  /* Linhas de Informações */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '600',
  },
  infoDivider: {
    height: 1,
    marginLeft: 16,
    marginRight: 16,
  },

  /* Botão Sair da Conta */
  logoutButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutButtonText: {
    color: '#DC2626',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* Modais Gerais */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '85%',
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
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 19,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 4,
  },

  /* Seletor de Foto */
  photoPickerContainer: {
    alignItems: 'center',
    marginVertical: 12,
    gap: 12,
  },
  modalAvatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarImage: {
    width: '100%',
    height: '100%',
  },
  modalAvatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarInitial: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 32,
    fontWeight: '800',
  },
  photoPickerActions: {
    alignItems: 'center',
    gap: 6,
  },
  pickGalleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  pickGalleryBtnText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
  },
  removePhotoBtn: {
    paddingVertical: 4,
  },
  removePhotoBtnText: {
    color: '#DC2626',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '600',
  },

  inputLabel: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
  },
  primaryModalBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 14,
  },
  primaryModalBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: '800',
  },
  errorBanner: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    marginBottom: 8,
  },
  errorBannerText: {
    color: '#DC2626',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
  },

  /* Modais Centrais */
  centerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  infoDialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  infoIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6F8F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  infoDialogTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  infoDialogBody: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  versionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 16,
  },
  versionText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '700',
  },
  dialogCloseBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogCloseBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '800',
  },

  supportContactBox: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    gap: 8,
    marginBottom: 16,
  },
  supportContactText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '600',
  },

  logoutActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmLogoutBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLogoutBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '800',
  },
  cardPressed: {
    opacity: 0.8,
  },
});
