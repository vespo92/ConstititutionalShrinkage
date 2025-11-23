/**
 * Auto-Remediation Service
 *
 * Automated response to security incidents.
 */

import type { Incident, RemediationResult, Playbook, PlaybookStep } from '../../types/index.js';
import { ThreatType, IncidentPriority } from '../../types/index.js';
import { redis, securityCache } from '../../lib/redis.js';
import * as incidentHandler from './incident-handler.js';

// Playbook definitions
const PLAYBOOKS: Map<string, Playbook> = new Map([
  [
    'brute_force',
    {
      id: 'pb_brute_force',
      name: 'Brute Force Response',
      description: 'Automated response to brute force attacks',
      triggerConditions: { threatType: ThreatType.BRUTE_FORCE },
      enabled: true,
      steps: [
        {
          order: 1,
          action: 'block_ip',
          parameters: { duration: 3600 },
          onFailure: 'continue',
        },
        {
          order: 2,
          action: 'lock_account',
          parameters: { duration: 900 },
          condition: 'affectedUsers.length > 0',
          onFailure: 'continue',
        },
        {
          order: 3,
          action: 'notify_user',
          parameters: { template: 'suspicious_login' },
          condition: 'affectedUsers.length > 0',
          onFailure: 'continue',
        },
        {
          order: 4,
          action: 'escalate',
          parameters: { priority: 'P2' },
          condition: 'attempts > 10',
          onFailure: 'abort',
        },
      ],
    },
  ],
  [
    'data_exfiltration',
    {
      id: 'pb_data_exfil',
      name: 'Data Exfiltration Response',
      description: 'Critical response to data exfiltration attempts',
      triggerConditions: { threatType: ThreatType.DATA_EXFILTRATION },
      enabled: true,
      steps: [
        {
          order: 1,
          action: 'block_ip',
          parameters: { duration: 86400 },
          onFailure: 'continue',
        },
        {
          order: 2,
          action: 'revoke_sessions',
          parameters: {},
          onFailure: 'continue',
        },
        {
          order: 3,
          action: 'lock_account',
          parameters: { permanent: true },
          onFailure: 'continue',
        },
        {
          order: 4,
          action: 'notify_security_team',
          parameters: { priority: 'critical' },
          onFailure: 'continue',
        },
        {
          order: 5,
          action: 'collect_forensics',
          parameters: {},
          onFailure: 'continue',
        },
        {
          order: 6,
          action: 'escalate',
          parameters: { priority: 'P1' },
          onFailure: 'abort',
        },
      ],
    },
  ],
  [
    'vote_manipulation',
    {
      id: 'pb_vote_manip',
      name: 'Vote Manipulation Response',
      description: 'Response to voting system manipulation',
      triggerConditions: { threatType: ThreatType.VOTE_MANIPULATION },
      enabled: true,
      steps: [
        {
          order: 1,
          action: 'suspend_voting',
          parameters: { scope: 'user' },
          onFailure: 'abort',
        },
        {
          order: 2,
          action: 'block_ip',
          parameters: { duration: 86400 },
          onFailure: 'continue',
        },
        {
          order: 3,
          action: 'flag_votes',
          parameters: {},
          onFailure: 'continue',
        },
        {
          order: 4,
          action: 'notify_security_team',
          parameters: { priority: 'critical' },
          onFailure: 'continue',
        },
        {
          order: 5,
          action: 'escalate',
          parameters: { priority: 'P1' },
          onFailure: 'abort',
        },
      ],
    },
  ],
  [
    'account_compromise',
    {
      id: 'pb_account_compromise',
      name: 'Account Compromise Response',
      description: 'Response to suspected account takeover',
      triggerConditions: { threatType: ThreatType.SESSION_HIJACKING },
      enabled: true,
      steps: [
        {
          order: 1,
          action: 'revoke_sessions',
          parameters: {},
          onFailure: 'continue',
        },
        {
          order: 2,
          action: 'force_password_reset',
          parameters: {},
          onFailure: 'continue',
        },
        {
          order: 3,
          action: 'notify_user',
          parameters: { template: 'account_compromise' },
          onFailure: 'continue',
        },
        {
          order: 4,
          action: 'require_mfa',
          parameters: {},
          onFailure: 'continue',
        },
      ],
    },
  ],
  [
    'ddos',
    {
      id: 'pb_ddos',
      name: 'DDoS Response',
      description: 'Response to DDoS attacks',
      triggerConditions: { threatType: ThreatType.DDOS },
      enabled: true,
      steps: [
        {
          order: 1,
          action: 'enable_rate_limiting',
          parameters: { level: 'aggressive' },
          onFailure: 'continue',
        },
        {
          order: 2,
          action: 'block_ip_range',
          parameters: {},
          onFailure: 'continue',
        },
        {
          order: 3,
          action: 'enable_captcha',
          parameters: {},
          onFailure: 'continue',
        },
        {
          order: 4,
          action: 'notify_ops_team',
          parameters: {},
          onFailure: 'continue',
        },
      ],
    },
  ],
]);

