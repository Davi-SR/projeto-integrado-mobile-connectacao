import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RootStackParamList } from '../../navigation/types';
import {
  AuthButton,
  AuthHeader,
  AuthTextField,
  FormError,
  GoogleAuthButton,
  PasswordField,
  SocialDivider,
} from '../components/AuthComponents';
import { useCadastroViewModel } from '../../viewmodel/useCadastroViewModel';
import { useTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Cadastro'>;

export function CadastroScreen({ navigation }: Props) {
  const { isDark, theme } = useTheme();
  const {
    nome,
    email,
    senha,
    confirmarSenha,
    loading,
    loadingGoogle,
    erro,
    setNome,
    setEmail,
    setSenha,
    setConfirmarSenha,
    cadastrar,
    cadastrarGoogle,
  } = useCadastroViewModel();

  const [senhaVisivel, setSenhaVisivel] = React.useState(false);
  const [confirmacaoVisivel, setConfirmacaoVisivel] = React.useState(false);
  const isBusy = loading || loadingGoogle;

  const pageBg = isDark ? '#111418' : theme.colors.canvas;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: pageBg }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <AuthHeader
              title="Crie sua conta e comece a transformar vidas"
              description="Conecte-se com ONGs, doe e faça a diferença hoje mesmo."
              accentTitle={isDark}
            />

            <GoogleAuthButton
              title="Cadastrar com Google"
              loading={loadingGoogle}
              onPress={() => void cadastrarGoogle()}
            />

            <SocialDivider label="OU CADASTRE-SE COM SEU E-MAIL" />

            <AuthTextField
              label="Nome completo"
              icon="person"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              placeholder="Digite seu nome"
              editable={!isBusy}
              returnKeyType="next"
            />
            <AuthTextField
              label="E-mail"
              icon="email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              placeholder="seu@email.com"
              editable={!isBusy}
              returnKeyType="next"
            />
            <PasswordField
              label="Senha"
              value={senha}
              onChangeText={setSenha}
              visible={senhaVisivel}
              onToggle={() => setSenhaVisivel((value) => !value)}
              placeholder="Mínimo 8 caracteres"
              editable={!isBusy}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              returnKeyType="next"
            />
            <PasswordField
              icon="confirm"
              label="Confirmar Senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              visible={confirmacaoVisivel}
              onToggle={() => setConfirmacaoVisivel((value) => !value)}
              placeholder="Repita sua senha"
              editable={!isBusy}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={() => void cadastrar()}
            />

            <FormError message={erro} />
            <AuthButton title="Criar Conta" loading={loading} onPress={() => void cadastrar()} />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: isDark ? '#CBD5E1' : theme.colors.text }]}>
                Já tem uma conta?
              </Text>
              <Pressable
                onPress={() => navigation.navigate('Login')}
                disabled={isBusy}
                accessibilityRole="button"
                accessibilityLabel="Entrar"
              >
                <Text style={[styles.link, { color: isDark ? '#05BCAA' : theme.colors.brand }]}>
                  Entre aqui
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 32,
  },
  content: {
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
    paddingHorizontal: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 28,
  },
  footerText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
  },
  link: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '800',
  },
});
