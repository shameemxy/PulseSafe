const twilio = require('twilio');

// Your current credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

async function testSMS() {
  try {
    console.log('Testing Twilio SMS...');
    
    const message = await client.messages.create({
      body: '🧪 PulseSafe SMS Test - If you receive this, Twilio is working!',
      from: TWILIO_PHONE_NUMBER,
      to: '+919480486500'
    });
    
    console.log('✅ SMS sent successfully!');
    console.log('Message SID:', message.sid);
    console.log('Status:', message.status);
    console.log('Check Twilio Console for detailed status');
    
  } catch (error) {
    console.error('❌ SMS failed:', error.message);
    console.error('Error details:', error);
  }
}

testSMS();
