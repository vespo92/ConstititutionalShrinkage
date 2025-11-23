import { Comment, CreateCommentParams } from '../../types/index.js';

export class CommentTreeService {
  async getComments(threadId: string): Promise<Comment[]> {
    // In production, fetch comments from database and build tree
    return [];
  }

  async addComment(params: CreateCommentParams): Promise<Comment> {
    const comment: Comment = {
      id: Date.now().toString(),
      content: params.content,
      author: { id: params.authorId, displayName: 'User' },
      threadId: params.threadId,
      parentId: params.parentId,
      upvotes: 1,
      downvotes: 0,
      createdAt: new Date().toISOString(),
      edited: false,
    };

    // Save to database
    // Update thread comment count

    return comment;
  }

  async updateComment(id: string, content: string): Promise<Comment | null> {
    // Update comment content, set edited = true
    return null;
  }

  async deleteComment(id: string): Promise<boolean> {
    // Soft delete - replace content with [deleted]
    return false;
  }

  buildTree(comments: Comment[]): Comment[] {
    const commentMap = new Map<string, Comment & { replies: Comment[] }>();
    const rootComments: Comment[] = [];

    // First pass: add all comments to map
    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build tree structure
    comments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  }
}
