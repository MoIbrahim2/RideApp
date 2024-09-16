import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Driver } from 'src/entites/Driver';
import { Repository } from 'typeorm';

import { Ride } from 'src/entites/Ride';
import { Notification } from 'src/entites/Notification';
import { getAddressFromCoordinates } from 'utils/getLocation';
import { sendNotficationToAllNearestDrivers } from 'utils/sendNotificationToDriver';
import { getDistance } from 'geolib';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver) private Driver: Repository<Driver>,
    @InjectRepository(Ride) private Ride: Repository<Ride>,
    @InjectRepository(Notification)
    private Notification: Repository<Notification>,
  ) {}

  async saveCarPhotos(driver: Driver, photos: Express.Multer.File[]) {
    try {
      const carPhotos = photos[0].buffer;
      console.log(carPhotos);
      driver.carPhotos = JSON.stringify(carPhotos);
      await this.Driver.save(driver);
      return {
        status: 'sucess',
        message: 'car photos have been saved successfully',
      };
    } catch (err) {
      console.log(err);
    }
  }
  async getCarPhotos(driverData) {
    // const driver = await this.Driver.findOneBy({ id: driverData.id });
    // if (!driver) {
    //   throw new Error('Driver not found');
    // }
    // const photoPaths = JSON.parse(driver.carPhotos);
    // return photoPaths.map((photoPath) => {
    //   try {
    //     const fullPath = path.resolve(photoPath);
    //     return fs.readFileSync(fullPath);
    //   } catch (error) {
    //     console.error(`Error reading file at path: ${photoPath}`, error);
    //     throw new Error(`Error reading file at path: ${photoPath}`);
    //   }
    // });
  }
  async startAcceptingRides(driver: Driver) {
    driver.startDriving = true;
    await this.Driver.save(driver);

    return { status: 'success', message: 'Driver starts to accepting rides' };
  }
  async setDriverLocation(lat: number, long: number, driver) {
    driver.latitude = lat;
    driver.longitude = long;

    await this.Driver.save(driver);
    return {
      status: 'success',
      message: 'The location of the captain has been added successfully',
    };
  }
}
