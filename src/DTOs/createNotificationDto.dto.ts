import { IsNotEmpty } from 'class-validator';
import { User } from 'src/entites/User';
import { Driver } from 'typeorm';

export class createNotificationDto {
  @IsNotEmpty()
  message: string;
}
