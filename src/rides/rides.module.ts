import { Module } from '@nestjs/common';
import { RidesController } from './controller/rides/rides.controller';
import { RidesService } from './services/rides/rides.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ride } from 'src/entites/Ride';
import { User } from 'src/entites/User';
import { JwtModule } from '@nestjs/jwt';
import { Driver } from 'src/entites/Driver';

@Module({
  imports: [JwtModule, TypeOrmModule.forFeature([User, Ride, Driver])],
  controllers: [RidesController],
  providers: [RidesService],
})
export class RidesModule {}
