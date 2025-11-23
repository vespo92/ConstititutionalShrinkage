import { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

/**
 * Badge Component
 * Status indicator with different variants
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  style,
}: BadgeProps) {
  const getVariantStyles = (): { bg: string; text: string } => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primary[100], text: colors.primary[700] };
      case 'secondary':
        return { bg: colors.secondary[100], text: colors.secondary[700] };
      case 'success':
        return { bg: `${colors.success}20`, text: colors.success };
      case 'warning':
        return { bg: `${colors.warning}20`, text: colors.warning };
      case 'error':
        return { bg: `${colors.error}20`, text: colors.error };
      default:
        return { bg: colors.gray[100], text: colors.gray[600] };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: variantStyles.bg },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.text,
            size === 'sm' ? styles.textSm : styles.textMd,
            { color: variantStyles.text },
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
  },
  badgeMd: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  textSm: {
    fontSize: typography.fontSize.xs,
  },
  textMd: {
    fontSize: typography.fontSize.sm,
  },
});
