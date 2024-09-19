import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from 'src/entites/Driver';
import { Review } from 'src/entites/Reviews';
import { ReviewService } from './services/review.service';
import { ReviewController } from './controllers/review/review.controller';
import { User } from 'src/entites/User';
import { JwtModule } from '@nestjs/jwt';
import { ReviewSubscriber } from './subscribers/review.subscriber';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    JwtModule,
    TypeOrmModule.forFeature([Review, Driver, User]),
  ],
  providers: [ReviewService, ReviewSubscriber],
  controllers: [ReviewController],
})
export class ReviewModule {}
