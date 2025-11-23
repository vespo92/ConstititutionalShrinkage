interface ReputationScore {
  total: number;
  breakdown: {
    votingParticipation: number;
    constructiveComments: number;
    petitionsCreated: number;
    questionsAnswered: number;
    reportAccuracy: number;
    communityStanding: number;
  };
  level: string;
  privileges: string[];
}

interface ReputationWeights {
  votingParticipation: number;
  constructiveComments: number;
  petitionsCreated: number;
  questionsAnswered: number;
  reportAccuracy: number;
  communityStanding: number;
}

export class ScoreCalculator {
  private weights: ReputationWeights = {
    votingParticipation: 0.15,
    constructiveComments: 0.25,
    petitionsCreated: 0.15,
    questionsAnswered: 0.15,
    reportAccuracy: 0.10,
    communityStanding: 0.20,
  };

  private levels = [
    { threshold: 0, name: 'Newcomer' },
    { threshold: 100, name: 'Participant' },
    { threshold: 500, name: 'Contributor' },
    { threshold: 1000, name: 'Active Citizen' },
    { threshold: 2500, name: 'Community Leader' },
    { threshold: 5000, name: 'Civic Champion' },
    { threshold: 10000, name: 'Democracy Advocate' },
  ];

  private privilegeThresholds = {
    upvote: 0,
    downvote: 100,
    comment: 0,
    createThread: 50,
    createPetition: 200,
    moderateBasic: 1000,
    moderateFull: 5000,
  };

  async calculateScore(userId: string): Promise<ReputationScore> {
    const metrics = await this.getUserMetrics(userId);

    const breakdown = {
      votingParticipation: metrics.votesCount * 2,
      constructiveComments: metrics.upvotedComments * 5,
      petitionsCreated: metrics.petitionsCreated * 50,
      questionsAnswered: metrics.questionsAnswered * 10,
      reportAccuracy: metrics.accurateReports * 20,
      communityStanding: metrics.netUpvotes * 1,
    };

    const total = Object.entries(breakdown).reduce((sum, [key, value]) => {
      return sum + value * this.weights[key as keyof ReputationWeights];
    }, 0);

    const level = this.getLevel(total);
    const privileges = this.getPrivileges(total);

    return {
      total: Math.round(total),
      breakdown,
      level,
      privileges,
    };
  }

  private async getUserMetrics(userId: string): Promise<{
    votesCount: number;
    upvotedComments: number;
    petitionsCreated: number;
    questionsAnswered: number;
    accurateReports: number;
    netUpvotes: number;
  }> {
    // In production, query from database
    return {
      votesCount: 50,
      upvotedComments: 25,
      petitionsCreated: 2,
      questionsAnswered: 10,
      accurateReports: 5,
      netUpvotes: 150,
    };
  }

  private getLevel(score: number): string {
    const level = [...this.levels]
      .reverse()
      .find((l) => score >= l.threshold);
    return level?.name || 'Newcomer';
  }

  private getPrivileges(score: number): string[] {
    return Object.entries(this.privilegeThresholds)
      .filter(([, threshold]) => score >= threshold)
      .map(([privilege]) => privilege);
  }

  hasPrivilege(userId: string, privilege: keyof typeof this.privilegeThresholds): boolean {
    // In production, calculate or cache user score
    const userScore = 1234; // Placeholder
    return userScore >= this.privilegeThresholds[privilege];
  }
}
