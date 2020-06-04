const Twilio = require('twilio');
const { v4: uuidv4 } = require('uuid');

/**
 *  This function joins the Client and Customer to a conference
 */

exports.handler = async function(context, event, callback) {
  const { callSid } = event;

  const {
    ACCOUNT_SID,
    AUTH_TOKEN,
    DOMAIN_NAME
  } = context;
  const client = Twilio(ACCOUNT_SID, AUTH_TOKEN);

  const conferenceName = uuidv4();

  console.log('Getting child calls for parent call', callSid);
  const allChildCalls = await client.calls.list({ parentCallSid: callSid });
  console.log(`Retrieved ${allChildCalls.length} child calls`);

  const childCall = allChildCalls.length > 0 && allChildCalls[0];
  let childCallSid;
  if (childCall) {
    childCallSid = childCall.sid;

    const childTwiml = new Twilio.twiml.VoiceResponse();
    childTwiml.dial().conference({
      startConferenceOnEnter: true,
      statusCallback: `https://${DOMAIN_NAME}/conference-status-handler`
        + `?ConsumerCallSid=${childCallSid}`
        + `&AgentCallSid=${callSid}`,
      statusCallbackEvent: 'start end join leave',
      waitUrl: ''
    }, conferenceName);

    console.log(`Joining child calls ${childCallSid} to conference ${conferenceName}`);
    await client.calls(childCallSid).update({ twiml: childTwiml.toString() })
  }

  const getConfSidInterval = setInterval(async () => {
    console.log(`Getting conference SID for ${conferenceName}`);
    const matchingConferences = await client.conferences.list({ friendlyName: conferenceName });
    const conference = matchingConferences.length > 0 && matchingConferences[0];
    if (!conference || !conference.sid) {
      return;
    }
    const { sid: conferenceSid } = conference;
    console.log(`Retrieved conference SID ${conferenceSid}`);

    clearInterval(getConfSidInterval);

    const response = new Twilio.Response();
  
    // Uncomment these lines for CORS support
    // response.appendHeader('Access-Control-Allow-Origin', '*');
    // response.appendHeader('Access-Control-Allow-Methods', 'GET');
    // response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    response.appendHeader("Content-Type", "application/json");
    response.setBody({
      success: true,
      conferenceName,
      conferenceSid,
      childCallSid
    });
    callback(null, response);
  }, 1000);

  // Setting a max timeout before no longer trying to retrieve the conference SID
  setTimeout(async () => {
    clearInterval(getConfSidInterval);
  }, 5000);
};
