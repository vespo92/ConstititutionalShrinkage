import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

/**
 * Forgot Password Screen
 * Request password reset via email
 */
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { resetPassword, isLoading } = useAuth();

  const validate = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    setError('');
    return true;
  };

  const handleReset = async () => {
    if (!validate()) return;

    const result = await resetPassword(email);
    if (result) {
      setSuccess(true);
    } else {
      setError('Failed to send reset email. Please try again.');
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <Card style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="mail-open" size={48} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successText}>
            We've sent password reset instructions to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <Button
            variant="primary"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            Back to Sign In
          </Button>
        </Card>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="key-outline" size={32} color={colors.primary[600]} />
          </View>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            No worries! Enter your email and we'll send you reset instructions.
          </Text>
        </View>

        {/* Form */}
        <Card style={styles.formCard}>
          <Input
            label="Email Address"
            placeholder="citizen@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={error}
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.gray[400]} />}
          />

          <Button
            variant="primary"
            onPress={handleReset}
            loading={isLoading}
            style={styles.resetButton}
          >
            Send Reset Link
          </Button>
        </Card>

        {/* Back Link */}
        <Button
          variant="ghost"
          onPress={() => router.back()}
          icon={<Ionicons name="arrow-back" size={20} color={colors.primary[600]} />}
          style={styles.backLink}
        >
          Back to Sign In
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
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
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  formCard: {
    padding: spacing.lg,
  },
  resetButton: {
    marginTop: spacing.md,
  },
  backLink: {
    marginTop: spacing.lg,
    alignSelf: 'center',
  },
  successCard: {
    margin: spacing.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.success}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  successText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  emailHighlight: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  backButton: {
    marginTop: spacing.xl,
    width: '100%',
  },
});
