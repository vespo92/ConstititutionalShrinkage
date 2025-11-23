import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

type VoteChoice = 'yea' | 'nay' | 'abstain';

interface VoteConfirmationProps {
  sessionTitle: string;
  voteChoice: VoteChoice;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}

/**
 * VoteConfirmation Component
 * Confirmation step before submitting vote
 */
export function VoteConfirmation({
  sessionTitle,
  voteChoice,
  onConfirm,
  onBack,
  isLoading,
}: VoteConfirmationProps) {
  const getVoteConfig = () => {
    switch (voteChoice) {
      case 'yea':
        return {
          icon: 'checkmark-circle' as const,
          label: 'Yea',
          color: colors.vote.yea,
        };
      case 'nay':
        return {
          icon: 'close-circle' as const,
          label: 'Nay',
          color: colors.vote.nay,
        };
      case 'abstain':
        return {
          icon: 'remove-circle' as const,
          label: 'Abstain',
          color: colors.vote.abstain,
        };
    }
  };

  const config = getVoteConfig();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={32} color={colors.primary[600]} />
          <Text style={styles.title}>Confirm Your Vote</Text>
        </View>

        <Text style={styles.description}>
          You are about to cast your vote on:
        </Text>

        <Text style={styles.sessionTitle}>{sessionTitle}</Text>

        <View style={styles.votePreview}>
          <Text style={styles.voteLabel}>Your Vote:</Text>
          <View style={[styles.voteBadge, { backgroundColor: `${config.color}20` }]}>
            <Ionicons name={config.icon} size={24} color={config.color} />
            <Text style={[styles.voteText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        <View style={styles.warningBox}>
          <Ionicons name="information-circle" size={20} color={colors.warning} />
          <Text style={styles.warningText}>
            This action cannot be undone. Your vote will be cryptographically
            signed and recorded on the blockchain.
          </Text>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          variant="outline"
          onPress={onBack}
          style={styles.backButton}
          disabled={isLoading}
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          onPress={onConfirm}
          loading={isLoading}
          style={styles.confirmButton}
          icon={<Ionicons name="finger-print" size={20} color={colors.text.inverse} />}
        >
          Confirm Vote
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  sessionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  votePreview: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.lg,
  },
  voteLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  voteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  voteText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: `${colors.warning}15`,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  backButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 2,
  },
});
