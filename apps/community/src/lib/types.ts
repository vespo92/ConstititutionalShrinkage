// Discussion Types
export interface Thread {
  id: string;
  title: string;
  content: string;
  author: UserSummary;
  billId?: string;
  category: DiscussionCategory;
  tags: string[];
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  locked: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: UserSummary;
  threadId: string;
  parentId?: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  createdAt: string;
  updatedAt?: string;
  edited: boolean;
  replies?: Comment[];
}

export type DiscussionCategory = 'legislation' | 'policy' | 'local' | 'feedback' | 'general';

// Petition Types
export interface Petition {
  id: string;
  title: string;
  description: string;
  creator: UserSummary;
  signatures: number;
  goal: number;
  progress: number;
  category: PetitionCategory;
  region: string;
  status: 'active' | 'successful' | 'closed' | 'rejected';
  createdAt: string;
  deadline?: string;
  responseRequired: boolean;
  officialResponse?: string;
  hasSigned?: boolean;
  recentSignatures?: Signature[];
}

export interface Signature {
  name: string;
  publicSignature: boolean;
  comment?: string;
  signedAt: string;
}

export type PetitionCategory =
  | 'environment'
  | 'education'
  | 'healthcare'
  | 'transportation'
  | 'housing'
  | 'economy'
  | 'civil-rights'
  | 'general';

// Town Hall Types
export interface TownHall {
  id: string;
  title: string;
  description: string;
  host: OfficialProfile;
  scheduledFor: string;
  duration: number;
  status: 'scheduled' | 'live' | 'ended';
  attendees: number;
  billIds?: string[];
  region: string;
  maxAttendees?: number;
  recording?: Recording;
  transcript?: string;
  questions?: Question[];
}

export interface OfficialProfile {
  id: string;
  name: string;
  title: string;
  avatar?: string;
}

export interface Recording {
  url: string;
  duration: number;
  createdAt: string;
}

export interface Question {
  id: string;
  content: string;
  author: UserSummary;
  upvotes: number;
  hasUpvoted: boolean;
  isAnswered: boolean;
  answer?: string;
  createdAt: string;
}

// Public Comment Types
export interface PublicComment {
  id: string;
  billId: string;
  author: UserSummary;
  position: 'support' | 'oppose' | 'neutral';
  comment: string;
  attachments?: Attachment[];
  representingOrg?: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface CommentSummary {
  billId: string;
  totalComments: number;
  breakdown: {
    support: number;
    oppose: number;
    neutral: number;
  };
  topConcerns: string[];
  topSupports: string[];
  organizationsRepresented: number;
}

// Group Types
export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  region: string;
  isJoined: boolean;
  createdAt: string;
  admins: UserSummary[];
}

// User Types
export interface UserSummary {
  id: string;
  displayName: string;
  avatar?: string;
  reputation?: number;
}

export interface ReputationScore {
  total: number;
  breakdown: {
    votingParticipation: number;
    constructiveComments: number;
    petitionsCreated: number;
    questionsAnswered: number;
    reportAccuracy: number;
    communityStanding: number;
  };
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  awardedAt: string;
}

// Moderation Types
export interface Report {
  id: string;
  contentType: 'discussion' | 'comment' | 'petition' | 'user';
  contentId: string;
  reason: string;
  details?: string;
  reporter: UserSummary;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
}

// API Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}
