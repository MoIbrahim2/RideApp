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
export class AcceptRideInterceptor implements NestInterceptor {
  constructor(@InjectRepository(Ride) private Ride: Repository<Ride>) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const { rideRequestId, driver, price } = req.body;

    const ride = await this.Ride.findOne({
      where: { id: rideRequestId, active: true },
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
    req['ride'] = ride;
    req['driverInfo'] = driverInfo;
    return next.handle();
  }
}
