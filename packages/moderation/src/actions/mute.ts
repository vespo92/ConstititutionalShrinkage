export interface MuteOptions {
  userId: string;
  reason: string;
  durationHours: number;
  scope: 'all' | 'discussions' | 'comments' | 'petitions';
  issuedBy: string;
}

export interface Mute {
  id: string;
  userId: string;
  reason: string;
  scope: MuteOptions['scope'];
  startedAt: string;
  expiresAt: string;
  issuedBy: string;
  lifted: boolean;
  liftedBy?: string;
  liftedAt?: string;
}

const mutes = new Map<string, Mute[]>();

export async function muteUser(options: MuteOptions): Promise<Mute> {
  const { userId, reason, durationHours, scope, issuedBy } = options;

  const mute: Mute = {
    id: Date.now().toString(),
    userId,
    reason,
    scope,
    startedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString(),
    issuedBy,
    lifted: false,
  };

  // Store mute
  if (!mutes.has(userId)) {
    mutes.set(userId, []);
  }
  mutes.get(userId)!.push(mute);

  // Notify user
  await sendMuteNotification(mute);

  return mute;
}

export async function isUserMuted(userId: string, scope?: MuteOptions['scope']): Promise<boolean> {
  const activeMute = await getActiveMute(userId, scope);
  return activeMute !== null;
}

export async function getActiveMute(userId: string, scope?: MuteOptions['scope']): Promise<Mute | null> {
  const userMutes = mutes.get(userId);
  if (!userMutes) return null;

  const now = new Date();

  return userMutes.find((m) => {
    if (m.lifted) return false;
    if (new Date(m.expiresAt) < now) return false;
    if (scope && m.scope !== 'all' && m.scope !== scope) return false;
    return true;
  }) || null;
}

export async function liftMute(muteId: string, liftedBy: string): Promise<boolean> {
  for (const userMutes of mutes.values()) {
    const mute = userMutes.find((m) => m.id === muteId);
    if (mute) {
      mute.lifted = true;
      mute.liftedBy = liftedBy;
      mute.liftedAt = new Date().toISOString();
      return true;
    }
  }
  return false;
}

export async function getMuteHistory(userId: string): Promise<Mute[]> {
  return mutes.get(userId) || [];
}

async function sendMuteNotification(mute: Mute): Promise<void> {
  const durationHours = Math.round(
    (new Date(mute.expiresAt).getTime() - new Date(mute.startedAt).getTime()) / (60 * 60 * 1000)
  );
  console.log(
    `User ${mute.userId} has been muted for ${durationHours} hours. ` +
    `Scope: ${mute.scope}. Reason: ${mute.reason}`
  );
}
