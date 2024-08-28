import { Module } from '@nestjs/common';
import { DriverController } from './controllers/driver/driver.controller';
import { DriverService } from './services/driver/driver.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from 'src/entites/Driver';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/entites/User';

@Module({
  imports: [TypeOrmModule.forFeature([User, Driver]), JwtModule],
  controllers: [DriverController],
  providers: [DriverService, AuthGuard],
})
export class DriversModule {}
