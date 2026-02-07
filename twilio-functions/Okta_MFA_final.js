/**
 * Okta MFA Telephony Inline Hook - Final Version
 * Based on official Okta documentation response format
 */

exports.handler = async function(context, event, callback) {
  console.log('=== OKTA MFA HOOK CALLED ===');
  console.log('Timestamp:', new Date().toISOString());

  // Create Twilio Response object
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    // Step 1: Authentication Check
    console.log('Step 1: Checking authentication...');
    if (context.auth_secret !== event.request.headers.auth_secret) {
      console.error('❌ AUTHENTICATION FAILED');
      response.setStatusCode(401);
      response.setBody({ error: "Authentication failed" });
      return callback(null, response);
    }
    console.log('✅ Authentication successful');

    // Step 2: Extract data
    console.log('Step 2: Extracting request data...');
    const messageProfile = event.data.messageProfile;
    const phoneNumber = messageProfile.phoneNumber;
    const otpCode = messageProfile.otpCode;
    const deliveryChannel = messageProfile.deliveryChannel.toLowerCase();

    console.log('Request details:', {
      phoneNumber,
      otpCode,
      deliveryChannel
    });

    // Step 3: Send via Twilio Verify
    console.log('Step 3: Sending SMS via Twilio Verify...');
    const client = context.getTwilioClient();

    const verification = await client.verify.v2
      .services(context.VERIFY_SID)
      .verifications
      .create({
        to: phoneNumber,
        channel: deliveryChannel === "sms" ? "sms" : "call",
        customCode: otpCode
      });

    console.log('✅ SMS sent successfully:', {
      sid: verification.sid,
      status: verification.status
    });

    // Step 4: Return success response in exact Okta format
    response.setStatusCode(200);
    response.setBody({
      "commands": [
        {
          "type": "com.okta.telephony.action",
          "status": "SUCCESSFUL"
        }
      ]
    });

    console.log('✅ Returning 200 OK to Okta');
    return callback(null, response);

  } catch (error) {
    console.error('❌ ERROR:', error.message);

    // Check if SMS was sent despite error
    if (error.code === 60200) {
      // Twilio verification already exists - SMS was sent
      console.log('⚠️ Verification already exists, but SMS was sent');
      response.setStatusCode(200);
      response.setBody({
        "commands": [{
          "type": "com.okta.telephony.action",
          "status": "SUCCESSFUL"
        }]
      });
      return callback(null, response);
    }

    // Return error response
    response.setStatusCode(200); // Still return 200 to Okta
    response.setBody({
      "commands": [{
        "type": "com.okta.telephony.action",
        "status": "FAILED",
        "value": [{
          "name": "cause",
          "value": error.message
        }]
      }]
    });

    console.log('Returning error response to Okta');
    return callback(null, response);
  }
};
