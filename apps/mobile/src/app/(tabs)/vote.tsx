import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useVoting } from '@/hooks/useVoting';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

type TabType = 'active' | 'completed' | 'upcoming';

/**
 * Vote Screen
 * View and participate in active voting sessions
 */
export default function VoteScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const { activeSessions, completedSessions, upcomingSessions, isLoading, refresh } = useVoting();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const getSessions = () => {
    switch (activeTab) {
      case 'active':
        return activeSessions;
      case 'completed':
        return completedSessions;
      case 'upcoming':
        return upcomingSessions;
    }
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    if (hours > 0) return `${hours}h remaining`;

    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m remaining`;
  };

  const renderSessionItem = ({ item: session }: { item: typeof activeSessions[0] }) => (
    <Link href={`/vote/${session.id}`} asChild>
      <Card style={styles.sessionCard} pressable>
        <View style={styles.sessionHeader}>
          <Badge
            variant={
              session.status === 'active'
                ? 'warning'
                : session.status === 'completed'
                ? 'success'
                : 'default'
            }
          >
            {session.status}
          </Badge>
          {session.hasVoted && (
            <View style={styles.votedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.votedText}>Voted</Text>
            </View>
          )}
        </View>

        <Text style={styles.sessionTitle} numberOfLines={2}>
          {session.title}
        </Text>

        <Text style={styles.sessionDescription} numberOfLines={2}>
          {session.description}
        </Text>

        <View style={styles.sessionFooter}>
          <View style={styles.timerContainer}>
            <Ionicons
              name="time-outline"
              size={16}
              color={session.status === 'active' ? colors.warning : colors.text.tertiary}
            />
            <Text
              style={[
                styles.timerText,
                session.status === 'active' && styles.timerTextActive,
              ]}
            >
              {getTimeRemaining(session.deadline)}
            </Text>
          </View>

          <View style={styles.voteStats}>
            <View style={styles.voteStat}>
              <View style={[styles.voteStatDot, { backgroundColor: colors.vote.yea }]} />
              <Text style={styles.voteStatText}>{session.votes.yea}</Text>
            </View>
            <View style={styles.voteStat}>
              <View style={[styles.voteStatDot, { backgroundColor: colors.vote.nay }]} />
              <Text style={styles.voteStatText}>{session.votes.nay}</Text>
            </View>
            <View style={styles.voteStat}>
              <View style={[styles.voteStatDot, { backgroundColor: colors.vote.abstain }]} />
              <Text style={styles.voteStatText}>{session.votes.abstain}</Text>
            </View>
          </View>
        </View>

        {session.status === 'active' && !session.hasVoted && (
          <Button variant="primary" style={styles.voteButton}>
            Cast Your Vote
          </Button>
        )}
      </Card>
    </Link>
  );

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {(['active', 'completed', 'upcoming'] as TabType[]).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'primary' : 'ghost'}
            size="sm"
            onPress={() => setActiveTab(tab)}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'active' && activeSessions.length > 0 && (
              <Badge variant="error" size="sm" style={styles.tabBadge}>
                {activeSessions.length}
              </Badge>
            )}
          </Button>
        ))}
      </View>

      {/* Sessions List */}
      <FlatList
        data={getSessions()}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name={
                activeTab === 'active'
                  ? 'checkmark-done'
                  : activeTab === 'completed'
                  ? 'archive-outline'
                  : 'calendar-outline'
              }
              size={48}
              color={colors.gray[300]}
            />
            <Text style={styles.emptyTitle}>
              No {activeTab} voting sessions
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'active'
                ? "You're all caught up!"
                : activeTab === 'completed'
                ? 'Your voting history will appear here'
                : 'Upcoming sessions will be shown here'}
            </Text>
          </View>
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
  tabBar: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.background.primary,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  tabButtonActive: {
    backgroundColor: colors.primary[600],
  },
  tabBadge: {
    marginLeft: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
  },
  sessionCard: {
    marginBottom: spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  votedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  votedText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: '500',
  },
  sessionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sessionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    marginBottom: spacing.md,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  timerTextActive: {
    color: colors.warning,
    fontWeight: '500',
  },
  voteStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  voteStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  voteStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  voteStatText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  voteButton: {
    marginTop: spacing.sm,
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
  },
});
