import { View, Text, StyleSheet, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

type VoteChoice = 'yea' | 'nay' | 'abstain';

interface VoteReceiptProps {
  sessionTitle: string;
  voteChoice: VoteChoice;
  receiptHash: string;
  timestamp: string;
  onDone: () => void;
}

/**
 * VoteReceipt Component
 * Confirmation receipt after successful vote submission
 */
export function VoteReceipt({
  sessionTitle,
  voteChoice,
  receiptHash,
  timestamp,
  onDone,
}: VoteReceiptProps) {
  const getVoteConfig = () => {
    switch (voteChoice) {
      case 'yea':
        return { label: 'Yea', color: colors.vote.yea };
      case 'nay':
        return { label: 'Nay', color: colors.vote.nay };
      case 'abstain':
        return { label: 'Abstain', color: colors.vote.abstain };
    }
  };

  const config = getVoteConfig();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just voted on "${sessionTitle}"!\n\nVote: ${config.label}\nReceipt: ${receiptHash}\n\n#ConstitutionalShrinkage #DirectDemocracy`,
      });
    } catch {
      // User cancelled share
    }
  };

  return (
    <View style={styles.container}>
      {/* Success Animation */}
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={80} color={colors.success} />
      </View>

      <Text style={styles.title}>Vote Recorded!</Text>
      <Text style={styles.subtitle}>
        Your vote has been securely recorded
      </Text>

      {/* Receipt Card */}
      <Card style={styles.receiptCard}>
        <View style={styles.receiptHeader}>
          <Ionicons name="receipt" size={24} color={colors.primary[600]} />
          <Text style={styles.receiptTitle}>Vote Receipt</Text>
        </View>

        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Session</Text>
          <Text style={styles.receiptValue} numberOfLines={2}>
            {sessionTitle}
          </Text>
        </View>

        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Your Vote</Text>
          <View style={[styles.voteBadge, { backgroundColor: `${config.color}20` }]}>
            <Text style={[styles.voteText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Timestamp</Text>
          <Text style={styles.receiptValue}>
            {new Date(timestamp).toLocaleString()}
          </Text>
        </View>

        <View style={styles.hashSection}>
          <Text style={styles.receiptLabel}>Verification Hash</Text>
          <View style={styles.hashContainer}>
            <Text style={styles.hashText} selectable>
              {receiptHash}
            </Text>
            <Ionicons name="copy-outline" size={16} color={colors.text.tertiary} />
          </View>
        </View>
      </Card>

      {/* QR Code Placeholder */}
      <Card style={styles.qrCard}>
        <View style={styles.qrPlaceholder}>
          <Ionicons name="qr-code" size={80} color={colors.gray[300]} />
        </View>
        <Text style={styles.qrText}>
          Scan to verify your vote on the public ledger
        </Text>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          variant="outline"
          onPress={handleShare}
          icon={<Ionicons name="share-outline" size={20} color={colors.primary[600]} />}
          style={styles.shareButton}
        >
          Share
        </Button>
        <Button variant="primary" onPress={onDone} style={styles.doneButton}>
          Done
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  receiptCard: {
    width: '100%',
    marginBottom: spacing.md,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  receiptTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  receiptLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  receiptValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  voteBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  voteText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  hashSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  hashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[100],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  hashText: {
    fontSize: typography.fontSize.xs,
    fontFamily: 'monospace',
    color: colors.text.secondary,
    flex: 1,
  },
  qrCard: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  qrPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  qrText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  shareButton: {
    flex: 1,
  },
  doneButton: {
    flex: 2,
  },
});
