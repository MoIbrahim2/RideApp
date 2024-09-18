import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { getDistance } from 'geolib';
import { Driver } from 'src/entites/Driver';

const cookieOptions = {
  expires: new Date(
    Date.now() +
      parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
  ),
  // secure: true,
  httpOnly: true,
};
@Injectable()
export class Refactoring {
  constructor(private jwtService: JwtService) {}

  async createSendToken(userId: number, res: Response) {
    const token = await this.jwtService.signAsync({ userId });

    res.cookie('jwt', token, cookieOptions);

    return token;
  }
  searchingForNearbyDrivers(
    drivers: Driver[],
    latitude,
    longitude,
    searchZone?: number,
  ) {
    console.log(latitude, longitude, searchZone);
    if (!searchZone) searchZone = parseInt(process.env.SEARCH_ZONE);

    const nearbyDrivers = drivers
      .map((driver) => ({
        driverId: driver.id,
        driverNotificationToken: driver.userNotificationToken,
        distance: getDistance(
          {
            latitude: latitude,
            longitude: longitude,
          },
          {
            latitude: driver.latitude,
            longitude: driver.longitude,
          },
        ),
      }))
      .filter((driver) => driver.distance <= searchZone)
      .sort((a, b) => a.distance - b.distance);
    return nearbyDrivers;
  }
  async calcEstimatedPrice(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const distance =
      getDistance(
        {
          latitude: lat1,
          longitude: lon1,
        },
        {
          latitude: lat2,
          longitude: lon2,
        },
      ) / 1000;
    const baseFare = 10;
    const pricePerKm = 10;
    const overAllPrice = Math.ceil(baseFare + pricePerKm * distance);
    return overAllPrice;
  }
}
