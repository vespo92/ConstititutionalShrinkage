import { ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Button Component
 * Reusable button with multiple variants and sizes
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isDisabled ? colors.primary[300] : colors.primary[600],
        };
      case 'secondary':
        return {
          backgroundColor: isDisabled ? colors.secondary[300] : colors.secondary[600],
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: isDisabled ? colors.border.medium : colors.primary[600],
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      case 'destructive':
        return {
          backgroundColor: isDisabled ? `${colors.error}80` : colors.error,
        };
    }
  };

  const getTextColor = (): string => {
    if (isDisabled && variant !== 'outline' && variant !== 'ghost') {
      return colors.text.inverse;
    }
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'destructive':
        return colors.text.inverse;
      case 'outline':
        return isDisabled ? colors.text.tertiary : colors.primary[600];
      case 'ghost':
        return isDisabled ? colors.text.tertiary : colors.primary[600];
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
        };
      case 'md':
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        };
      case 'lg':
        return {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
        };
    }
  };

  const getTextSize = (): number => {
    switch (size) {
      case 'sm':
        return typography.fontSize.sm;
      case 'md':
        return typography.fontSize.md;
      case 'lg':
        return typography.fontSize.lg;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary[600] : colors.text.inverse}
        />
      ) : (
        <>
          {icon}
          {typeof children === 'string' ? (
            <Text
              style={[
                styles.text,
                { color: getTextColor(), fontSize: getTextSize() },
                icon ? styles.textWithIcon : null,
                textStyle,
              ]}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textWithIcon: {
    marginLeft: spacing.sm,
  },
});
