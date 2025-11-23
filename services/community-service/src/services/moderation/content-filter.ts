interface ContentFlag {
  type: 'toxicity' | 'spam' | 'misinformation' | 'pii';
  severity: 'low' | 'medium' | 'high';
  details: string;
  confidence: number;
}

export class ContentFilter {
  private spamPatterns = [
    /buy now/i,
    /click here/i,
    /free money/i,
    /make \$\d+/i,
    /limited time offer/i,
  ];

  private toxicPatterns = [
    // Would contain actual toxicity patterns in production
    // Using placeholder patterns
  ];

  private piiPatterns = [
    /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/, // SSN
    /\b\d{16}\b/, // Credit card
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
  ];

  async analyze(contentId: string, contentType: string): Promise<ContentFlag[]> {
    // In production, fetch content from database
    const content = ''; // Placeholder
    return this.analyzeContent(content);
  }

  async analyzeContent(content: string): Promise<ContentFlag[]> {
    const flags: ContentFlag[] = [];

    // Check for spam
    const spamFlags = this.checkSpam(content);
    flags.push(...spamFlags);

    // Check for PII
    const piiFlags = this.checkPII(content);
    flags.push(...piiFlags);

    // Check for toxicity (in production, use ML model)
    const toxicityFlags = this.checkToxicity(content);
    flags.push(...toxicityFlags);

    return flags;
  }

  private checkSpam(content: string): ContentFlag[] {
    const flags: ContentFlag[] = [];

    for (const pattern of this.spamPatterns) {
      if (pattern.test(content)) {
        flags.push({
          type: 'spam',
          severity: 'medium',
          details: `Matches spam pattern: ${pattern.source}`,
          confidence: 0.8,
        });
      }
    }

    // Check for excessive links
    const linkCount = (content.match(/https?:\/\//g) || []).length;
    if (linkCount > 3) {
      flags.push({
        type: 'spam',
        severity: 'low',
        details: `Contains ${linkCount} links`,
        confidence: 0.6,
      });
    }

    return flags;
  }

  private checkPII(content: string): ContentFlag[] {
    const flags: ContentFlag[] = [];

    for (const pattern of this.piiPatterns) {
      if (pattern.test(content)) {
        flags.push({
          type: 'pii',
          severity: 'high',
          details: 'Contains potentially sensitive personal information',
          confidence: 0.9,
        });
      }
    }

    return flags;
  }

  private checkToxicity(content: string): ContentFlag[] {
    const flags: ContentFlag[] = [];

    // In production, would use ML model for toxicity detection
    // For now, using basic keyword matching as placeholder

    const lowercaseContent = content.toLowerCase();

    // Check for all-caps (shouting)
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.7 && content.length > 20) {
      flags.push({
        type: 'toxicity',
        severity: 'low',
        details: 'Excessive use of capital letters',
        confidence: 0.5,
      });
    }

    return flags;
  }

  async shouldAutoHide(content: string): Promise<boolean> {
    const flags = await this.analyzeContent(content);
    return flags.some((f) => f.severity === 'high' && f.confidence > 0.8);
  }
}
