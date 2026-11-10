import React, { forwardRef } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  useWindowDimensions,
} from 'react-native';

import { authTheme as t } from '../../theme/authTheme';
import { useTheme } from '../../theme/ThemeContext';

type AuthTextFieldProps = TextInputProps & {
  label: string;
  icon: 'email' | 'person' | 'lock' | 'confirm';
  error?: boolean;
  trailing?: React.ReactNode;
};

export const AuthTextField = forwardRef<TextInput, AuthTextFieldProps>(function AuthTextField(
  { label, icon, error = false, trailing, style, onFocus, onBlur, ...props },
  ref,
) {
  const [focused, setFocused] = React.useState(false);
  const { isDark, theme } = useTheme();

  const fieldBg = isDark ? '#1A1D24' : theme.colors.surface;
  const fieldBorder = isDark ? '#2E3543' : theme.colors.inputBorder;
  const labelColor = isDark ? '#CBD5E1' : theme.colors.text;
  const inputColor = isDark ? '#FFFFFF' : theme.colors.ink;
  const placeholderColor = isDark ? '#6B7280' : theme.colors.muted;

  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <View
        style={[
          styles.field,
          { backgroundColor: fieldBg, borderColor: fieldBorder },
          focused && { borderColor: '#05BCAA' },
          error && styles.fieldError,
        ]}
      >
        <FieldGlyph name={icon} active={focused} isDark={isDark} />
        <TextInput
          ref={ref}
          {...props}
          style={[styles.input, { color: inputColor }, style]}
          placeholderTextColor={placeholderColor}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />
        {trailing}
      </View>
    </View>
  );
});

function FieldGlyph({
  name,
  active,
  isDark,
}: {
  name: AuthTextFieldProps['icon'];
  active: boolean;
  isDark: boolean;
}) {
  const glyphColor = isDark ? '#9CA3AF' : t.colors.muted;

  return (
    <View style={[styles.glyph, active && styles.glyphActive]} accessibilityElementsHidden>
      {name === 'email' && (
        <View style={[styles.envelope, { borderColor: glyphColor }]}>
          <View style={[styles.envelopeLeft, { backgroundColor: glyphColor }]} />
          <View style={[styles.envelopeRight, { backgroundColor: glyphColor }]} />
        </View>
      )}
      {name === 'person' && (
        <>
          <View style={[styles.personHead, { borderColor: glyphColor }]} />
          <View style={[styles.personBody, { borderColor: glyphColor }]} />
        </>
      )}
      {name === 'lock' && (
        <>
          <View style={[styles.lockShackle, { borderColor: glyphColor }]} />
          <View style={[styles.lockBody, { borderColor: glyphColor }]}>
            <View style={[styles.lockKeyhole, { backgroundColor: glyphColor }]} />
          </View>
        </>
      )}
      {name === 'confirm' && (
        <Text style={[styles.confirmGlyph, { color: glyphColor }]}>↻</Text>
      )}
    </View>
  );
}

type PasswordFieldProps = Omit<AuthTextFieldProps, 'icon' | 'trailing'> & {
  icon?: 'lock' | 'confirm';
  visible: boolean;
  onToggle: () => void;
};

export function PasswordField({
  icon = 'lock',
  visible,
  onToggle,
  ...props
}: PasswordFieldProps) {
  const { isDark } = useTheme();
  const glyphColor = isDark ? '#9CA3AF' : t.colors.muted;

  return (
    <AuthTextField
      {...props}
      icon={icon}
      secureTextEntry={!visible}
      trailing={
        <Pressable
          onPress={onToggle}
          style={styles.trailingButton}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
          hitSlop={8}
        >
          <View style={[styles.eye, { borderColor: glyphColor }]}>
            <View style={[styles.eyePupil, { backgroundColor: glyphColor }]} />
            {!visible && <View style={[styles.eyeSlash, { backgroundColor: glyphColor }]} />}
          </View>
        </Pressable>
      }
    />
  );
}

