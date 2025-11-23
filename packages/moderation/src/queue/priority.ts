import { ReviewItem } from './review-queue.js';

interface PriorityInput {
  reportCount: number;
  autoFlags: string[];
  contentType: ReviewItem['contentType'];
  createdAt: string;
  authorReputation?: number;
}

export class PriorityCalculator {
  private weights = {
    reportCount: 0.3,
    autoFlags: 0.4,
    age: 0.1,
    contentType: 0.2,
  };

  private contentTypeWeights: Record<ReviewItem['contentType'], number> = {
    thread: 0.7,
    comment: 0.5,
    petition: 0.8,
    group: 0.6,
    user: 0.9,
  };

  private flagSeverity: Record<string, number> = {
    toxicity_high: 1.0,
    toxicity_medium: 0.6,
    spam: 0.4,
    pii: 0.8,
    misinformation: 0.7,
    harassment: 0.9,
    hate_speech: 1.0,
    threats: 1.0,
  };

  calculate(input: PriorityInput): ReviewItem['priority'] {
    let score = 0;

    // Report count factor
    const reportScore = Math.min(input.reportCount / 10, 1);
    score += reportScore * this.weights.reportCount;

    // Auto flags factor
    const flagScore = this.calculateFlagScore(input.autoFlags);
    score += flagScore * this.weights.autoFlags;

    // Content type factor
    const contentScore = this.contentTypeWeights[input.contentType];
    score += contentScore * this.weights.contentType;

    // Age factor (older = higher priority)
    const ageHours = (Date.now() - new Date(input.createdAt).getTime()) / (1000 * 60 * 60);
    const ageScore = Math.min(ageHours / 24, 1); // Max out at 24 hours
    score += ageScore * this.weights.age;

    // Low reputation boost
    if (input.authorReputation !== undefined && input.authorReputation < 100) {
      score *= 1.2;
    }

    return this.scoreToPriority(score);
  }

  private calculateFlagScore(flags: string[]): number {
    if (flags.length === 0) return 0;

    const maxSeverity = Math.max(
      ...flags.map((flag) => this.flagSeverity[flag] || 0.3)
    );

    return maxSeverity;
  }

  private scoreToPriority(score: number): ReviewItem['priority'] {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.3) return 'medium';
    return 'low';
  }

  setWeight(factor: keyof typeof this.weights, weight: number): void {
    this.weights[factor] = weight;
  }

  setFlagSeverity(flag: string, severity: number): void {
    this.flagSeverity[flag] = severity;
  }
}
