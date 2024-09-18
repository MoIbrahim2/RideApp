import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppRatingDto } from 'src/DTOs/appRatingDto.dto';
import { Driver } from 'src/entites/Driver';
import { Review } from 'src/entites/Reviews';
import { User } from 'src/entites/User';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Driver) private Driver: Repository<Driver>,
    @InjectRepository(Review) private Review: Repository<Review>,
  ) {}

  async calcAverageRatings(driverId: number) {
    const stats = await this.Review.createQueryBuilder('review')
      .where('review.refCaptain = :driverId', { driverId })
      .select('COUNT(review.id)', 'nRatings')
      .addSelect('AVG(review.rating)', 'avgRating')
      .getRawOne();

    console.log(stats);
  }
  async createReview(user: User, driverId: number, reviewData: AppRatingDto) {
    const review = this.Review.create({
      comment: reviewData.comment,
      rating: reviewData.rating,
      refUser: { id: user.id },
      refCaptain: { id: driverId },
    });
    await this.Review.save(review);
    return {
      status: 'created',
      message: 'Review created successfully',
    };
  }
}
