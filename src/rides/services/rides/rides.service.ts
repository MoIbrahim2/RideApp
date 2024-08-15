import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Ride } from 'src/entites/Ride';
import { User } from 'src/entites/User';
import { Repository } from 'typeorm';
import { getDistance } from 'geolib';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride) private Ride: Repository<Ride>,
    @InjectRepository(User) private User: Repository<User>,
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
    userLocation: [string, string],
    userId,
    to: [string, string],
  ) {
    try {
      const drivers = await this.User.find();

      let nearestDriver = null;
      let minDistance = Infinity;

      drivers.forEach((driver) => {
        const distance = getDistance(
          {
            latitude: parseFloat(userLocation[0]),
            longitude: parseFloat(userLocation[1]),
          },
          {
            latitude: parseFloat(driver.location[0]),
            longitude: parseFloat(driver.location[1]),
          },
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestDriver = driver;
        }
      });

      const ride = this.Ride.create({
        user: userId,
        driver: nearestDriver.id,
        from: userLocation,
        to,
        expectedPrice: 50,
        startTime: new Date(Date.now()),
      });
      const newRide = await this.Ride.save(ride);
      return {
        message: `your driver will be ${nearestDriver.name} `,
        newRide,
      };
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
