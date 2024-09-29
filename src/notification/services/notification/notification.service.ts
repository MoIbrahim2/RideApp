import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createNotificationDto } from 'src/DTOs/createNotificationDto.dto';
import { Notification } from 'src/entites/Notification';
import { Repository } from 'typeorm';
import { initializeApp, cert, App } from 'firebase-admin/app';
import { FirebaseNotificationService } from '../firebase-notification/firebase-notification.service';
import { User } from 'src/entites/User';
import { NearbyDriver } from 'src/DTOs/nearbyDriver';
import { getAddressFromCoordinates } from 'utils/getLocation';
import { formatDate } from 'utils/dateUtils';
import { Driver } from 'src/entites/Driver';
import { Ride } from 'src/entites/Ride';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private Notification: Repository<Notification>,
    private firebaseNotificationService: FirebaseNotificationService,
  ) {}

  async getAllNotifications(userOrDriver) {
    let notifications;
    if (userOrDriver.isDriver) {
      notifications = await this.Notification.find({
        where: {
          driver: { id: userOrDriver.id },
        },
        order: { createdAt: 'DESC' },
      });
    } else {
      notifications = await this.Notification.find({
        where: {
          user: { id: userOrDriver.id },
        },
        order: { createdAt: 'DESC' },
      });
    }

    const notificationsWithoutUserAndDriver = notifications.map(
      (notification) => {
        const { user, driver, ...rest } = notification;
        return rest;
      },
    );

    return { status: 'success', data: notificationsWithoutUserAndDriver };
  }
  async createNotification(
    userOrDriver,
    notificationData: createNotificationDto,
  ) {
    let notification;
    if (userOrDriver.isDriver) {
      notification = this.Notification.create({
        message: notificationData.message,
        driver: { id: userOrDriver.id },
      });
    } else {
      notification = this.Notification.create({
        message: notificationData.message,
        user: { id: userOrDriver.id },
      });
    }
    const newNotification = await this.Notification.save(notification);

    return {
      status: 'success',
      message: `new Notification for ${userOrDriver.name}`,
      data: newNotification,
    };
  }
  async sendAcceptRideNotifications(ride, driver: Driver, driverInfo, price) {
    const notification = await this.Notification.save(
      this.Notification.create({
        user: { id: ride.user.id },
        message: 'captain accept the ride',
        data: {
          driverName: driver.name,
          carBrand: driver.carBrand,
          carEdition: driver.carEdition,
          distance: driverInfo.distance.toString(),
          driverId: driver.id.toString(),
          captainPrice: price.toString(),
        },
      }),
    );
    console.log({ ...notification });
    await this.firebaseNotificationService.sendMessage(
      ride.user.userNotificationToken,
      FirebaseNotificationService.templates.captainAcceptRide(driver.name, {
        ...notification.data,
      }),
    );
  }
  async sendRideConfirmationNotifications(
    admin,
    captain,
    user,
    ride,
    pickupDate,
    manager,
  ) {
    const message = `The client confirmed the trip `;
    await manager.save([
      this.Notification.create({
        user: { id: admin.id },
        message: `The trip ${ride.id} confirmed by ${user.name}`,
        data: {
          userId: user.id.toString(),
          driverId: captain.id,
        },
      }),
      this.Notification.create({
        driver: { id: captain.id },
        message,
        data: { from: user.name, pickupDate },
      }),
    ]);

    await this.firebaseNotificationService.sendMessage(
      captain.userNotificationToken,
      FirebaseNotificationService.templates.rideConfirmedCaptain({
        userName: user.name,
        pickupDate,
      }),
    );
    await this.firebaseNotificationService.sendMessage(
      admin.userNotificationToken,
      FirebaseNotificationService.templates.rideConfirmationAdmin(
        ride.id,
        user.name,
        {
          userId: user.id.toString(),
          driverId: captain.id,
        },
      ),
    );
  }
  async sendNotficationToAllNearestDrivers(
    destinationLat: number,
    destinationLong: number,
    user: User,
    pickupLat: number,
    pickupLong: number,
    expectedPrice: number,
    nearestDrivers: NearbyDriver[],
    Notification: Repository<Notification>,
    rideRequestId: string,
    pickupDate?: Date,
    admin?: User,
  ) {
    const pickupLocation = await getAddressFromCoordinates(
      pickupLat,
      pickupLong,
    );
    const dropinLocation = await getAddressFromCoordinates(
      destinationLat,
      destinationLong,
    );
    const minAllowedPrice = (expectedPrice * 0.65).toFixed(2);
    const maxAllowedPrice = (expectedPrice * 1.35).toFixed(2);

    let scheduleMessage = '';
    pickupDate = new Date(pickupDate);
    if (pickupDate)
      scheduleMessage = `This ride request is scheduled to ${formatDate(pickupDate)} `;

    nearestDrivers.forEach(async (nearestDriver) => {
      const driverNotification = Notification.create({
        driver: { id: nearestDriver.driverId },
        message: `New ride request`,
        data: {
          from: user.name,
          pickupLocation,
          dropinLocation,
          userPhone: user.phone,
          distance: nearestDriver.distance,
          rideRequestId,
          expectedPrice,
          priceMessage: `notice your maximum price offer will be ${maxAllowedPrice}, and the minimum one is ${minAllowedPrice}`,
          scheduleMessage,
        },
      });
      console.log(nearestDriver.driverNotificationToken);
      await this.firebaseNotificationService.sendMessage(
        nearestDriver.driverNotificationToken,
        FirebaseNotificationService.templates.newRideRequest(user.name, {
          pickupLocation,
          dropinLocation,
          userPhone: user.phone,
          distance: nearestDriver.distance.toString(),
          rideRequestId,
          expectedPrice: expectedPrice.toString(),
          priceMessage: `notice your maximum price offer will be ${maxAllowedPrice}, and the minimum one is ${minAllowedPrice}`,
        }),
      );

      await Notification.save(driverNotification);
    });
    await this.firebaseNotificationService.sendMessage(
      admin.userNotificationToken,
      FirebaseNotificationService.templates.newRideRequest(user.name, {
        pickupLocation,
        dropinLocation,
        userPhone: user.phone,
        sendedTo: nearestDrivers.toString(),
        rideRequestId,
        expectedPrice: expectedPrice.toString(),
      }),
    );
  }
  async clientCancelRideNotificaions(ride: Ride, admin: User, reason: string) {
    if (ride.driver) {
      const message = 'The ride cancelled by the client';
      await this.Notification.save(
        this.Notification.create({
          driver: { id: ride.driver.id },
          message,
          data: { reason },
        }),
      );
      await this.firebaseNotificationService.sendMessage(
        ride.driver.userNotificationToken,
        FirebaseNotificationService.templates.clientCancelRideCaptain(
          ride.user.name,
          { cancelationReason: reason, userPhone: ride.user.phone },
        ),
      );
    }
    await this.firebaseNotificationService.sendMessage(
      admin.userNotificationToken,
      FirebaseNotificationService.templates.clientCancelRideAdmin(
        ride.id,
        ride.user.name,
        { cancelationReason: reason, userPhone: ride.user.phone },
      ),
    );
  }
  async captainCacncelRideNotifications(
    ride: Ride,
    driver: Driver,
    reason: string,
  ) {
    const message = `Captain ${driver.name} cancel the ride`;
    await this.Notification.save(
      await this.Notification.create({
        user: { id: ride.user.id },
        message,
        data: {
          driverName: driver.name,
          reasonOfCancelation: reason,
          driverPhone: driver.phone,
        },
      }),
    );
    await this.firebaseNotificationService.sendMessage(
      ride.user.userNotificationToken,
      FirebaseNotificationService.templates.captainCancelRide(message, {
        driverName: driver.name,
        reasonOfCancelation: reason,
        driverPhone: driver.phone,
      }),
    );
  }
}
