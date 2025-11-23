import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

interface Delegation {
  id: string;
  delegateName?: string;
  delegatorName?: string;
  category: string;
  weight: number;
  createdAt: string;
  status: 'active' | 'pending' | 'expired';
}

interface DelegationCardProps {
  delegation: Delegation;
  type: 'outgoing' | 'incoming';
  onRevoke?: () => void;
}

/**
 * DelegationCard Component
 * Displays delegation information with action buttons
 */
export function DelegationCard({ delegation, type, onRevoke }: DelegationCardProps) {
  const personName = type === 'outgoing' ? delegation.delegateName : delegation.delegatorName;
  const personRole = type === 'outgoing' ? 'Delegate' : 'Delegator';

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {personName?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{personName || 'Unknown'}</Text>
          <Text style={styles.role}>{personRole}</Text>
        </View>

        {/* Status Badge */}
        <Badge
          variant={
            delegation.status === 'active'
              ? 'success'
              : delegation.status === 'pending'
              ? 'warning'
              : 'default'
          }
        >
          {delegation.status}
        </Badge>
      </View>

      {/* Delegation Details */}
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="folder-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.detailLabel}>Category</Text>
          <Text style={styles.detailValue}>{delegation.category}</Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="flash-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.detailLabel}>Weight</Text>
          <Text style={styles.detailValue}>{delegation.weight}x</Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.detailLabel}>Since</Text>
          <Text style={styles.detailValue}>
            {new Date(delegation.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Actions */}
      {type === 'outgoing' && onRevoke && delegation.status === 'active' && (
        <View style={styles.actions}>
          <Button
            variant="outline"
            size="sm"
            icon={<Ionicons name="settings-outline" size={16} color={colors.primary[600]} />}
            style={styles.actionButton}
          >
            Modify
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onPress={onRevoke}
            icon={<Ionicons name="close-outline" size={16} color={colors.text.inverse} />}
            style={styles.actionButton}
          >
            Revoke
          </Button>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.primary[700],
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  role: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  details: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.text.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
