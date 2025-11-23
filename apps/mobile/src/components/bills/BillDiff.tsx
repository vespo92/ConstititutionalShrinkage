import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

interface BillDiffProps {
  content: string;
  previousContent?: string;
}

/**
 * BillDiff Component
 * Displays bill content with optional diff highlighting
 */
export function BillDiff({ content, previousContent }: BillDiffProps) {
  // Simple content display for now - could be enhanced with actual diff
  const lines = content.split('\n');

  return (
    <ScrollView style={styles.container} horizontal={false}>
      <View style={styles.content}>
        {lines.map((line, index) => {
          const isHeader = line.startsWith('#');
          const isListItem = line.startsWith('-') || line.startsWith('*');
          const isQuote = line.startsWith('>');

          return (
            <View key={index} style={styles.lineContainer}>
              <Text style={styles.lineNumber}>{index + 1}</Text>
              <Text
                style={[
                  styles.lineText,
                  isHeader && styles.headerText,
                  isListItem && styles.listText,
                  isQuote && styles.quoteText,
                ]}
              >
                {line || ' '}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 400,
  },
  content: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  lineContainer: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  lineNumber: {
    width: 32,
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginRight: spacing.sm,
    fontFamily: 'monospace',
  },
  lineText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  headerText: {
    fontWeight: '700',
    color: colors.primary[700],
  },
  listText: {
    color: colors.text.secondary,
  },
  quoteText: {
    fontStyle: 'italic',
    color: colors.text.tertiary,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary[300],
    paddingLeft: spacing.sm,
  },
});
