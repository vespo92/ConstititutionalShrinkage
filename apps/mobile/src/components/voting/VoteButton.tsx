import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

type VoteType = 'yea' | 'nay' | 'abstain';

interface VoteButtonProps {
  type: VoteType;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * VoteButton Component
 * Large interactive button for casting votes with haptic feedback
 */
export function VoteButton({ type, selected, onPress, disabled = false }: VoteButtonProps) {
  const getConfig = () => {
    switch (type) {
      case 'yea':
        return {
          icon: 'checkmark' as const,
          label: 'Yea',
          color: colors.vote.yea,
          bgColor: selected ? colors.vote.yea : colors.background.primary,
        };
      case 'nay':
        return {
          icon: 'close' as const,
          label: 'Nay',
          color: colors.vote.nay,
          bgColor: selected ? colors.vote.nay : colors.background.primary,
        };
      case 'abstain':
        return {
          icon: 'remove' as const,
          label: 'Abstain',
          color: colors.vote.abstain,
          bgColor: selected ? colors.vote.abstain : colors.background.primary,
        };
    }
  };

  const config = getConfig();
  const textColor = selected ? colors.text.inverse : config.color;
  const iconColor = selected ? colors.text.inverse : config.color;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: config.bgColor },
        selected && styles.buttonSelected,
        !selected && { borderColor: config.color },
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, selected && { backgroundColor: 'transparent' }]}>
        <Ionicons name={config.icon} size={32} color={iconColor} />
      </View>
      <Text style={[styles.label, { color: textColor }]}>{config.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 100,
    height: 120,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  buttonSelected: {
    transform: [{ scale: 1.05 }],
    ...shadows.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
});
