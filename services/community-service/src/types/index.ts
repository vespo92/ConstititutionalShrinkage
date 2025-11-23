export interface UserSummary {
  id: string;
  displayName: string;
  avatar?: string;
}

export interface Thread {
  id: string;
  title: string;
  content: string;
  author: UserSummary;
  category: string;
  tags: string[];
  billId?: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  locked: boolean;
}

export interface CreateThreadParams {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  billId?: string;
  authorId: string;
}

export interface ThreadQueryParams {
  sort?: string;
  timeframe?: string;
  category?: string;
  billId?: string;
  page?: number;
  limit?: number;
}

export interface Comment {
  id: string;
  content: string;
  author: UserSummary;
  threadId: string;
  parentId?: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt?: string;
  edited: boolean;
  replies?: Comment[];
}

export interface CreateCommentParams {
  threadId: string;
  content: string;
  parentId?: string;
  authorId: string;
}

export interface Petition {
  id: string;
  title: string;
  description: string;
  creator: UserSummary;
  signatures: number;
  goal: number;
  progress: number;
  category: string;
  region: string;
  status: 'active' | 'successful' | 'closed' | 'rejected';
  createdAt: string;
  deadline?: string;
  responseRequired: boolean;
  officialResponse?: string;
}

export interface TownHall {
  id: string;
  title: string;
  description: string;
  host: {
    id: string;
    name: string;
    title: string;
  };
  scheduledFor: string;
  duration: number;
  status: 'scheduled' | 'live' | 'ended';
  attendees: number;
  billIds?: string[];
  region: string;
  maxAttendees?: number;
  recording?: {
    url: string;
    duration: number;
  };
  transcript?: string;
}

export interface ScheduleTownHallParams {
  title: string;
  description: string;
  hostId: string;
  scheduledFor: string;
  duration: number;
  billIds?: string[];
  region: string;
  maxAttendees?: number;
}

export interface Report {
  id: string;
  contentType: string;
  contentId: string;
  reason: string;
  details?: string;
  reporter: UserSummary;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
}
