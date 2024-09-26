import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { AppRatingDto } from 'src/DTOs/appRatingDto.dto';
import { ReviewDto } from 'src/DTOs/reviewDto.dto';
import { ReviewService } from 'src/review/services/review.service';

@UsePipes(ValidationPipe)
@Controller('review')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @UseGuards(AuthGuard)
  @Post('createReview/:driverId')
  async createReview(
    @Param('driverId') driverId: string,
    @Body() reviewData: AppRatingDto,
    @Req() req: Request,
  ) {
    return await this.reviewService.createReview(
      req['user'],
      driverId,
      reviewData,
    );
  }
}
