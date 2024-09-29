import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { Ride } from 'src/entites/Ride';
import { Repository } from 'typeorm';

@Injectable()
export class CaptainCancelRideInterceptor implements NestInterceptor {
  constructor(@InjectRepository(Ride) private Ride: Repository<Ride>) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const { rideRequestId, driver } = req.body;

    const ride = await this.Ride.findOne({
      where: { id: rideRequestId, active: true },
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

    req['ride'] = ride;
    return next.handle();
  }
}
