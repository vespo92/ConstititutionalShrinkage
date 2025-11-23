import { ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/constants/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  pressable?: boolean;
  onPress?: () => void;
}

/**
 * Card Component
 * Container component with consistent styling
 */
export function Card({ children, style, pressable = false, onPress }: CardProps) {
  const cardStyles = [styles.card, style];

  if (pressable) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
});
