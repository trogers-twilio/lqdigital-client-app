const Twilio = require('twilio');

/**
 *  This function joins the Client and Customer to a conference
 */

exports.handler = async function(context, event, callback) {
  const { conferenceSid, callSid } = event;

  const {
    ACCOUNT_SID,
    AUTH_TOKEN,
  } = context;
  const client = Twilio(ACCOUNT_SID, AUTH_TOKEN);

  console.log(`Removing ${callSid} from conference ${conferenceSid}`);
  await client
    .conferences(conferenceSid)
    .participants(callSid)
    .remove();

  const response = new Twilio.Response();

  // Uncomment these lines for CORS support
  // response.appendHeader('Access-Control-Allow-Origin', '*');
  // response.appendHeader('Access-Control-Allow-Methods', 'GET');
  // response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  response.appendHeader("Content-Type", "application/json");
  response.setBody({
    success: true,
  });
  callback(null, response);
};
