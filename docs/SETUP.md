# Detailed Setup Guide

This guide provides step-by-step instructions for setting up the Okta BYOT + Twilio Verify demo application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Okta Configuration](#okta-configuration)
3. [Twilio Configuration](#twilio-configuration)
4. [Local Development Setup](#local-development-setup)
5. [Function Instrumentation](#function-instrumentation)
6. [Running the Demo](#running-the-demo)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts

- **Okta Trial Account:** Sign up at [developer.okta.com](https://developer.okta.com/)
- **Twilio Account:** Sign up at [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
- **GitHub Account:** (Optional) For cloning the repository

### Required Software

- **Node.js:** Version 18.0.0 or higher
- **npm:** Version 9.0.0 or higher
- **ngrok:** For local webhook testing ([ngrok.com](https://ngrok.com/))
- **Git:** For cloning the repository

### Verify Installations

```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
ngrok version   # Should be installed
```

## Okta Configuration

### Step 1: Create OAuth Application

1. Log in to your Okta Admin Console
2. Navigate to **Applications** → **Applications**
3. Click **Create App Integration**
4. Select:
   - **Sign-in method:** OIDC - OpenID Connect
   - **Application type:** Single-Page Application
5. Click **Next**
6. Configure the application:
   - **App integration name:** Okta BYOT Demo
   - **Grant type:** Authorization Code
   - **Sign-in redirect URIs:** `http://localhost:5173/callback`
   - **Sign-out redirect URIs:** `http://localhost:5173`
   - **Controlled access:** Allow everyone in your organization to access
7. Click **Save**
8. Note your **Client ID** (you'll need this for `.env`)

### Step 2: Configure Telephony Inline Hook

1. Navigate to **Workflow** → **Inline Hooks**
2. Click **Add Inline Hook** → **Telephony**
3. Configure:
   - **Name:** Twilio Verify Hook
   - **URL:** Your Twilio Function URL (e.g., `https://okta-mfa-9214.twil.io/Okta_MFA`)
   - **Authentication:** Custom Header
   - **Header name:** `auth_secret`
   - **Header value:** Your secret (same as `auth_secret` in Twilio Function)
4. Click **Save**

### Step 3: Enable MFA Policy

1. Navigate to **Security** → **Authenticators**
2. Ensure **Phone** authenticator is active
3. Navigate to **Security** → **Authentication Policies**
4. Edit your authentication policy or create a new one:
   - Enable **Phone** as required factor
   - Set policy to require MFA
5. Assign the policy to your test users

### Step 4: Create Test User

1. Navigate to **Directory** → **People**
2. Click **Add Person**
3. Fill in details:
   - **First name:** Test
   - **Last name:** User
   - **Username:** testuser@yourdomain.com
   - **Password:** Set a temporary password
   - **Primary phone:** Your test phone number (E.164 format: +1234567890)
4. Click **Save**
5. Activate the user and set password

## Twilio Configuration

### Step 1: Get Twilio Credentials

1. Log in to [Twilio Console](https://console.twilio.com/)
2. From the dashboard, note:
   - **Account SID:** ACxxxxxxxxxxxxx
   - **Auth Token:** xxxxxxxxxxxxx (click to reveal)

### Step 2: Create Verify Service

1. Navigate to **Verify** → **Services**
2. Click **Create Service**
3. Configure:
   - **Friendly Name:** Okta BYOT Verify
   - **Verification channels:** SMS (enable)
   - **Code length:** 6 digits
   - **Code expiration:** 5 minutes
4. Click **Create**
5. Note your **Service SID:** VAxxxxxxxxxxxxx

### Step 3: Deploy Twilio Function

If you haven't already deployed the Twilio Function:

1. Navigate to **Functions & Assets** → **Services**
2. Click **Create Service**
3. Name it "Okta MFA"
4. Click **Add** → **Add Function**
5. Name it `/Okta_MFA`
6. Paste the function code from the blog post
7. Add environment variables:
   - `VERIFY_SID`: Your Verify Service SID
   - `auth_secret`: A secure secret for Okta authentication
8. Click **Deploy All**
9. Note your Function URL

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd okta-verify
```

### Step 2: Install Dependencies

```bash
npm run install:all
```

This installs dependencies for root, frontend, and backend.

### Step 3: Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```bash
PORT=3001
NODE_ENV=development

# Okta Configuration
OKTA_ORG_URL=https://dev-xxxxx.okta.com  # Your Okta org URL
OKTA_CLIENT_ID=0oaxxxxxxxxxxxxx          # From Step 1 of Okta config
OKTA_CLIENT_SECRET=xxxxxxxxxxxxx         # Not required for SPA

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx       # From Twilio Console
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx          # From Twilio Console
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxx # Your Verify Service SID

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Logging
LOG_LEVEL=info

# Demo Webhook Secret (must match Function environment variable)
DEMO_SECRET=your-secure-secret-here
```

### Step 4: Configure Frontend

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```bash
VITE_BACKEND_URL=http://localhost:3001
VITE_OKTA_ORG_URL=https://dev-xxxxx.okta.com  # Your Okta org URL
VITE_OKTA_CLIENT_ID=0oaxxxxxxxxxxxxx          # Same as backend
VITE_OKTA_REDIRECT_URI=http://localhost:5173/callback
```

### Step 5: Set Up ngrok

```bash
# In a new terminal window
ngrok http 3001
```

You'll see output like:

```
Forwarding  https://abc123.ngrok.io -> http://localhost:3001
```

Note the HTTPS URL (`https://abc123.ngrok.io`).

**Important:**
- Keep ngrok running throughout your development session
- The URL changes each time you restart ngrok
- Free ngrok accounts have connection limits

## Function Instrumentation

### Step 1: Add Environment Variables to Function

1. Go to Twilio Console → **Functions & Assets** → **Services**
2. Select your Okta MFA service
3. Click **Environment Variables**
4. Add:
   ```
   DEMO_WEBHOOK_URL = https://abc123.ngrok.io/api/events/capture
   DEMO_SECRET = your-secure-secret-here
   ```
   (Use the ngrok URL from Step 5 above)
   (Use the same secret as in backend/.env)

### Step 2: Add Instrumentation Code

1. Click on your `/Okta_MFA` function
2. Add the instrumentation code (see [functions/README.md](../functions/README.md))
3. The code should be inserted after `console.log(verification.sendCodeAttempts);`
4. Review the complete code in [functions/Okta_MFA.js](../functions/Okta_MFA.js)

### Step 3: Deploy Function

1. Click **Deploy All**
2. Wait for deployment to complete
3. Verify "Last deployed" timestamp is current

## Running the Demo

### Step 1: Start Backend

```bash
cd backend
npm run dev
```

You should see:

```
Server started { port: 3001, environment: 'development' }
```

### Step 2: Start Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

You should see:

```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 3: Open Demo

1. Open http://localhost:5173 in your browser
2. Verify:
   - Page loads with split view
   - WebSocket indicator shows "Connected" (green)
   - Left pane shows Okta login widget
   - Right pane shows "Waiting for API Events"

### Step 4: Test the Flow

1. Enter your test user credentials in the left pane
2. Click "Sign In"
3. Okta will prompt for MFA
4. Select your phone number
5. Watch the right pane - you should see:
   - **Event #1:** Telephony Hook (Okta → Twilio Function)
6. Check your phone for SMS with OTP code
7. Enter the OTP code in Okta
8. You should see:
   - **Event #2:** Verify API (if instrumented)
   - **Event #3:** Event Hook (if configured)
9. Login completes successfully

### Step 5: Inspect Events

1. Click on any event in the right pane to expand it
2. Toggle between "Request" and "Response" tabs
3. Review JSON payloads
4. Copy payloads using the copy button
5. Check metadata section for additional info

### Step 6: Reset and Retry

1. Click "Reset Demo" button in header
2. Events clear
3. Login widget resets
4. You can try the flow again

## Troubleshooting

### Backend Issues

**Error: Port 3001 already in use**
- Solution: Kill the process using port 3001
  ```bash
  lsof -ti:3001 | xargs kill -9
  ```

**Error: Missing environment variables**
- Solution: Verify `.env` file exists in backend directory
- Verify all required variables are set
- Restart backend after changes

**Error: WebSocket connection failed**
- Solution: Check backend logs for errors
- Verify CORS settings in `backend/.env`
- Try restarting backend

### Frontend Issues

**Error: Okta widget not loading**
- Solution: Check browser console for errors
- Verify Okta credentials in `frontend/.env`
- Ensure OAuth app is configured correctly in Okta
- Check that redirect URI matches in Okta and `.env`

**Error: WebSocket disconnected**
- Solution: Verify backend is running on port 3001
- Check `VITE_BACKEND_URL` in `frontend/.env`
- Restart frontend

### Function Issues

**Error: Events not appearing**
- Solution: Check Twilio Function logs
- Verify `DEMO_WEBHOOK_URL` is set correctly
- Ensure ngrok is still running
- Test webhook endpoint:
  ```bash
  curl -X POST https://abc123.ngrok.io/api/events/capture \
    -H "Content-Type: application/json" \
    -H "X-Demo-Secret: your-secure-secret-here" \
    -d '{"type":"telephony_hook","timestamp":"2024-01-01T00:00:00Z","request":{"url":"test","method":"POST","body":{}}}'
  ```

**Error: Function authentication failed**
- Solution: Verify `X-Demo-Secret` header matches
- Check `DEMO_SECRET` in both Function and backend
- Review backend logs for "Unauthorized" messages

### Okta Issues

**Error: MFA not triggered**
- Solution: Check authentication policy in Okta
- Verify phone authenticator is enabled
- Ensure test user has phone number set
- Check that inline hook is active

**Error: SMS not received**
- Solution: Check Twilio Console → Verify → Logs
- Verify phone number is in E.164 format
- Check that Verify service is active
- Try a different phone number

### ngrok Issues

**Error: ngrok URL changed**
- Solution: Update `DEMO_WEBHOOK_URL` in Twilio Function
- Redeploy Function
- Test again

**Error: ngrok connection limit reached**
- Solution: Free accounts have limits
- Wait for limit to reset
- Consider upgrading to paid plan
- Use alternative tunneling service

## Next Steps

Once the demo is working:

1. Review the [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) for presenting to customers
2. Customize the UI to match your branding
3. Add additional event types (Event Hooks, etc.)
4. Deploy to production environment
5. Consider adding analytics and monitoring

## Support

If you continue to have issues:

1. Check all environment variables are set correctly
2. Review all logs (backend, frontend, Function, Okta)
3. Test each component individually
4. Review the main [README.md](../README.md)
5. Open an issue on GitHub with:
   - Steps to reproduce
   - Error messages
   - Relevant logs
   - Environment details
