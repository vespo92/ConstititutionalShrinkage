import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BillTimeline } from '@/components/bills/BillTimeline';
import { BillDiff } from '@/components/bills/BillDiff';
import { useBills } from '@/hooks/useBills';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

type TabType = 'overview' | 'content' | 'timeline' | 'discussion';

/**
 * Bill Detail Screen
 * View full bill details, content, timeline, and related voting sessions
 */
export default function BillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getBill, isLoading } = useBills();
  const [bill, setBill] = useState<ReturnType<typeof useBills>['bills'][0] | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    if (id) {
      const fetchedBill = getBill(id);
      setBill(fetchedBill || null);
    }
  }, [id, getBill]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Loading bill details...</Text>
      </View>
    );
  }

  if (!bill) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="document-text-outline" size={64} color={colors.gray[300]} />
        <Text style={styles.errorTitle}>Bill Not Found</Text>
        <Text style={styles.errorText}>
          The bill you're looking for doesn't exist or has been removed.
        </Text>
      </View>
    );
  }

  const getStatusColor = () => {
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
    <View style={styles.container}>
      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {(['overview', 'content', 'timeline', 'discussion'] as TabType[]).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'primary' : 'ghost'}
            size="sm"
            onPress={() => setActiveTab(tab)}
            style={styles.tabButton}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Badge variant={getStatusColor()}>{bill.status}</Badge>
            <Text style={styles.billId}>#{bill.id.slice(0, 8)}</Text>
          </View>
          <Text style={styles.billTitle}>{bill.title}</Text>
          <Text style={styles.billSummary}>{bill.summary}</Text>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.metaLabel}>Sponsor</Text>
              <Text style={styles.metaValue}>{bill.sponsor}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.metaLabel}>Introduced</Text>
              <Text style={styles.metaValue}>
                {new Date(bill.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.metaLabel}>Region</Text>
              <Text style={styles.metaValue}>{bill.region || 'National'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaValue}>{bill.category || 'General'}</Text>
            </View>
          </View>
        </Card>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Voting Stats */}
            {bill.votingSession && (
              <Card style={styles.votingCard}>
                <Text style={styles.sectionTitle}>Current Voting</Text>
                <View style={styles.voteProgress}>
                  <View style={styles.voteBar}>
                    <View
                      style={[
                        styles.voteBarFill,
                        { flex: bill.votingSession.yea, backgroundColor: colors.vote.yea },
                      ]}
                    />
                    <View
                      style={[
                        styles.voteBarFill,
                        { flex: bill.votingSession.nay, backgroundColor: colors.vote.nay },
                      ]}
                    />
                    <View
                      style={[
                        styles.voteBarFill,
                        { flex: bill.votingSession.abstain, backgroundColor: colors.vote.abstain },
                      ]}
                    />
                  </View>
                  <View style={styles.voteCounts}>
                    <View style={styles.voteCount}>
                      <View style={[styles.voteDot, { backgroundColor: colors.vote.yea }]} />
                      <Text style={styles.voteCountText}>{bill.votingSession.yea} Yea</Text>
                    </View>
                    <View style={styles.voteCount}>
                      <View style={[styles.voteDot, { backgroundColor: colors.vote.nay }]} />
                      <Text style={styles.voteCountText}>{bill.votingSession.nay} Nay</Text>
                    </View>
                    <View style={styles.voteCount}>
                      <View style={[styles.voteDot, { backgroundColor: colors.vote.abstain }]} />
                      <Text style={styles.voteCountText}>{bill.votingSession.abstain} Abstain</Text>
                    </View>
                  </View>
                </View>
                <Link href={`/vote/${bill.votingSession.id}`} asChild>
                  <Button variant="primary" style={styles.voteButton}>
                    Cast Your Vote
                  </Button>
                </Link>
              </Card>
            )}

            {/* Related Bills */}
            <Card style={styles.relatedCard}>
              <Text style={styles.sectionTitle}>Related Legislation</Text>
              <Text style={styles.placeholderText}>No related bills found</Text>
            </Card>
          </>
        )}

        {activeTab === 'content' && (
          <Card style={styles.contentCard}>
            <Text style={styles.sectionTitle}>Bill Content</Text>
            <BillDiff content={bill.content || 'Bill content not available.'} />
          </Card>
        )}

        {activeTab === 'timeline' && (
          <Card style={styles.timelineCard}>
            <Text style={styles.sectionTitle}>Bill Timeline</Text>
            <BillTimeline events={bill.timeline || []} />
          </Card>
        )}

        {activeTab === 'discussion' && (
          <Card style={styles.discussionCard}>
            <Text style={styles.sectionTitle}>Discussion</Text>
            <Text style={styles.placeholderText}>
              Discussion feature coming soon. Stay tuned!
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  tabBar: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tabBarContent: {
    padding: spacing.sm,
    gap: spacing.sm,
  },
  tabButton: {
    paddingHorizontal: spacing.md,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  billId: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
  },
  billTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  billSummary: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
    marginBottom: spacing.lg,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  metaItem: {
    width: '45%',
    gap: spacing.xs,
  },
  metaLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  metaValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  votingCard: {
    marginBottom: spacing.md,
  },
  voteProgress: {
    marginBottom: spacing.md,
  },
  voteBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.gray[200],
    marginBottom: spacing.sm,
  },
  voteBarFill: {
    height: '100%',
  },
  voteCounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  voteCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  voteDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  voteCountText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  voteButton: {
    marginTop: spacing.sm,
  },
  relatedCard: {
    marginBottom: spacing.md,
  },
  contentCard: {
    marginBottom: spacing.md,
  },
  timelineCard: {
    marginBottom: spacing.md,
  },
  discussionCard: {
    marginBottom: spacing.md,
  },
  placeholderText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
  },
});
