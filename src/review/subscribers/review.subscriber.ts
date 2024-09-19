import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  Repository,
} from 'typeorm';
import { Review } from '../../entites/Reviews';
import { ReviewService } from 'src/review/services/review.service';
import { OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@EventSubscriber()
export class ReviewSubscriber implements EntitySubscriberInterface<Review> {
  constructor() {}
  listenTo() {
    return Review;
  }

  // async afterInsert(event: InsertEvent<Review>) {
  //   console.log(this.moduleRef, this.reviewService);

  //   await this.reviewService.calcAverageRatings(event.entity.refCaptain.id);
  // }

  //   async afterUpdate(event: UpdateEvent<Review>) {
  //     await this.reviewService.calcAverageRatings(event.entity.refCaptain.id);
  //   }
}
