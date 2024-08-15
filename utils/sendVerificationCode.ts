import * as twilio from 'twilio';
// Replace these values with your Twilio account SID and Auth Token
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

// Create a Twilio client
const client = twilio(accountSid, authToken);

// Function to send SMS
export const sendSms = async (to, message) => {
  await client.messages.create({
    body: message,
    from: 'whatsapp:+14155238886',
    to,
  });
};
