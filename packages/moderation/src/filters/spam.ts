export interface SpamResult {
  isSpam: boolean;
  score: number;
  signals: SpamSignal[];
}

interface SpamSignal {
  type: string;
  description: string;
  weight: number;
}

export class SpamFilter {
  private patterns = {
    promotional: [
      /buy now/i,
      /click here/i,
      /limited time/i,
      /act now/i,
      /free (money|gift|offer)/i,
      /make \$\d+/i,
      /earn \$\d+/i,
      /100% free/i,
    ],
    phishing: [
      /verify your account/i,
      /confirm your identity/i,
      /update your payment/i,
      /suspended account/i,
    ],
    scam: [
      /congratulations.+won/i,
      /you('ve| have) been selected/i,
      /claim your (prize|reward)/i,
      /wire transfer/i,
    ],
  };

  private thresholds = {
    linkDensity: 0.1, // Links per word
    maxLinks: 5,
    repetitionRatio: 0.3,
    capsRatio: 0.5,
  };

  async analyze(content: string): Promise<SpamResult> {
    const signals: SpamSignal[] = [];

    // Check promotional patterns
    for (const pattern of this.patterns.promotional) {
      if (pattern.test(content)) {
        signals.push({
          type: 'promotional',
          description: `Matches promotional pattern: ${pattern.source}`,
          weight: 0.3,
        });
      }
    }

    // Check phishing patterns
    for (const pattern of this.patterns.phishing) {
      if (pattern.test(content)) {
        signals.push({
          type: 'phishing',
          description: `Matches phishing pattern: ${pattern.source}`,
          weight: 0.5,
        });
      }
    }

    // Check scam patterns
    for (const pattern of this.patterns.scam) {
      if (pattern.test(content)) {
        signals.push({
          type: 'scam',
          description: `Matches scam pattern: ${pattern.source}`,
          weight: 0.5,
        });
      }
    }

    // Check link density
    const links = content.match(/https?:\/\/\S+/g) || [];
    const words = content.split(/\s+/).length;
    const linkDensity = links.length / words;

    if (links.length > this.thresholds.maxLinks) {
      signals.push({
        type: 'excessive_links',
        description: `Contains ${links.length} links (max: ${this.thresholds.maxLinks})`,
        weight: 0.3,
      });
    }

    if (linkDensity > this.thresholds.linkDensity) {
      signals.push({
        type: 'high_link_density',
        description: `Link density: ${(linkDensity * 100).toFixed(1)}%`,
        weight: 0.2,
      });
    }

    // Check caps ratio
    const caps = (content.match(/[A-Z]/g) || []).length;
    const capsRatio = caps / content.length;
    if (capsRatio > this.thresholds.capsRatio && content.length > 20) {
      signals.push({
        type: 'excessive_caps',
        description: `${(capsRatio * 100).toFixed(1)}% capital letters`,
        weight: 0.2,
      });
    }

    // Check for repetition
    const repetitionScore = this.checkRepetition(content);
    if (repetitionScore > this.thresholds.repetitionRatio) {
      signals.push({
        type: 'repetitive',
        description: 'Content is highly repetitive',
        weight: 0.3,
      });
    }

    const score = Math.min(
      signals.reduce((sum, s) => sum + s.weight, 0),
      1
    );

    return {
      isSpam: score >= 0.5,
      score,
      signals,
    };
  }

  private checkRepetition(content: string): number {
    const words = content.toLowerCase().split(/\s+/);
    if (words.length < 5) return 0;

    const wordCounts = new Map<string, number>();
    words.forEach((word) => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });

    const maxCount = Math.max(...wordCounts.values());
    return maxCount / words.length;
  }

  addPattern(category: keyof typeof this.patterns, pattern: RegExp): void {
    this.patterns[category].push(pattern);
  }
}
