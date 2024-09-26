import { Module } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { AuthController } from './controller/auth/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entites/User';
import { Ride } from 'src/entites/Ride';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth/auth.guard';
import { Driver } from 'src/entites/Driver';
import { ScheduleModule } from '@nestjs/schedule';
import { VerficationCode } from 'src/entites/VerificationCode';
import { Refactoring } from 'utils/Refactoring';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([User, Driver, Ride, VerficationCode]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
  ],
  providers: [AuthService, AuthGuard, Refactoring],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard, JwtModule],
})
export class AuthModule {}
