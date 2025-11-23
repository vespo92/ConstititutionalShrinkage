import { ToxicityFilter, ToxicityResult } from './filters/toxicity.js';
import { SpamFilter, SpamResult } from './filters/spam.js';
import { MisinformationFilter, MisinformationResult } from './filters/misinformation.js';
import { PIIFilter, PIIResult } from './filters/pii.js';

export interface ModerationResult {
  approved: boolean;
  requiresReview: boolean;
  autoActions: string[];
  toxicity: ToxicityResult;
  spam: SpamResult;
  misinformation: MisinformationResult;
  pii: PIIResult;
  processedContent?: string;
  flags: string[];
}

export class ContentModerator {
  private toxicityFilter: ToxicityFilter;
  private spamFilter: SpamFilter;
  private misinformationFilter: MisinformationFilter;
  private piiFilter: PIIFilter;

  constructor() {
    this.toxicityFilter = new ToxicityFilter();
    this.spamFilter = new SpamFilter();
    this.misinformationFilter = new MisinformationFilter();
    this.piiFilter = new PIIFilter();
  }

  async moderate(content: string): Promise<ModerationResult> {
    // Run all filters in parallel
    const [toxicity, spam, misinformation, pii] = await Promise.all([
      this.toxicityFilter.analyze(content),
      this.spamFilter.analyze(content),
      this.misinformationFilter.analyze(content),
      this.piiFilter.analyze(content),
    ]);

    const flags: string[] = [];
    const autoActions: string[] = [];

    // Process toxicity
    if (toxicity.isToxic) {
      flags.push(`toxicity_${toxicity.score >= 0.8 ? 'high' : 'medium'}`);
      if (toxicity.score >= 0.9) {
        autoActions.push('auto_hide');
      }
    }

    // Process spam
    if (spam.isSpam) {
      flags.push('spam');
      if (spam.score >= 0.8) {
        autoActions.push('auto_hide');
      }
    }

    // Process misinformation
    if (misinformation.flagged) {
      flags.push('misinformation');
      autoActions.push('add_warning_label');
    }

    // Process PII
    let processedContent = content;
    if (pii.containsPII) {
      flags.push('pii');
      processedContent = pii.redactedContent;
      autoActions.push('redact_pii');
    }

    // Determine if content should be auto-approved or requires review
    const requiresReview = flags.length > 0 && !autoActions.includes('auto_hide');
    const approved = flags.length === 0;

    return {
      approved,
      requiresReview,
      autoActions,
      toxicity,
      spam,
      misinformation,
      pii,
      processedContent: pii.containsPII ? processedContent : undefined,
      flags,
    };
  }

  async previewModeration(content: string): Promise<{
    wouldBeBlocked: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    const result = await this.moderate(content);

    const issues: string[] = [];
    const suggestions: string[] = [];

    if (result.toxicity.isToxic) {
      issues.push('Content may be considered toxic or harmful');
      suggestions.push('Consider rephrasing to be more constructive');
    }

    if (result.spam.isSpam) {
      issues.push('Content appears to be spam');
      suggestions.push('Remove promotional language and excessive links');
    }

    if (result.pii.containsPII) {
      issues.push(`Contains personal information: ${result.pii.detectedTypes.join(', ')}`);
      suggestions.push('Remove personal information before posting');
    }

    if (result.misinformation.flagged) {
      issues.push('Contains claims that may need verification');
      suggestions.push('Add sources for factual claims');
    }

    return {
      wouldBeBlocked: result.autoActions.includes('auto_hide'),
      issues,
      suggestions,
    };
  }
}
