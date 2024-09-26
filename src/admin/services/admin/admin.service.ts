import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from 'src/entites/Driver';
import { Notification } from 'src/entites/Notification';
import { Ride } from 'src/entites/Ride';
import { User } from 'src/entites/User';
import { DataSource, getConnection, Repository } from 'typeorm';
import { ApiFeatures } from 'utils/apiFeatures';
import { sendMessage } from 'utils/firebaseConfig';
import { getExactLanguageMessages } from 'utils/getExactLanguageMessages';

@Injectable()
export class AdminService implements OnModuleInit {
  admin: User;
  constructor(
    @InjectRepository(User) private User: Repository<User>,
    @InjectRepository(Driver) private Driver: Repository<Driver>,
    @InjectRepository(Ride) private Ride: Repository<Ride>,
    @InjectRepository(Notification)
    private Notification: Repository<Notification>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    this.admin = await this.User.findOneBy({ id: process.env.ADMIN_ID });
  }
  async getAllUsers() {
    const users = await this.User.find({
      where: { role: 'user' },
      relations: ['userRides'],
    });
    return { status: 'success', data: users };
  }
  async getAllCaptains() {
    const captains = await this.Driver.find({
      relations: ['appRating', 'driverRides'],
    });
    return { status: 'success', data: captains };
  }
  async approveDriver(phone: string) {
    const driver = await this.Driver.findOneBy({ phone });
    if (!driver.verified)
      throw new HttpException(
        'Please verify the account first ',
        HttpStatus.UNAUTHORIZED,
      );
    if (!driver || driver.accepted === true)
      throw new HttpException(
        'There is no Driver with that phone, or driver is already accepted',
        HttpStatus.NOT_FOUND,
      );
    driver.accepted = true;

    let message = getExactLanguageMessages('approve_driver').replace(
      /{(\w+)}/g,
      () => phone,
    );

    await this.Driver.save(driver);
    return {
      status: 'success',
      message: message,
    };
  }

  async getRides(queryParam) {
    const queryBuilder = this.Ride.createQueryBuilder('ride')
      .leftJoinAndSelect('ride.user', 'user')
      .leftJoinAndSelect('ride.driver', 'driver');
    const features = new ApiFeatures(queryBuilder, queryParam)
      .filter()
      .limitFields()
      .sort()
      .returnQuery();
    const rides = await features.getMany();

    if (!rides) {
      throw new HttpException(
        'There are no rides with the specifications you asked for',
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      status: 'sucess',
      data: { rides },
    };
  }

  @OnEvent('captainSignUp')
  async captianSignup(captainId: string) {
    await this.Notification.save(
      this.Notification.create({
        user: { id: process.env.ADMIN_ID },
        message: 'new captain application please accept or reject it',
        data: { captainId },
      }),
    );
    await sendMessage(this.admin.userNotificationToken, {
      title: 'new captain application',
      body: 'new captain application please accept or reject it',
      data: {
        captainId: captainId.toString(),
      },
    });
  }
  async clearDatabase() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0;');

      const entities = this.dataSource.entityMetadatas;

      for (const entity of entities) {
        const repository = queryRunner.manager.getRepository(entity.name);
        await repository.clear();
      }

      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    return { status: 'success' };
  }
}