// Action implementations
const ACTIONS: Record<
  string,
  (incident: Incident, params: Record<string, unknown>) => Promise<boolean>
> = {
  block_ip: async (incident, params) => {
    const duration = (params.duration as number) || 3600;
    for (const resource of incident.affectedResources) {
      if (resource.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
        await securityCache.blockIP(resource, duration, `incident:${incident.id}`);
      }
    }
    return true;
  },

  block_ip_range: async (incident, _params) => {
    // Block /24 range for each affected IP
    for (const resource of incident.affectedResources) {
      const match = resource.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/);
      if (match && match[1]) {
        await redis.setex(`blocked:range:${match[1]}`, 3600, `incident:${incident.id}`);
      }
    }
    return true;
  },

  lock_account: async (incident, params) => {
    const duration = params.permanent ? 0 : ((params.duration as number) || 900);
    for (const userId of incident.affectedUsers) {
      if (duration > 0) {
        await redis.setex(`locked:user:${userId}`, duration, `incident:${incident.id}`);
      } else {
        await redis.set(`locked:user:${userId}`, `incident:${incident.id}`);
      }
    }
    return true;
  },

  revoke_sessions: async (incident, _params) => {
    for (const userId of incident.affectedUsers) {
      await securityCache.invalidateAllUserSessions(userId);
    }
    return true;
  },

  notify_user: async (incident, params) => {
    const template = params.template as string;
    for (const userId of incident.affectedUsers) {
      await redis.lpush(
        'notifications:user',
        JSON.stringify({
          userId,
          template,
          incidentId: incident.id,
          timestamp: new Date().toISOString(),
        })
      );
    }
    return true;
  },

  notify_security_team: async (incident, params) => {
    await redis.lpush(
      'notifications:security_team',
      JSON.stringify({
        incidentId: incident.id,
        priority: params.priority || 'high',
        timestamp: new Date().toISOString(),
      })
    );
    return true;
  },

  notify_ops_team: async (incident, _params) => {
    await redis.lpush(
      'notifications:ops_team',
      JSON.stringify({
        incidentId: incident.id,
        type: 'infrastructure',
        timestamp: new Date().toISOString(),
      })
    );
    return true;
  },

  escalate: async (incident, params) => {
    const priority = params.priority as IncidentPriority;
    await incidentHandler.updateStatus(
      incident.id,
      'investigating',
      'auto_remediation',
      `Escalated to ${priority}`
    );
    return true;
  },

  force_password_reset: async (incident, _params) => {
    for (const userId of incident.affectedUsers) {
      await redis.set(`force_password_reset:${userId}`, 'true');
    }
    return true;
  },

  require_mfa: async (incident, _params) => {
    for (const userId of incident.affectedUsers) {
      await redis.set(`require_mfa:${userId}`, 'true');
    }
    return true;
  },

  suspend_voting: async (incident, _params) => {
    for (const userId of incident.affectedUsers) {
      await redis.setex(`voting_suspended:${userId}`, 86400, `incident:${incident.id}`);
    }
    return true;
  },

  flag_votes: async (incident, _params) => {
    // Flag recent votes from affected users for review
    for (const userId of incident.affectedUsers) {
      await redis.lpush(
        'votes:flagged',
        JSON.stringify({
          userId,
          incidentId: incident.id,
          timestamp: new Date().toISOString(),
        })
      );
    }
    return true;
  },

  enable_rate_limiting: async (_incident, params) => {
    const level = params.level as string;
    await redis.set('rate_limit:level', level);
    await redis.expire('rate_limit:level', 3600);
    return true;
  },

  enable_captcha: async (_incident, _params) => {
    await redis.set('captcha:enabled', 'true');
    await redis.expire('captcha:enabled', 3600);
    return true;
  },

  collect_forensics: async (incident, _params) => {
    await redis.lpush(
      'forensics:queue',
      JSON.stringify({
        incidentId: incident.id,
        timestamp: new Date().toISOString(),
      })
    );
    return true;
  },
};

/**
 * Execute auto-remediation for an incident
 */
