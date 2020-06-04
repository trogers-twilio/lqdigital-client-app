exports.handler = function(context, event, callback) {
  let twiml = new Twilio.twiml.VoiceResponse();

  if (event.To) {
    // Wrap the phone number or client name in the appropriate TwiML verb
    // if is a valid phone number
    const attr = isAValidPhoneNumber(event.To) ? "number" : "client";

    const dial = twiml.dial({
      answerOnBridge: true,
      callerId: process.env.CALLER_ID
    });
    dial[attr]({}, event.To);
    // This pause is necessary so the parent call (agent call) doesn't drop
    // when the child call is updated. If there is no TwiML instruction after
    // <Dial> and no action URL which will return TwiML, then <Pause> will
    // at least keep the agent call active until it can be updated with new
    // TwiML upon the consumer joining the conference 
    twiml.pause({ length: 20 });
  } else {
    twiml.say("Thanks for calling!");
  }

  callback(null, twiml);  
};

/**
 * Checks if the given value is valid as phone number
 * @param {Number|String} number
 * @return {Boolean}
 */
function isAValidPhoneNumber(number) {
  return /^[\d\+\-\(\) ]+$/.test(number);
}
