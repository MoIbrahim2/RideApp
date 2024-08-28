import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';

import { Ride } from 'src/entites/Ride';
import { User } from 'src/entites/User';
import { Repository } from 'typeorm';
import { getDistance } from 'geolib';
import { Driver } from 'src/entites/Driver';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride) private Ride: Repository<Ride>,
    @InjectRepository(User) private User: Repository<User>,
    @InjectRepository(Driver) private Driver: Repository<Driver>,
  ) {}
  async sendRequest(
    userLocation: [string, string],
    userId,
    to: [string, string],
  ) {
    const active = await this.Ride.findOneBy({ user: userId, active: true });
    if (active)
      throw new HttpException(
        "You can't start a new ride while you are already in a one",
        HttpStatus.BAD_REQUEST,
      );
  }
  async bindingRide(
    from: { lat: number; long: number },
    userId,
    to: { lat: number; long: number },
  ) {
    try {
      const drivers = await this.Driver.find();

      let nearestDriver = null;
      let minDistance = Infinity;

      drivers.forEach((driver) => {
        const distance = getDistance(
          {
            latitude: from.lat,
            longitude: from.long,
          },
          {
            latitude: driver.latitude,
            longitude: driver.longitude,
          },
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestDriver = driver;
        }
      });
      // Code for sending a notification to the nearest driver

      //     const ride = this.Ride.create({
      //       user: userId,
      //       driver: nearestDriver.id,
      //       from: userLocation,
      //       to,
      //       expectedPrice: 50,
      //       startTime: new Date(Date.now()),
      //     });
      //     const newRide = await this.Ride.save(ride);
      //     return {
      //       message: `your driver will be ${nearestDriver.name} `,
      //       newRide,
      // };
    } catch (err) {
      return { message: err.message, err };
    }
  }
  async endRide(driverId) {
    const ride = await this.Ride.findOneBy({ driver: driverId, endTime: null });
    if (!ride)
      throw new HttpException(
        'There is no active rides for this driver',
        HttpStatus.NOT_FOUND,
      );
    ride.endTime = new Date(Date.now());
    ride.actualPrice = 40;
    ride.active = false;
    const newRide = await this.Ride.save(ride);
    return { message: 'The ride ended successfully', newRide };
  }
}
