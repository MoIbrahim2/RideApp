import { Module } from '@nestjs/common';
import { UserController } from './controller/user/user.controller';
import { UserService } from './services/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entites/User';
import { Ride } from 'src/entites/Ride';
import { Driver } from 'src/entites/Driver';
import { JwtModule } from '@nestjs/jwt';
import { Transaction } from 'src/entites/Transactions';
import { HandlerFactoryService } from 'src/handler-factory/handler-factory.service';
import { AppRating } from 'src/entites/AppRating';

import { Notification } from 'src/entites/Notification';
import { Refactoring } from 'utils/Refactoring';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Driver,
      Ride,
      Transaction,
      AppRating,
      Notification,
    ]),
    JwtModule,
  ],
  providers: [UserService, UserService, HandlerFactoryService, Refactoring],
  controllers: [UserController],
})
export class UserModule {}
