import { TownHall, ScheduleTownHallParams } from '../../types/index.js';

interface Participant {
  id: string;
  name: string;
  joinedAt: string;
  handRaised: boolean;
}

export class RoomManager {
  private events = new Map<string, TownHall>();
  private participants = new Map<string, Map<string, Participant>>();
  private rsvps = new Map<string, Set<string>>();

  async getEvents(status?: string): Promise<TownHall[]> {
    const events = Array.from(this.events.values());
    if (status) {
      return events.filter((e) => e.status === status);
    }
    return events;
  }

  async getLiveEvents(): Promise<TownHall[]> {
    return Array.from(this.events.values()).filter((e) => e.status === 'live');
  }

  async getEvent(id: string): Promise<TownHall | null> {
    return this.events.get(id) || null;
  }

  async schedule(params: ScheduleTownHallParams): Promise<TownHall> {
    const event: TownHall = {
      id: Date.now().toString(),
      title: params.title,
      description: params.description,
      host: { id: params.hostId, name: 'Host Name', title: 'Official Title' },
      scheduledFor: params.scheduledFor,
      duration: params.duration,
      status: 'scheduled',
      attendees: 0,
      billIds: params.billIds,
      region: params.region,
      maxAttendees: params.maxAttendees,
    };

    this.events.set(event.id, event);
    return event;
  }

  async rsvp(eventId: string, userId: string): Promise<void> {
    if (!this.rsvps.has(eventId)) {
      this.rsvps.set(eventId, new Set());
    }
    this.rsvps.get(eventId)!.add(userId);

    // Update attendee count
    const event = this.events.get(eventId);
    if (event) {
      event.attendees = this.rsvps.get(eventId)!.size;
    }
  }

  async join(eventId: string, userId: string): Promise<void> {
    if (!this.participants.has(eventId)) {
      this.participants.set(eventId, new Map());
    }

    this.participants.get(eventId)!.set(userId, {
      id: userId,
      name: 'User Name',
      joinedAt: new Date().toISOString(),
      handRaised: false,
    });

    // Update live attendee count
    const event = this.events.get(eventId);
    if (event) {
      event.attendees = this.participants.get(eventId)!.size;
    }
  }

  async leave(eventId: string, userId: string): Promise<void> {
    this.participants.get(eventId)?.delete(userId);

    const event = this.events.get(eventId);
    if (event) {
      event.attendees = this.participants.get(eventId)?.size || 0;
    }
  }

  async raiseHand(eventId: string, userId: string): Promise<void> {
    const participant = this.participants.get(eventId)?.get(userId);
    if (participant) {
      participant.handRaised = !participant.handRaised;
    }
  }

  async getRaisedHands(eventId: string): Promise<Participant[]> {
    const eventParticipants = this.participants.get(eventId);
    if (!eventParticipants) return [];

    return Array.from(eventParticipants.values()).filter((p) => p.handRaised);
  }

  async startEvent(eventId: string): Promise<void> {
    const event = this.events.get(eventId);
    if (event) {
      event.status = 'live';
    }
  }

  async endEvent(eventId: string): Promise<void> {
    const event = this.events.get(eventId);
    if (event) {
      event.status = 'ended';
    }
  }
}
