import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

interface TimelineEvent {
  id: string;
  type: 'created' | 'updated' | 'voting_started' | 'voting_ended' | 'passed' | 'rejected';
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
}

interface BillTimelineProps {
  events: TimelineEvent[];
}

/**
 * BillTimeline Component
 * Visual timeline of bill events and status changes
 */
export function BillTimeline({ events }: BillTimelineProps) {
  const getEventConfig = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'created':
        return { icon: 'add-circle' as const, color: colors.primary[600] };
      case 'updated':
        return { icon: 'pencil' as const, color: colors.info };
      case 'voting_started':
        return { icon: 'play-circle' as const, color: colors.warning };
      case 'voting_ended':
        return { icon: 'stop-circle' as const, color: colors.gray[500] };
      case 'passed':
        return { icon: 'checkmark-circle' as const, color: colors.success };
      case 'rejected':
        return { icon: 'close-circle' as const, color: colors.error };
    }
  };

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={32} color={colors.gray[300]} />
        <Text style={styles.emptyText}>No timeline events yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {events.map((event, index) => {
        const config = getEventConfig(event.type);
        const isLast = index === events.length - 1;

        return (
          <View key={event.id} style={styles.eventRow}>
            {/* Timeline indicator */}
            <View style={styles.indicatorColumn}>
              <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
                <Ionicons name={config.icon} size={16} color={config.color} />
              </View>
              {!isLast && <View style={styles.line} />}
            </View>

            {/* Event content */}
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              {event.description && (
                <Text style={styles.eventDescription}>{event.description}</Text>
              )}
              <View style={styles.eventMeta}>
                <Ionicons name="time-outline" size={12} color={colors.text.tertiary} />
                <Text style={styles.eventTime}>
                  {new Date(event.timestamp).toLocaleString()}
                </Text>
                {event.actor && (
                  <>
                    <Text style={styles.eventDivider}>•</Text>
                    <Text style={styles.eventActor}>{event.actor}</Text>
                  </>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    marginTop: spacing.sm,
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
  },
  eventRow: {
    flexDirection: 'row',
  },
  indicatorColumn: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.xs,
  },
  eventContent: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  eventTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  eventDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  eventTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  eventDivider: {
    color: colors.text.tertiary,
  },
  eventActor: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
});
