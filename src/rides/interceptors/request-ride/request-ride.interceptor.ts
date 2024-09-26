import { InjectQueue } from '@nestjs/bullmq';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Observable } from 'rxjs';
import { Driver } from 'src/entites/Driver';
import { Ride } from 'src/entites/Ride';
import { Repository } from 'typeorm';
import { formatDate } from 'utils/dateUtils';

@Injectable()
export class RequestRideInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(Ride) private Ride: Repository<Ride>,
    @InjectRepository(Driver) private Driver: Repository<Driver>,
    @InjectQueue('schedule-trip') private tripSchedulerQueue: Queue,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const user = req['user'];
    let { sizeOfTheCar, pickupDate } = req.body;
    // chekc if there active previous rides for the user
    const checkRides = await this.Ride.findBy({
      user: { id: user.id },
      active: true,
    });

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
    }
    req['drivers'] = drivers;

    return next.handle();
  }
}
