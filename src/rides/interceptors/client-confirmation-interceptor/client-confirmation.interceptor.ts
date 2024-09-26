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
export class ClientConfirmationInterceptor implements NestInterceptor {
  constructor(@InjectRepository(Ride) private Ride: Repository<Ride>) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const driverId = req.body.driverId;
    const user = req['user'];

    const ride = await this.Ride.findOne({
      where: { user: { id: user.id }, active: true },
      relations: ['driver', 'candidatesDrivers', 'user', 'discountVoucher'],
    });
    if (!ride || ride.rideAccepted)
      throw new HttpException(
        'There is no ride with that client, or The ride already accepted by client',
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

    req['ride'] = ride;
    req['captain'] = acceptedDriver;
    return next.handle();
  }
}
