interface Question {
  id: string;
  eventId: string;
  question: string;
  author: { id: string; name: string };
  upvotes: number;
  hasUpvoted: Set<string>;
  isAnswered: boolean;
  answer?: string;
  createdAt: string;
  answeredAt?: string;
}

interface SubmitQuestionParams {
  eventId: string;
  question: string;
  authorId: string;
}

export class QuestionQueue {
  private questions = new Map<string, Question[]>();
  private userVotes = new Map<string, Set<string>>();

  async submit(params: SubmitQuestionParams): Promise<Question> {
    const { eventId, question, authorId } = params;

    const newQuestion: Question = {
      id: Date.now().toString(),
      eventId,
      question,
      author: { id: authorId, name: 'User Name' },
      upvotes: 1,
      hasUpvoted: new Set([authorId]),
      isAnswered: false,
      createdAt: new Date().toISOString(),
    };

    if (!this.questions.has(eventId)) {
      this.questions.set(eventId, []);
    }
    this.questions.get(eventId)!.push(newQuestion);

    return newQuestion;
  }

  async upvote(questionId: string, userId: string): Promise<void> {
    const allQuestions = Array.from(this.questions.values()).flat();
    const question = allQuestions.find((q) => q.id === questionId);

    if (!question) return;

    if (question.hasUpvoted.has(userId)) {
      // Remove upvote
      question.hasUpvoted.delete(userId);
      question.upvotes--;
    } else {
      // Add upvote
      question.hasUpvoted.add(userId);
      question.upvotes++;
    }
  }

  async getQuestions(eventId: string, sort: 'popular' | 'recent' = 'popular'): Promise<Question[]> {
    const questions = this.questions.get(eventId) || [];

    if (sort === 'popular') {
      return [...questions].sort((a, b) => b.upvotes - a.upvotes);
    }

    return [...questions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async markAnswered(questionId: string, answer?: string): Promise<void> {
    const allQuestions = Array.from(this.questions.values()).flat();
    const question = allQuestions.find((q) => q.id === questionId);

    if (question) {
      question.isAnswered = true;
      question.answer = answer;
      question.answeredAt = new Date().toISOString();
    }
  }

  async getNextQuestion(eventId: string): Promise<Question | null> {
    const questions = await this.getQuestions(eventId, 'popular');
    return questions.find((q) => !q.isAnswered) || null;
  }
}
