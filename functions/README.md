# Twilio Functions Instrumentation

This document explains how to modify your deployed Twilio Functions to send events to the demo middleware.

## Overview

Your Twilio Function at `https://okta-mfa-9214.twil.io/Okta_MFA` needs to be instrumented to send event data to the demo backend via webhook. This allows the demo to display real-time API calls.

## Prerequisites

- Access to Twilio Console
- Deployed Twilio Function handling Okta telephony hooks
- Running demo backend (either locally with ngrok or deployed)

## Step 1: Add Environment Variables

1. Go to Twilio Console → Functions & Assets → Services
2. Find your Okta MFA service
3. Click on "Environment Variables"
4. Add the following variables:

```
DEMO_WEBHOOK_URL = https://your-ngrok-url.ngrok.io/api/events/capture
DEMO_SECRET = your-secure-secret-here
```

**For local development:**
- Use ngrok to expose your local backend: `ngrok http 3001`
- Copy the HTTPS URL provided by ngrok
- Example: `https://abc123.ngrok.io/api/events/capture`

**For production:**
- Use your deployed backend URL
- Example: `https://your-domain.com/api/events/capture`

**Important:** Make sure `DEMO_SECRET` matches the value in your backend `.env` file.

## Step 2: Instrument the Okta_MFA Function

### Current Function Code

Your function currently looks like this (based on the blog post):

```javascript
exports.handler = async function(context, event, callback) {
  try {
    console.log(event.request.headers);

    if (context.auth_secret !== event.request.headers.auth_secret) {
      throw new Error("Authentication failed");
    }

    let client = context.getTwilioClient();

    let to = event.data.messageProfile.phoneNumber;
    let customCode = event.data.messageProfile.otpCode;
    let channel =
      event.data.messageProfile.deliveryChannel.toLowerCase() === "sms" ?
      "sms" :
      "call";

    let verification = await client.verify.v2
      .services(context.VERIFY_SID)
      .verifications.create({
        to,
        channel,
        customCode
      });

    console.log(verification);
    console.log(verification.sendCodeAttempts);

    let response = {
      commands: [{
        type: "com.okta.telephony.action",
        value: [{
          status: "SUCCESSFUL",
          provider: "Twilio Verify",
          transactionId: verification.sid,
          transactionMetadata: verification.sendCodeAttempts.at(-1).attempt_sid,
        }],
      }],
    };

    return callback(null, response);
  } catch (error) {
    console.error("Error: " + error);
    let errorResponse = {
      error: {
        errorSummary: error.message,
        errorCauses: [{
          errorSummary: error.status || error.message,
          reason: error.moreInfo || error.message,
        }],
      },
    };
    return callback(null, errorResponse);
  }
};
```

### Add Instrumentation Code

Add the following code **after** the `console.log(verification.sendCodeAttempts);` line:

```javascript
    console.log(verification);
    console.log(verification.sendCodeAttempts);

    // ===== DEMO INSTRUMENTATION START =====
    // Send event to demo middleware
    if (context.DEMO_WEBHOOK_URL) {
      try {
        const demoEvent = {
          type: 'telephony_hook',
          timestamp: new Date().toISOString(),
          request: {
            url: 'https://okta-mfa-9214.twil.io/Okta_MFA',
            method: 'POST',
            body: {
              userId: event.data.userProfile.login,
              phoneNumber: to,
              channel: channel,
              otpCode: customCode,
              factorType: event.data.messageProfile.factorType || 'SMS',
            }
          },
          response: {
            status: 200,
            body: {
              verificationSid: verification.sid,
              status: verification.status,
              to: verification.to,
              channel: verification.channel,
              sendCodeAttempts: verification.sendCodeAttempts,
            }
          },
          metadata: {
            phoneNumber: to,
            channel: channel,
            verificationSid: verification.sid,
          }
        };

        await fetch(context.DEMO_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Demo-Secret': context.DEMO_SECRET || 'default-secret'
          },
          body: JSON.stringify(demoEvent)
        });

        console.log('Demo event sent successfully');
      } catch (demoError) {
        // Don't fail the main flow if demo webhook fails
        console.log('Demo webhook error (non-critical):', demoError.message);
      }
    }
    // ===== DEMO INSTRUMENTATION END =====

    let response = {
      commands: [{
        type: "com.okta.telephony.action",
```

