import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OktaSignIn from '@okta/okta-signin-widget'

export default function LoginCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processCallback = async () => {
      try {
        const signIn = new OktaSignIn({
          baseUrl: import.meta.env.VITE_OKTA_ORG_URL,
          clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
          redirectUri: window.location.origin + '/callback',
          useClassicEngine: true,
          useInteractionCodeFlow: false,
        })

        console.log('Processing OAuth callback...')

        // Parse authorization code and exchange for tokens
        const tokens = await signIn.authClient.token.parseFromUrl()

        console.log('✅ Successfully received tokens:', tokens)

        // Store tokens in token manager
        signIn.authClient.tokenManager.setTokens(tokens.tokens)

        // Navigate back to main app
        navigate('/', { replace: true })
      } catch (err: any) {
        console.error('❌ Callback error:', err)
        setError(err.message || 'Authentication failed')
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
