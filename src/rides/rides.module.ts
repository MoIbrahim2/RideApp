import { Module } from '@nestjs/common';
import { RidesController } from './controller/rides/rides.controller';
import { RidesService } from './services/rides/rides.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ride } from 'src/entites/Ride';
import { User } from 'src/entites/User';
import { JwtModule } from '@nestjs/jwt';
import { Driver } from 'src/entites/Driver';
import { RideListenerService } from './services/ride-listener/ride-listener.service';

import { Notification } from 'src/entites/Notification';
import { Refactoring } from 'utils/Refactoring';
import { Voucher } from 'src/entites/Vouchers';
import { VoucherService } from 'src/voucher/service/voucher/voucher.service';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([User, Ride, Driver, Notification, Voucher]),
  ],
  controllers: [RidesController],
  providers: [RidesService, RideListenerService, Refactoring, VoucherService],
})
export class RidesModule {}
