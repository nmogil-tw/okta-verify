/**
 * Okta MFA Telephony Inline Hook - Working Version
 *
 * This function handles sending SMS/Voice codes via Twilio Verify
 * Based on the actual request structure from Okta
 */

exports.handler = async function(context, event, callback) {
  console.log('=== OKTA MFA HOOK CALLED ===');
  console.log('Timestamp:', new Date().toISOString());

  try {
    // Step 1: Authentication Check
    console.log('Step 1: Checking authentication...');
    if (context.auth_secret !== event.request.headers.auth_secret) {
      console.error('❌ AUTHENTICATION FAILED');
      const response = new Twilio.Response();
      response.setStatusCode(401);
      response.setBody({ error: "Authentication failed" });
      return callback(null, response);
    }
    console.log('✅ Authentication successful');

    // Step 2: Extract data from Okta request
    console.log('Step 2: Extracting request data...');
    const messageProfile = event.data.messageProfile;
    const phoneNumber = messageProfile.phoneNumber;
    const otpCode = messageProfile.otpCode;
    const deliveryChannel = messageProfile.deliveryChannel.toLowerCase(); // "sms" or "voice"

    console.log('Request details:', {
      phoneNumber,
      otpCode,
      deliveryChannel,
      verifySid: context.VERIFY_SID
    });

    // Step 3: Get Twilio Client
    console.log('Step 3: Getting Twilio client...');
    const client = context.getTwilioClient();

    // Step 4: Send verification code via Twilio Verify
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
      to: verification.to,
      channel: verification.channel
    });

    // Step 5: Return success response to Okta
    const response = {
      commands: [{
        type: "com.okta.telephony.action",
        status: "SUCCESSFUL"
      }]
    };

    console.log('✅ Returning success response to Okta');
    return callback(null, response);

  } catch (error) {
    console.error('❌ ERROR OCCURRED:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);
    console.error('Full error:', JSON.stringify(error, null, 2));

    // Return error response to Okta
    const errorResponse = {
      commands: [{
        type: "com.okta.telephony.action",
        status: "FAILED",
        error: error.message
      }]
    };

    console.log('Returning error response to Okta');
    return callback(null, errorResponse);
  }
};
