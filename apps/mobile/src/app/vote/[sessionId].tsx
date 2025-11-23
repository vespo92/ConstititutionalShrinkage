import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { VoteButton } from '@/components/voting/VoteButton';
import { VoteConfirmation } from '@/components/voting/VoteConfirmation';
import { VoteReceipt } from '@/components/voting/VoteReceipt';
import { useVoting } from '@/hooks/useVoting';
import { useBiometrics } from '@/hooks/useBiometrics';
import { colors, spacing, typography } from '@/constants/theme';

type VoteChoice = 'yea' | 'nay' | 'abstain' | null;
type VoteStep = 'select' | 'confirm' | 'biometric' | 'submitting' | 'complete';

/**
 * Voting Interface Screen
 * Cast vote with biometric confirmation and receive verification receipt
 */
export default function VoteScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { getSession, castVote, isLoading } = useVoting();
  const { authenticate, isAvailable: biometricsAvailable } = useBiometrics();

  const [session, setSession] = useState<ReturnType<typeof getSession> | null>(null);
  const [selectedVote, setSelectedVote] = useState<VoteChoice>(null);
  const [step, setStep] = useState<VoteStep>('select');
  const [receipt, setReceipt] = useState<{ hash: string; timestamp: string } | null>(null);

  useEffect(() => {
    if (sessionId) {
      const fetchedSession = getSession(sessionId);
      setSession(fetchedSession || null);
    }
  }, [sessionId, getSession]);

  const handleVoteSelect = async (choice: VoteChoice) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedVote(choice);
  };

  const handleContinue = () => {
    if (!selectedVote) return;
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (biometricsAvailable) {
      setStep('biometric');
      const authenticated = await authenticate('Confirm your vote with biometrics');
      if (!authenticated) {
        Alert.alert('Authentication Failed', 'Please try again to confirm your vote.');
        setStep('confirm');
        return;
      }
    }

    await submitVote();
  };

  const submitVote = async () => {
    setStep('submitting');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const result = await castVote(sessionId!, selectedVote!);
      if (result) {
        setReceipt({
          hash: result.hash,
          timestamp: new Date().toISOString(),
        });
        setStep('complete');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error('Vote submission failed');
      }
    } catch {
      Alert.alert('Error', 'Failed to submit your vote. Please try again.');
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('select');
    } else {
      router.back();
    }
  };

  if (isLoading || !session) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Loading voting session...</Text>
      </View>
    );
  }

  if (session.hasVoted) {
    return (
      <View style={styles.container}>
        <Card style={styles.alreadyVotedCard}>
          <View style={styles.alreadyVotedIcon}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          </View>
          <Text style={styles.alreadyVotedTitle}>Already Voted</Text>
          <Text style={styles.alreadyVotedText}>
            You have already cast your vote in this session.
          </Text>
          <Button variant="primary" onPress={() => router.back()} style={styles.backButton}>
            Return to Voting Sessions
          </Button>
        </Card>
      </View>
    );
  }

  if (step === 'complete' && receipt) {
    return (
      <View style={styles.container}>
        <VoteReceipt
          sessionTitle={session.title}
          voteChoice={selectedVote!}
          receiptHash={receipt.hash}
          timestamp={receipt.timestamp}
          onDone={() => router.back()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Session Header */}
      <Card style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Badge variant="warning">Active Vote</Badge>
          <Text style={styles.deadline}>
            Ends {new Date(session.deadline).toLocaleString()}
          </Text>
        </View>
        <Text style={styles.sessionTitle}>{session.title}</Text>
        <Text style={styles.sessionDescription}>{session.description}</Text>
      </Card>

      {step === 'select' && (
        <>
          {/* Vote Selection */}
          <View style={styles.voteSection}>
            <Text style={styles.instructionText}>Select your vote</Text>
            <View style={styles.voteButtons}>
              <VoteButton
                type="yea"
                selected={selectedVote === 'yea'}
                onPress={() => handleVoteSelect('yea')}
              />
              <VoteButton
                type="nay"
                selected={selectedVote === 'nay'}
                onPress={() => handleVoteSelect('nay')}
              />
              <VoteButton
                type="abstain"
                selected={selectedVote === 'abstain'}
                onPress={() => handleVoteSelect('abstain')}
              />
            </View>
          </View>

          {/* Continue Button */}
          <View style={styles.footer}>
            <Button
              variant="primary"
              onPress={handleContinue}
              disabled={!selectedVote}
              style={styles.continueButton}
            >
              Continue
            </Button>
          </View>
        </>
      )}

      {step === 'confirm' && selectedVote && (
        <VoteConfirmation
          sessionTitle={session.title}
          voteChoice={selectedVote}
          onConfirm={handleConfirm}
          onBack={handleBack}
          isLoading={false}
        />
      )}

      {(step === 'biometric' || step === 'submitting') && (
        <View style={styles.submittingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.submittingText}>
            {step === 'biometric' ? 'Awaiting biometric confirmation...' : 'Submitting your vote...'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
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
  headerCard: {
    marginBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  deadline: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  sessionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sessionDescription: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  voteSection: {
    flex: 1,
    justifyContent: 'center',
  },
  instructionText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  voteButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
  continueButton: {
    marginBottom: spacing.md,
  },
  submittingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submittingText: {
    marginTop: spacing.lg,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  alreadyVotedCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  alreadyVotedIcon: {
    marginBottom: spacing.md,
  },
  alreadyVotedTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  alreadyVotedText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    width: '100%',
  },
});
