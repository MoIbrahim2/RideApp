import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from 'src/entites/Driver';

import { Notification } from 'src/entites/Notification';
import { Ride } from 'src/entites/Ride';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/entites/User';
import { Repository } from 'typeorm';
import { sendNotficationToAllNearestDrivers } from 'utils/sendNotificationToDriver';
import { Refactoring } from 'utils/Refactoring';

@Injectable()
export class UserService {
  constructor(
    private Refactoring: Refactoring,
    @InjectRepository(User) private User: Repository<User>,
    @InjectRepository(Ride) private Ride: Repository<Ride>,
    @InjectRepository(Driver) private Driver: Repository<Driver>,

    @InjectRepository(Notification)
    private Notification: Repository<Notification>,
  ) {}
  async findAll() {
    const users = await this.User.find({
      relations: ['userRides'],
    });
    return { users };
  }
  async setUserLocation(lat: number, long: number, user) {
    user.latitude = lat;
    user.longitude = long;

    await this.User.save(user);
    return {
      status: 'success',
      message: 'The location of the user has been added successfully',
    };
  }
  async getUserProfile(user: User) {
    return {
      name: user.name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
    };
  }

  // async assignNextNearestDriver(rideId: string) {
  //   const ride = await this.Ride.findOne({
  //     where: { id: rideId },
  //     relations: ['driver', 'user'],
  //   });

  //   if (!ride || ride.driver) {
  //     throw new HttpException(
  //       "Ride not found, or it's already assigned to another driver",
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  //   const { user } = ride;
  //   // Find the next nearest driver and notify him
  //   const nearestDrivers = await this.NearbyDrivers.findOneBy({
  //     user: { id: user.id },
  //   });

  //   const nearestDriver = nearestDrivers.nearbyDrivers.shift();
  //   if (!nearestDriver) {
  //     await this.NearbyDrivers.delete({ user: { id: user.id } });
  //     await this.Ride.delete({ id: ride.id });
  //     throw new HttpException(
  //       'Sorry there are no drivers around you right now, try again later',
  //       HttpStatus.SERVICE_UNAVAILABLE,
  //     );
  //   }

  //   ride.driver = { id: nearestDriver.driverId } as any;

  //   await this.NearbyDrivers.save(nearestDrivers);
  //   await this.Ride.save(ride);

  //   // sendNotficationToAllNearestDrivers(user, nearestDriver, this.Notification);
  //   return {
  //     status: 'success',
  //     message: 'Send notification to the next nearest driver',
  //     data: { nearestDriver: nearestDriver.driverId },
  //   };
}
