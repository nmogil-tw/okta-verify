export type EventType =
  | 'telephony_hook'      // Backend - Okta → Twilio Function
  | 'verify_api'          // Backend - Twilio Verify API call
  | 'event_hook'          // Backend - Okta Event Hook
  | 'widget_init'         // Frontend - Widget initialized
  | 'oauth_redirect'      // Frontend - Redirect to Okta
  | 'oauth_callback'      // Frontend - Return from Okta
  | 'token_exchange'      // Frontend - Token exchange
  | 'auth_success';       // Frontend - Auth complete

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
    synthetic?: boolean;           // Is this a frontend-generated event?
    source?: 'frontend' | 'backend'; // Where did this event originate?
    description?: string;           // Human-readable description
  };
}
