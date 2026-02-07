export type EventType = 'telephony_hook' | 'verify_api' | 'event_hook';

export interface DemoEvent {
  id: string;
  type: EventType;
  timestamp: string;
  duration?: number;
  request: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body: any;
  };
  response?: {
    status: number;
    headers?: Record<string, string>;
    body: any;
  };
  metadata?: {
    phoneNumber?: string;
    channel?: 'sms' | 'voice';
    status?: 'pending' | 'approved' | 'denied';
    verificationSid?: string;
  };
}
