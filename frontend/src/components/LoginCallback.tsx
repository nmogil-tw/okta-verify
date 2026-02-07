import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import OktaSignIn from '@okta/okta-signin-widget'
import { useEventManager } from '../hooks/useEventManager'
import { EventGenerator } from '../services/eventGenerator'

export default function LoginCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const { addFrontendEvent } = useEventManager()
  const eventGeneratorRef = useRef(new EventGenerator())

  useEffect(() => {
    const processCallback = async () => {
      console.log('⚠️ Processing OAuth callback via REDIRECT (fallback mode - popup was blocked)')

      try {
        // Check for Okta error parameters in URL
        const urlParams = new URLSearchParams(window.location.search)
        const errorParam = urlParams.get('error')
        const errorDesc = urlParams.get('error_description')

        if (errorParam) {
          console.error('❌ Okta error in callback:', errorParam, errorDesc)
          setError(errorDesc || errorParam)
          return
        }

        // Sync configuration with OktaLoginPane
        const signIn = new OktaSignIn({
          baseUrl: import.meta.env.VITE_OKTA_ORG_URL,
          clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
          redirectUri: window.location.origin + '/callback',
          useClassicEngine: true,
          useInteractionCodeFlow: false,
          authParams: {
            issuer: import.meta.env.VITE_OKTA_ORG_URL,
            scopes: ['openid', 'profile', 'email'],
            responseType: 'code',
            pkce: true,
          },
          // Use localStorage so PKCE verifier can be shared between parent and popup
          tokenManager: {
            storage: 'localStorage'
          }
        })

        console.log('Processing OAuth callback...')

        // Generate callback event
        const callbackEvent = eventGeneratorRef.current.generateCallbackEvent()
        addFrontendEvent(callbackEvent)

        // Validate URL has required parameters
        const code = urlParams.get('code')
        const state = urlParams.get('state')

        if (!code || !state) {
          console.warn('⚠️ Missing code or state parameter in callback URL')
          setError('Missing required OAuth parameters')
          return
        }

        // Retrieve PKCE data from localStorage
        const pkceDataStr = localStorage.getItem('okta-pkce-storage')
        if (!pkceDataStr) {
          console.error('❌ PKCE data not found in localStorage')
          setError('PKCE verification data missing')
          return
        }

        const pkceData = JSON.parse(pkceDataStr)
        console.log('Retrieved PKCE data from localStorage')

        // Verify state matches
        if (state !== pkceData.state) {
          console.error('❌ State mismatch!')
          setError('Invalid state parameter')
          return
        }

        // Generate token exchange event
        const tokenEvent = eventGeneratorRef.current.generateTokenExchangeEvent()
        addFrontendEvent(tokenEvent)

        // Exchange authorization code for tokens using PKCE verifier
        const tokens = await signIn.authClient.token.exchangeCodeForTokens({
          authorizationCode: code,
          codeVerifier: pkceData.codeVerifier,
          redirectUri: pkceData.redirectUri,
        })

        console.log('✅ Successfully received tokens:', tokens)

        // Store tokens in token manager
        signIn.authClient.tokenManager.setTokens(tokens.tokens)

        // Clean up PKCE data from localStorage
        localStorage.removeItem('okta-pkce-storage')
        console.log('Cleaned up PKCE data from localStorage')

        // Generate success event
        const successEvent = eventGeneratorRef.current.generateAuthSuccessEvent()
        addFrontendEvent(successEvent)

        // Check if we're in a popup window
        if (window.opener && !window.opener.closed) {
          console.log('Running in popup - sending message to parent')
          // Send message to parent window
          window.opener.postMessage(
            { type: 'okta-callback', success: true },
            window.location.origin
          )
          // Don't navigate - parent will close the popup
        } else {
          // Normal flow - navigate back to main app
          navigate('/', { replace: true })
        }
      } catch (err: any) {
        console.error('❌ Callback error:', err)
        const errorMessage = err.message || 'Authentication failed'
        console.error('Error details:', {
          message: errorMessage,
          errorCode: err.errorCode,
          url: window.location.href
        })

        // Clean up PKCE data on error
        localStorage.removeItem('okta-pkce-storage')

        setError(errorMessage)
      }
    }

    processCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  )
}
