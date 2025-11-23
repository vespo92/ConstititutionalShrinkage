import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DelegationCard } from '@/components/delegation/DelegationCard';
import { useDelegations } from '@/hooks/useDelegations';
import { colors, spacing, typography } from '@/constants/theme';

type TabType = 'outgoing' | 'incoming';

/**
 * Delegations Screen
 * Manage delegation relationships - who you delegate to and who delegates to you
 */
export default function DelegationsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('outgoing');
  const {
    outgoingDelegations,
    incomingDelegations,
    isLoading,
    refresh,
    revokeDelegation,
  } = useDelegations();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleRevoke = (delegationId: string, delegateName: string) => {
    Alert.alert(
      'Revoke Delegation',
      `Are you sure you want to revoke your delegation to ${delegateName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => revokeDelegation(delegationId),
        },
      ]
    );
  };

  const getDelegations = () => {
    return activeTab === 'outgoing' ? outgoingDelegations : incomingDelegations;
  };

  const calculateTotalPower = () => {
    return incomingDelegations.reduce((sum, d) => sum + d.weight, 1);
  };

  return (
    <View style={styles.container}>
      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{outgoingDelegations.length}</Text>
            <Text style={styles.summaryLabel}>Delegating To</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{incomingDelegations.length}</Text>
            <Text style={styles.summaryLabel}>Delegators</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{calculateTotalPower()}x</Text>
            <Text style={styles.summaryLabel}>Voting Power</Text>
          </View>
        </View>
      </Card>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <Button
          variant={activeTab === 'outgoing' ? 'primary' : 'ghost'}
          onPress={() => setActiveTab('outgoing')}
          style={styles.tabButton}
        >
          <Ionicons
            name="arrow-forward"
            size={16}
            color={activeTab === 'outgoing' ? colors.text.inverse : colors.text.secondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'outgoing' && styles.tabTextActive,
            ]}
          >
            My Delegations
          </Text>
        </Button>
        <Button
          variant={activeTab === 'incoming' ? 'primary' : 'ghost'}
          onPress={() => setActiveTab('incoming')}
          style={styles.tabButton}
        >
          <Ionicons
            name="arrow-back"
            size={16}
            color={activeTab === 'incoming' ? colors.text.inverse : colors.text.secondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'incoming' && styles.tabTextActive,
            ]}
          >
            Delegated to Me
          </Text>
        </Button>
      </View>

      {/* Delegations List */}
      <FlatList
        data={getDelegations()}
        renderItem={({ item }) => (
          <DelegationCard
            delegation={item}
            type={activeTab}
            onRevoke={
              activeTab === 'outgoing'
                ? () => handleRevoke(item.id, item.delegateName || item.delegatorName || '')
                : undefined
            }
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>
              No {activeTab === 'outgoing' ? 'outgoing' : 'incoming'} delegations
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'outgoing'
                ? 'Delegate your vote to trusted representatives'
                : "When others delegate to you, they'll appear here"}
            </Text>
            {activeTab === 'outgoing' && (
              <Button variant="primary" style={styles.emptyButton}>
                Find Delegates
              </Button>
            )}
          </View>
        }
        ListHeaderComponent={
          activeTab === 'outgoing' && outgoingDelegations.length > 0 ? (
            <Button
              variant="outline"
              style={styles.addButton}
              icon={<Ionicons name="add" size={20} color={colors.primary[600]} />}
            >
              Add New Delegation
            </Button>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  summaryCard: {
    margin: spacing.md,
    marginBottom: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.primary[600],
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
  },
  tabBar: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.text.inverse,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  addButton: {
    marginBottom: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyButton: {
    marginTop: spacing.lg,
  },
});
