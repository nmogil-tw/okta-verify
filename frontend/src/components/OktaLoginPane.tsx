import { useEffect, useRef, useState } from 'react'
import OktaSignIn from '@okta/okta-signin-widget'
import StepIndicator from './StepIndicator'

interface OktaLoginPaneProps {
  onReset: () => void
}

export default function OktaLoginPane({ onReset }: OktaLoginPaneProps) {
  const widgetRef = useRef<HTMLDivElement>(null)
  const [widget, setWidget] = useState<OktaSignIn | null>(null)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (!widgetRef.current) return

    const oktaOrgUrl = import.meta.env.VITE_OKTA_ORG_URL
    const clientId = import.meta.env.VITE_OKTA_CLIENT_ID

    if (!oktaOrgUrl || !clientId) {
      console.error('Missing Okta configuration. Please check your .env file.')
      return
    }

    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const signIn = new OktaSignIn({
          baseUrl: oktaOrgUrl,
          clientId: clientId,
          redirectUri: window.location.origin + '/callback',
          useClassicEngine: true,
          useInteractionCodeFlow: false,
        })

        const authClient = signIn.authClient
        const accessToken = await authClient.tokenManager.get('accessToken')
        const idToken = await authClient.tokenManager.get('idToken')

        if (accessToken && idToken) {
          console.log('User already authenticated')
          setIsAuthenticated(true)
          setCurrentStep(3)
          return true
        }
      } catch (err) {
        console.log('Not authenticated, showing widget')
      }
      return false
    }

    // Check auth status first
    checkAuth().then(alreadyAuthenticated => {
      if (alreadyAuthenticated) return

      // Initialize widget with Authorization Code + PKCE flow
      console.log('Initializing Okta Sign-In Widget with Authorization Code + PKCE')

      const signIn = new OktaSignIn({
        baseUrl: oktaOrgUrl,
        clientId: clientId,
        redirectUri: window.location.origin + '/callback',
        useClassicEngine: true,         // Use Classic Engine
        useInteractionCodeFlow: false,  // Disable Interaction Code
        authParams: {
          issuer: `${oktaOrgUrl}/oauth2/default`,
          scopes: ['openid', 'profile', 'email'],
          responseType: 'code',  // Authorization Code flow
          pkce: true,            // Enable PKCE
        },
        features: {
          registration: false,
          rememberMe: true,
          autoFocus: true,
        },
      })

      setWidget(signIn)

      console.log('Widget configuration:', {
        baseUrl: oktaOrgUrl,
        clientId: clientId,
        redirectUri: window.location.origin + '/callback',
        responseType: 'code',
        pkce: true,
      })

      // Use showSignInAndRedirect for Authorization Code flow
      // This will trigger a full-page redirect to Okta (no iframes)
      signIn.showSignInAndRedirect({
        el: widgetRef.current as unknown as string,
      }).catch((error: any) => {
        console.error('Error showing sign-in widget:', error)
      })
    })

    return () => {
      if (widget) {
        widget.remove()
      }
    }
  }, [])

  const handleResetClick = () => {
    setIsAuthenticated(false)
    setCurrentStep(1)
    onReset()

    // Clear tokens
    if (widget) {
      widget.authClient.tokenManager.clear()
      widget.remove()
    }

    // Reload page to reinitialize widget
    window.location.reload()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          User Login Experience
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          This is what your users see when logging in with Okta
        </p>
        <StepIndicator currentStep={currentStep} totalSteps={3} />
      </div>

      <div className="flex-1 flex items-start justify-center p-6 relative">
        {isAuthenticated ? (
          <div className="text-center">
            <div className="mb-6">
              <svg
                className="w-20 h-20 mx-auto text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Authentication Successful!
            </h3>
            <p className="text-gray-600 mb-6">
              You have successfully logged in with MFA verification
            </p>
            <button
              onClick={handleResetClick}
              className="px-6 py-2 bg-okta-blue text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div ref={widgetRef} id="okta-signin-container" />
        )}
      </div>
    </div>
  )
}
