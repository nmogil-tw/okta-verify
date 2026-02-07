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
          authParams: {
            issuer: oktaOrgUrl,
            responseType: 'code',
            pkce: true,
          },
          tokenManager: {
            storage: 'localStorage'
          }
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

      // Initialize widget with Authorization Code + PKCE (redirect flow in popup)
      console.log('Initializing Okta Sign-In Widget with Authorization Code + PKCE')

      const signIn = new OktaSignIn({
        baseUrl: oktaOrgUrl,
        clientId: clientId,
        redirectUri: window.location.origin + '/callback',
        useClassicEngine: true,
        useInteractionCodeFlow: false,
        authParams: {
          issuer: oktaOrgUrl,
          scopes: ['openid', 'profile', 'email'],
          responseType: 'code',
          pkce: true,
        },
        features: {
          registration: false,
          rememberMe: true,
          autoFocus: true,
        },
        // Use localStorage instead of sessionStorage so popup can access PKCE verifier
        tokenManager: {
          storage: 'localStorage'
        }
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

      // Render a button that opens authentication in a popup window
      if (widgetRef.current) {
        widgetRef.current.innerHTML = `
          <div style="text-align: center; padding: 40px;">
            <h3 style="margin-bottom: 20px; font-size: 18px; font-weight: 600;">Ready to sign in</h3>
            <button id="okta-signin-btn" style="
              background: #007dc1;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 4px;
              font-size: 16px;
              cursor: pointer;
              font-weight: 500;
            ">
              Sign In with Okta
            </button>
          </div>
        `

        const button = document.getElementById('okta-signin-btn')
        if (button) {
          button.addEventListener('click', async () => {
            try {
              console.log('🔄 Opening popup for authentication...')

              // Generate oauth_redirect event
              if (addFrontendEvent) {
                const redirectEvent = eventGeneratorRef.current.generateOAuthRedirectEvent(
                  `${oktaOrgUrl}/oauth2/v1/authorize`
                )
                addFrontendEvent(redirectEvent)
              }

              // Open popup window for authentication
              const width = 500
              const height = 700
              const left = window.screen.width / 2 - width / 2
              const top = window.screen.height / 2 - height / 2

              // Manually build authorize URL with PKCE
              console.log('Generating PKCE parameters...')

              // Generate PKCE code verifier (random string)
              const codeVerifier = signIn.authClient.pkce.generateVerifier()
              console.log('Code verifier generated:', codeVerifier.substring(0, 20) + '...')

              // Compute code challenge from verifier
              const codeChallenge = await signIn.authClient.pkce.computeChallenge(codeVerifier)
              console.log('Code challenge computed:', codeChallenge.substring(0, 20) + '...')

              // Generate state and nonce
              const state = Math.random().toString(36).substring(2, 15)
              const nonce = Math.random().toString(36).substring(2, 15)

              // Store in localStorage for popup to access
              localStorage.setItem('okta-pkce-storage', JSON.stringify({
                codeVerifier,
                redirectUri: window.location.origin + '/callback',
                state,
                nonce,
              }))

              console.log('PKCE data stored in localStorage')

              // Build authorize URL
              const authorizeUrl = `${oktaOrgUrl}/oauth2/v1/authorize?` + new URLSearchParams({
                client_id: clientId,
                response_type: 'code',
                scope: 'openid profile email',
                redirect_uri: window.location.origin + '/callback',
                state: state,
                nonce: nonce,
                code_challenge: codeChallenge,
                code_challenge_method: 'S256',
              }).toString()

              console.log('Opening popup with URL:', authorizeUrl)

              const popup = window.open(
                authorizeUrl,
                'okta-signin',
                `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes`
              )

            if (!popup) {
              alert('Popup was blocked. Please allow popups for this site.')
              return
            }

            // Listen for callback message from popup
            const messageHandler = async (event: MessageEvent) => {
              // Only accept messages from our domain
              if (event.origin !== window.location.origin) return

              if (event.data.type === 'okta-callback') {
                console.log('✅ Received callback from popup')

                window.removeEventListener('message', messageHandler)
                clearInterval(popupCheck)
                popup.close()

                // Clean up PKCE data (should already be cleaned by popup, but double-check)
                localStorage.removeItem('okta-pkce-storage')

                // The tokens are already stored by LoginCallback in the popup
                // Just verify they exist
                const idToken = await signIn.authClient.tokenManager.get('idToken')
                const accessToken = await signIn.authClient.tokenManager.get('accessToken')

                if (idToken && accessToken) {
                  console.log('✅ Tokens confirmed in parent window')

                  // Generate remaining auth events
                  if (addFrontendEvent) {
                    // oauth_callback
                    const callbackEvent = eventGeneratorRef.current.generateCallbackEvent()
                    addFrontendEvent(callbackEvent)

                    // token_exchange
                    const tokenEvent = eventGeneratorRef.current.generateTokenExchangeEvent()
                    addFrontendEvent(tokenEvent)

                    // auth_success
                    const successEvent = eventGeneratorRef.current.generateAuthSuccessEvent()
                    addFrontendEvent(successEvent)
                  }

                  // Update UI state
                  setIsAuthenticated(true)
                  setCurrentStep(3)
                } else {
                  console.error('Tokens not found after callback')
                  alert('Authentication failed. Tokens not received.')
                }
              }
            }

            window.addEventListener('message', messageHandler)

            // Monitor if popup is closed manually
            const popupCheck = setInterval(() => {
              if (popup.closed) {
                clearInterval(popupCheck)
                window.removeEventListener('message', messageHandler)
                console.log('Popup was closed by user')
                // Clean up PKCE data if popup was closed without completing auth
                localStorage.removeItem('okta-pkce-storage')
              }
            }, 500)

            } catch (error) {
              console.error('Error opening popup:', error)
              alert('Failed to open authentication popup: ' + (error as Error).message)
              // Clean up PKCE data on error
              localStorage.removeItem('okta-pkce-storage')
            }
          })
        }
      }
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
    <div className="h-full flex flex-col animate-fade-in-up">
      <div className="p-8 border-b border-neutral-200 bg-white">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          User Login Experience
        </h2>
        <p className="text-sm text-neutral-600 mb-6">
          This is what your users see when logging in with Okta
        </p>
        <StepIndicator currentStep={currentStep} totalSteps={3} />
      </div>

      <div className="flex-1 flex items-start justify-center p-8 relative">
        {isAuthenticated ? (
          <div className="text-center animate-fade-in-up bg-white rounded-2xl shadow-soft-lg p-12 max-w-md border border-neutral-200">
            <div className="mb-6">
              <svg
                className="w-24 h-24 mx-auto text-accent-green"
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
            <h3 className="text-3xl font-bold text-neutral-900 mb-3">
              Authentication Successful!
            </h3>
            <p className="text-neutral-600 mb-8 leading-relaxed">
              You have successfully logged in with MFA verification
            </p>
            <button
              onClick={handleResetClick}
              className="px-6 py-3 bg-okta-blue text-white rounded-lg hover:bg-okta-blue/90 active:scale-95 transition-all duration-200 font-semibold shadow-soft-md hover:shadow-soft-lg"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-soft-lg p-8 max-w-md w-full border border-neutral-200">
            <div ref={widgetRef} id="okta-signin-container" />
          </div>
        )}
      </div>
    </div>
  )
})

OktaLoginPane.displayName = 'OktaLoginPane'

export default OktaLoginPane
