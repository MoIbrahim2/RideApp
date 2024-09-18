import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
} from 'typeorm';
import { Review } from '../../entites/Reviews';
import { ReviewService } from 'src/review/services/review.service';

@EventSubscriber()
export class ReviewSubscriber implements EntitySubscriberInterface<Review> {
  constructor(private reviewService: ReviewService) {}

  listenTo() {
    return Review;
  }

  async afterInsert(event: InsertEvent<Review>) {
    console.log('before ERROR');
    await this.reviewService.calcAverageRatings(event.entity.refCaptain.id);
  }

  //   async afterUpdate(event: UpdateEvent<Review>) {
  //     await this.reviewService.calcAverageRatings(event.entity.refCaptain.id);
  //   }
}
