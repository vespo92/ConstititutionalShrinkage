export interface BanOptions {
  userId: string;
  reason: string;
  durationDays?: number; // undefined = permanent
  issuedBy: string;
  appealable: boolean;
}

export interface Ban {
  id: string;
  userId: string;
  reason: string;
  permanent: boolean;
  startedAt: string;
  expiresAt?: string;
  issuedBy: string;
  appealable: boolean;
  appealed: boolean;
  appealStatus?: 'pending' | 'approved' | 'denied';
  appealReason?: string;
  lifted: boolean;
  liftedBy?: string;
  liftedAt?: string;
}

const bans = new Map<string, Ban[]>();

export async function banUser(options: BanOptions): Promise<Ban> {
  const { userId, reason, durationDays, issuedBy, appealable } = options;

  const ban: Ban = {
    id: Date.now().toString(),
    userId,
    reason,
    permanent: durationDays === undefined,
    startedAt: new Date().toISOString(),
    expiresAt: durationDays
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined,
    issuedBy,
    appealable,
    appealed: false,
    lifted: false,
  };

  // Store ban
  if (!bans.has(userId)) {
    bans.set(userId, []);
  }
  bans.get(userId)!.push(ban);

  // Notify user
  await sendBanNotification(ban);

  // Revoke active sessions
  await revokeUserSessions(userId);

  return ban;
}

export async function isUserBanned(userId: string): Promise<boolean> {
  const activeBan = await getActiveBan(userId);
  return activeBan !== null;
}

export async function getActiveBan(userId: string): Promise<Ban | null> {
  const userBans = bans.get(userId);
  if (!userBans) return null;

  const now = new Date();

  return userBans.find((b) => {
    if (b.lifted) return false;
    if (b.expiresAt && new Date(b.expiresAt) < now) return false;
    return true;
  }) || null;
}

export async function submitAppeal(banId: string, userId: string, reason: string): Promise<boolean> {
  const userBans = bans.get(userId);
  if (!userBans) return false;

  const ban = userBans.find((b) => b.id === banId);
  if (!ban || !ban.appealable || ban.appealed) return false;

  ban.appealed = true;
  ban.appealStatus = 'pending';
  ban.appealReason = reason;

  // Notify moderators
  await notifyAppealSubmitted(ban);

  return true;
}

export async function resolveAppeal(
  banId: string,
  approved: boolean,
  resolvedBy: string
): Promise<boolean> {
  for (const userBans of bans.values()) {
    const ban = userBans.find((b) => b.id === banId);
    if (ban && ban.appealStatus === 'pending') {
      ban.appealStatus = approved ? 'approved' : 'denied';

      if (approved) {
        await liftBan(banId, resolvedBy);
      }

      return true;
    }
  }
  return false;
}

export async function liftBan(banId: string, liftedBy: string): Promise<boolean> {
  for (const userBans of bans.values()) {
    const ban = userBans.find((b) => b.id === banId);
    if (ban) {
      ban.lifted = true;
      ban.liftedBy = liftedBy;
      ban.liftedAt = new Date().toISOString();
      return true;
    }
  }
  return false;
}

export async function getBanHistory(userId: string): Promise<Ban[]> {
  return bans.get(userId) || [];
}

async function sendBanNotification(ban: Ban): Promise<void> {
  const duration = ban.permanent
    ? 'permanently'
    : `for ${Math.round((new Date(ban.expiresAt!).getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days`;

  console.log(`User ${ban.userId} has been banned ${duration}. Reason: ${ban.reason}`);
}

async function revokeUserSessions(userId: string): Promise<void> {
  console.log(`Revoking all sessions for user ${userId}`);
}

async function notifyAppealSubmitted(ban: Ban): Promise<void> {
  console.log(`Appeal submitted for ban ${ban.id} by user ${ban.userId}`);
}
