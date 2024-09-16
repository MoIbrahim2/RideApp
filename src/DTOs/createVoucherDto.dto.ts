import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateVoucherDto {
  @IsNotEmpty()
  voucherCode: string;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  expirationDate: Date;

  @IsNotEmpty()
  @IsNumber()
  voucherDiscount: number;
}
