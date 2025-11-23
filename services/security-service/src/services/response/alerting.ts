/**
 * Alerting Service
 *
 * Manages security alerts and notifications.
 */

import { redis } from '../../lib/redis.js';
import type { Incident, Threat } from '../../types/index.js';
import { ThreatLevel, IncidentPriority } from '../../types/index.js';

interface Alert {
  id: string;
  type: 'threat' | 'incident' | 'compliance' | 'system';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  message: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata?: Record<string, unknown>;
}

interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    type?: string;
    severity?: string[];
    source?: string;
    pattern?: string;
  };
  actions: AlertAction[];
  cooldown?: number; // Seconds between repeated alerts
  lastTriggered?: Date;
}

interface AlertAction {
  type: 'email' | 'slack' | 'pagerduty' | 'webhook' | 'log';
  config: Record<string, unknown>;
}

// Alert storage
const alerts: Map<string, Alert> = new Map();
const alertRules: Map<string, AlertRule> = new Map();

// Default alert rules
const DEFAULT_RULES: AlertRule[] = [
  {
    id: 'rule_critical',
    name: 'Critical Alert Escalation',
    enabled: true,
    conditions: { severity: ['critical'] },
    actions: [
      { type: 'pagerduty', config: { urgency: 'high' } },
      { type: 'slack', config: { channel: '#security-alerts' } },
      { type: 'email', config: { to: 'security@example.com' } },
    ],
    cooldown: 60,
  },
  {
    id: 'rule_high',
    name: 'High Severity Alert',
    enabled: true,
    conditions: { severity: ['high'] },
    actions: [
      { type: 'slack', config: { channel: '#security-alerts' } },
      { type: 'email', config: { to: 'security@example.com' } },
    ],
    cooldown: 300,
  },
  {
    id: 'rule_compliance',
    name: 'Compliance Alert',
    enabled: true,
    conditions: { type: 'compliance' },
    actions: [
      { type: 'email', config: { to: 'compliance@example.com' } },
      { type: 'log', config: { level: 'warn' } },
    ],
    cooldown: 3600,
  },
];

// Initialize default rules
for (const rule of DEFAULT_RULES) {
  alertRules.set(rule.id, rule);
}

/**
 * Create alert from threat
 */
export async function createThreatAlert(threat: Threat): Promise<Alert> {
  const severityMap: Record<string, Alert['severity']> = {
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low',
    info: 'info',
  };

  return createAlert({
    type: 'threat',
    severity: severityMap[threat.level] || 'medium',
    title: `${threat.type}: ${threat.description.substring(0, 50)}`,
    message: threat.description,
    source: threat.source,
    metadata: {
      threatId: threat.id,
      threatType: threat.type,
      target: threat.target,
      indicators: threat.indicators,
    },
  });
}

/**
 * Create alert from incident
 */
export async function createIncidentAlert(incident: Incident): Promise<Alert> {
  const severityMap: Record<string, Alert['severity']> = {
    P1: 'critical',
    P2: 'high',
    P3: 'medium',
    P4: 'low',
  };

  return createAlert({
    type: 'incident',
    severity: severityMap[incident.priority] || 'medium',
    title: `Incident ${incident.id}: ${incident.title}`,
    message: incident.description,
    source: 'incident_handler',
    metadata: {
      incidentId: incident.id,
      priority: incident.priority,
      status: incident.status,
      affectedResources: incident.affectedResources,
    },
  });
}

/**
 * Create a new alert
 */
