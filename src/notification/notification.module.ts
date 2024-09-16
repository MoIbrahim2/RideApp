import { Module } from '@nestjs/common';
import { NotificationController } from './controllers/notification/notification.controller';
import { NotificationService } from './services/notification/notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/entites/Notification';
import { User } from 'src/entites/User';
import { Driver } from 'src/entites/Driver';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User, Driver]), JwtModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
