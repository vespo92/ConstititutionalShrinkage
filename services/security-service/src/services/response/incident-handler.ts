/**
 * Incident Handler
 *
 * Manages security incident lifecycle and response.
 */

import type {
  Incident,
  IncidentStatus,
  IncidentPriority,
  IncidentTimelineEntry,
  Threat,
  RemediationResult,
} from '../../types/index.js';
import { ThreatType } from '../../types/index.js';
import { redis } from '../../lib/redis.js';
import { sha256 } from '../../lib/hashing.js';

// In-memory incident storage (would be database in production)
const incidents = new Map<string, Incident>();

// Incident counter for ID generation
let incidentCounter = 0;

/**
 * Create a new incident from a threat
 */
export async function createIncident(
  threat: Threat,
  title?: string,
  assignee?: string
): Promise<Incident> {
  incidentCounter++;
  const id = `INC-${Date.now().toString(36).toUpperCase()}-${incidentCounter}`;

  const priority = determinePriority(threat);

  const incident: Incident = {
    id,
    title: title || `${threat.type}: ${threat.description.substring(0, 50)}`,
    description: threat.description,
    priority,
    status: 'open' as IncidentStatus,
    type: threat.type,
    affectedResources: [threat.target],
    affectedUsers: [],
    timeline: [
      {
        timestamp: new Date(),
        action: 'created',
        actor: 'system',
        details: `Incident created from threat detection: ${threat.id}`,
      },
    ],
    assignee,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  incidents.set(id, incident);

  // Store in Redis for persistence
  await redis.hset(`incident:${id}`, {
    data: JSON.stringify(incident),
    priority: priority,
    status: incident.status,
    createdAt: incident.createdAt.toISOString(),
  });

  // Add to priority queue
  await redis.zadd('incidents:open', Date.now().toString(), id);

  // Trigger notifications based on priority
  await notifyIncident(incident);

  return incident;
}

/**
 * Determine incident priority from threat
 */
function determinePriority(threat: Threat): IncidentPriority {
  // Critical priority threats
  const criticalTypes = [
    ThreatType.DATA_EXFILTRATION,
    ThreatType.VOTE_MANIPULATION,
    ThreatType.PRIVILEGE_ESCALATION,
  ];

  if (threat.level === 'critical' || criticalTypes.includes(threat.type)) {
    return 'P1' as IncidentPriority;
  }

  if (threat.level === 'high') {
    return 'P2' as IncidentPriority;
  }

  if (threat.level === 'medium') {
    return 'P3' as IncidentPriority;
  }

  return 'P4' as IncidentPriority;
}

/**
 * Get incident by ID
 */
export async function getIncident(id: string): Promise<Incident | null> {
  // Check memory cache
  if (incidents.has(id)) {
    return incidents.get(id) || null;
  }

  // Check Redis
  const data = await redis.hget(`incident:${id}`, 'data');
  if (data) {
    const incident = JSON.parse(data);
    incident.createdAt = new Date(incident.createdAt);
    incident.updatedAt = new Date(incident.updatedAt);
    if (incident.resolvedAt) {
      incident.resolvedAt = new Date(incident.resolvedAt);
    }
    incidents.set(id, incident);
    return incident;
  }

  return null;
}

/**
 * Update incident status
 */
export async function updateStatus(
  id: string,
  status: IncidentStatus,
  actor: string,
  details?: string
): Promise<Incident | null> {
  const incident = await getIncident(id);
  if (!incident) return null;

  const previousStatus = incident.status;
  incident.status = status;
  incident.updatedAt = new Date();

  if (status === 'closed' || status === 'remediated') {
    incident.resolvedAt = new Date();
  }

  // Add timeline entry
  incident.timeline.push({
    timestamp: new Date(),
    action: 'status_change',
    actor,
    details: details || `Status changed from ${previousStatus} to ${status}`,
  });

  // Update storage
  incidents.set(id, incident);
  await redis.hset(`incident:${id}`, {
    data: JSON.stringify(incident),
    status: status,
  });

  // Update queues
  await redis.zrem('incidents:open', id);
  if (status === 'open' || status === 'investigating' || status === 'contained') {
    await redis.zadd('incidents:open', Date.now().toString(), id);
  } else {
    await redis.zadd('incidents:closed', Date.now().toString(), id);
  }

  return incident;
}

/**
 * Add timeline entry
 */
export async function addTimelineEntry(
  id: string,
  entry: Omit<IncidentTimelineEntry, 'timestamp'>
): Promise<boolean> {
  const incident = await getIncident(id);
  if (!incident) return false;

  incident.timeline.push({
    ...entry,
    timestamp: new Date(),
  });
  incident.updatedAt = new Date();

  incidents.set(id, incident);
  await redis.hset(`incident:${id}`, 'data', JSON.stringify(incident));

  return true;
}

/**
 * Assign incident
 */
export async function assignIncident(
  id: string,
  assignee: string,
  actor: string
): Promise<boolean> {
  const incident = await getIncident(id);
  if (!incident) return false;

  const previousAssignee = incident.assignee;
  incident.assignee = assignee;
  incident.updatedAt = new Date();

  incident.timeline.push({
    timestamp: new Date(),
    action: 'assigned',
    actor,
    details: previousAssignee
      ? `Reassigned from ${previousAssignee} to ${assignee}`
      : `Assigned to ${assignee}`,
  });

  incidents.set(id, incident);
  await redis.hset(`incident:${id}`, 'data', JSON.stringify(incident));

  return true;
}

/**
 * Add affected user
 */
export async function addAffectedUser(
  id: string,
  userId: string
): Promise<boolean> {
  const incident = await getIncident(id);
  if (!incident) return false;

  if (!incident.affectedUsers.includes(userId)) {
    incident.affectedUsers.push(userId);
    incident.updatedAt = new Date();

    incidents.set(id, incident);
    await redis.hset(`incident:${id}`, 'data', JSON.stringify(incident));
  }

  return true;
}

/**
 * Add affected resource
 */
export async function addAffectedResource(
  id: string,
  resource: string
): Promise<boolean> {
  const incident = await getIncident(id);
  if (!incident) return false;

  if (!incident.affectedResources.includes(resource)) {
    incident.affectedResources.push(resource);
    incident.updatedAt = new Date();

    incidents.set(id, incident);
    await redis.hset(`incident:${id}`, 'data', JSON.stringify(incident));
  }

  return true;
}

/**
 * Set root cause
 */
export async function setRootCause(
  id: string,
  rootCause: string,
  actor: string
): Promise<boolean> {
  const incident = await getIncident(id);
  if (!incident) return false;

  incident.rootCause = rootCause;
  incident.updatedAt = new Date();

  incident.timeline.push({
    timestamp: new Date(),
    action: 'root_cause_identified',
    actor,
    details: `Root cause identified: ${rootCause}`,
  });

  incidents.set(id, incident);
  await redis.hset(`incident:${id}`, 'data', JSON.stringify(incident));

  return true;
}

/**
 * Set remediation
 */
export async function setRemediation(
  id: string,
  remediation: string,
  actor: string
): Promise<boolean> {
  const incident = await getIncident(id);
  if (!incident) return false;

  incident.remediation = remediation;
  incident.updatedAt = new Date();

  incident.timeline.push({
    timestamp: new Date(),
    action: 'remediation_defined',
    actor,
    details: `Remediation plan: ${remediation}`,
  });

  incidents.set(id, incident);
  await redis.hset(`incident:${id}`, 'data', JSON.stringify(incident));

  return true;
}

/**
 * Get open incidents
 */
export async function getOpenIncidents(): Promise<Incident[]> {
  const ids = await redis.zrevrange('incidents:open', 0, -1);
  const openIncidents: Incident[] = [];

  for (const id of ids) {
    const incident = await getIncident(id);
    if (incident) {
      openIncidents.push(incident);
    }
  }

  return openIncidents;
}

/**
 * Get incidents by priority
 */
export async function getIncidentsByPriority(
  priority: IncidentPriority
): Promise<Incident[]> {
  const allOpen = await getOpenIncidents();
  return allOpen.filter((i) => i.priority === priority);
}

/**
 * Get incident metrics
 */
export async function getMetrics(): Promise<{
  total: number;
  open: number;
  investigating: number;
  contained: number;
  resolved: number;
  byPriority: Record<string, number>;
  avgResolutionTime: number;
  mttr: number; // Mean time to resolve
}> {
  const allIncidents = Array.from(incidents.values());

  const open = allIncidents.filter((i) => i.status === 'open').length;
  const investigating = allIncidents.filter((i) => i.status === 'investigating').length;
  const contained = allIncidents.filter((i) => i.status === 'contained').length;
  const resolved = allIncidents.filter(
    (i) => i.status === 'closed' || i.status === 'remediated'
  ).length;

  const byPriority: Record<string, number> = {
    P1: allIncidents.filter((i) => i.priority === 'P1').length,
    P2: allIncidents.filter((i) => i.priority === 'P2').length,
    P3: allIncidents.filter((i) => i.priority === 'P3').length,
    P4: allIncidents.filter((i) => i.priority === 'P4').length,
  };

  // Calculate MTTR
  const resolvedIncidents = allIncidents.filter((i) => i.resolvedAt);
  let totalResolutionTime = 0;

  for (const incident of resolvedIncidents) {
    if (incident.resolvedAt) {
      totalResolutionTime +=
        incident.resolvedAt.getTime() - incident.createdAt.getTime();
    }
  }

  const mttr =
    resolvedIncidents.length > 0
      ? totalResolutionTime / resolvedIncidents.length / 1000 / 60 // minutes
      : 0;

  return {
    total: allIncidents.length,
    open,
    investigating,
    contained,
    resolved,
    byPriority,
    avgResolutionTime: mttr,
    mttr,
  };
}

/**
 * Notify about incident
 */
async function notifyIncident(incident: Incident): Promise<void> {
  // Store notification in queue
  await redis.lpush(
    'notifications:security',
    JSON.stringify({
      type: 'incident',
      incidentId: incident.id,
      priority: incident.priority,
      title: incident.title,
      timestamp: new Date().toISOString(),
    })
  );

  // For P1 incidents, add to urgent queue
  if (incident.priority === 'P1') {
    await redis.lpush('notifications:urgent', incident.id);
  }
}

/**
 * Link related incidents
 */
export async function linkIncidents(
  id1: string,
  id2: string
): Promise<boolean> {
  await redis.sadd(`incident:${id1}:related`, id2);
  await redis.sadd(`incident:${id2}:related`, id1);
  return true;
}

/**
 * Get related incidents
 */
export async function getRelatedIncidents(id: string): Promise<string[]> {
  return redis.smembers(`incident:${id}:related`);
}

/**
 * Search incidents
 */
export async function searchIncidents(query: {
  status?: IncidentStatus;
  priority?: IncidentPriority;
  type?: ThreatType;
  assignee?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
}): Promise<Incident[]> {
  let results = Array.from(incidents.values());

  if (query.status) {
    results = results.filter((i) => i.status === query.status);
  }

  if (query.priority) {
    results = results.filter((i) => i.priority === query.priority);
  }

  if (query.type) {
    results = results.filter((i) => i.type === query.type);
  }

  if (query.assignee) {
    results = results.filter((i) => i.assignee === query.assignee);
  }

  if (query.fromDate) {
    results = results.filter((i) => i.createdAt >= query.fromDate!);
  }

  if (query.toDate) {
    results = results.filter((i) => i.createdAt <= query.toDate!);
  }

  // Sort by priority then by date
  results.sort((a, b) => {
    const priorityOrder = { P1: 0, P2: 1, P3: 2, P4: 3 };
    const priorityDiff =
      priorityOrder[a.priority as keyof typeof priorityOrder] -
      priorityOrder[b.priority as keyof typeof priorityOrder];
    if (priorityDiff !== 0) return priorityDiff;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return results.slice(0, query.limit || 100);
}

/**
 * Generate incident report
 */
export async function generateReport(id: string): Promise<string> {
  const incident = await getIncident(id);
  if (!incident) return '';

  const related = await getRelatedIncidents(id);

  const report = `
# Incident Report: ${incident.id}

## Summary
- **Title:** ${incident.title}
- **Priority:** ${incident.priority}
- **Status:** ${incident.status}
- **Type:** ${incident.type}
- **Created:** ${incident.createdAt.toISOString()}
- **Resolved:** ${incident.resolvedAt?.toISOString() || 'N/A'}
- **Assignee:** ${incident.assignee || 'Unassigned'}

## Description
${incident.description}

## Affected Resources
${incident.affectedResources.map((r) => `- ${r}`).join('\n')}

## Affected Users
${incident.affectedUsers.length > 0 ? incident.affectedUsers.map((u) => `- ${u}`).join('\n') : 'None identified'}

## Root Cause
${incident.rootCause || 'Not yet identified'}

## Remediation
${incident.remediation || 'Not yet defined'}

## Timeline
${incident.timeline.map((e) => `- **${e.timestamp.toISOString()}** [${e.actor}] ${e.action}: ${e.details}`).join('\n')}

## Related Incidents
${related.length > 0 ? related.map((r) => `- ${r}`).join('\n') : 'None'}

---
Report generated: ${new Date().toISOString()}
Report hash: ${sha256(JSON.stringify(incident))}
  `.trim();

  return report;
}
