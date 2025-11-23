import { ReviewItem } from './review-queue.js';

interface Moderator {
  id: string;
  name: string;
  expertise: string[];
  currentLoad: number;
  maxLoad: number;
  available: boolean;
  lastAssignment?: string;
}

export class AssignmentManager {
  private moderators = new Map<string, Moderator>();
  private contentTypeExperts: Record<ReviewItem['contentType'], string[]> = {
    thread: [],
    comment: [],
    petition: [],
    group: [],
    user: [],
  };

  registerModerator(moderator: Moderator): void {
    this.moderators.set(moderator.id, moderator);

    // Register as expert for their expertise areas
    moderator.expertise.forEach((area) => {
      if (area in this.contentTypeExperts) {
        this.contentTypeExperts[area as ReviewItem['contentType']].push(moderator.id);
      }
    });
  }

  async assignItem(item: ReviewItem): Promise<string | null> {
    const eligibleModerators = this.getEligibleModerators(item);

    if (eligibleModerators.length === 0) {
      return null;
    }

    // Sort by load (ascending) then by expertise match
    const experts = this.contentTypeExperts[item.contentType];
    eligibleModerators.sort((a, b) => {
      // Prefer experts
      const aIsExpert = experts.includes(a.id);
      const bIsExpert = experts.includes(b.id);
      if (aIsExpert && !bIsExpert) return -1;
      if (!aIsExpert && bIsExpert) return 1;

      // Then by current load
      return a.currentLoad - b.currentLoad;
    });

    const assignee = eligibleModerators[0];
    assignee.currentLoad++;
    assignee.lastAssignment = new Date().toISOString();

    return assignee.id;
  }

  private getEligibleModerators(item: ReviewItem): Moderator[] {
    return Array.from(this.moderators.values()).filter((mod) => {
      if (!mod.available) return false;
      if (mod.currentLoad >= mod.maxLoad) return false;
      return true;
    });
  }

  async releaseAssignment(moderatorId: string): Promise<void> {
    const moderator = this.moderators.get(moderatorId);
    if (moderator && moderator.currentLoad > 0) {
      moderator.currentLoad--;
    }
  }

  setModeratorAvailability(moderatorId: string, available: boolean): void {
    const moderator = this.moderators.get(moderatorId);
    if (moderator) {
      moderator.available = available;
    }
  }

  getModeratorStats(moderatorId: string): {
    currentLoad: number;
    maxLoad: number;
    available: boolean;
  } | null {
    const moderator = this.moderators.get(moderatorId);
    if (!moderator) return null;

    return {
      currentLoad: moderator.currentLoad,
      maxLoad: moderator.maxLoad,
      available: moderator.available,
    };
  }

  getQueueStats(): {
    totalModerators: number;
    availableModerators: number;
    totalCapacity: number;
    usedCapacity: number;
  } {
    const mods = Array.from(this.moderators.values());
    const available = mods.filter((m) => m.available);

    return {
      totalModerators: mods.length,
      availableModerators: available.length,
      totalCapacity: mods.reduce((sum, m) => sum + m.maxLoad, 0),
      usedCapacity: mods.reduce((sum, m) => sum + m.currentLoad, 0),
    };
  }
}
