# Twilio Function Deployment Guide

## Quick Reference

### Environment Variables to Add

In your Twilio Function's Environment Variables section, add:

```
DEMO_WEBHOOK_URL=https://363ba4317b61.ngrok.app
DEMO_SECRET=your-secure-secret-here
```

**Important:** The `DEMO_SECRET` must match exactly what's in `backend/.env`

### Dependencies

In your Function's Dependencies section, ensure you have:

```
node-fetch: 2.6.7
```

## Deployment Steps

1. **Open Twilio Console**
   - Go to: Functions & Assets → Services
   - Find and open your Okta MFA Function

2. **Add Environment Variables**
   - Click "Environment Variables" section
   - Add `DEMO_WEBHOOK_URL` = `https://363ba4317b61.ngrok.app`
   - Add `DEMO_SECRET` = `your-secure-secret-here`

3. **Update Function Code**
   - Copy the entire contents of `Okta_MFA_complete.js`
   - Paste into your Twilio Function editor
   - The webhook instrumentation is on lines 70-125

4. **Check Dependencies**
   - Click "Dependencies" section
   - Add `node-fetch` version `2.6.7` if not present

5. **Deploy**
   - Click "Deploy All" button
   - Wait for deployment to complete

6. **Verify Deployment**
   - Check Function logs after deployment
   - You should NOT see any errors about missing dependencies

## Testing

After deployment, complete an Okta login with MFA and check:

### In Twilio Function Logs:
```
Sending event to demo backend...
✅ Event sent to demo backend
```

### In Local Backend Logs:
```
[info]: Incoming request {"method":"POST","path":"/api/events/capture"...}
[info]: Event captured and broadcast {"eventType":"telephony_hook"...}
```

### In Frontend UI:
- Backend event should appear with **blue "Backend"** badge
- Event type: "Okta Telephony Hook"
- Should include phone number and verification details

## Troubleshooting

### "Failed to send demo event" in Function logs
- Check that `DEMO_WEBHOOK_URL` is set correctly
- Verify ngrok is running and URL is correct
- Check that backend server is running on port 3001

### "Demo webhook returned error: 401" in Function logs
- The `DEMO_SECRET` doesn't match between Function and backend/.env
- Check both values are exactly: `your-secure-secret-here`

### "Cannot find module 'node-fetch'" error
- Add `node-fetch: 2.6.7` to Dependencies
- Redeploy the function

### No backend events appearing in UI
- Check all above issues
- Verify WebSocket is connected (green indicator)
- Check browser console for errors
- Check backend logs for incoming requests

## What Changed

The webhook instrumentation (lines 70-125) adds:
- Event creation with request/response details
- POST to `/api/events/capture` endpoint
- Authentication with `X-Demo-Secret` header
- Graceful error handling (won't break auth flow)

This is **non-critical** - if the webhook fails, the authentication will still succeed.
