import { IsNotEmpty, Length } from 'class-validator';

export class createFaqDto {
  @IsNotEmpty()
  @Length(20, 70, {
    message:
      "The question shouldn't be less than 20 and more than 70 characters",
  })
  question: string;

  @IsNotEmpty()
  answer: string;
}
