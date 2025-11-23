interface VoteParams {
  targetId: string;
  targetType: 'thread' | 'comment';
  type: 'up' | 'down';
  userId: string;
}

export class VotingService {
  private votes = new Map<string, Map<string, 'up' | 'down'>>();

  async vote(params: VoteParams): Promise<void> {
    const { targetId, type, userId } = params;
    const key = `${params.targetType}:${targetId}`;

    if (!this.votes.has(key)) {
      this.votes.set(key, new Map());
    }

    const targetVotes = this.votes.get(key)!;
    const existingVote = targetVotes.get(userId);

    if (existingVote === type) {
      // Remove vote (toggle off)
      targetVotes.delete(userId);
    } else {
      // Add or change vote
      targetVotes.set(userId, type);
    }

    // In production, update database and recalculate score
  }

  async getVote(targetId: string, targetType: string, userId: string): Promise<'up' | 'down' | null> {
    const key = `${targetType}:${targetId}`;
    return this.votes.get(key)?.get(userId) || null;
  }

  async getScore(targetId: string, targetType: string): Promise<{ upvotes: number; downvotes: number }> {
    const key = `${targetType}:${targetId}`;
    const targetVotes = this.votes.get(key);

    if (!targetVotes) {
      return { upvotes: 0, downvotes: 0 };
    }

    let upvotes = 0;
    let downvotes = 0;

    targetVotes.forEach((vote) => {
      if (vote === 'up') upvotes++;
      else downvotes++;
    });

    return { upvotes, downvotes };
  }

  calculateHotScore(upvotes: number, downvotes: number, createdAt: Date): number {
    // Reddit-style hot ranking algorithm
    const score = upvotes - downvotes;
    const order = Math.log10(Math.max(Math.abs(score), 1));
    const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    const seconds = createdAt.getTime() / 1000 - 1134028003; // Reddit epoch
    return sign * order + seconds / 45000;
  }

  calculateControversialScore(upvotes: number, downvotes: number): number {
    // Controversial if many votes but close to 50/50
    const total = upvotes + downvotes;
    if (total < 10) return 0;

    const ratio = Math.min(upvotes, downvotes) / Math.max(upvotes, downvotes);
    return total * ratio;
  }
}
