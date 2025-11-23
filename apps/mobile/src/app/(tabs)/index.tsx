import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useBills } from '@/hooks/useBills';
import { useVoting } from '@/hooks/useVoting';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

/**
 * Dashboard Screen
 * Home tab showing active votes, recent bills, and quick actions
 */
export default function DashboardScreen() {
  const { user } = useAuth();
  const { recentBills, isLoading: billsLoading, refresh: refreshBills } = useBills();
  const { activeSessions, isLoading: votingLoading, refresh: refreshVoting } = useVoting();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshBills(), refreshVoting()]);
    setRefreshing(false);
  }, [refreshBills, refreshVoting]);

  const isLoading = billsLoading || votingLoading;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.displayName || 'Citizen'}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color={colors.primary[600]} />
          <Text style={styles.statNumber}>{activeSessions.length}</Text>
          <Text style={styles.statLabel}>Active Votes</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="document-text" size={24} color={colors.secondary[600]} />
          <Text style={styles.statNumber}>{recentBills.length}</Text>
          <Text style={styles.statLabel}>Pending Bills</Text>
        </Card>
      </View>

      {/* Active Voting Sessions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Voting Sessions</Text>
          <Link href="/(tabs)/vote" asChild>
            <Text style={styles.seeAllLink}>See All</Text>
          </Link>
        </View>
        {activeSessions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="checkmark-done" size={32} color={colors.gray[400]} />
            <Text style={styles.emptyText}>No active voting sessions</Text>
          </Card>
        ) : (
          activeSessions.slice(0, 3).map((session) => (
            <Link key={session.id} href={`/vote/${session.id}`} asChild>
              <Card style={styles.sessionCard} pressable>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle} numberOfLines={2}>
                    {session.title}
                  </Text>
                  <Text style={styles.sessionDeadline}>
                    Ends: {new Date(session.deadline).toLocaleDateString()}
                  </Text>
                </View>
                <Badge variant="warning">Vote Now</Badge>
              </Card>
            </Link>
          ))
        )}
      </View>

      {/* Recent Bills */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Legislation</Text>
          <Link href="/(tabs)/bills" asChild>
            <Text style={styles.seeAllLink}>See All</Text>
          </Link>
        </View>
        {recentBills.slice(0, 5).map((bill) => (
          <Link key={bill.id} href={`/bill/${bill.id}`} asChild>
            <Card style={styles.billCard} pressable>
              <View style={styles.billHeader}>
                <Badge variant={bill.status === 'active' ? 'primary' : 'default'}>
                  {bill.status}
                </Badge>
                <Text style={styles.billDate}>
                  {new Date(bill.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.billTitle} numberOfLines={2}>{bill.title}</Text>
              <Text style={styles.billSummary} numberOfLines={2}>{bill.summary}</Text>
            </Card>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  welcomeSection: {
    marginBottom: spacing.lg,
  },
  welcomeText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  userName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  statNumber: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  seeAllLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.sm,
    color: colors.text.tertiary,
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sessionInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  sessionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text.primary,
  },
  sessionDeadline: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  billCard: {
    marginBottom: spacing.sm,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  billDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  billTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  billSummary: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
});
