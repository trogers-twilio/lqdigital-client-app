const Twilio = require('twilio');

/**
 *  This function joins the Client and Customer to a conference
 */

exports.handler = async function(context, event, callback) {
  const { conferenceSid, phoneNumber } = event;

  const {
    ACCOUNT_SID,
    AUTH_TOKEN,
    CALLER_ID
  } = context;
  const client = Twilio(ACCOUNT_SID, AUTH_TOKEN);

  console.log(`Adding ${phoneNumber} to conference ${conferenceSid}`);
  const participant = await client.conferences(conferenceSid)
    .participants
    .create({
      earlyMedia: true,
      from: CALLER_ID,
      to: phoneNumber
    })

  const response = new Twilio.Response();

  // Uncomment these lines for CORS support
  // response.appendHeader('Access-Control-Allow-Origin', '*');
  // response.appendHeader('Access-Control-Allow-Methods', 'GET');
  // response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  response.appendHeader("Content-Type", "application/json");
  response.setBody({
    success: true,
    participantSid: participant.callSid
  });
  callback(null, response);
};
