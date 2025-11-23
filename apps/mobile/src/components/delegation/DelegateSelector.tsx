import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

interface Delegate {
  id: string;
  name: string;
  region: string;
  specialties: string[];
  trustScore: number;
  delegatorCount: number;
}

interface DelegateSelectorProps {
  delegates: Delegate[];
  onSelect: (delegate: Delegate) => void;
  isLoading?: boolean;
}

/**
 * DelegateSelector Component
 * Search and select delegates for vote delegation
 */
export function DelegateSelector({
  delegates,
  onSelect,
  isLoading = false,
}: DelegateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDelegates = delegates.filter(
    (delegate) =>
      delegate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delegate.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delegate.specialties.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const renderDelegate = ({ item: delegate }: { item: Delegate }) => (
    <Card style={styles.delegateCard} pressable onPress={() => onSelect(delegate)}>
      <View style={styles.delegateHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {delegate.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.delegateInfo}>
          <Text style={styles.delegateName}>{delegate.name}</Text>
          <View style={styles.regionRow}>
            <Ionicons name="location-outline" size={12} color={colors.text.tertiary} />
            <Text style={styles.regionText}>{delegate.region}</Text>
          </View>
        </View>
        <View style={styles.trustScore}>
          <Text style={styles.trustScoreValue}>{delegate.trustScore}%</Text>
          <Text style={styles.trustScoreLabel}>Trust</Text>
        </View>
      </View>

      <View style={styles.specialties}>
        {delegate.specialties.slice(0, 3).map((specialty, index) => (
          <Badge key={index} variant="default" size="sm">
            {specialty}
          </Badge>
        ))}
      </View>

      <View style={styles.delegateFooter}>
        <View style={styles.stat}>
          <Ionicons name="people-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.statText}>{delegate.delegatorCount} delegators</Text>
        </View>
        <Button variant="primary" size="sm">
          Select
        </Button>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.gray[400]}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search delegates by name, region, or expertise..."
          placeholderTextColor={colors.gray[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Delegates List */}
      <FlatList
        data={filteredDelegates}
        renderItem={renderDelegate}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No delegates found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search criteria
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  delegateCard: {
    marginBottom: spacing.md,
  },
  delegateHeader: {
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
  },
  avatarText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.primary[700],
  },
  delegateInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  delegateName: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  regionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  trustScore: {
    alignItems: 'center',
  },
  trustScoreValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.success,
  },
  trustScoreLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  delegateFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
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
  },
});
