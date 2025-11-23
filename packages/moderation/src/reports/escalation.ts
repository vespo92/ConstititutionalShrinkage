export type EscalationLevel = 'moderator' | 'senior_moderator' | 'admin' | 'legal';

interface EscalationRule {
  condition: (context: EscalationContext) => boolean;
  level: EscalationLevel;
  reason: string;
}

interface EscalationContext {
  reportCount: number;
  reason: string;
  autoFlags: string[];
  contentType: string;
  reporterReputation?: number;
  previousActions?: string[];
}

interface Escalation {
  id: string;
  contentId: string;
  level: EscalationLevel;
  reason: string;
  escalatedBy: string;
  escalatedAt: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  resolvedBy?: string;
  resolvedAt?: string;
}

export class EscalationManager {
  private rules: EscalationRule[] = [
    {
      condition: (ctx) => ctx.autoFlags.includes('threats') || ctx.autoFlags.includes('hate_speech'),
      level: 'senior_moderator',
      reason: 'Severe content flags detected',
    },
    {
      condition: (ctx) => ctx.reportCount >= 10,
      level: 'senior_moderator',
      reason: 'High report volume',
    },
    {
      condition: (ctx) => ctx.reason === 'impersonation' && ctx.contentType === 'user',
      level: 'admin',
      reason: 'User impersonation',
    },
    {
      condition: (ctx) => ctx.autoFlags.includes('legal_concern'),
      level: 'legal',
      reason: 'Potential legal issue',
    },
    {
      condition: (ctx) =>
        ctx.previousActions?.includes('warned') && ctx.previousActions?.includes('muted'),
      level: 'senior_moderator',
      reason: 'Repeat offender',
    },
  ];

  private escalations = new Map<string, Escalation[]>();

  async evaluate(contentId: string, context: EscalationContext): Promise<EscalationLevel | null> {
    for (const rule of this.rules) {
      if (rule.condition(context)) {
        await this.createEscalation(contentId, rule.level, rule.reason, 'system');
        return rule.level;
      }
    }
    return null;
  }

  async createEscalation(
    contentId: string,
    level: EscalationLevel,
    reason: string,
    escalatedBy: string
  ): Promise<Escalation> {
    const escalation: Escalation = {
      id: Date.now().toString(),
      contentId,
      level,
      reason,
      escalatedBy,
      escalatedAt: new Date().toISOString(),
      status: 'pending',
    };

    if (!this.escalations.has(contentId)) {
      this.escalations.set(contentId, []);
    }
    this.escalations.get(contentId)!.push(escalation);

    // Notify appropriate personnel
    await this.notifyEscalation(escalation);

    return escalation;
  }

  async acknowledge(escalationId: string, acknowledgedBy: string): Promise<boolean> {
    for (const escalations of this.escalations.values()) {
      const escalation = escalations.find((e) => e.id === escalationId);
      if (escalation) {
        escalation.status = 'acknowledged';
        return true;
      }
    }
    return false;
  }

  async resolve(escalationId: string, resolvedBy: string): Promise<boolean> {
    for (const escalations of this.escalations.values()) {
      const escalation = escalations.find((e) => e.id === escalationId);
      if (escalation) {
        escalation.status = 'resolved';
        escalation.resolvedBy = resolvedBy;
        escalation.resolvedAt = new Date().toISOString();
        return true;
      }
    }
    return false;
  }

  async getEscalations(level?: EscalationLevel): Promise<Escalation[]> {
    const all = Array.from(this.escalations.values()).flat();
    if (level) {
      return all.filter((e) => e.level === level && e.status === 'pending');
    }
    return all.filter((e) => e.status === 'pending');
  }

  private async notifyEscalation(escalation: Escalation): Promise<void> {
    console.log(
      `Escalation to ${escalation.level}: Content ${escalation.contentId} - ${escalation.reason}`
    );
    // In production, send notifications to appropriate personnel
  }

  addRule(rule: EscalationRule): void {
    this.rules.push(rule);
  }
}
