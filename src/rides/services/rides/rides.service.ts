import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ride } from 'src/entites/Ride';
import { User } from 'src/entites/User';
import { DataSource, Repository } from 'typeorm';
import { getDistance } from 'geolib';
import { Driver } from 'src/entites/Driver';

import { Refactoring } from 'utils/Refactoring';
import { Notification } from 'src/entites/Notification';
import { RequestRideDto } from 'src/DTOs/requestRideDto.dto';
import { Voucher } from 'src/entites/Vouchers';
import { VoucherService } from 'src/voucher/service/voucher/voucher.service';
import { formatDate } from 'utils/dateUtils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentsService } from 'src/payments/services/payments/payments.service';
import { NotificationService } from 'src/notification/services/notification/notification.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class RidesService implements OnModuleInit {
  admin: User;
  constructor(
    @InjectRepository(Ride) private Ride: Repository<Ride>,
    @InjectRepository(User) private User: Repository<User>,
    @InjectRepository(Driver) private Driver: Repository<Driver>,
    @InjectRepository(Voucher) private Voucher: Repository<Voucher>,
    @InjectRepository(Notification)
    private Notification: Repository<Notification>,
    @InjectQueue('schedule-trip') private tripSchedulerQueue: Queue,
    private Refactoring: Refactoring,
    private voucherService: VoucherService,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
    private paymentService: PaymentsService,
    private notificationService: NotificationService,
  ) {}

  async onModuleInit() {
    this.admin = await this.User.findOneBy({ id: process.env.ADMIN_ID });
  }
  // User endpoints
  async requestRide(
    user: User,
    drivers: Driver[],
    requestRideData: RequestRideDto,
  ) {
    let {
      destinationLat,
      destinationLong,
      paymentMethod,
      pickupDate,
      pickupLat,
      pickupLong,
      discountVoucher,
    } = requestRideData;

    if (
      pickupDate &&
      new Date(pickupDate) >= new Date(Date.now() + 31 * 60 * 1000)
    ) {
      const delay = new Date(formatDate(pickupDate)).getTime() - Date.now();
      const job = await this.tripSchedulerQueue.add(
        'schedule-trip',
        {
          pickupDate,
          pickupLat,
          pickupLong,
          user,
          drivers,
          destinationLat,
          destinationLong,
          discountVoucher,
          paymentMethod,
          admin: this.admin,
        },
        { delay },
      );
      return {
        status: 'scheduled',
        message: 'Trip scheduled successfully',
        data: { jobId: job.id },
      };
      // searchZone = 5000;
    }
    // If the pickupLat or pickupLong not exists choose the current location of the user
    if (!pickupLat || !pickupLong) {
      pickupLat = user.latitude;
      pickupLong = user.longitude;
    }

    const nearbyDrivers = this.Refactoring.searchingForNearbyDrivers(
      drivers,
      pickupLat,
      pickupLong,
    );

    const price = await this.Refactoring.calcEstimatedPrice(
      pickupLat,
      pickupLong,
      destinationLat,
      destinationLong,
    );

    if (!nearbyDrivers)
      throw new HttpException(
        'There is no captains available around you right now please try again later',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    let voucher: Voucher = null;
    if (discountVoucher) {
      voucher = await this.voucherService.validateVoucher(discountVoucher);
    }

    const ride = await this.Ride.save(
      this.Ride.create({
        discountVoucher: voucher,
        scheduledTo: pickupDate,
        paymentMethod: paymentMethod,
        expectedPrice: price,
        user: { id: user.id },
        to: { destinationLat, destinationLong },
        from: {
          destinationLat: pickupLat,
          destinationLong: pickupLong,
        },
        nearbyDrivers,
      }),
    );
    // Save nearby drivers into DB

    this.notificationService.sendNotficationToAllNearestDrivers(
      destinationLat,
      destinationLong,
      user,
      pickupLat,
      pickupLong,
      price,
      nearbyDrivers,
      this.Notification,
      ride.id,
      pickupDate,
      this.admin,
    );
    return {
      status: 'pending',
      message: 'Send notification to the nearest drivers successfully',
    };
  }

  async clientConfirmation(
    accept: boolean,
    captain: Driver,
    user: User,
    ride: Ride,
  ) {
    let actualPrice = ride.priceOffers.find(
      (driver) => captain.id === driver.driverId,
    ).price;

    let pickupDate = 'Now';
    let voucherMessage = '';

    if (ride.scheduledTo) {
      pickupDate = formatDate(ride.scheduledTo);
    }
    console.log(pickupDate);
    if (accept) {
      await this.dataSource.transaction(async (manager) => {
        try {
          ride.driver = { id: captain.id } as any;
          ride.rideAccepted = true;
          ride.acceptanceTime = new Date(Date.now());
          ride.actualPrice = actualPrice;

          // Check if there voucher
          if (ride.discountVoucher) {
            actualPrice = await this.voucherService.applyVoucher(
              ride.discountVoucher,
              actualPrice,
              manager,
            );
            voucherMessage = ', The voucher applied successfully';
          }

          if (ride.paymentMethod === 'wallet') {
            await this.paymentService.processWalletPayment(
              user,
              actualPrice,
              manager,
            );
          }
          await manager.save(ride);
          await this.notificationService.sendRideConfirmationNotifications(
            this.admin,
            captain,
            user,
            ride,
            pickupDate,
            manager,
          );
          return {
            status: 'accepted',
            message: `You have accepted ${captain.name} to be your captain${voucherMessage}`,
            data: {
              captainName: captain.name,
              captainPhone: captain.phone,
              carBrand: captain.carBrand,
              carEdition: captain.carEdition,
              carNumbers: captain.carNumbers,
              carLetters: captain.carLetters,
              amountPaid: actualPrice,
            },
          };
        } catch (error) {
          throw error;
        }
      });
    } else {
      ride.candidatesDrivers = ride.candidatesDrivers.filter(
        (driver) => driver.id !== captain.id,
      );
      await this.Ride.save(ride);
      return {
        status: 'rejected',
        message: `You have rejected ${captain.name} `,
      };
    }
  }

  // Driver endpoints
  async acceptRide(ride: Ride, driverInfo, driver: Driver, price: number) {
    // Used interceptor to check if the ride exist, if the driver authorised to accept the ride, if the price is lying within the allowed range

    //just to make sure that the priceOffers array set to value (empty array) so i could use it
    if (!ride.priceOffers) ride.priceOffers = [];
    ride.priceOffers.push({ driverId: driver.id, price });

    ride.nearbyDrivers = ride.nearbyDrivers.filter(
      (d) => d.driverId !== driver.id,
    );

    ride.candidatesDrivers.push(driver);
    await this.Ride.save(ride);

    await this.notificationService.sendAcceptRideNotifications(
      ride,
      driver,
      driverInfo,
      price,
    );

    return {
      status: 'success',
      message: `The driver ${driver.name} has accepted the ride`,
    };
  }

  async rejectRide(rideRequestId: string, driver: Driver) {
    const ride = await this.Ride.findOne({
      where: { id: rideRequestId },
      relations: ['candidatesDrivers', 'user'],
    });

    if (!ride.nearbyDrivers.find((d) => d.driverId === driver.id)) {
      throw new HttpException(
        'Driver not authorized to access this ride',
        HttpStatus.UNAUTHORIZED,
      );
    }

    ride.nearbyDrivers = ride.nearbyDrivers.filter(
      (d) => d.driverId !== driver.id,
    );

    await this.Ride.save(ride);

    return {
      status: 'rejected',
      message: 'The ride has been rejected successfully',
    };
  }

  async startRide(driver: Driver) {
    const ride = await this.Ride.findOne({
      where: { driver: { id: driver.id }, active: true, rideAccepted: true },
      relations: ['user'],
    });

    if (!ride || ride.startTime) {
      throw new HttpException(
        "There is no active rides for that captain, or it's already started",
        HttpStatus.UNAUTHORIZED,
      );
    }
    const distance = getDistance(
      { latitude: ride.user.latitude, longitude: ride.user.longitude },
      { latitude: driver.latitude, longitude: driver.longitude },
    );

    if (distance > 20) {
      throw new HttpException(
        'You have to be clost enough from the location of the user so you could start the ride',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    ride.startTime = new Date(Date.now());
    await this.Ride.save(ride);
    return { status: 'success', message: 'The trip started successfully' };
  }
  async endRide(driver) {
    const ride = await this.Ride.findOne({
      where: { driver: { id: driver.id }, active: true, rideAccepted: true },
      relations: ['user'],
    });

    if (!ride || !ride.startTime) {
      throw new HttpException(
        'There is no active rides for that captain, maybe finished or not even started',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const distance = getDistance(
      { latitude: ride.to.destinationLat, longitude: ride.to.destinationLong },
      { latitude: driver.latitude, longitude: driver.longitude },
    );

    if (distance > 15) {
      throw new HttpException(
        'You have to be clost enough from the location of the user so you could start the ride',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    ride.endTime = new Date(Date.now());
    ride.active = false;
    await this.Ride.save(ride);
    return { status: 'success', message: 'The ride ended successfully' };
  }
  async captainCancelRide(ride: Ride, driver: Driver, reason: string) {
    // Used interceptor to check of the existance of the ride and if the captain is allowed to cancel the ride or not

    // If the ride has been accepted by the client before (which means the captain assigned to the ride)
    if (ride.driver && ride.driver.id === driver.id && ride.rideAccepted) {
      ride.driver = null;
      ride.rideAccepted = false;
    }

    // Delete the driver from the candidates of the ride
    ride.candidatesDrivers = ride.candidatesDrivers.filter(
      (d) => d.id !== driver.id,
    );

    await this.Ride.save(ride);
    await this.notificationService.captainCacncelRideNotifications(
      ride,
      driver,
      reason,
    );

    return {
      status: 'rejected',
      message: 'Ride has been cancelled successfully',
    };
  }

  async clientCancelRide(rideRequestId: string, reason: string) {
    const ride = await this.Ride.findOne({
      where: { id: rideRequestId, active: true },
      relations: ['driver', 'candidatesDrivers', 'user'],
    });
    if (!ride) {
      throw new HttpException(
        "There is no availabe rides for that id, or it's already been canceled before ",
        HttpStatus.NOT_FOUND,
      );
    }

    ride.active = false;
    await this.Ride.save(ride);

    await this.notificationService.clientCancelRideNotificaions(
      ride,
      this.admin,
      reason,
    );

    return {
      status: 'canceled',
      message: 'The trip cancelled successfully',
    };
  }
  async showAllAcceptedDrivers(rideRequestId: string) {
    const ride = await this.Ride.findOne({
      where: { id: rideRequestId },
      relations: ['candidatesDrivers', 'user'],
    });

    const acceptedDrivers = ride.candidatesDrivers;

    if (!ride || !acceptedDrivers)
      throw new HttpException(
        'Either no ride, or no one still accepted the trip',
        HttpStatus.NOT_FOUND,
      );
    return { data: acceptedDrivers };
  }
}
