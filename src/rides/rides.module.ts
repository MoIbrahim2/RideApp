import { MiddlewareConsumer, Module } from '@nestjs/common';
import { RidesController } from './controller/rides/rides.controller';
import { RidesService } from './services/rides/rides.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ride } from 'src/entites/Ride';
import { User } from 'src/entites/User';
import { JwtModule } from '@nestjs/jwt';
import { Driver } from 'src/entites/Driver';

import { Notification } from 'src/entites/Notification';
import { Refactoring } from 'utils/Refactoring';
import { Voucher } from 'src/entites/Vouchers';
import { VoucherService } from 'src/voucher/service/voucher/voucher.service';
import { PaymentsService } from 'src/payments/services/payments/payments.service';
import { NotificationService } from 'src/notification/services/notification/notification.service';
import { BullModule } from '@nestjs/bullmq';
import { TripSchedulerProcessor } from './consumers/scheduleConsumer';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    NotificationModule,
    BullModule.registerQueue({
      name: 'schedule-trip',
    }),
    JwtModule,
    TypeOrmModule.forFeature([User, Ride, Driver, Notification, Voucher]),
  ],
  controllers: [RidesController],
  providers: [
    RidesService,
    TripSchedulerProcessor,
    Refactoring,
    VoucherService,
    PaymentsService,
    NotificationService,
  ],
})
export class RidesModule {}
