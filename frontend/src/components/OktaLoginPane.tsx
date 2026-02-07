import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import OktaSignIn from '@okta/okta-signin-widget'
import StepIndicator from './StepIndicator'
import { EventGenerator } from '../services/eventGenerator'
import { DemoEvent } from '../types/events'

interface OktaLoginPaneProps {
  onReset: () => void
  addFrontendEvent?: (event: DemoEvent) => void
}

export interface OktaLoginPaneRef {
  resetWithOktaLogout: () => Promise<void>
}

const OktaLoginPane = forwardRef<OktaLoginPaneRef, OktaLoginPaneProps>(({ onReset, addFrontendEvent }, ref) => {
  const widgetRef = useRef<HTMLDivElement>(null)
  const [widget, setWidget] = useState<OktaSignIn | null>(null)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const eventGeneratorRef = useRef(new EventGenerator())

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

        // Save widget to state so it's available for sign-out
        setWidget(signIn)

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
          issuer: oktaOrgUrl,  // Use Org Authorization Server (not /oauth2/default)
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

      // Generate widget init event
      if (addFrontendEvent) {
        const widgetInitEvent = eventGeneratorRef.current.generateWidgetInitEvent()
        addFrontendEvent(widgetInitEvent)
      }

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

  const handleResetClick = async () => {
    try {
      console.log('=== RESET CLICKED ===')
      console.log('Widget state:', widget)
      console.log('Widget is null?', widget === null)

      // Clear application state first
      setIsAuthenticated(false)
      setCurrentStep(1)
      onReset()

      // Sign out from Okta (this will redirect to Okta and back)
      if (widget) {
        console.log('Widget exists, attempting sign-out...')
        console.log('AuthClient:', widget.authClient)

        // Clear local tokens before sign out
        console.log('Clearing token manager...')
        widget.authClient.tokenManager.clear()

        // Sign out with explicit options - this will redirect the page
        // so no code after this will execute
        console.log('Calling signOut()...')
        await widget.authClient.signOut({
          postLogoutRedirectUri: window.location.origin,
          revokeAccessToken: true,
          revokeRefreshToken: true
        })

        // This code won't execute because signOut redirects
        console.log('Okta sign-out initiated (should redirect)...')
      } else {
        // If no widget, just reload
        console.log('ERROR: No widget found! Cannot sign out from Okta.')
        console.log('Reloading page...')
        window.location.reload()
      }
    } catch (error) {
      console.error('Error during sign-out:', error)

      // Even if sign-out fails, clear local state and reload
      if (widget) {
        widget.authClient.tokenManager.clear()
        widget.remove()
      }
      window.location.reload()
    }
  }

  // Expose reset function to parent components via ref
  useImperativeHandle(ref, () => ({
    resetWithOktaLogout: handleResetClick
  }))

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
})

OktaLoginPane.displayName = 'OktaLoginPane'

export default OktaLoginPane
