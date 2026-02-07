import { v4 as uuidv4 } from 'uuid'
import { DemoEvent } from '../types/events'

/**
 * Generates synthetic frontend events for authentication flow visualization.
 * These events help track the user's journey through OAuth redirect.
 */
export class EventGenerator {
  /**
   * Generate event when Okta Sign-In Widget initializes
   */
  generateWidgetInitEvent(): DemoEvent {
    return {
      id: uuidv4(),
      type: 'widget_init',
      timestamp: new Date().toISOString(),
      request: {
        url: window.location.origin,
        method: 'INIT',
        body: {
          baseUrl: import.meta.env.VITE_OKTA_ORG_URL,
          clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
          flow: 'Authorization Code + PKCE (Popup Mode)',
          redirectUri: window.location.origin + '/callback',
        }
      },
      metadata: {
        synthetic: true,
        source: 'frontend',
        description: 'Okta Sign-In Widget initialized'
      }
    }
  }

  /**
   * Generate event when user is redirected to Okta for authentication
   */
  generateOAuthRedirectEvent(oktaUrl: string): DemoEvent {
    return {
      id: uuidv4(),
      type: 'oauth_redirect',
      timestamp: new Date().toISOString(),
      request: {
        url: oktaUrl,
        method: 'GET',
        body: {
          responseType: 'code',
          pkce: true,
          scopes: ['openid', 'profile', 'email'],
        }
      },
      metadata: {
        synthetic: true,
        source: 'frontend',
        description: 'Opening Okta authentication in popup window'
      }
    }
  }

  /**
   * Generate event when OAuth callback is received
   */
  generateCallbackEvent(): DemoEvent {
    // In popup flow, the callback happens in the popup window,
    // not the main window, so we generate a synthetic representation
    return {
      id: uuidv4(),
      type: 'oauth_callback',
      timestamp: new Date().toISOString(),
      request: {
        url: 'popup://okta-authentication/callback',
        method: 'GET',
        body: {
          code: '[authorization code received in popup]',
          state: '[verified in popup window]',
          mode: 'popup',
        }
      },
      response: {
        status: 200,
        body: {
          codeReceived: true,
          popup: true,
        }
      },
      metadata: {
        synthetic: true,
        source: 'frontend',
        description: 'OAuth callback received in popup window'
      }
    }
  }

  /**
   * Generate event when exchanging authorization code for tokens
   */
  generateTokenExchangeEvent(): DemoEvent {
    return {
      id: uuidv4(),
      type: 'token_exchange',
      timestamp: new Date().toISOString(),
      request: {
        url: `${import.meta.env.VITE_OKTA_ORG_URL}/oauth2/v1/token`,
        method: 'POST',
        body: {
          grantType: 'authorization_code',
          codeVerifier: '[PKCE verifier from popup]',
          redirectUri: window.location.origin + '/callback',
        }
      },
      metadata: {
        synthetic: true,
        source: 'frontend',
        description: 'Exchanging authorization code for tokens (in popup)'
      }
    }
  }

  /**
   * Generate event when authentication succeeds
   */
  generateAuthSuccessEvent(): DemoEvent {
    return {
      id: uuidv4(),
      type: 'auth_success',
      timestamp: new Date().toISOString(),
      request: {
        url: window.location.origin,
        method: 'SUCCESS',
        body: {
          tokensReceived: true,
        }
      },
      response: {
        status: 200,
        body: {
          authenticated: true,
          tokensStored: true,
        }
      },
      metadata: {
        synthetic: true,
        source: 'frontend',
        description: 'Authentication completed successfully'
      }
    }
  }
}