export async function createAlert(params: {
  type: Alert['type'];
  severity: Alert['severity'];
  title: string;
  message: string;
  source: string;
  metadata?: Record<string, unknown>;
}): Promise<Alert> {
  const id = `alert_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const alert: Alert = {
    id,
    type: params.type,
    severity: params.severity,
    title: params.title,
    message: params.message,
    source: params.source,
    timestamp: new Date(),
    acknowledged: false,
    resolved: false,
    metadata: params.metadata,
  };

  alerts.set(id, alert);

  // Store in Redis
  await redis.hset(`alert:${id}`, {
    data: JSON.stringify(alert),
    severity: alert.severity,
    type: alert.type,
    timestamp: alert.timestamp.toISOString(),
  });

  // Add to alert queues
  await redis.zadd('alerts:unacknowledged', Date.now().toString(), id);
  await redis.zadd(`alerts:severity:${alert.severity}`, Date.now().toString(), id);

  // Process alert rules
  await processAlertRules(alert);

  return alert;
}

/**
 * Process alert against rules
 */
async function processAlertRules(alert: Alert): Promise<void> {
  for (const rule of alertRules.values()) {
    if (!rule.enabled) continue;

    // Check conditions
    if (!matchesConditions(alert, rule.conditions)) continue;

    // Check cooldown
    if (rule.cooldown && rule.lastTriggered) {
      const elapsed = (Date.now() - rule.lastTriggered.getTime()) / 1000;
      if (elapsed < rule.cooldown) continue;
    }

    // Execute actions
    for (const action of rule.actions) {
      await executeAction(action, alert);
    }

    // Update last triggered
    rule.lastTriggered = new Date();
  }
}

/**
 * Check if alert matches rule conditions
 */
function matchesConditions(
  alert: Alert,
  conditions: AlertRule['conditions']
): boolean {
  if (conditions.type && conditions.type !== alert.type) {
    return false;
  }

  if (conditions.severity && !conditions.severity.includes(alert.severity)) {
    return false;
  }

  if (conditions.source && conditions.source !== alert.source) {
    return false;
  }

  if (conditions.pattern) {
    const regex = new RegExp(conditions.pattern, 'i');
    if (!regex.test(alert.title) && !regex.test(alert.message)) {
      return false;
    }
  }

  return true;
}

/**
 * Execute alert action
 */
async function executeAction(action: AlertAction, alert: Alert): Promise<void> {
  switch (action.type) {
    case 'email':
      await sendEmailAlert(alert, action.config);
      break;
    case 'slack':
      await sendSlackAlert(alert, action.config);
      break;
    case 'pagerduty':
      await sendPagerDutyAlert(alert, action.config);
      break;
    case 'webhook':
      await sendWebhookAlert(alert, action.config);
      break;
    case 'log':
      logAlert(alert, action.config);
      break;
  }
}

/**
 * Send email alert (mock implementation)
 */
async function sendEmailAlert(
  alert: Alert,
  config: Record<string, unknown>
): Promise<void> {
  await redis.lpush(
    'notifications:email',
    JSON.stringify({
      to: config.to,
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      body: alert.message,
      alertId: alert.id,
      timestamp: new Date().toISOString(),
    })
  );
}

/**
 * Send Slack alert (mock implementation)
 */
async function sendSlackAlert(
  alert: Alert,
  config: Record<string, unknown>
): Promise<void> {
  const colorMap: Record<string, string> = {
    critical: '#dc3545',
    high: '#fd7e14',
    medium: '#ffc107',
    low: '#17a2b8',
    info: '#6c757d',
  };

  await redis.lpush(
    'notifications:slack',
    JSON.stringify({
      channel: config.channel,
      attachments: [
        {
          color: colorMap[alert.severity],
          title: alert.title,
          text: alert.message,
          fields: [
            { title: 'Severity', value: alert.severity, short: true },
            { title: 'Type', value: alert.type, short: true },
            { title: 'Source', value: alert.source, short: true },
          ],
          ts: Math.floor(alert.timestamp.getTime() / 1000),
        },
      ],
      alertId: alert.id,
    })
  );
}

/**
 * Send PagerDuty alert (mock implementation)
 */
async function sendPagerDutyAlert(
  alert: Alert,
  config: Record<string, unknown>
): Promise<void> {
  await redis.lpush(
    'notifications:pagerduty',
    JSON.stringify({
      routing_key: config.routingKey,
      event_action: 'trigger',
      payload: {
        summary: alert.title,
        severity: alert.severity,
        source: alert.source,
        custom_details: {
          message: alert.message,
          ...alert.metadata,
        },
      },
      alertId: alert.id,
    })
  );
}

/**
 * Send webhook alert (mock implementation)
 */
async function sendWebhookAlert(
  alert: Alert,
  config: Record<string, unknown>
): Promise<void> {
  await redis.lpush(
    'notifications:webhook',
    JSON.stringify({
      url: config.url,
      method: config.method || 'POST',
      headers: config.headers || {},
      body: {
        alert,
        timestamp: new Date().toISOString(),
      },
    })
  );
}

/**
 * Log alert
 */
function logAlert(alert: Alert, config: Record<string, unknown>): void {
  const level = (config.level as string) || 'info';
  console.log(`[ALERT:${level.toUpperCase()}] ${alert.severity}: ${alert.title}`);
}

/**
 * Acknowledge alert
 */
export async function acknowledgeAlert(
  id: string,
  acknowledgedBy: string
): Promise<boolean> {
  const alert = alerts.get(id);
  if (!alert) return false;

  alert.acknowledged = true;
  alert.acknowledgedBy = acknowledgedBy;
  alert.acknowledgedAt = new Date();

  alerts.set(id, alert);
  await redis.hset(`alert:${id}`, 'data', JSON.stringify(alert));
  await redis.zrem('alerts:unacknowledged', id);

  return true;
}

/**
 * Resolve alert
 */
export async function resolveAlert(id: string): Promise<boolean> {
  const alert = alerts.get(id);
  if (!alert) return false;

  alert.resolved = true;
  alert.resolvedAt = new Date();

  alerts.set(id, alert);
  await redis.hset(`alert:${id}`, 'data', JSON.stringify(alert));
  await redis.zadd('alerts:resolved', Date.now().toString(), id);

  return true;
}

/**
 * Get unacknowledged alerts
 */
export async function getUnacknowledgedAlerts(): Promise<Alert[]> {
  const ids = await redis.zrevrange('alerts:unacknowledged', 0, -1);
  const result: Alert[] = [];

  for (const id of ids) {
    const alert = alerts.get(id);
    if (alert) {
      result.push(alert);
    }
  }

  return result;
}

/**
 * Get alerts by severity
 */
export async function getAlertsBySeverity(
  severity: Alert['severity'],
  limit = 100
): Promise<Alert[]> {
  const ids = await redis.zrevrange(`alerts:severity:${severity}`, 0, limit - 1);
  const result: Alert[] = [];

  for (const id of ids) {
    const alert = alerts.get(id);
    if (alert) {
      result.push(alert);
    }
  }

  return result;
}

/**
 * Get alert statistics
 */
export async function getAlertStats(): Promise<{
  total: number;
  unacknowledged: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  last24h: number;
}> {
  const allAlerts = Array.from(alerts.values());
  const unacknowledged = allAlerts.filter((a) => !a.acknowledged).length;
  const oneDayAgo = Date.now() - 86400000;
  const last24h = allAlerts.filter(
    (a) => a.timestamp.getTime() > oneDayAgo
  ).length;

  const bySeverity: Record<string, number> = {};
  const byType: Record<string, number> = {};

  for (const alert of allAlerts) {
    bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
    byType[alert.type] = (byType[alert.type] || 0) + 1;
  }

  return {
    total: allAlerts.length,
    unacknowledged,
    bySeverity,
    byType,
    last24h,
  };
}

/**
 * Get alert rules
 */
export function getAlertRules(): AlertRule[] {
  return Array.from(alertRules.values());
}

/**
 * Add or update alert rule
 */
export function upsertAlertRule(rule: AlertRule): void {
  alertRules.set(rule.id, rule);
}

/**
 * Delete alert rule
 */
export function deleteAlertRule(id: string): boolean {
  return alertRules.delete(id);
}

/**
 * Toggle alert rule
 */
export function toggleAlertRule(id: string, enabled: boolean): boolean {
  const rule = alertRules.get(id);
  if (!rule) return false;
  rule.enabled = enabled;
  return true;
}
