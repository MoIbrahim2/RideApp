import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RidesModule } from './rides/rides.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entites/User';
import { Ride } from './entites/Ride';
import { ScheduleModule } from '@nestjs/schedule';
import { UserSubscriber } from './user/subscribers/user.subscriber';
import { Driver } from './entites/Driver';
import { VerficationCode } from './entites/VerificationCode';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      subscribers: [UserSubscriber],
      synchronize: true,
      logging: true,
      entities: [User, Ride, Driver, VerficationCode],
      // autoLoadEntities: true,
    }),
    UserModule,
    RidesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
