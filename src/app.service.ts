import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppRating } from './entites/AppRating';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(AppRating) private AppRating: Repository<AppRating>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async averageRatings() {
    const ratings = await this.AppRating.find();
    let sumRatings = 0;
    ratings.forEach((appRating) => (sumRatings += appRating.rating));
    const averageRatings = sumRatings / ratings.length;
    return {
      status: 'success',
      message: `${averageRatings} is the average rating of the app`,
    };
  }
}
