import { IsNotEmpty } from 'class-validator';

export class verificationCodeDto {
  @IsNotEmpty()
  otp: string;
}