export async function autoRemediate(incident: Incident): Promise<RemediationResult> {
  const result: RemediationResult = {
    incidentId: incident.id,
    success: true,
    actionsPerformed: [],
    errors: [],
    timestamp: new Date(),
  };

  // Find matching playbook
  const playbook = findPlaybook(incident.type);

  if (!playbook || !playbook.enabled) {
    result.actionsPerformed.push('No matching playbook found');
    return result;
  }

  // Log playbook execution start
  await incidentHandler.addTimelineEntry(incident.id, {
    action: 'auto_remediation_started',
    actor: 'system',
    details: `Executing playbook: ${playbook.name}`,
  });

  // Execute steps in order
  for (const step of playbook.steps.sort((a, b) => a.order - b.order)) {
    try {
      // Check condition if present
      if (step.condition && !evaluateCondition(step.condition, incident)) {
        result.actionsPerformed.push(`Skipped ${step.action} (condition not met)`);
        continue;
      }

      // Execute action
      const action = ACTIONS[step.action];
      if (!action) {
        throw new Error(`Unknown action: ${step.action}`);
      }

      const success = await action(incident, step.parameters);

      if (success) {
        result.actionsPerformed.push(step.action);
      } else {
        throw new Error(`Action ${step.action} returned false`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      result.errors?.push(`${step.action}: ${errorMsg}`);

      if (step.onFailure === 'abort') {
        result.success = false;
        break;
      }
      // 'continue' - keep going to next step
      // 'retry' - would implement retry logic here
    }
  }

  // Log completion
  await incidentHandler.addTimelineEntry(incident.id, {
    action: 'auto_remediation_completed',
    actor: 'system',
    details: `Actions: ${result.actionsPerformed.join(', ')}. Errors: ${result.errors?.length || 0}`,
  });

  // Update incident status if successful
  if (result.success && result.actionsPerformed.length > 0) {
    await incidentHandler.updateStatus(
      incident.id,
      'contained',
      'auto_remediation',
      'Automated remediation completed'
    );
  }

  return result;
}

/**
 * Find playbook for threat type
 */
function findPlaybook(threatType: ThreatType): Playbook | undefined {
  for (const [key, playbook] of PLAYBOOKS) {
    if (
      playbook.triggerConditions.threatType === threatType ||
      key === threatType
    ) {
      return playbook;
    }
  }
  return undefined;
}

/**
 * Evaluate condition against incident
 */
function evaluateCondition(condition: string, incident: Incident): boolean {
  // Simple condition evaluation
  // In production, would use a proper expression parser

  if (condition.includes('affectedUsers.length')) {
    const match = condition.match(/affectedUsers\.length\s*(>|<|>=|<=|===?)\s*(\d+)/);
    if (match) {
      const [, operator, value] = match;
      const numValue = parseInt(value || '0', 10);
      const len = incident.affectedUsers.length;

      switch (operator) {
        case '>':
          return len > numValue;
        case '<':
          return len < numValue;
        case '>=':
          return len >= numValue;
        case '<=':
          return len <= numValue;
        case '==':
        case '===':
          return len === numValue;
      }
    }
  }

  // Default to true if condition can't be parsed
  return true;
}

/**
 * Get all playbooks
 */
export function getPlaybooks(): Playbook[] {
  return Array.from(PLAYBOOKS.values());
}

/**
 * Get playbook by ID
 */
export function getPlaybook(id: string): Playbook | undefined {
  return PLAYBOOKS.get(id);
}

/**
 * Enable/disable playbook
 */
export function togglePlaybook(id: string, enabled: boolean): boolean {
  const playbook = PLAYBOOKS.get(id);
  if (playbook) {
    playbook.enabled = enabled;
    return true;
  }
  return false;
}

/**
 * Add custom playbook
 */
export function addPlaybook(playbook: Playbook): void {
  PLAYBOOKS.set(playbook.id, playbook);
}

/**
 * Get remediation history
 */
export async function getRemediationHistory(
  limit = 100
): Promise<RemediationResult[]> {
  const results = await redis.lrange('remediation:history', 0, limit - 1);
  return results.map((r) => JSON.parse(r));
}

/**
 * Log remediation result
 */
export async function logRemediation(result: RemediationResult): Promise<void> {
  await redis.lpush('remediation:history', JSON.stringify(result));
  await redis.ltrim('remediation:history', 0, 999);
}

/**
 * Execute immediate action without playbook
 */
export async function executeAction(
  actionName: string,
  incident: Incident,
  params: Record<string, unknown> = {}
): Promise<boolean> {
  const action = ACTIONS[actionName];
  if (!action) {
    throw new Error(`Unknown action: ${actionName}`);
  }

  const success = await action(incident, params);

  await incidentHandler.addTimelineEntry(incident.id, {
    action: `manual_action:${actionName}`,
    actor: 'operator',
    details: `Executed ${actionName} with params: ${JSON.stringify(params)}`,
  });

  return success;
}
