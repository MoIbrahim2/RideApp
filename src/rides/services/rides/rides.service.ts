import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ride } from 'src/entites/Ride';
import { User } from 'src/entites/User';
import { DataSource, Repository } from 'typeorm';
import { getDistance } from 'geolib';
import { Driver } from 'src/entites/Driver';
import { sendNotficationToAllNearestDrivers } from 'utils/sendNotificationToDriver';
import { Refactoring } from 'utils/Refactoring';
import { Notification } from 'src/entites/Notification';
import { RequestRideDto } from 'src/DTOs/requestRideDto.dto';
import { Voucher } from 'src/entites/Vouchers';
import { VoucherService } from 'src/voucher/service/voucher/voucher.service';
import { formatDate } from 'utils/dateUtils';
import { sendMessage } from 'utils/firebaseConfig';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride) private Ride: Repository<Ride>,
    @InjectRepository(User) private User: Repository<User>,
    @InjectRepository(Driver) private Driver: Repository<Driver>,
    @InjectRepository(Voucher) private Voucher: Repository<Voucher>,
    @InjectRepository(Notification)
    private Notification: Repository<Notification>,
    private Refactoring: Refactoring,
    private voucherService: VoucherService,
    private dataSource: DataSource,
  ) {}

  // User endpoints
  async requestRide(user: User, requestRideData: RequestRideDto) {
    let {
      destinationLat,
      destinationLong,
      sizeOfTheCar,
      paymentMethod,
      pickupDate,
      pickupLat,
      pickupLong,
    } = requestRideData;

    const checkRides = await this.Ride.findBy({ user: { id: user.id } });

    if (checkRides.length > 0)
      throw new HttpException(
        "Can't declare new ride as there is one in progress",
        HttpStatus.BAD_REQUEST,
      );
    const drivers = await this.Driver.find({
      where: { startDriving: true, sizeOfTheCar },
    });

    let searchZone: number;
    // If the pickup is in the past
    if (pickupDate && pickupDate < new Date(Date.now())) {
      throw new HttpException(
        'The pickupDate is in the past',
        HttpStatus.BAD_REQUEST,
      );
    }

    // If the pickup is soon so no need to be scheduled for
    if (pickupDate && pickupDate < new Date(Date.now() + 30 * 60 * 1000)) {
      throw new HttpException(
        'Schedule trips date should be atleast 30 minutes from now',
        HttpStatus.BAD_REQUEST,
      );
    } else if (
      pickupDate &&
      new Date(pickupDate) >= new Date(Date.now() + 31 * 60 * 1000)
    ) {
      searchZone = 5000;
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
      searchZone,
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

    const ride = await this.Ride.save(
      this.Ride.create({
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

    sendNotficationToAllNearestDrivers(
      user,
      pickupLat,
      pickupLong,
      price,
      nearbyDrivers,
      this.Notification,
      ride.id,
      pickupDate,
    );
    return {
      status: 'pending',
      message: 'Send notification to the nearest drivers successfully',
    };
  }

  async clientConfirmation(
    accept: boolean,
    driverId: number,
    user: User,
    discountVoucher?: string,
  ) {
    const ride = await this.Ride.findOne({
      where: { user: { id: user.id } },
      relations: ['driver', 'candidatesDrivers', 'user'],
    });
    if (ride.rideAccepted)
      throw new HttpException(
        'The ride already accepted by client',
        HttpStatus.UNAUTHORIZED,
      );
    const acceptedDriver = ride.candidatesDrivers.find(
      (driver) => driver.id === driverId,
    );
    if (!acceptedDriver)
      throw new HttpException(
        'This driver is not one of the accepted drivers ',
        HttpStatus.UNAUTHORIZED,
      );

    let actualPrice = ride.priceOffers.find(
      (driver) => driverId === driver.driverId,
    ).price;

    let pickupDate = 'Now';

    let voucherMessage = '';
    let voucher: Voucher;

    if (discountVoucher) {
      voucher = await this.voucherService.validateVoucher(discountVoucher);
      actualPrice = actualPrice - actualPrice * voucher.voucherDiscount;
      voucherMessage = ', The voucher applied successfully';
    }
    if (ride.scheduledTo) {
      pickupDate = formatDate(ride.scheduledTo);
    }

    if (accept) {
      await this.dataSource.transaction(async (manager) => {
        try {
          ride.rideAccepted = true;
          ride.acceptanceTime = new Date(Date.now());
          ride.active = true;
          ride.actualPrice = actualPrice;

          if (voucher) {
            voucher.usageCount++;
            await manager.save(voucher);
          }

          if (ride.paymentMethod === 'wallet') {
            if (ride.user.wallet < actualPrice) {
              throw new HttpException(
                'Not enough funds in wallet',
                HttpStatus.PAYMENT_REQUIRED,
              );
            }
            ride.user.wallet -= actualPrice;
          }
          await manager.save(ride.user);
          await manager.save(ride);
          const message = `The client confirmed the trip `;
          await manager.save(
            this.Notification.create({
              driver: { id: driverId },
              message,
              data: { from: user.name, pickupDate },
            }),
          );
        } catch (error) {
          throw error;
        }
      });
    } else {
      ride.candidatesDrivers = ride.candidatesDrivers.filter(
        (driver) => driver.id !== driverId,
      );
      await this.Ride.save(ride);
      return {
        status: 'rejected',
        message: `You have rejected ${acceptedDriver.name} `,
      };
    }

    return {
      status: 'accepted',
      message: `You have accepted ${acceptedDriver.name} to be your captain${voucherMessage}`,
      data: {
        captainName: acceptedDriver.name,
        captainPhone: acceptedDriver.phone,
        carBrand: acceptedDriver.carBrand,
        carEdition: acceptedDriver.carEdition,
        carNumbers: acceptedDriver.carNumbers,
        carLetters: acceptedDriver.carLetters,
        captainPrice: actualPrice,
      },
    };
  }

  // Driver endpoints
  async acceptRide(rideRequestId: string, driver: Driver, price: number) {
    const ride = await this.Ride.findOne({
      where: { id: rideRequestId },
      relations: ['candidatesDrivers', 'user'],
    });
    if (!ride)
      throw new HttpException('Not valid request ID', HttpStatus.NOT_FOUND);
    const driverInfo = ride.nearbyDrivers.find((d) => d.driverId === driver.id);
    if (!driverInfo) {
      throw new HttpException(
        'Driver not authorized to accept this ride, or he is already accepted or refused it',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const minAllowedPrice = ride.expectedPrice * 0.65;
    const maxAllowedPrice = ride.expectedPrice * 1.35;
    if (price < minAllowedPrice || price > maxAllowedPrice) {
      throw new HttpException(
        `The price must be within 35% of the original price. Allowed range: ${minAllowedPrice.toFixed(2)} - ${maxAllowedPrice.toFixed(2)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!ride.priceOffers) ride.priceOffers = [];
    ride.priceOffers.push({ driverId: driver.id, price });

    ride.nearbyDrivers = ride.nearbyDrivers.filter(
      (d) => d.driverId !== driver.id,
    );

    ride.candidatesDrivers.push(driver);
    await this.Ride.save(ride);

    const message = `Captain accept the ride and offered to you his price, accept or reject back`;
    const notification = await this.Notification.save(
      this.Notification.create({
        user: { id: ride.user.id },
        message,
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

    await sendMessage(ride.user.userNotificationToken, {
      title: `Ride accepted by ${driver.name}`,
      body: message,
      data: { ...notification.data, message },
    });
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
    console.log(distance);
    if (distance > 15) {
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
    ride.endTime = new Date(Date.now());
    ride.active = false;
    await this.Ride.save(ride);
    return { status: 'success', message: 'The ride ended successfully' };
  }
  async captainCancelRide(
    rideRequestId: string,
    driver: Driver,
    reason: string,
  ) {
    const ride = await this.Ride.findOne({
      where: { id: rideRequestId },
      relations: ['driver', 'candidatesDrivers', 'user'],
    });
    if (!ride) {
      throw new HttpException(
        'There is no availabe rides for that id',
        HttpStatus.NOT_FOUND,
      );
    }

    const acceptedDriver = ride.candidatesDrivers.find(
      (d) => d.id === driver.id,
    );
    if (!acceptedDriver)
      throw new HttpException(
        'This driver is not one of the accepted drivers ',
        HttpStatus.UNAUTHORIZED,
      );

    // If the ride has been accepted by the client before
    if (ride.driver && ride.driver.id === driver.id && ride.rideAccepted) {
      ride.driver = null;
      ride.rideAccepted = false;
    }

    ride.candidatesDrivers = ride.candidatesDrivers.filter(
      (d) => d.id !== driver.id,
    );

    await this.Ride.save(ride);

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
    await sendMessage(ride.user.userNotificationToken, {
      title: `Captain cancel the trip`,
      body: message,
      data: {
        driverName: driver.name,
        reasonOfCancelation: reason,
        driverPhone: driver.phone,
      },
    });

    return {
      status: 'rejected',
      message: 'Ride has been cancelled successfully',
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
