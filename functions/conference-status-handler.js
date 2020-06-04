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
    // By leveraging the conference status participant-join event, we can be certain
    // the consumer's child call leg has processed the new instruction to join the conference
    // before updating the agent's parent call leg and potentially causing the child call
    // to drop if we updated that call too soon. This pattern helps avoid a race condition.
    const agentTwiml = new Twilio.twiml.VoiceResponse();
    agentTwiml.dial().conference({ startConferenceOnEnter: true }, FriendlyName);
    
    console.log(`Consumer joined the conference. Updating agent call ${AgentCallSid} to join`);
    await client
      .calls(AgentCallSid)
      .update({ twiml: agentTwiml.toString() });

  } else if (CallSid === AgentCallSid) {
    // Putting the consumer on hold since the agent should only join the conference once,
    // when the conference is first setup. This assumes all new conferences require the
    // consumer to be on hold initially so the agent and third party can talk privately.
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
