const Twilio = require('twilio');

/**
 *  This function handles conference status events
 */

const handleParticipantJoin = async (client, event, callback) => {
  const {
    AgentCallSid,
    CallSid,
    ConferenceSid,
    ConsumerCallSid,
    FriendlyName
  } = event;

  if (CallSid === ConsumerCallSid) {
    const agentTwiml = new Twilio.twiml.VoiceResponse();
    agentTwiml.dial().conference({ startConferenceOnEnter: true }, FriendlyName);
    
    console.log(`Consumer joined the conference. Updating agent call ${AgentCallSid} to join`);
    await client
      .calls(AgentCallSid)
      .update({ twiml: agentTwiml.toString() });
      
  } else if (CallSid === AgentCallSid) {
    console.log('Agent joined the conference. Holding consumer participant.');
    await client
      .conferences(ConferenceSid)
      .participants(ConsumerCallSid)
      .update({ hold: true });
  }

  callback();
}

exports.handler = async function(context, event, callback) {
  const {
    StatusCallbackEvent
  } = event;

  const {
    ACCOUNT_SID,
    AUTH_TOKEN
  } = context;
  const client = Twilio(ACCOUNT_SID, AUTH_TOKEN);

  console.log('Received event', event);

  switch(StatusCallbackEvent) {
    case 'participant-join': {
      return handleParticipantJoin(client, event, callback);
    }
    default: {
      return callback();
    }
  }
};
