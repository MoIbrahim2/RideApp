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

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Driver, Ride, Transaction]),
    JwtModule,
  ],
  providers: [UserService, UserService, HandlerFactoryService],
  controllers: [UserController],
})
export class UserModule {}
