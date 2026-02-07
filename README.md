# Okta BYOT + Twilio Verify Visual Demo

A split-screen visualization tool that demonstrates the integration between Okta's Bring Your Own Telephony (BYOT) feature and Twilio Verify for SMS-based two-factor authentication.

## Overview

This demo application helps Twilio customers understand the API flow between Okta's telephony inline hooks, Twilio Functions, and the Verify API. The split-screen interface shows:

- **Left Pane:** Real Okta login experience with MFA
- **Right Pane:** Live API calls, request/response payloads, and timing information

## Architecture

```
┌─────────────────┐           ┌─────────────────┐
│  Okta Login     │           │  API Inspector  │
│  Experience     │◄─────────►│  (Live Events)  │
└────────┬────────┘           └────────▲────────┘
         │                              │
         │ OAuth                        │ WebSocket
         │                              │
    ┌────▼────┐          ┌──────────────┴─────┐
    │  Okta   │          │  Demo Middleware   │
    │ (Trial) │          │   (Node.js)        │
    └────┬────┘          └──────────▲─────────┘
         │ Telephony Hook           │ Webhook
         │                          │
         ▼                          │
    ┌────────────────────────────────┴────┐
    │     Twilio Functions (Deployed)     │
    │  - Okta_MFA (inline hook handler)   │
    └─────────────────────────────────────┘
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Okta trial account with telephony hooks configured
- Twilio account with Verify service
- Deployed Twilio Function (see [Okta BYOT blog post](https://www.twilio.com/blog))
- ngrok or similar tool for local webhook testing

## Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd okta-verify
npm run install:all
```

### 2. Configure Environment Variables

Create `.env` files in both frontend and backend directories:

**Backend (.env):**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials
```

**Frontend (.env):**
```bash
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your credentials
```

See `.env.example` files for all required variables.

### 3. Instrument Your Twilio Function

Add the demo instrumentation code to your deployed Twilio Function. See [functions/README.md](./functions/README.md) for detailed instructions.

**Key steps:**
1. Add environment variables to your Function:
   - `DEMO_WEBHOOK_URL` - URL to your demo backend (e.g., ngrok URL)
   - `DEMO_SECRET` - Secret for authenticating webhook calls
2. Add instrumentation code (see [functions/Okta_MFA.js](./functions/Okta_MFA.js))
3. Redeploy your Function

### 4. Set Up Local Development with ngrok

Since Twilio Functions need to reach your local backend:

```bash
# Terminal 1: Start ngrok
ngrok http 3001

# Copy the HTTPS URL (e.g., https://xxxx.ngrok.io)
# Update your Twilio Function's DEMO_WEBHOOK_URL environment variable
```

## Usage

### Start the Demo

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:5173
```

### Run the Demo Flow

1. Open http://localhost:5173 in your browser
2. Verify WebSocket connection (green indicator in header)
3. Enter Okta credentials in the left pane
4. Watch API events appear in real-time in the right pane
5. Check your phone for the SMS with OTP code
6. Enter the OTP code in Okta
7. See the complete API flow with all request/response payloads

### Reset and Retry

Click the "Reset Demo" button in the header to clear events and start over.

## Project Structure

```
okta-verify/
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks (WebSocket)
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # CSS and Tailwind
│   └── package.json
├── backend/               # Express + TypeScript backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── websocket/    # Socket.io handlers
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Config and logging
│   └── package.json
├── functions/            # Twilio Function modifications
│   ├── README.md        # Setup instructions
│   └── Okta_MFA.js      # Instrumented Function code
└── docs/                # Additional documentation
    ├── SETUP.md         # Detailed setup guide
    └── DEMO_SCRIPT.md   # Customer demo walkthrough
```

## Event Types

The demo captures two categories of events:

### Backend Events (Real API Calls)

These events are captured by the backend when Twilio Functions make actual API calls:

**1. Telephony Hook**
- **Description:** Okta calls Twilio Function to request SMS verification
- **Flow:** Okta → Twilio Function
- **Payload:** User info, phone number, OTP code
- **Badge:** Backend (Blue)

**2. Verify API**
- **Description:** Twilio Function calls Verify API to send SMS
- **Flow:** Twilio Function → Twilio Verify
- **Payload:** Verification request, SMS details
- **Badge:** Backend (Blue)

**3. Event Hook**
- **Description:** Okta reports verification result
- **Flow:** Okta → Twilio Function
- **Payload:** Authentication outcome, MFA result
- **Badge:** Backend (Blue)

### Frontend Events (User Journey Tracking)

These synthetic events track the user's authentication journey through the OAuth flow:

**1. Widget Init**
- **Description:** Okta Sign-In Widget initialized
- **Trigger:** When the login page loads
- **Badge:** Frontend (Orange)

**2. OAuth Redirect**
- **Description:** User redirected to Okta for authentication
- **Trigger:** When OAuth flow begins
- **Badge:** Frontend (Orange)

**3. OAuth Callback**
- **Description:** User returned from Okta with authorization code
- **Trigger:** When callback URL is hit
- **Badge:** Frontend (Orange)

**4. Token Exchange**
- **Description:** Authorization code exchanged for access tokens
- **Trigger:** During callback processing
- **Badge:** Frontend (Orange)

**5. Auth Success**
- **Description:** Authentication completed successfully
- **Trigger:** After tokens are stored
- **Badge:** Frontend (Orange)

Frontend events persist across OAuth redirects using sessionStorage, ensuring visibility throughout the entire authentication flow.

## Troubleshooting

### WebSocket Not Connecting
- Check that backend is running on port 3001
- Verify `VITE_BACKEND_URL` in frontend/.env
- Check browser console for connection errors

### No Events Appearing
- Verify ngrok URL is set in Twilio Function environment
- Check that `DEMO_WEBHOOK_URL` and `DEMO_SECRET` match in Function and backend
- Verify instrumentation code was added to Function
- Check Twilio Function logs for errors

### Okta Widget Not Loading
- Verify Okta credentials in frontend/.env
- Check browser console for Okta-related errors
- Ensure OAuth application is configured correctly in Okta

### SMS Not Received
- Check Twilio Console → Verify → Logs
- Verify phone number is in E.164 format
- Ensure Verify service is active

## API Endpoints

### Backend

- `GET /health` - Health check endpoint
- `POST /api/events/capture` - Webhook for receiving events from Functions
- `GET /api/events/history` - Get event history (debugging)
- `DELETE /api/events/history` - Clear event history (debugging)

### WebSocket Events

- `connect` - Client connected
- `disconnect` - Client disconnected
- `api-event` - New API event received

## Development

### Building for Production

```bash
# Build both frontend and backend
npm run build

# Or build individually
npm run build --workspace=frontend
npm run build --workspace=backend
```

### Running in Production

```bash
cd backend
npm start
```

Serve the frontend build directory with a static file server.

## Contributing

This is a demo application for educational purposes. Feel free to customize and extend it for your needs.

## License

MIT

## Resources

- [Okta BYOT Documentation](https://developer.okta.com/docs/guides/telephony-inline-hook/)
- [Twilio Verify API Documentation](https://www.twilio.com/docs/verify/api)
- [Twilio Functions Documentation](https://www.twilio.com/docs/serverless/functions-assets/functions)
- [Original Blog Post](https://www.twilio.com/blog)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review [docs/SETUP.md](./docs/SETUP.md) for detailed setup
3. Open an issue on GitHub
