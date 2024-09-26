import { Module } from '@nestjs/common';
import { PaymentsService } from './services/payments/payments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entites/User';

import { Driver } from 'src/entites/Driver';
import { Notification } from 'src/entites/Notification';
import { Ride } from 'src/entites/Ride';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User, Driver, Ride])],
  providers: [PaymentsService],
})
export class PaymentsModule {}
