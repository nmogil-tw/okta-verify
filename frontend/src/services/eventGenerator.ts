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
          flow: 'Authorization Code + PKCE',
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
        description: 'Redirecting to Okta for authentication'
      }
    }
  }

  /**
   * Generate event when OAuth callback is received
   */
  generateCallbackEvent(): DemoEvent {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')

    return {
      id: uuidv4(),
      type: 'oauth_callback',
      timestamp: new Date().toISOString(),
      request: {
        url: window.location.href,
        method: 'GET',
        body: {
          code: code ? `${code.substring(0, 10)}...` : 'missing',
          state: state ? `${state.substring(0, 10)}...` : 'missing',
        }
      },
      response: {
        status: 200,
        body: {
          received: true
        }
      },
      metadata: {
        synthetic: true,
        source: 'frontend',
        description: 'OAuth callback received from Okta'
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
          codeVerifier: '[PKCE verifier]',
          redirectUri: window.location.origin + '/callback',
        }
      },
      metadata: {
        synthetic: true,
        source: 'frontend',
        description: 'Exchanging authorization code for tokens'
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
