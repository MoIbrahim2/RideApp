import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { AppRatingDto } from 'src/DTOs/appRatingDto.dto';
import { Driver } from 'src/entites/Driver';

import { Review } from 'src/entites/Reviews';
import { User } from 'src/entites/User';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private Review: Repository<Review>,
    @InjectRepository(Driver) private Driver: Repository<Driver>,
    private eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('review.created')
  async calcAverageRatings(driverId: number) {
    const stats = await this.Review.createQueryBuilder('review')
      .where('review.refCaptain = :driverId', { driverId })
      .select('COUNT(review.id)', 'nRatings')
      .addSelect('AVG(review.rating)', 'avgRating')
      .getRawOne();

    await this.Driver.update(
      { id: driverId },
      {
        nRatings: stats.nRatings,
        avgRating: stats.avgRating,
      },
    );
  }

  async createReview(user: User, driverId: number, reviewData: AppRatingDto) {
    const driver = await this.Driver.findOneBy({ id: driverId });
    if (!driver)
      throw new HttpException(
        'There is no captain with that ID',
        HttpStatus.NOT_FOUND,
      );
    const review = this.Review.create({
      comment: reviewData.comment,
      rating: reviewData.rating,
      refUser: { id: user.id },
      refCaptain: { id: driverId },
    });
    if (!review)
      throw new HttpException(
        'Error while creating the review',
        HttpStatus.FAILED_DEPENDENCY,
      );
    await this.Review.save(review);

    // Update the rating for the captain after each review created
    this.eventEmitter.emit('review.created', review.refCaptain.id);
    return {
      status: 'created',
      message: 'Review created successfully',
    };
  }
}
