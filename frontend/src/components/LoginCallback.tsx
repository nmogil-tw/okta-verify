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
        })

        console.log('Processing OAuth callback...')

        // Generate callback event
        const callbackEvent = eventGeneratorRef.current.generateCallbackEvent()
        addFrontendEvent(callbackEvent)

        // Validate URL has required parameters
        const hasCode = urlParams.get('code')
        const hasState = urlParams.get('state')

        if (!hasCode || !hasState) {
          console.warn('⚠️ Missing code or state parameter in callback URL')
        }

        // Generate token exchange event
        const tokenEvent = eventGeneratorRef.current.generateTokenExchangeEvent()
        addFrontendEvent(tokenEvent)

        // Parse authorization code and exchange for tokens
        const tokens = await signIn.authClient.token.parseFromUrl()

        console.log('✅ Successfully received tokens:', tokens)

        // Store tokens in token manager
        signIn.authClient.tokenManager.setTokens(tokens.tokens)

        // Generate success event
        const successEvent = eventGeneratorRef.current.generateAuthSuccessEvent()
        addFrontendEvent(successEvent)

        // Navigate back to main app
        navigate('/', { replace: true })
      } catch (err: any) {
        console.error('❌ Callback error:', err)
        const errorMessage = err.message || 'Authentication failed'
        console.error('Error details:', {
          message: errorMessage,
          errorCode: err.errorCode,
          url: window.location.href
        })
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
