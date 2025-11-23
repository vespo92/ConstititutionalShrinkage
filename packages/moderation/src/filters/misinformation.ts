export interface MisinformationResult {
  flagged: boolean;
  confidence: number;
  claims: ClaimAnalysis[];
  suggestedFactChecks: string[];
}

interface ClaimAnalysis {
  claim: string;
  type: 'factual' | 'opinion' | 'unverifiable';
  needsVerification: boolean;
  relatedTopics: string[];
}

export class MisinformationFilter {
  private sensitiveTopics = [
    'election',
    'voting',
    'vaccine',
    'covid',
    'pandemic',
    'climate',
    'health',
    'medical',
  ];

  private factualClaimPatterns = [
    /studies show/i,
    /research proves/i,
    /scientists say/i,
    /statistics indicate/i,
    /data shows/i,
    /according to/i,
    /officially/i,
    /confirmed/i,
    /\d+% of/i,
  ];

  private absoluteClaimPatterns = [
    /always/i,
    /never/i,
    /everyone knows/i,
    /nobody/i,
    /proven fact/i,
    /undeniable/i,
    /100%/i,
  ];

  async analyze(content: string): Promise<MisinformationResult> {
    const claims = this.extractClaims(content);
    const containsSensitiveTopic = this.checkSensitiveTopics(content);
    const hasFactualClaims = this.hasFactualClaims(content);
    const hasAbsoluteClaims = this.hasAbsoluteClaims(content);

    // Calculate confidence based on signals
    let confidence = 0;
    if (containsSensitiveTopic) confidence += 0.2;
    if (hasFactualClaims) confidence += 0.3;
    if (hasAbsoluteClaims) confidence += 0.3;

    const suggestedFactChecks = this.suggestFactChecks(claims);

    return {
      flagged: confidence >= 0.5 && hasFactualClaims,
      confidence,
      claims,
      suggestedFactChecks,
    };
  }

  private extractClaims(content: string): ClaimAnalysis[] {
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim());
    const claims: ClaimAnalysis[] = [];

    for (const sentence of sentences) {
      const hasFactualPattern = this.factualClaimPatterns.some((p) => p.test(sentence));
      const hasAbsolutePattern = this.absoluteClaimPatterns.some((p) => p.test(sentence));

      if (hasFactualPattern || hasAbsolutePattern) {
        claims.push({
          claim: sentence.trim(),
          type: hasFactualPattern ? 'factual' : 'opinion',
          needsVerification: hasFactualPattern,
          relatedTopics: this.extractTopics(sentence),
        });
      }
    }

    return claims;
  }

  private checkSensitiveTopics(content: string): boolean {
    const lowercaseContent = content.toLowerCase();
    return this.sensitiveTopics.some((topic) => lowercaseContent.includes(topic));
  }

  private hasFactualClaims(content: string): boolean {
    return this.factualClaimPatterns.some((p) => p.test(content));
  }

  private hasAbsoluteClaims(content: string): boolean {
    return this.absoluteClaimPatterns.some((p) => p.test(content));
  }

  private extractTopics(content: string): string[] {
    const lowercaseContent = content.toLowerCase();
    return this.sensitiveTopics.filter((topic) => lowercaseContent.includes(topic));
  }

  private suggestFactChecks(claims: ClaimAnalysis[]): string[] {
    const suggestions: string[] = [];

    for (const claim of claims) {
      if (claim.needsVerification) {
        claim.relatedTopics.forEach((topic) => {
          suggestions.push(`Verify claim about ${topic}`);
        });
      }
    }

    return [...new Set(suggestions)];
  }

  addSensitiveTopic(topic: string): void {
    this.sensitiveTopics.push(topic.toLowerCase());
  }
}
