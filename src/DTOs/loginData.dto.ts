import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class loginDataDto {
  @IsNotEmpty()
  @IsPhoneNumber('EG')
  phone: string;
  @IsNotEmpty()
  password: string;
}
