interface ThresholdStatus {
  currentSignatures: number;
  thresholdsReached: ThresholdLevel[];
  nextThreshold: ThresholdLevel | null;
  progress: number;
  newThresholdReached?: boolean;
  threshold?: ThresholdLevel;
}

interface ThresholdLevel {
  count: number;
  level: 'local' | 'regional' | 'state' | 'federal';
  action: string;
}

export class ThresholdChecker {
  private thresholds: ThresholdLevel[] = [
    { count: 100, level: 'local', action: 'Triggers local review' },
    { count: 1000, level: 'regional', action: 'Requires regional response' },
    { count: 10000, level: 'state', action: 'Goes to state level' },
    { count: 100000, level: 'federal', action: 'Federal consideration' },
  ];

  private previousCounts = new Map<string, number>();

  async check(petitionId: string): Promise<ThresholdStatus> {
    // Get current signature count
    const currentSignatures = await this.getSignatureCount(petitionId);
    const previousCount = this.previousCounts.get(petitionId) || 0;

    // Determine which thresholds have been reached
    const thresholdsReached = this.thresholds.filter(
      (t) => currentSignatures >= t.count
    );

    // Check if a new threshold was just reached
    const previouslyReached = this.thresholds.filter(
      (t) => previousCount >= t.count
    );
    const newlyReached = thresholdsReached.filter(
      (t) => !previouslyReached.includes(t)
    );

    // Find next threshold
    const nextThreshold = this.thresholds.find(
      (t) => currentSignatures < t.count
    ) || null;

    // Calculate progress to next threshold
    const progress = nextThreshold
      ? (currentSignatures / nextThreshold.count) * 100
      : 100;

    // Update previous count
    this.previousCounts.set(petitionId, currentSignatures);

    return {
      currentSignatures,
      thresholdsReached,
      nextThreshold,
      progress,
      newThresholdReached: newlyReached.length > 0,
      threshold: newlyReached[0],
    };
  }

  private async getSignatureCount(petitionId: string): Promise<number> {
    // In production, query from database
    return 8567; // Placeholder
  }

  getThresholdForLevel(level: string): ThresholdLevel | undefined {
    return this.thresholds.find((t) => t.level === level);
  }

  getAllThresholds(): ThresholdLevel[] {
    return [...this.thresholds];
  }
}
