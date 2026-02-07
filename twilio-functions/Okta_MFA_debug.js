/**
 * DEBUGGING VERSION - Logs Everything
 *
 * Use this temporarily to see exactly what Okta is sending
 * Then we can fix the main function based on the logs
 */

exports.handler = async function(context, event, callback) {
  console.log('\n\n==============================================');
  console.log('🔍 OKTA MFA DEBUG - FULL REQUEST DUMP');
  console.log('==============================================');
  console.log('Timestamp:', new Date().toISOString());
  console.log('\n--- CONTEXT ---');
  console.log('Environment Variables:', {
    VERIFY_SID: context.VERIFY_SID,
    auth_secret: context.auth_secret ? '[EXISTS]' : '[MISSING]',
    DOMAIN_NAME: context.DOMAIN_NAME
  });

  console.log('\n--- EVENT OBJECT ---');
  console.log('Full event:', JSON.stringify(event, null, 2));

  console.log('\n--- REQUEST HEADERS ---');
  if (event.request && event.request.headers) {
    const headers = {...event.request.headers};
    if (headers.auth_secret) headers.auth_secret = '[REDACTED]';
    console.log('Headers:', JSON.stringify(headers, null, 2));
  }

  console.log('\n--- REQUEST BODY / DATA ---');
  console.log('event.data:', JSON.stringify(event.data, null, 2));

  console.log('\n--- MESSAGE PROFILE ---');
  if (event.data && event.data.messageProfile) {
    console.log('Message Profile:', JSON.stringify(event.data.messageProfile, null, 2));
  }

  console.log('\n--- AUTHENTICATION CHECK ---');
  const authMatch = context.auth_secret === event.request.headers.auth_secret;
  console.log('Auth secrets match:', authMatch);
  if (!authMatch) {
    console.log('Expected:', context.auth_secret ? '[EXISTS]' : '[MISSING]');
    console.log('Received:', event.request.headers.auth_secret ? '[EXISTS]' : '[MISSING]');
  }

  console.log('\n==============================================\n');

  try {
    // Authentication check
    if (context.auth_secret !== event.request.headers.auth_secret) {
      console.error('❌ Authentication failed - returning 401');
      throw new Error("Authentication failed");
    }

    // For now, just send a basic success response
    let response = {
      commands: [{
        type: "com.okta.telephony.action",
        status: "SUCCESSFUL"
      }]
    };

    console.log('✅ Returning success response:', JSON.stringify(response));
    return callback(null, response);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);

    return callback(error);
  }
};
