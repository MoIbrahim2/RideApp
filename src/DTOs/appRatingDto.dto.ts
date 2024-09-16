import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class AppRatingDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Rating must be not less than 0' })
  @Max(5, { message: 'Rating must not exceeds 5' })
  rating: number;

  @IsOptional()
  @IsString()
  @Length(0, 100, { message: "You shouoldn't exceeds 100 characters" })
  comment: string;
}
