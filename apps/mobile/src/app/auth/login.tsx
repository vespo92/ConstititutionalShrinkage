import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useBiometrics } from '@/hooks/useBiometrics';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

/**
 * Login Screen
 * Authentication with email/password and biometric options
 */
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login, loginWithBiometrics, isLoading, error } = useAuth();
  const { isAvailable: biometricsAvailable, biometricType } = useBiometrics();

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    const success = await login(email, password);
    if (success) {
      router.replace('/(tabs)');
    }
  };

  const handleBiometricLogin = async () => {
    const success = await loginWithBiometrics();
    if (success) {
      router.replace('/(tabs)');
    }
  };

  const getBiometricIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (biometricType) {
      case 'facial':
        return 'scan-outline';
      case 'fingerprint':
        return 'finger-print-outline';
      default:
        return 'lock-closed-outline';
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={48} color={colors.primary[600]} />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to participate in governance
          </Text>
        </View>

        {/* Login Form */}
        <Card style={styles.formCard}>
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <Input
            label="Email"
            placeholder="citizen@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.gray[400]} />}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            error={errors.password}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.gray[400]} />}
            rightIcon={
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.gray[400]}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <Link href="/auth/forgot-password" asChild>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </Link>

          <Button
            variant="primary"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          >
            Sign In
          </Button>

          {biometricsAvailable && (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                variant="outline"
                onPress={handleBiometricLogin}
                icon={<Ionicons name={getBiometricIcon()} size={24} color={colors.primary[600]} />}
              >
                Sign in with {biometricType === 'facial' ? 'Face ID' : 'Touch ID'}
              </Button>
            </>
          )}
        </Card>

        {/* OAuth Options */}
        <Card style={styles.oauthCard}>
          <Text style={styles.oauthTitle}>Or continue with</Text>
          <View style={styles.oauthButtons}>
            <Button variant="outline" style={styles.oauthButton}>
              <Ionicons name="logo-apple" size={24} color={colors.text.primary} />
            </Button>
            <Button variant="outline" style={styles.oauthButton}>
              <Ionicons name="logo-google" size={24} color={colors.text.primary} />
            </Button>
          </View>
        </Card>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <Link href="/auth/register" asChild>
            <Text style={styles.registerLink}>Create one</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  formCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.error}15`,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    color: colors.error,
    fontSize: typography.fontSize.sm,
  },
  forgotPassword: {
    color: colors.primary[600],
    fontSize: typography.fontSize.sm,
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  loginButton: {
    marginTop: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    color: colors.text.tertiary,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
  },
  oauthCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  oauthTitle: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
  },
  oauthButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  oauthButton: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  registerText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
  },
  registerLink: {
    color: colors.primary[600],
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
});
