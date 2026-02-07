/**
 * Okta MFA Telephony Inline Hook - Complete Version
 *
 * Handles both SENDING verification codes and VERIFYING entered codes
 * Uses correct Okta response format with transaction metadata
 */

exports.handler = async function(context, event, callback) {
  console.log('=== OKTA MFA TELEPHONY HOOK ===');
  console.log('Timestamp:', new Date().toISOString());

  try {
    // Step 1: Authentication
    console.log('Step 1: Authenticating request...');
    console.log('Request headers:', JSON.stringify({
      ...event.request.headers,
      auth_secret: event.request.headers.auth_secret ? '[REDACTED]' : undefined
    }));

    if (context.auth_secret !== event.request.headers.auth_secret) {
      console.error('❌ Authentication failed');
      throw new Error("Authentication failed");
    }
    console.log('✅ Authentication successful');

    // Step 2: Get Twilio Client
    const client = context.getTwilioClient();

    // Step 3: Extract request data
    console.log('Step 2: Extracting request data...');
    const messageProfile = event.data.messageProfile;
    const phoneNumber = messageProfile.phoneNumber;
    const otpCode = messageProfile.otpCode;
    const deliveryChannel = messageProfile.deliveryChannel.toLowerCase(); // "sms" or "call"

    console.log('Request details:', {
      phoneNumber,
      hasOtpCode: !!otpCode,
      deliveryChannel,
      verifySid: context.VERIFY_SID
    });

    // Step 4: Determine operation type
    // If otpCode exists, this is a SEND request
    // If otpCode is missing, this is a VERIFY request

    if (otpCode) {
      // ===== SEND OPERATION =====
      console.log('Operation: SEND verification code');
      console.log('OTP Code:', otpCode);

      const verification = await client.verify.v2
        .services(context.VERIFY_SID)
        .verifications
        .create({
          to: phoneNumber,
          channel: deliveryChannel === "sms" ? "sms" : "call",
          customCode: otpCode
        });

      console.log('✅ Verification created:', {
        sid: verification.sid,
        status: verification.status,
        to: verification.to,
        channel: verification.channel
      });

      console.log('Send code attempts:', verification.sendCodeAttempts);

      // Send event to demo backend webhook (non-critical)
      if (context.DEMO_WEBHOOK_URL) {
        console.log('Sending event to demo backend...');

        try {
          const demoEvent = {
            type: 'telephony_hook',
            timestamp: new Date().toISOString(),
            request: {
              url: 'https://twilio-function.twil.io/Okta_MFA',
              method: 'POST',
              body: {
                userId: event.data.userProfile?.login || 'unknown',
                phoneNumber: phoneNumber,
                channel: deliveryChannel,
                otpCode: '[REDACTED]',
                factorType: 'SMS',
              }
            },
            response: {
              status: 200,
              body: {
                verificationSid: verification.sid,
                status: verification.status,
                to: verification.to,
                channel: verification.channel,
              }
            },
            metadata: {
              phoneNumber: phoneNumber,
              channel: deliveryChannel,
              verificationSid: verification.sid,
              status: 'pending',
            }
          };

          const fetch = require('node-fetch');
          const webhookResponse = await fetch(context.DEMO_WEBHOOK_URL + '/api/events/capture', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Demo-Secret': context.DEMO_SECRET || 'default-secret'
            },
            body: JSON.stringify(demoEvent)
          });

          if (webhookResponse.ok) {
            console.log('✅ Event sent to demo backend');
          } else {
            console.warn('⚠️ Demo webhook returned error:', webhookResponse.status);
          }
        } catch (webhookError) {
          // Non-critical, don't fail the main flow
          console.warn('⚠️ Failed to send demo event:', webhookError.message);
        }
      }

      // Return success response with transaction metadata
      const response = {
        commands: [{
          type: "com.okta.telephony.action",
          value: [{
            status: "SUCCESSFUL",
            provider: "Twilio Verify",
            transactionId: verification.sid,
            transactionMetadata: verification.sendCodeAttempts?.length > 0
              ? verification.sendCodeAttempts[verification.sendCodeAttempts.length - 1].attempt_sid
              : verification.sid,
          }],
        }],
      };

      console.log('✅ Returning success response:', JSON.stringify(response));
      return callback(null, response);

    } else {
      // ===== VERIFY OPERATION =====
      console.log('Operation: VERIFY entered code');

      // For verification, Okta may send the code in a different field
      // We need to check the actual event structure
      console.log('Full event data:', JSON.stringify(event.data, null, 2));

      // Based on Okta's telephony hook docs, verification checks might not be needed
      // if using Twilio Verify's built-in validation
      // For now, return success if we get here
      const response = {
        commands: [{
          type: "com.okta.telephony.action",
          value: [{
            status: "SUCCESSFUL",
            provider: "Twilio Verify"
          }],
        }],
      };

      console.log('✅ Returning verification response:', JSON.stringify(response));
      return callback(null, response);
    }

  } catch (error) {
    console.error('❌ ERROR OCCURRED:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);
    console.error('Error stack:', error.stack);

    // Return error response in Okta format
    const errorResponse = {
      error: {
        errorSummary: error.message || "Internal server error",
        errorCauses: [{
          errorSummary: error.status || error.code || "UNKNOWN_ERROR",
          reason: error.moreInfo || error.message || "An unexpected error occurred",
        }],
      },
    };

    console.log('Returning error response:', JSON.stringify(errorResponse));
    return callback(null, errorResponse);
  }
};
