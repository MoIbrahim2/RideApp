import { IsNotEmpty } from 'class-validator';

export class ApproveDriverDto {
  @IsNotEmpty()
  phone: string;
}
