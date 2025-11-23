export interface ToxicityResult {
  isToxic: boolean;
  score: number;
  categories: {
    harassment: number;
    hateSpeech: number;
    threats: number;
    profanity: number;
    personalAttack: number;
  };
  flaggedPhrases: string[];
}

export class ToxicityFilter {
  private thresholds = {
    harassment: 0.7,
    hateSpeech: 0.6,
    threats: 0.5,
    profanity: 0.8,
    personalAttack: 0.7,
  };

  async analyze(content: string): Promise<ToxicityResult> {
    const lowercaseContent = content.toLowerCase();

    // In production, use ML model for toxicity detection
    // This is a simplified placeholder implementation

    const categories = {
      harassment: this.detectHarassment(lowercaseContent),
      hateSpeech: this.detectHateSpeech(lowercaseContent),
      threats: this.detectThreats(lowercaseContent),
      profanity: this.detectProfanity(lowercaseContent),
      personalAttack: this.detectPersonalAttack(lowercaseContent),
    };

    const maxScore = Math.max(...Object.values(categories));
    const isToxic = Object.entries(categories).some(
      ([category, score]) => score >= this.thresholds[category as keyof typeof this.thresholds]
    );

    const flaggedPhrases = this.extractFlaggedPhrases(content);

    return {
      isToxic,
      score: maxScore,
      categories,
      flaggedPhrases,
    };
  }

  private detectHarassment(content: string): number {
    const patterns = [
      /you('re| are) (stupid|idiot|dumb)/i,
      /shut up/i,
      /go away/i,
    ];
    return this.matchPatterns(content, patterns);
  }

  private detectHateSpeech(content: string): number {
    // Placeholder - would use comprehensive hate speech detection
    return 0;
  }

  private detectThreats(content: string): number {
    const patterns = [
      /i('ll| will) (hurt|harm|destroy)/i,
      /you('ll| will) (regret|pay|suffer)/i,
    ];
    return this.matchPatterns(content, patterns);
  }

  private detectProfanity(content: string): number {
    // Would use profanity word list
    return 0;
  }

  private detectPersonalAttack(content: string): number {
    const patterns = [
      /you('re| are) (a |an )?\w*(fool|loser|failure)/i,
    ];
    return this.matchPatterns(content, patterns);
  }

  private matchPatterns(content: string, patterns: RegExp[]): number {
    const matchCount = patterns.filter((p) => p.test(content)).length;
    return Math.min(matchCount / patterns.length, 1);
  }

  private extractFlaggedPhrases(content: string): string[] {
    // Extract the actual problematic phrases
    return [];
  }

  setThreshold(category: keyof typeof this.thresholds, threshold: number): void {
    this.thresholds[category] = threshold;
  }
}
