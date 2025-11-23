export interface Warning {
  id: string;
  userId: string;
  type: 'content' | 'behavior' | 'spam' | 'harassment';
  reason: string;
  contentId?: string;
  issuedBy: string;
  issuedAt: string;
  acknowledged: boolean;
  expiresAt?: string;
}

export interface WarnOptions {
  userId: string;
  type: Warning['type'];
  reason: string;
  contentId?: string;
  issuedBy: string;
  expiresInDays?: number;
}

const warnings = new Map<string, Warning[]>();

export async function warnUser(options: WarnOptions): Promise<Warning> {
  const { userId, type, reason, contentId, issuedBy, expiresInDays } = options;

  const warning: Warning = {
    id: Date.now().toString(),
    userId,
    type,
    reason,
    contentId,
    issuedBy,
    issuedAt: new Date().toISOString(),
    acknowledged: false,
    expiresAt: expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined,
  };

  // Store warning
  if (!warnings.has(userId)) {
    warnings.set(userId, []);
  }
  warnings.get(userId)!.push(warning);

  // Send notification to user
  await sendWarningNotification(warning);

  return warning;
}

export async function getUserWarnings(userId: string): Promise<Warning[]> {
  return warnings.get(userId) || [];
}

export async function getActiveWarnings(userId: string): Promise<Warning[]> {
  const userWarnings = await getUserWarnings(userId);
  const now = new Date();

  return userWarnings.filter((w) => {
    if (w.expiresAt && new Date(w.expiresAt) < now) {
      return false;
    }
    return true;
  });
}

export async function acknowledgeWarning(warningId: string, userId: string): Promise<boolean> {
  const userWarnings = warnings.get(userId);
  if (!userWarnings) return false;

  const warning = userWarnings.find((w) => w.id === warningId);
  if (!warning) return false;

  warning.acknowledged = true;
  return true;
}

export async function getWarningCount(userId: string, timeframeDays = 30): Promise<number> {
  const userWarnings = await getUserWarnings(userId);
  const cutoff = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);

  return userWarnings.filter(
    (w) => new Date(w.issuedAt) >= cutoff
  ).length;
}

async function sendWarningNotification(warning: Warning): Promise<void> {
  // In production, send email/push notification
  console.log(`Warning notification sent to user ${warning.userId}: ${warning.reason}`);
}
