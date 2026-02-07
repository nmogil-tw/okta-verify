/**
 * Okta MFA Telephony Inline Hook - Fixed Response Format
 *
 * Ensures the response format matches Okta's expectations exactly
 */

exports.handler = async function(context, event, callback) {
  console.log('=== OKTA MFA HOOK CALLED ===');
  console.log('Timestamp:', new Date().toISOString());

  try {
    // Step 1: Authentication Check
    console.log('Step 1: Checking authentication...');
    if (context.auth_secret !== event.request.headers.auth_secret) {
      console.error('❌ AUTHENTICATION FAILED');

      // Create proper error response
      const response = new Twilio.Response();
      response.setStatusCode(401);
      response.setBody({ error: "Authentication failed" });
      response.appendHeader('Content-Type', 'application/json');
      return callback(null, response);
    }
    console.log('✅ Authentication successful');

    // Step 2: Extract data from Okta request
    console.log('Step 2: Extracting request data...');
    const messageProfile = event.data.messageProfile;
    const phoneNumber = messageProfile.phoneNumber;
    const otpCode = messageProfile.otpCode;
    const deliveryChannel = messageProfile.deliveryChannel.toLowerCase();

    console.log('Request details:', {
      phoneNumber,
      otpCode,
      deliveryChannel,
      verifySid: context.VERIFY_SID
    });

    // Step 3: Get Twilio Client and send verification
    console.log('Step 3: Getting Twilio client...');
    const client = context.getTwilioClient();

    console.log('Step 4: Creating Twilio verification...');
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
      to: verification.to
    });

    // Step 5: Create proper Twilio Response object with correct headers
    const response = new Twilio.Response();
    response.setStatusCode(200);
    response.appendHeader('Content-Type', 'application/json');

    const responseBody = {
      commands: [{
        type: "com.okta.telephony.action",
        status: "SUCCESSFUL"
      }]
    };

    response.setBody(responseBody);

    console.log('✅ Returning response with body:', JSON.stringify(responseBody));
    return callback(null, response);

  } catch (error) {
    console.error('❌ ERROR OCCURRED:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', error);

    // Return proper error response
    const response = new Twilio.Response();
    response.setStatusCode(500);
    response.appendHeader('Content-Type', 'application/json');

    const errorBody = {
      commands: [{
        type: "com.okta.telephony.action",
        status: "FAILED",
        error: error.message
      }]
    };

    response.setBody(errorBody);

    console.log('Returning error response:', JSON.stringify(errorBody));
    return callback(null, response);
  }
};
