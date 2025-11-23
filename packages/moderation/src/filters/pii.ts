export interface PIIResult {
  containsPII: boolean;
  detectedTypes: PIIType[];
  redactedContent: string;
  matches: PIIMatch[];
}

type PIIType = 'ssn' | 'credit_card' | 'email' | 'phone' | 'address' | 'dob' | 'passport' | 'license';

interface PIIMatch {
  type: PIIType;
  value: string;
  startIndex: number;
  endIndex: number;
}

export class PIIFilter {
  private patterns: Record<PIIType, RegExp> = {
    ssn: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
    credit_card: /\b(?:\d{4}[-.\s]?){3}\d{4}\b/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    phone: /\b(?:\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    address: /\b\d+\s+\w+\s+(street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln)\b/gi,
    dob: /\b(?:0?[1-9]|1[0-2])[-/](?:0?[1-9]|[12]\d|3[01])[-/](?:19|20)\d{2}\b/g,
    passport: /\b[A-Z]{1,2}\d{6,9}\b/g,
    license: /\b[A-Z]{1,2}\d{5,8}\b/g,
  };

  private redactionStrings: Record<PIIType, string> = {
    ssn: '[SSN REDACTED]',
    credit_card: '[CARD REDACTED]',
    email: '[EMAIL REDACTED]',
    phone: '[PHONE REDACTED]',
    address: '[ADDRESS REDACTED]',
    dob: '[DOB REDACTED]',
    passport: '[PASSPORT REDACTED]',
    license: '[LICENSE REDACTED]',
  };

  async analyze(content: string): Promise<PIIResult> {
    const matches: PIIMatch[] = [];
    const detectedTypes = new Set<PIIType>();

    for (const [type, pattern] of Object.entries(this.patterns)) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;

      while ((match = regex.exec(content)) !== null) {
        matches.push({
          type: type as PIIType,
          value: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
        detectedTypes.add(type as PIIType);
      }
    }

    // Sort matches by start index for proper redaction
    matches.sort((a, b) => a.startIndex - b.startIndex);

    const redactedContent = this.redact(content, matches);

    return {
      containsPII: matches.length > 0,
      detectedTypes: [...detectedTypes],
      redactedContent,
      matches,
    };
  }

  redact(content: string, matches?: PIIMatch[]): string {
    if (!matches) {
      // Auto-detect and redact
      const result = this.analyzeSync(content);
      matches = result.matches;
    }

    let redactedContent = content;
    let offset = 0;

    for (const match of matches) {
      const redaction = this.redactionStrings[match.type];
      const before = redactedContent.slice(0, match.startIndex + offset);
      const after = redactedContent.slice(match.endIndex + offset);
      redactedContent = before + redaction + after;
      offset += redaction.length - match.value.length;
    }

    return redactedContent;
  }

  private analyzeSync(content: string): { matches: PIIMatch[] } {
    const matches: PIIMatch[] = [];

    for (const [type, pattern] of Object.entries(this.patterns)) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;

      while ((match = regex.exec(content)) !== null) {
        matches.push({
          type: type as PIIType,
          value: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }

    matches.sort((a, b) => a.startIndex - b.startIndex);
    return { matches };
  }

  addPattern(type: PIIType, pattern: RegExp, redactionString?: string): void {
    this.patterns[type] = pattern;
    if (redactionString) {
      this.redactionStrings[type] = redactionString;
    }
  }
}
