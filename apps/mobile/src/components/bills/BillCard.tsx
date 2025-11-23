import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing, typography } from '@/constants/theme';

interface Bill {
  id: string;
  title: string;
  summary: string;
  status: 'draft' | 'active' | 'passed' | 'rejected';
  sponsor: string;
  createdAt: string;
  category?: string;
}

interface BillCardProps {
  bill: Bill;
}

/**
 * BillCard Component
 * Compact card for displaying bill information in lists
 */
export function BillCard({ bill }: BillCardProps) {
  const getStatusVariant = () => {
    switch (bill.status) {
      case 'active':
        return 'primary';
      case 'passed':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Link href={`/bill/${bill.id}`} asChild>
      <Card style={styles.card} pressable>
        <View style={styles.header}>
          <Badge variant={getStatusVariant()}>{bill.status}</Badge>
          <Text style={styles.id}>#{bill.id.slice(0, 8)}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {bill.title}
        </Text>

        <Text style={styles.summary} numberOfLines={2}>
          {bill.summary}
        </Text>

        <View style={styles.footer}>
          <View style={styles.meta}>
            <Ionicons name="person-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.metaText}>{bill.sponsor}</Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.metaText}>
              {new Date(bill.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </Card>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  id: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  summary: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});
