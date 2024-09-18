import { IsNotEmpty, IsString } from 'class-validator';

export class CancelationBodyDto {
  @IsNotEmpty()
  @IsString()
  reasonOfCancelation: string;
}
