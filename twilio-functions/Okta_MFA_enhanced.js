/**
 * Enhanced Okta MFA Telephony Inline Hook with Comprehensive Logging
 *
 * This function handles Okta's telephony inline hook requests for SMS/Voice MFA
 * With added logging to debug authentication issues
 */

exports.handler = async function(context, event, callback) {
  console.log('=== OKTA MFA HOOK CALLED ===');
  console.log('Timestamp:', new Date().toISOString());

  try {
    // Log all request headers (sanitized)
    console.log('Request Headers:', JSON.stringify({
      ...event.request.headers,
      auth_secret: event.request.headers.auth_secret ? '[REDACTED]' : undefined
    }));

    // Step 1: Authentication Check
    console.log('Step 1: Checking authentication...');
    console.log('Expected auth_secret exists:', !!context.auth_secret);
    console.log('Received auth_secret exists:', !!event.request.headers.auth_secret);

    if (context.auth_secret !== event.request.headers.auth_secret) {
      console.error('❌ AUTHENTICATION FAILED: Secrets do not match');
      throw new Error("Authentication failed");
    }
    console.log('✅ Authentication successful');

    // Step 2: Get Twilio Client
    console.log('Step 2: Getting Twilio client...');
    let client = context.getTwilioClient();
    console.log('✅ Twilio client obtained');

    // Step 3: Parse Okta Request
    console.log('Step 3: Parsing Okta request data...');
    console.log('Event data:', JSON.stringify(event.data, null, 2));

    // Extract message profile data from Okta
    // https://developer.okta.com/docs/reference/telephony-hook/#data-messageprofile
    let to = event.data.messageProfile.phoneNumber;
    let customCode = event.data.messageProfile.otpCode;
    let channel =
      event.data.messageProfile.deliveryChannel.toLowerCase() === "sms" ?
      "sms" : "call";

    console.log('Parsed data:', {
      to,
      customCode,
      channel,
      hasOtpCode: !!customCode
    });

    // Step 4: Determine Operation Type
    console.log('Step 4: Determining operation type...');

    // If there's an OTP code, this is a SEND request
    // If there's no OTP code, this is a VERIFY request
    if (customCode) {
      console.log('Operation: SEND SMS/VOICE');

      // Step 5: Create Verification via Twilio
      console.log('Step 5: Creating Twilio verification...');
      console.log('VERIFY_SID:', context.VERIFY_SID);

      let verification = await client.verify.v2
        .services(context.VERIFY_SID)
        .verifications.create({
          to,
          channel,
          customCode
        });

      console.log('✅ Verification created:', {
        sid: verification.sid,
        status: verification.status,
        to: verification.to,
        channel: verification.channel
      });

      // Step 6: Return Success Response
      let response = {
        commands: [{
          type: "com.okta.telephony.action",
          status: "SUCCESSFUL"
        }]
      };

      console.log('Returning response:', JSON.stringify(response));
      return callback(null, response);

    } else {
      // This is a VERIFY request - check if code is valid
      console.log('Operation: VERIFY CODE');

      // For verification check, Okta sends the code in a different field
      const codeToVerify = event.data.messageProfile.deliveryChannel; // This might be wrong - need to check Okta docs

      console.log('Step 5: Checking verification with code:', codeToVerify);

      // Check verification
      let verificationCheck = await client.verify.v2
        .services(context.VERIFY_SID)
        .verificationChecks.create({
          to,
          code: codeToVerify
        });

      console.log('✅ Verification check result:', {
        status: verificationCheck.status,
        valid: verificationCheck.valid
      });

      // Return response based on verification result
      let response = {
        commands: [{
          type: "com.okta.telephony.action",
          status: verificationCheck.status === 'approved' ? "SUCCESSFUL" : "FAILED"
        }]
      };

      console.log('Returning response:', JSON.stringify(response));
      return callback(null, response);
    }

  } catch (error) {
    console.error('❌ ERROR OCCURRED:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, null, 2));

    // Return error response to Okta
    let errorResponse = {
      error: {
        errorSummary: error.message || "Internal server error"
      }
    };

    console.log('Returning error response:', JSON.stringify(errorResponse));
    return callback(null, errorResponse);
  }
};
