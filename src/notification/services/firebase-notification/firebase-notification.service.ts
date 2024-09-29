import { Injectable } from '@nestjs/common';
import { App, cert, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { Repository } from 'typeorm';

@Injectable()
export class FirebaseNotificationService {
  serviceAccount = require(process.env.FIREBASE_CREDENTIALS_FILE);
  private static firebaseApp: App;
  constructor() {
    if (!FirebaseNotificationService.firebaseApp) {
      FirebaseNotificationService.firebaseApp = this.initializeFirebaseApp();
    }
  }
  private initializeFirebaseApp(): App {
    try {
      const serviceAccount = require(process.env.FIREBASE_CREDENTIALS_FILE);

      return initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (error) {
      console.error('Failed to initialize Firebase app:', error);
      throw new Error('Firebase initialization failed');
    }
  }
  static templates = {
    rideConfirmedCaptain: (data: {}) => ({
      title: 'The trip has confirmed by the client',
      body: 'Trip confrimed, please start moving towards the client',
      data: { ...data },
    }),
    rideConfirmationAdmin: (rideId, userName, data: {}) => ({
      title: `Trip confirmation`,
      body: `The trip ${rideId} confirmed by ${userName}`,
      data: { ...data },
    }),
    newRideRequest: (userName, data: {}) => ({
      title: `New ride request `,
      body: `request ride from ${userName}`,
      data: { ...data },
    }),
    captainAcceptRide: (driverName, data: {}) => ({
      title: `Ride accepted by ${driverName}`,
      body: `Captain accept the ride and offered to you his price, accept or reject back`,
      data: { ...data },
    }),
    clientCancelRideCaptain: (userName, data: {}) => ({
      title: 'Ride cancelation',
      body: `Ride from ${userName} canceled `,
      data: { ...data },
    }),
    clientCancelRideAdmin: (rideId, userName, data: {}) => ({
      title: 'Ride cancelation',
      body: `Ride ${rideId} from ${userName} has been canceled `,
      data: { ...data },
    }),
    captainCancelRide: (message: string, data: {}) => ({
      title: `Captain cancel the trip`,
      body: message,
      data: { ...data },
    }),
  };

  async sendMessage(
    token: string,
    notification: { title: string; body: string; data: any },
  ) {
    const messaging = getMessaging(FirebaseNotificationService.firebaseApp);
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
  }
}
