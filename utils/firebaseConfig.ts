import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

const serviceAccount = require('/Users/mohamedibrahim/figma-project/figma-project-32be2-firebase-adminsdk-3aa5t-2154844a4b.json');

// Initialize the Firebase app with the service account credentials
const app = initializeApp({
  credential: cert(serviceAccount),
});

// Function to send a message
export const sendMessage = async (
  token: string,
  notification: { title: string; body: string; data: any },
) => {
  const messaging = getMessaging(app);
  const payload = {
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: notification.data,
    token: token,
  };

  try {
    await messaging.send(payload);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

//user token 'emb4wogmSoG93oufCOvfwg:APA91bGpVfgzq_ygawMLkV5G_s_QRjcojFc2eLU7m22baan9dip9WOsVxBvzdtoAFLY4lkk3Qkdt6q297ko-3_HsNcqgrnWNJjfrAwtJYxpXltQG-7CQuOWrV6FH6DxUgoL7pZ5UsNqK';
