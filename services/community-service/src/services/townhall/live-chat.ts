interface ChatMessage {
  id: string;
  eventId: string;
  content: string;
  author: { id: string; name: string };
  timestamp: string;
}

export class LiveChatService {
  private messages = new Map<string, ChatMessage[]>();
  private maxMessages = 1000; // Keep last 1000 messages per event

  async send(eventId: string, userId: string, content: string): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: Date.now().toString(),
      eventId,
      content: content.slice(0, 500), // Limit message length
      author: { id: userId, name: 'User Name' },
      timestamp: new Date().toISOString(),
    };

    if (!this.messages.has(eventId)) {
      this.messages.set(eventId, []);
    }

    const eventMessages = this.messages.get(eventId)!;
    eventMessages.push(message);

    // Trim old messages
    if (eventMessages.length > this.maxMessages) {
      eventMessages.shift();
    }

    return message;
  }

  async getMessages(eventId: string, limit = 100): Promise<ChatMessage[]> {
    const messages = this.messages.get(eventId) || [];
    return messages.slice(-limit);
  }

  async getMessagesSince(eventId: string, timestamp: string): Promise<ChatMessage[]> {
    const messages = this.messages.get(eventId) || [];
    const sinceTime = new Date(timestamp).getTime();
    return messages.filter(
      (m) => new Date(m.timestamp).getTime() > sinceTime
    );
  }

  async clearChat(eventId: string): Promise<void> {
    this.messages.delete(eventId);
  }

  async deleteMessage(eventId: string, messageId: string): Promise<boolean> {
    const messages = this.messages.get(eventId);
    if (!messages) return false;

    const index = messages.findIndex((m) => m.id === messageId);
    if (index === -1) return false;

    messages.splice(index, 1);
    return true;
  }
}
