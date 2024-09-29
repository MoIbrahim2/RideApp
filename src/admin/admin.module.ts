import { Module } from '@nestjs/common';
import { AdminService } from './services/admin/admin.service';
import { AdminController } from './controllers/admin/admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entites/User';
import { Driver } from 'src/entites/Driver';
import { JwtModule } from '@nestjs/jwt';
import { Notification } from 'src/entites/Notification';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Ride } from 'src/entites/Ride';
import { NotificationService } from 'src/notification/services/notification/notification.service';
import { FirebaseNotificationService } from 'src/notification/services/firebase-notification/firebase-notification.service';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    JwtModule,
    TypeOrmModule.forFeature([User, Driver, Notification, Ride]),
  ],
  providers: [AdminService, NotificationService, FirebaseNotificationService],
  controllers: [AdminController],
})
export class AdminModule {}