### Complete Instrumented Function

See [Okta_MFA.js](./Okta_MFA.js) for the complete instrumented function code.

## Step 3: Deploy the Changes

1. Save the updated function code
2. Click "Deploy All" in the Twilio Console
3. Wait for deployment to complete (usually 1-2 minutes)
4. Verify deployment status shows "Success"

## Step 4: Test the Integration

1. Start your demo backend
2. If using ngrok, ensure it's running and URL is updated in Function environment
3. Open the demo frontend at http://localhost:5173
4. Verify WebSocket connection is established (green indicator)
5. Attempt Okta login
6. Watch for events to appear in the API Inspector pane

## Verification Checklist

- [ ] Environment variables added to Twilio Function
- [ ] `DEMO_WEBHOOK_URL` points to correct backend URL
- [ ] `DEMO_SECRET` matches backend configuration
- [ ] Instrumentation code added to function
- [ ] Function successfully deployed
- [ ] Demo backend is running and accessible
- [ ] ngrok tunnel is active (if using local development)
- [ ] WebSocket connection established in demo frontend
- [ ] Test login produces events in API Inspector

## Troubleshooting

### Events Not Appearing in Demo

1. **Check Function Logs:**
   - Go to Twilio Console → Functions & Assets → Logs
   - Look for "Demo event sent successfully" or error messages
   - If you see "Demo webhook error", check the error details

2. **Verify Environment Variables:**
   - Ensure `DEMO_WEBHOOK_URL` is set correctly
   - Test the URL: `curl -X POST https://your-ngrok-url.ngrok.io/api/events/capture`
   - Check that `DEMO_SECRET` matches in both Function and backend

3. **Check Backend Logs:**
   - Look for "Event captured from webhook" messages
   - Check for authentication errors
   - Verify webhook endpoint is receiving requests

4. **ngrok Issues:**
   - Ensure ngrok is running: `ngrok http 3001`
   - Verify ngrok URL hasn't changed (it changes on restart)
   - Update Function environment variable if ngrok URL changed

### Function Errors

If the main Function flow breaks:

1. **Remove Instrumentation:** Comment out the demo code to restore normal operation
2. **Check Syntax:** Ensure no typos or missing brackets
3. **Review Logs:** Look for JavaScript errors in Function logs
4. **Test Without Demo:** Verify base Function works without instrumentation

### Authentication Errors

If you see "Unauthorized" in Function logs:

1. Verify `X-Demo-Secret` header is being sent
2. Check that `DEMO_SECRET` environment variable is set in Function
3. Ensure `DEMO_SECRET` in backend matches Function
4. Check backend logs for authentication failures

## Important Notes

- **Non-Critical Failures:** The instrumentation is designed to fail gracefully. If the webhook fails, it won't break the Okta authentication flow.
- **Performance:** The webhook call adds ~50-100ms to the Function execution time, which is acceptable for demo purposes.
- **Production:** For production deployments, consider removing the instrumentation or using feature flags to enable/disable it.
- **Security:** Keep your `DEMO_SECRET` secure. Don't commit it to version control.

## Disabling Instrumentation

To disable the demo instrumentation without modifying code:

1. Remove the `DEMO_WEBHOOK_URL` environment variable from your Function
2. The instrumentation code checks for this variable and skips if not present
3. Redeploy the Function

## Alternative: Event Hooks (Future Enhancement)

Instead of instrumenting Functions, you could use Okta Event Hooks to capture events. However, this approach:
- Only captures Okta-side events
- Misses the Twilio Verify API call details
- Requires additional Okta configuration

The instrumentation approach provides the most complete view of the integration.

## Support

If you encounter issues:
1. Check Function logs in Twilio Console
2. Check backend logs for webhook errors
3. Verify all environment variables are set correctly
4. Test webhook endpoint with curl
5. Review the main [README.md](../README.md) troubleshooting section
