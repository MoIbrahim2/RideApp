import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class ConfirmationTripDto {
  @IsNotEmpty()
  @IsBoolean()
  accept: boolean;

  @IsOptional()
  discountVoucher: string;

  @IsNotEmpty()
  @IsNumber()
  driverId: number;
}
