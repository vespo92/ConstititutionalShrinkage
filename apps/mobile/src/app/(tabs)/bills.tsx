import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useBills } from '@/hooks/useBills';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

type FilterStatus = 'all' | 'active' | 'passed' | 'rejected' | 'draft';

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'passed', label: 'Passed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'draft', label: 'Draft' },
];

/**
 * Bills Screen
 * Browse and search legislation with filtering
 */
export default function BillsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const { bills, isLoading, refresh } = useBills();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      searchQuery === '' ||
      bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderBillItem = ({ item: bill }: { item: typeof bills[0] }) => (
    <Link href={`/bill/${bill.id}`} asChild>
      <Card style={styles.billCard} pressable>
        <View style={styles.billHeader}>
          <Badge
            variant={
              bill.status === 'active'
                ? 'primary'
                : bill.status === 'passed'
                ? 'success'
                : bill.status === 'rejected'
                ? 'error'
                : 'default'
            }
          >
            {bill.status}
          </Badge>
          <Text style={styles.billId}>#{bill.id.slice(0, 8)}</Text>
        </View>
        <Text style={styles.billTitle} numberOfLines={2}>
          {bill.title}
        </Text>
        <Text style={styles.billSummary} numberOfLines={3}>
          {bill.summary}
        </Text>
        <View style={styles.billFooter}>
          <View style={styles.billMeta}>
            <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.billMetaText}>
              {new Date(bill.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.billMeta}>
            <Ionicons name="person-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.billMetaText}>{bill.sponsor}</Text>
          </View>
        </View>
      </Card>
    </Link>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.gray[400]}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search legislation..."
          placeholderTextColor={colors.gray[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setSearchQuery('')}
            icon={<Ionicons name="close-circle" size={20} color={colors.gray[400]} />}
          />
        )}
      </View>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        {FILTER_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={statusFilter === option.value ? 'primary' : 'outline'}
            size="sm"
            onPress={() => setStatusFilter(option.value)}
            style={styles.filterButton}
          >
            {option.label}
          </Button>
        ))}
      </View>

      {/* Results Count */}
      <Text style={styles.resultsCount}>
        {filteredBills.length} {filteredBills.length === 1 ? 'bill' : 'bills'} found
      </Text>

      {/* Bills List */}
      <FlatList
        data={filteredBills}
        renderItem={renderBillItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No bills found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filters
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
  },
  resultsCount: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  billCard: {
    marginBottom: spacing.md,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  billId: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
  },
  billTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  billSummary: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    marginBottom: spacing.md,
  },
  billFooter: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  billMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  billMetaText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
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
