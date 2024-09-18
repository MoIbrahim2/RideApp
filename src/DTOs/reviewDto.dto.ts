import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class ReviewDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Rating must be not less than 0' })
  @Max(5, { message: 'Rating must not exceeds 5' })
  rating: number;
}
