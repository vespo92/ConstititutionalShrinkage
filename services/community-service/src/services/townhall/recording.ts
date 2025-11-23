interface Recording {
  id: string;
  eventId: string;
  url: string;
  duration: number;
  createdAt: string;
  status: 'recording' | 'processing' | 'ready' | 'failed';
}

export class RecordingService {
  private recordings = new Map<string, Recording>();

  async startRecording(eventId: string): Promise<Recording> {
    const recording: Recording = {
      id: Date.now().toString(),
      eventId,
      url: '', // Will be set when recording is ready
      duration: 0,
      createdAt: new Date().toISOString(),
      status: 'recording',
    };

    this.recordings.set(eventId, recording);
    return recording;
  }

  async stopRecording(eventId: string): Promise<Recording | null> {
    const recording = this.recordings.get(eventId);
    if (!recording) return null;

    recording.status = 'processing';

    // In production, would process and upload recording
    // Simulate processing time
    setTimeout(() => {
      recording.status = 'ready';
      recording.url = `/recordings/${recording.id}.mp4`;
      recording.duration = 3600; // 1 hour
    }, 5000);

    return recording;
  }

  async getRecording(eventId: string): Promise<Recording | null> {
    return this.recordings.get(eventId) || null;
  }

  async deleteRecording(eventId: string): Promise<boolean> {
    return this.recordings.delete(eventId);
  }
}
