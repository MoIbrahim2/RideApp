import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createNotificationDto } from 'src/DTOs/createNotificationDto.dto';
import { Notification } from 'src/entites/Notification';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private Notification: Repository<Notification>,
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
}
