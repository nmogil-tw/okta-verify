/**
 * Okta Telephony Inline Hook Handler with Demo Instrumentation
 *
 * This function handles Okta's telephony inline hook requests and uses
 * Twilio Verify to send SMS or voice OTP codes.
 *
 * Demo instrumentation sends events to the demo middleware for visualization.
 */

exports.handler = async function(context, event, callback) {
  try {
    console.log(event.request.headers);

    // Validate Okta authentication
    if (context.auth_secret !== event.request.headers.auth_secret) {
      throw new Error("Authentication failed");
    }

    let client = context.getTwilioClient();

    // Extract data from Okta request
    let to = event.data.messageProfile.phoneNumber;
    let customCode = event.data.messageProfile.otpCode;
    let channel =
      event.data.messageProfile.deliveryChannel.toLowerCase() === "sms" ?
      "sms" :
      "call";

    // Call Twilio Verify API
    let verification = await client.verify.v2
      .services(context.VERIFY_SID)
      .verifications.create({
        to,
        channel,
        customCode
      });

    console.log(verification);
    console.log(verification.sendCodeAttempts);

    // ===== DEMO INSTRUMENTATION START =====
    // Send event to demo middleware for visualization
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
              deliveryChannel: event.data.messageProfile.deliveryChannel,
            }
          },
          response: {
            status: 200,
            body: {
              verificationSid: verification.sid,
              status: verification.status,
              to: verification.to,
              channel: verification.channel,
              valid: verification.valid,
              sendCodeAttempts: verification.sendCodeAttempts,
            }
          },
          metadata: {
            phoneNumber: to,
            channel: channel,
            verificationSid: verification.sid,
            status: 'pending',
          }
        };

        // Send webhook to demo backend
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

    // Return success response to Okta
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

    // Return error response to Okta
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