export function AuthHeader({
  title,
  description,
  accentTitle = false,
}: {
  title: string;
  description: string;
  accentTitle?: boolean;
}) {
  const { width } = useWindowDimensions();
  const { isDark, theme } = useTheme();
  const titleSize = Math.min(28, Math.max(23, width * 0.067));

  const resolvedTitleColor = accentTitle
    ? (isDark ? '#05BCAA' : theme.colors.tealDark)
    : (isDark ? '#FFFFFF' : theme.colors.brand);

  return (
    <View style={styles.header}>
      <View style={[styles.logoContainer, isDark && styles.logoContainerDark]}>
        <Image
          source={require('../../Assets/Logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Logo ConectAção"
        />
      </View>
      <Text
        style={[
          styles.title,
          {
            color: resolvedTitleColor,
            fontSize: titleSize,
            lineHeight: Math.round(titleSize * 1.25),
          },
        ]}
      >
        {title}
      </Text>
      <Text style={[styles.description, { color: isDark ? '#CBD5E1' : theme.colors.text }]}>
        {description}
      </Text>
    </View>
  );
}

export function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Image
      source={require('../../Assets/google-logo.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityLabel="Logo Google"
    />
  );
}

export function GoogleAuthButton({
  title = 'Continuar com o Google',
  loading = false,
  onPress,
}: {
  title?: string;
  loading?: boolean;
  onPress: () => void;
}) {
  const { isDark, theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.socialButton,
        {
          backgroundColor: isDark ? '#262B35' : theme.colors.surface,
          borderColor: isDark ? '#2E3543' : theme.colors.line,
        },
        pressed && !loading && styles.socialButtonPressed,
        loading && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isDark ? '#FFFFFF' : theme.colors.ink} />
      ) : (
        <>
          <GoogleIcon size={20} />
          <Text
            style={[
              styles.googleButtonText,
              { color: isDark ? '#FFFFFF' : theme.colors.ink },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function SocialDivider({
  label = 'OU ENTRE COM SEU E-MAIL',
}: {
  label?: string;
}) {
  const { isDark, theme } = useTheme();

  return (
    <View style={styles.dividerContainer}>
      <View
        style={[
          styles.dividerLine,
          { backgroundColor: isDark ? '#242A35' : theme.colors.line },
        ]}
      />
      <Text
        style={[
          styles.dividerLabel,
          { color: isDark ? '#9CA3AF' : theme.colors.muted },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.dividerLine,
          { backgroundColor: isDark ? '#242A35' : theme.colors.line },
        ]}
      />
    </View>
  );
}

export function FormError({ message }: { message: string | null }) {
  const { isDark } = useTheme();
  if (!message) return null;
  return (
    <View
      style={[
        styles.errorBox,
        isDark && { backgroundColor: '#2D1616', borderColor: '#5C2424' },
      ]}
    >
      <Text style={styles.errorText} accessibilityRole="alert">
        {message}
      </Text>
    </View>
  );
}

export function AuthButton({
  title,
  loading,
  onPress,
}: {
  title: string;
  loading: boolean;
  onPress: () => void;
}) {
  const { isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: loading, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: isDark ? '#05BCAA' : t.colors.tealDark },
        pressed && !loading && styles.buttonPressed,
        loading && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.buttonText}>{title}  →</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 28 },
  logoContainer: {
    borderRadius: 24,
    marginBottom: 8,
    overflow: 'hidden',
  },
  logoContainerDark: {
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 28,
  },
  logo: { width: 140, height: 100 },
  title: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  description: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 340,
  },
  fieldGroup: { marginBottom: 16 },
  label: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  field: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  fieldError: { borderColor: '#EF4444' },
  glyph: {
    width: 24,
    height: 24,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  glyphActive: { opacity: 1 },
  envelope: {
    width: 21,
    height: 16,
    borderWidth: 1.8,
    borderRadius: 3,
  },
  envelopeLeft: {
    position: 'absolute',
    width: 12,
    height: 1.5,
    top: 5,
    left: 0,
    transform: [{ rotate: '31deg' }],
  },
  envelopeRight: {
    position: 'absolute',
    width: 12,
    height: 1.5,
    top: 5,
    right: 0,
    transform: [{ rotate: '-31deg' }],
  },
  personHead: {
    width: 8,
    height: 8,
    borderWidth: 1.8,
    borderRadius: 4,
    marginBottom: 2,
  },
  personBody: {
    width: 17,
    height: 8,
    borderWidth: 1.8,
    borderRadius: 9,
  },
  lockShackle: {
    width: 11,
    height: 9,
    borderWidth: 1.8,
    borderBottomWidth: 0,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    marginBottom: -1,
  },
  lockBody: {
    width: 17,
    height: 13,
    borderWidth: 1.8,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockKeyhole: {
    width: 3,
    height: 4,
    borderRadius: 2,
  },
  confirmGlyph: {
    fontSize: 27,
    lineHeight: 27,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    minHeight: 56,
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    paddingVertical: 0,
  },
  trailingButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
  },
  eye: {
    width: 22,
    height: 14,
    borderWidth: 1.7,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyePupil: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  eyeSlash: {
    position: 'absolute',
    width: 27,
    height: 1.7,
    transform: [{ rotate: '43deg' }],
  },
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F3B7B7',
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  button: {
    minHeight: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonPressed: { opacity: 0.88 },
  buttonDisabled: { opacity: 0.62 },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: '800',
  },
  socialButton: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  googleButtonText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '700',
  },
  socialButtonPressed: { opacity: 0.76 },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerLabel: {
    marginHorizontal: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
